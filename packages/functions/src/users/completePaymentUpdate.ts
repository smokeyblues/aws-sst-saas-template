// completePaymentUpdate.ts
import Stripe from "stripe";
import { Resource } from "sst";
import { Util } from "@aws-sst-saas-template/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event) => {
  const userId = event.requestContext.authorizer?.iam.cognitoIdentity.identityId;
  const { setupIntent } = JSON.parse(event.body);

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

  try {
    const setup = await stripe.setupIntents.retrieve(setupIntent);
    
    if (setup.status === 'succeeded') {
      const paymentMethod = setup.payment_method;
      
      if (typeof paymentMethod === 'string') {
        await stripe.customers.update(user.customerId, {
          invoice_settings: {
            default_payment_method: paymentMethod,
          },
        });
      }
      
      return JSON.stringify({ status: "success" });
    } else {
      throw new Error("Setup intent not succeeded");
    }
  } catch (error) {
    console.error('Error completing payment update:', error);
    throw error;
  }
});