import { Resource } from "sst";
import { Util } from "@aws-sst-saas-template/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event) => {
  let data = {
    email: "",
    customerId: "",
    bio: "",
    subscriptionId: "",
    subscriptionStatus: "",
  };

  if (event.body != null) {
    data = JSON.parse(event.body);
  }

  const params = {
    TableName: Resource.Users.name,
    Item: {
      // The attributes of the item to be created
      userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId, // The id of the user
      email: data.email, // Parsed from request body
      customerId: data.customerId, // Parsed from request body
      bio: data.bio, // Parsed from request body

    },
  };

  await dynamoDb.send(new PutCommand(params));

  return JSON.stringify(params.Item);
});