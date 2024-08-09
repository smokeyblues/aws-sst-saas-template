import Stripe from "stripe";
import { Resource } from "sst";
import { Util } from "@aws-sst-saas-template/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { ReturnValue } from "@aws-sdk/client-dynamodb";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event) => {
  const data = JSON.parse(event.body || "{}");
  const { priceId, planName, isAnnual } = data;

  if (!planName || isAnnual === undefined) {
    throw new Error("Plan name and billing cycle are required");
  }

  const userId = event.requestContext.authorizer?.iam.cognitoIdentity.identityId;

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
    throw new Error("User not found or doesn't have a Stripe customer ID");
  }

  // Initialize Stripe
  const stripe = new Stripe(Resource.StripeSecretKey.value, {
    apiVersion: "2024-06-20",
  });

  // Fetch all active products and prices from Stripe
  const products = await stripe.products.list({ active: true });
  const prices = await stripe.prices.list({ active: true });

  // Find the selected product
  const selectedProduct = products.data.find(product => product.name === planName);
  if (!selectedProduct) {
    throw new Error(`Product not found for plan: ${planName}`);
  }

  // Find the correct price for the selected product and billing cycle
  const selectedPrice = prices.data.find(price => 
    price.product === selectedProduct.id && 
    price.recurring?.interval === (isAnnual ? 'year' : 'month')
  );

  if (!selectedPrice) {
    throw new Error(`Price not found for plan: ${planName} with ${isAnnual ? 'annual' : 'monthly'} billing`);
  }

  // Create a new subscription
  const subscription = await stripe.subscriptions.create({
    customer: user.customerId,
    items: [{ price: priceId }],
  });

  // Update the user data in DynamoDB
  const updateParams = {
    TableName: Resource.Users.name,
    Key: { userId: userId },
    UpdateExpression: "SET subscriptionId = :subscriptionId, subscriptionStatus = :subscriptionStatus, planName = :planName, isAnnual = :isAnnual",
    ExpressionAttributeValues: {
      ":subscriptionId": subscription.id,
      ":subscriptionStatus": subscription.status,
      ":planName": planName,
      ":isAnnual": isAnnual,
    },
    ReturnValues: "ALL_NEW" as ReturnValue,
  };

  await dynamoDb.send(new UpdateCommand(updateParams));

  return JSON.stringify({
    userId: userId,
    email: user.email,
    customerId: user.customerId,
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    planName: planName,
    isAnnual: isAnnual,
  });
});