// createSetupIntent.ts
import Stripe from "stripe";
import { Resource } from "sst";
import { Util } from "@aws-sst-saas-template/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event) => {
  const userId = event.requestContext.authorizer?.iam.cognitoIdentity.identityId;

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

  const stripe = new Stripe(Resource.StripeSecretKey.value, {
    apiVersion: "2024-06-20",
  });

  const setupIntent = await stripe.setupIntents.create({
    customer: user.customerId,
  });

  return JSON.stringify({ clientSecret: setupIntent.client_secret });
});