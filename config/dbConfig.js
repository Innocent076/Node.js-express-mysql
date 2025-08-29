import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

//create connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_SERVER_NAME,
    database: process.env.DB_NAME
});

export default pool;