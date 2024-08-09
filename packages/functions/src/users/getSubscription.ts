// getSubscription.ts
import Stripe from "stripe";
import { Resource } from "sst";
import { Util } from "@aws-sst-saas-template/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event) => {
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

  if (!user || !user.subscriptionId) {
    return JSON.stringify({ isSubscribed: false });
  }

  // Initialize Stripe
  const stripe = new Stripe(Resource.StripeSecretKey.value, {
    apiVersion: "2024-06-20",
  });

  try {
    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
    
    const isActive = subscription.status === 'active';
    
    return JSON.stringify({
      isSubscribed: isActive,
      subscriptionStatus: subscription.status,
      planId: subscription.items.data[0].price.id,
      planName: user.planName,
      isAnnual: user.isAnnual,
      currentPeriodEnd: subscription.current_period_end,
      // Include any other relevant information from the user object or Stripe subscription
    });
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return JSON.stringify({ isSubscribed: false, error: 'Failed to retrieve subscription' });
  }
});