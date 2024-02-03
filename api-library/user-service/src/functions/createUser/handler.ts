import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
// import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';

const { Pool } = require('@npm/pg');
const dataAccess = require('@commonLib/data-access');
const response = require('@commonLib/response-lib');
const dataMgmt = require('@commonLib/data-mgmt');
const initTable = require ('@commonLib/init-table');

import {Iuser, user as userFields} from '@commonLib/table-fields';


let pool: any;
const stage : string = process.env.STAGE;

const source: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  console.log(event);
  initConnectionPool();

  //check body data 
  if (!event?.body) {
    return response.generate(event, 400, 'body is undefined');
  }
  const body = event.body;

  body.phone ? body.phone = dataMgmt.formatPhone(body.phone) : '';

  body?.name && body.name !== null ? body.name = String(body.name).trim() : '';

  try {
    await initTable.user(pool, stage)
    //manage insert data user
    const userData: Iuser = { id: '', ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

    const user = event?.requestContext?.authorizer?.jwt?.claims?.sub;
    user !== undefined ? userData['created_by'] = user : '';

    let insertParams = dataAccess.composeInsertParams(userFields, userData);
    let insertQry = await dataAccess.insert(pool, insertParams.fields, insertParams.valuesTemplate, insertParams.values, stage, 'user', 'id', `id`);

    //return error if result of query insert error
    if (insertQry.error) {
      throw(insertQry.error?.detail ? insertQry.error?.detail : insertQry.error);
    }

    if (insertQry.rowCount == 0) {
      throw(`email or phone are exsist`)
    }

    //get returning id from query insert
    userData.id = insertQry.rows[0].id;

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