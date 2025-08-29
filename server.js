import express from 'express';
import bodyParser from 'body-parser';
import userRouter from './routes/usersRout.js'; 
import pool from './config/dbConfig.js';

const app = express();
const port = process.env.PORT || 4040;

app.use(bodyParser.urlencoded({ extended: false }));//helps us read url encoded data.
//app.use(bodyParser.json());//helps us read json data
app.use(express.json()); // or bodyParser.json()

//create tables and ensure that they exists and handle errors
async function createTable(){
   pool.query(
        `CREATE TABLE IF NOT EXISTS users (
            email VARCHAR(100) PRIMARY KEY,
            name VARCHAR(30) NOT NULL,
            surname VARCHAR(30) NOT NULL,
            password VARCHAR(30) NOT NULL,
            profile_picture VARCHAR(255),
            role ENUM('user','admin') NOT NULL DEFAULT 'user',
            status ENUM('active','blocked','deleted') NOT NULL DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,(error) => {
            if(error){
                console.log("Failed to create users table.", error.message);
            }else{
                console.log("Users table created.");
            }
        }
    );
        

    //create posts table
    pool.query(
        `CREATE TABLE IF NOT EXISTS posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100),
            content TEXT NOT NULL,
            privacy ENUM('public','private') NOT NULL DEFAULT 'public',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (email) REFERENCES users(email) ON UPDATE CASCADE ON DELETE CASCADE
        )`,(error) => {
            if(error){
                console.log("Failed to create posts table.", error.message);
            }else{
                console.log("Posts table created.");
            }
        }
    );
};


//routes
app.use('/api/auth', userRouter);

// Call the function before starting the server
createTable();
app.listen((port), () => {
    console.log(`server running on port ${port}`);
});
