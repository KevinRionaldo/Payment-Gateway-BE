import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
// import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';

const { Pool } = require('@npm/pg');
const dataAccess = require('@commonLib/data-access');
const response = require('@commonLib/response-lib');
const queryFilter = require('@commonLib/query-filter')
const initTable = require('@commonLib/init-table')

let pool: any;
const stage: string = process.env.STAGE;

const source: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    console.log(event);
    initConnectionPool();
    await initTable.transaction(pool, stage)

    let selectFilter = `INNER JOIN ${stage}.user u ON t.user_id = u.id WHERE t.id IS NOT NULL`;
    let selectValue = [];

    const params = event?.queryStringParameters;
    const page = params?.page || 1; const limit = params?.limit || 10;

    //filter and pagination
    if (params?.filter) {
        selectFilter += ` AND (t.token ILIKE $1 OR t.id_meter ILIKE $1 OR u.phone ILIKE $1 OR u."name" ILIKE $1 OR u.email ILIKE $1)`; selectValue.push(`%${params.filter}%`)
    }

    if (params?.date_type || params?.from || params?.to) {
        const dateParams = queryFilter.dateSplitFilter(params?.date, params.date_type, params?.from, params?.to);

        selectValue.push(dateParams.startTime, dateParams.stopTime)
        selectFilter += ` AND (t.created_at BETWEEN $${selectValue.length - 1} AND $${selectValue.length})`
    }

    selectValue.push(`${Number(limit)}`, `${(Number(page) - 1) * Number(limit)}`);
    selectFilter += ` ORDER BY t.created_at desc LIMIT $${selectValue.length - 1} OFFSET $${selectValue.length}`;

    try {
        //query select data with filter
        let selectQry = await dataAccess.select(pool, stage, 'transaction t', selectFilter, `t.*, jsonb_build_object('data', u.*) as user`, selectValue);
        selectQry = selectQry.rows;

        selectQry.map(item => {
            item.user_id = item.user.data; delete item.user;
        })
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