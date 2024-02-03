// import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  layers: [{Ref: 'PaymentGatewayCommonLibraryLambdaLayer'}, {Ref: 'PaymentGatewayNpmLibraryLambdaLayer'}],
  events: [
    {
      http: {
        method: 'DELETE',
        path: 'user/{id}',
        // request: {
        //   schemas: {
        //     'application/json': schema,
        //   },
        // },
      },
    },
  ],
};
