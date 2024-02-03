// import schema from './schema';
// import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  layers: [{Ref: 'PaymentGatewayCommonLibraryLambdaLayer'}, {Ref: 'PaymentGatewayNpmLibraryLambdaLayer'}],
  events: [
    {
      http: {
        method: 'GET',
        path: 'transaction',

        // request: {
          // schemas: {
          //   'application/json': schema,
          // },
        // },
      },
    },
  ],
};
