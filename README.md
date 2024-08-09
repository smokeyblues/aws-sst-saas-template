# Serverless SaaS App Template

This project is a full-stack serverless SaaS application template built with SST (Serverless Stack) and running on AWS. This template is an extension of the notes app created in [the SST guide](https://sst.dev/guide.html), modifying the storage based pricing model in the example to a fla-rate subscription model. 

## Features

- Serverless architecture using AWS services
- User authentication and authorization with Amazon Cognito
- API Gateway for RESTful endpoints
- DynamoDB for data storage
- S3 for file storage
- Automated Stripe product and pricing integration
- React frontend with TypeScript

## Key Highlights

- **Stripe Integration**: This template automatically pulls your products and their associated prices from your Stripe account. There's no need for manual configuration of products or prices within the template itself.
- **Dynamic Plan Picker**: The PlanPicker component displays your Stripe products and prices in cards, offering a ready-to-use subscription interface.
- **Serverless Secrets Management**: Environment variables, including Stripe credentials, are securely managed using the `sst.Secret` component, ensuring best practices for secret management in a serverless environment.

## Get Started

1. If you haven't done so, get started by going through [the SST guide](https://sst.dev/guide.html) to get familiar with the basics of this project and its workflow.

2. Use this template to [create your own repo](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template).

3. Clone the new repo.

   ```bash
   git clone MY_APP
   cd MY_APP
   ```

4. Rename the files in the project to the name of your app. 

   ```bash
   npx replace-in-file /aws-sst-saas-template/g MY_APP **/*.* --verbose
   ```

5. Install dependencies:
   ```
   npm install
   ```

6. Configure Stripe secrets:
   Use the SST CLI to set your Stripe secret key:
   ```
   npx sst secrets set STRIPE_SECRET_KEY your_stripe_secret_key
   npx sst secrets set STRIPE_PUBLIC_KEY your_stripe_public_key
   ```

7. Deploy!

   ```bash
   npx sst deploy
   ```

8. Optionally, enable [_git push to deploy_](https://ion.sst.dev/docs/console/#autodeploy).

## Project Structure

This template uses [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces). It has the following packages:

1. `core/`: This is for any shared code. It's defined as modules.

2. `functions/`: This is for your Lambda functions and it uses the `core` package as a local dependency.

3. `frontend/`: This contains the React frontend application.

4. `scripts/`: This is for any scripts that you can run on your SST app using the `sst shell` CLI and [`tsx`](https://www.npmjs.com/package/tsx).

### Infrastructure

The `infra/` directory allows you to logically split the infrastructure of your app into separate files. This can be helpful as your app grows.

These resources are imported in the `sst.config.ts`.

## Key Components

### Backend

- `api.ts`: Defines API Gateway routes and integrations
- `auth.ts`: Configures Cognito user pool and identity pool
- `storage.ts`: Sets up DynamoDB tables and S3 bucket
- `web.ts`: Configures the static site hosting for the frontend

### Frontend

- `App.tsx`: Main React component and routing
- `containers/`: React components for different pages
- `components/`: Reusable React components, including PlanPicker
- `lib/`: Utility functions and custom hooks

## Customization

1. Modify the DynamoDB table schemas in `storage.ts` to fit your data model.
2. Update API routes in `api.ts` to add or modify endpoints.
3. Customize the React components in the `packages/frontend/` directory to match your UI requirements.
4. Adjust the Stripe product configurations in your Stripe dashboard to reflect your desired pricing model.

## Testing

Run the test suite with:
```
npm test
```

## Deployment

To deploy to production:
```
npx sst deploy --stage prod
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Serverless Stack (SST)](https://serverless-stack.com/)
- [AWS](https://aws.amazon.com/)
- [React](https://reactjs.org/)
- [Stripe](https://stripe.com/)

## Support

If you have any questions or need help with setup, please open an issue in the GitHub repository.