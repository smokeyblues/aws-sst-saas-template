import { 
  notesTable, 
  usersTable, 
  stripeSecretKey,
  stripePublicKey, 
} from "./storage";

// Create the API
export const notesApi = new sst.aws.ApiGatewayV2("NotesApi", {
  transform: {
    route: {
      handler: {
        link: [notesTable, stripeSecretKey],
      },
      args: {
        auth: { iam: true }
      },
    }
  }
});

// Create a new API for users
export const usersApi = new sst.aws.ApiGatewayV2("UsersApi", {
  transform: {
    route: {
      handler: {
        link: [
          usersTable, 
          stripeSecretKey, 
          stripePublicKey],
      },
      args: {
        auth: { iam: true }
      },
    }
  }
});

// Routes for notes API
notesApi.route("POST /notes", "packages/functions/src/notes/create.main");
notesApi.route("GET /notes/{id}", "packages/functions/src/notes/get.main");
notesApi.route("GET /notes", "packages/functions/src/notes/list.main");
notesApi.route("PUT /notes/{id}", "packages/functions/src/notes/update.main");
notesApi.route("DELETE /notes/{id}", "packages/functions/src/notes/delete.main");
notesApi.route("POST /billing", "packages/functions/src/billing.main");

// Routes for users API
usersApi.route("POST /users", "packages/functions/src/users/create.main");
usersApi.route("GET /users", "packages/functions/src/users/get.main");
usersApi.route("PUT /users/{id}", "packages/functions/src/users/update.main");
usersApi.route("DELETE /users/{id}", "packages/functions/src/users/delete.main");

// Routes for stripe API
usersApi.route("POST /users/create-stripe-customer", "packages/functions/src/users/createStripeCustomer.main");
usersApi.route("POST /users/create-subscription", "packages/functions/src/users/createSubscription.main");
usersApi.route("POST /users/add-payment-method", "packages/functions/src/users/addPaymentMethod.main");
usersApi.route("GET /plans", "packages/functions/src/users/getStripePlans.main");
usersApi.route("GET /users/subscription", "packages/functions/src/users/getSubscription.main");
usersApi.route("POST /users/create-setup-intent", "packages/functions/src/users/createSetupIntent.main");
usersApi.route("POST /users/update-payment-method", "packages/functions/src/users/updatePaymentMethod.main");
usersApi.route("POST /users/complete-payment-update", "packages/functions/src/users/completePaymentUpdate.main");