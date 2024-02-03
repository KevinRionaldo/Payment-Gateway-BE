import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
// import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';

const { Pool } = require('@npm/pg');
const dataAccess = require('@commonLib/data-access');
const response = require('@commonLib/response-lib');
const dataMgmt = require('@commonLib/data-mgmt');
const initTable = require('@commonLib/init-table')
import { encryptObject } from '@commonLib/encryption'

let pool: any;
const stage: string = process.env.STAGE;

const source: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  initConnectionPool();
  await initTable.user(pool, stage)

  if (!event?.body) {
    return response.generate(event, 400, 'body undefined')
  }
  const body: any = event.body;

  if (body?.id_meter === undefined || body?.energy === undefined || body?.user_id === undefined) {
    return response.generate(event, 400, 'id meter or energy undefined or user_id undefined')
  }

  const idMeter = dataMgmt.idMeterValidation(String(body.id_meter));

  if (idMeter === '') {
    return response.generate(event, 400, 'id meter is not valid')
  }

  try {
    let checkUserId = await dataAccess.select(pool, stage, 'user', 'WHERE id = $1', `id`, [body.user_id]);
    checkUserId = checkUserId.rows;

    if (checkUserId.length == 0) {
      throw('user id is not found')
    }

    const tokenEncryptionResult = await encryptObject(idMeter, Number(body.energy), body.user_id);
    // const decryptValue = await decryptObject(tokenEncryptionResult);

    return response.generate(event, 200, tokenEncryptionResult)
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