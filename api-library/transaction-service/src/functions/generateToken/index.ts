// import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  layers: [{Ref: 'PaymentGatewayCommonLibraryLambdaLayer'}, {Ref: 'PaymentGatewayNpmLibraryLambdaLayer'}],
  events: [
    {
      http: {
        method: 'POST',
        path: 'token',
        // request: {
        //   // parameters: {
        //   //   querystrings: {
        //   //     param1: true, // Make param1 required
        //   //     param2: true, // Make param2 required
        //   //   },
        //   // },
        //   schemas: {
        //     'application/json': schema,
        //   },
        // },
      },
    },
  ],
};
