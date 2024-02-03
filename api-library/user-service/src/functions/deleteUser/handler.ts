import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
// import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';

const { Pool } = require('@npm/pg');
const dataAccess = require('@commonLib/data-access');
const response = require('@commonLib/response-lib');

let pool: any;
const stage : string = process.env.STAGE;

const source: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  console.log(event);
  initConnectionPool();
  try {
    //delete query
    let deleteQry = await dataAccess.delete(pool, stage, 'user', `where id = $1`, [event.pathParameters.id], '*')

    if (deleteQry?.error) {
      throw(deleteQry.error?.detail ? deleteQry.error?.detail : deleteQry.error);
    }

    if (deleteQry.rowCount == 0) {
      throw('user id is not found')
    }

    const resultData = deleteQry.rows[0]

    return response.generate(event, 200, resultData);
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