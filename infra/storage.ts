// Create a secret for Stripe
export const stripeSecretKey = new sst.Secret("StripeSecretKey");
export const stripePublicKey = new sst.Secret("StripePublicKey");

// Create an S3 bucket
export const bucket = new sst.aws.Bucket("Uploads");

export const usersTable = new sst.aws.Dynamo("Users", {
    fields: {
      userId: "string",
    },
    primaryIndex: { hashKey: "userId" },
  });

// Create the DynamoDB table for notes
export const notesTable = new sst.aws.Dynamo("Notes", {
    fields: {
      userId: "string",
      noteId: "string",
    },
    primaryIndex: { hashKey: "userId", rangeKey: "noteId" },
  });