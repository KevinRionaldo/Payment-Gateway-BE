import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
// import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';

const { Pool } = require('@npm/pg');
const dataAccess = require('@commonLib/data-access');
const response = require('@commonLib/response-lib');
const initTable = require ('@commonLib/init-table');

let pool: any;
const stage : string = process.env.STAGE;

const source: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    console.log(event);
    initConnectionPool();

    let selectFilter = `WHERE id IS NOT NULL`;
    let selectValue = [];

    const params = event?.queryStringParameters;

    //filter and pagination
    if (params?.filter) {
        selectFilter = `WHERE (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)`; selectValue.push(`%${params.filter}%`)
    }

    selectFilter += ` ORDER BY name asc`;

    if (params?.page && params?.limit) {
        selectValue.push(`${Number(params.limit)}`, `${(Number(params.page) - 1) * Number(params.limit)}`);
        selectFilter += ` LIMIT $${selectValue.length - 1} OFFSET $${selectValue.length}`;
    }

    try {
        await initTable.user(pool, stage)
        //query select data with filter
        let selectQry = await dataAccess.select(pool, stage, 'user', selectFilter, `*`, selectValue);
        selectQry = selectQry.rows;

        return response.generate(event, 200, selectQry);
    }
    catch (err) {
        console.log(err);
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