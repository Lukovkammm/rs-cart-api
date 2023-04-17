import { Pool } from "pg";

const { PG_PASSWORD, PG_DATABASE, PG_USER, PG_PORT, PG_HOST } = process.env;

const options = {
    host: PG_HOST,
    port: Number(PG_PORT),
    database: PG_DATABASE,
    user: PG_USER,
    password: PG_PASSWORD,
    ssl: {
        rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
};

let pool;

export const getClient = async () => {
    if (!pool) {
        pool = new Pool(options);
    }
    const client = await pool.connect();
    return client;
};

export const clientPg = async (action: string) => {
    console.log("!!! Action: ", action);
    const client = await getClient();

    try {
        const result = await client.query(action);
        return result;
    } catch (error) {
        console.log(error);
    } finally {
        client.release();
    }
};
