import Stripe from "stripe";
import { Resource } from "sst";
import { Util } from "@aws-sst-saas-template/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event) => {
  const data = JSON.parse(event.body || "{}");
  const { email } = data;

  if (!email) {
    throw new Error("Email is required");
  }

  // Initialize Stripe
  const stripe = new Stripe(Resource.StripeSecretKey.value, {
    apiVersion: "2024-06-20",
  });

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email: email,
  });

  // Prepare the item to be saved in DynamoDB
  const params = {
    TableName: Resource.Users.name,
    Item: {
      userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
      email: email,
      customerId: customer.id,
    },
  };

  // Save the customer data to DynamoDB
  await dynamoDb.send(new PutCommand(params));

  return JSON.stringify({
    userId: params.Item.userId,
    email: params.Item.email,
    customerId: params.Item.customerId,
  });
});