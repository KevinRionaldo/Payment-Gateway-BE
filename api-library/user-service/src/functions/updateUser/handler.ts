import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
// import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';

const { Pool } = require('@npm/pg');
const dataAccess = require('@commonLib/data-access');
const response = require('@commonLib/response-lib');
const dataMgmt = require('@commonLib/data-mgmt');

import {Iuser, user as userFields} from '@commonLib/table-fields';

let pool: any;
const stage : string = process.env.STAGE;

const source: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  console.log(event);
  initConnectionPool();

  //check body data 
  if (!event.body) {
    return response.generate(event, 400, 'body is undefined')
  }

  const body = event.body;

  body.phone ? body.phone = dataMgmt.formatPhone(body.phone) : '';

  body.name && body.name !== null ? body.name = String(body.name).trim() : '';

  try {
    //manage update customer data
    let userData : Iuser = { id: event.pathParameters.id, ...body, updated_at: new Date().toISOString() }

    const user = event?.requestContext?.authorizer?.jwt?.claims?.sub;
    user !== undefined ? userData['updated_by'] = user : '';

    const updateParams = dataAccess.composeUpdateParams(userFields, userData, ['id']);
    let updateCustomerQry = await dataAccess.update(pool, updateParams.fields, updateParams.keyParameter, updateParams.values, stage, 'user');

    if (updateCustomerQry.error) {
      throw(updateCustomerQry.error?.detail ? updateCustomerQry.error?.detail : updateCustomerQry.error);
    }

    if (updateCustomerQry.rowCount == 0) {
      throw(`user id is not found`)
    }

    return response.generate(event, 200, userData);
  }
  catch (err) {
    console.log(err)
    return response.generate(event, 400, err);
  }
};

export const main = middyfy(source);

const initConnectionPool = async () => {
    if (!pool) {
        console.log('database url', process.env.DATABASE_URL)
        const connectionString = process.env.DATABASE_URL;
        pool = new Pool({
            connectionString,
            max: 1,
        });
    }
}