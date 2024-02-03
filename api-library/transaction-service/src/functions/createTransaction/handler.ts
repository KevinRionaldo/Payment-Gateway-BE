import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
// import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';

const { Pool } = require('@npm/pg');
const dataAccess = require('@commonLib/data-access');
const response = require('@commonLib/response-lib');
const initTable = require('@commonLib/init-table')
import { decryptObject } from '@commonLib/encryption'
import { Itransaction, transaction as transactionFields } from '@commonLib/table-fields';

let pool: any;
const stage: string = process.env.STAGE;

const source: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  initConnectionPool();
  await initTable.transaction(pool, stage)
  
  if (!event?.body) {
    return response.generate(event, 400, 'body undefined')
  }
  const body: any = event.body;

  if (body?.token === undefined) {
    return response.generate(event, 400, 'token or energy undefined')
  }

  try {
    const decryptToken = await decryptObject(body.token);

    if (decryptToken === 'error') {
      throw('token is not valid')
    }
    //manage insert data transaction
    const transactionData: Itransaction = { id: '', user_id: decryptToken.user_id, token: body.token, energy: decryptToken.energy, id_meter: decryptToken.id_meter, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

    const user = event?.requestContext?.authorizer?.jwt?.claims?.sub;
    user !== undefined ? transactionData['created_by'] = user : '';

    let insertParams = dataAccess.composeInsertParams(transactionFields, transactionData);
    let insertQry = await dataAccess.insert(pool, insertParams.fields, insertParams.valuesTemplate, insertParams.values, stage, 'transaction', 'id', `id`);

    //return error if result of query insert error
    if (insertQry.error) {
      throw (insertQry.error?.detail ? insertQry.error?.detail : insertQry.error);
    }

    if (insertQry.rowCount == 0) {
      throw (`token is already used`)
    }
    transactionData.id = insertQry.rows[0].id;

    return response.generate(event, 200, transactionData)
  }
  catch (err) {
    console.log(err)
    return response.generate(event, 400, err);
  }
};

export const main = middyfy(source);


const initConnectionPool = async () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    pool = new Pool({
      connectionString,
      max: 1,
    });
  }
}