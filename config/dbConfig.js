import mysql from 'mysql';

//create connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_SERVER_NAME,
    database: process.env.DB_NAME
});

export default pool;