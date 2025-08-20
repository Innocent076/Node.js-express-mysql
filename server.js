import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql';

const app = express();
const port = process.env.PORT || 4040;

app.use(bodyParser.urlencoded({ extended: false }));//helps us read url encoded data.
app.use(bodyParser.json());//helps us read json data

//MySql
const pool = mysql.createPool({
    connectionLimit : 10,
    user: 'root',
    password: '',
    host: 'localhost',
    database: 'posts_db'
});

//get all posts
app.get('/', (req, res) => {
    pool.getConnection((error, connection) => {
        if (error) {
            console.error("Database connection failed:", error);
            res.status(500).send(`Database connection failed error => ${error}`);
        } else {
            console.log(`Connected as ID ${connection.threadId}`);
            //res.send("Database connection successful");
            //connection.release(); // always release back to pool
        }

        connection.query('SELECT * FROM posts', (error, rows) => {
            connection.release();//return the connection to the pool

            if(error){
                console.error("Query faild: ", error);
                res.status(500).send("Query faild");
            }else {
                res.json(rows);
            }
        });
    });
});

//get post by id
app.get('/:id', (req, res) => {

    pool.getConnection((error, connection) => {
        
        const idNum = parseInt(req.params.id);

        connection.query('SELECT * FROM posts WHERE id = ?', [idNum] , (error, rows) => {
            connection.release();//return the connection to the pool

            if(error){
                console.error("Query faild: ", error);
                res.status(500).send("Query faild");
            }else {
                res.json(rows);
            }
        });
    });
});

//delete a record
app.delete('/:id', (req, res) => {

    pool.getConnection((error, connection) => {      

        const idNum = parseInt(req.params.id);

        connection.query('DELETE FROM posts WHERE id = ?', [idNum] , (error, rows) => {
            connection.release();//return the connection to the pool

            if(error){
                console.error("Query faild: ", error);
                res.status(500).send("Query faild");
            }else {
                res.json(`Post with the record id ${idNum} has been successfully deleted`);
            }
        });
    });
});

//Add a record/post
app.post('', (req, res) => {

    pool.getConnection((error, connection) => {      
        if(error) throw error;
        console.log(`connected as Id ${connection.threadId}`);

        //const idNum = parseInt(req.params.id);
        const params = req.body;


        connection.query('INSERT INTO posts SET ?', params , (error, rows) => {
            connection.release();//return the connection to the pool

            if(error){
                console.error("Query faild: ", error);
                res.status(500).send("Query faild");
            }else {
                res.json(`Post with the title of ${params.title} has been successfully ADDED`);
            }
        });

        console.log(req.body);
    });
});

//update a record/post
app.put('/:id', (req, res) => {

    pool.getConnection((error, connection) => {      
        if(error) throw error;
        console.log(`connected as Id ${connection.threadId}`);
      
        const {id, title} = req.body;

        connection.query('UPDATE posts SET title = ? WHERE id = ?', {title, id} , (error, rows) => {
            connection.release();//return the connection to the pool

            if(error){
                console.error("Query faild: ", error);
                res.status(500).send("Query faild");
            }else {
                res.json(`Post with the title of ${params.title} has been successfully ADDED`);
            }
        });

        console.log(req.body);
    });
});



app.listen((port), () => {
    console.log(`server running on port ${port}`);
});
