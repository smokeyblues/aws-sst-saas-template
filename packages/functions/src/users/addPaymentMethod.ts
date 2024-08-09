import Stripe from "stripe";
import { Resource } from "sst";
import { Util } from "@aws-sst-saas-template/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { ReturnValue } from "@aws-sdk/client-dynamodb";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event) => {
  const data = JSON.parse(event.body || "{}");
  const { token } = data;

  if (!token) {
    throw new Error("Stripe token is required, ya big dummy!");
  }

  const userId = event.requestContext.authorizer?.iam.cognitoIdentity.identityId;

  // Initialize Stripe
  const stripe = new Stripe(Resource.StripeSecretKey.value, {
    apiVersion: "2024-06-20",
  });

  // Get the user's data from DynamoDB
  const getUserParams = {
    TableName: Resource.Users.name,
    Key: {
      userId: userId,
    },
  };

  const userResult = await dynamoDb.send(new GetCommand(getUserParams));
  const user = userResult.Item;

  if (!user || !user.customerId) {
    throw new Error("User not found or Stripe customer ID is missing");
  }

  // Create a new payment method using the token
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      token: token,
    },
  });

  // Attach the payment method to the customer
  await stripe.paymentMethods.attach(paymentMethod.id, {
    customer: user.customerId,
  });

  // Set the payment method as the default for the customer
  await stripe.customers.update(user.customerId, {
    invoice_settings: {
      default_payment_method: paymentMethod.id,
    },
  });

  // Update the user in DynamoDB with the new payment method ID
  const updateParams = {
    TableName: Resource.Users.name,
    Key: {
      userId: userId,
    },
    UpdateExpression: "SET paymentMethodId = :paymentMethodId",
    ExpressionAttributeValues: {
      ":paymentMethodId": paymentMethod.id,
    },
    ReturnValues: "ALL_NEW" as ReturnValue,
  };

  const updatedUser = await dynamoDb.send(new UpdateCommand(updateParams));

  return JSON.stringify({
    userId: updatedUser.Attributes?.userId,
    email: updatedUser.Attributes?.email,
    customerId: updatedUser.Attributes?.customerId,
    paymentMethodId: updatedUser.Attributes?.paymentMethodId,
  });
});