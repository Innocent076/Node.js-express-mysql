import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql';

const app = express();
const port = process.env.PORT || 4040;

app.use(bodyParser.urlencoded({ extended: false }));//helps us read url encoded data.
//app.use(bodyParser.json());//helps us read json data
app.use(express.json()); // or bodyParser.json()


//MySql
const pool = mysql.createPool({
    connectionLimit : 10,
    user: 'root',
    password: '',
    host: 'localhost',
    database: 'posts_db'
});

/*
// Add this near the top, after your pool is created
const createTables = () => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Database connection failed:", err);
            return;
        }

        // Create department table
        const createDepartmentTable = `
            CREATE TABLE IF NOT EXISTS department (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            )
        `;
        connection.query(createDepartmentTable, (err) => {
            if (err) console.error("Failed to create department table:", err);
            else console.log("Department table ready");
        });

    });
};
*/


// Add this near the top, after your pool is created
const createTables = () => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Database connection failed:", err);
            return;
        }

        // Create department table
        connection.query(
            `
            CREATE TABLE IF NOT EXISTS posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(30) NOT NULL
            )`,
            (err) => {
                if(err){
                    console.error("Faild to create posts table:", err.message);
                }else {
                    console.log("Posts table created");
                }
            });


        connection.query(
            `
            CREATE TABLE IF NOT EXISTS department (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            )
            `, 
            (err) => {
            if (err) console.error("Failed to create department table:", err);
            else console.log("Department table created");
        });

        connection.query(
            `CREATE TABLE IF NOT EXISTS sales (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            )`,
            (err) => {
                if(err){
                    console.error("Error creating sales table:",  err.message);
                }else {
                    console.log("Sales table created");
                } 

            });
        connection.query(
            `CREATE TABLE IF NOT EXISTS budget (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            )`,
            (err) => {
                if(err){
                    console.error("Error creating budge table:",  err.message);
                }else {
                    console.log("Budget table created");
                } 

            });


    });
};





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
        if (error) {
            console.error("Database connection failed:", error);
            res.status(500).send(`Database connection failed error => ${error}`);
        } else {
            console.log(`Connected as ID ${connection.threadId}`);
            //res.send("Database connection successful");
            //connection.release(); // always release back to pool
        }

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
        if (error) {
            console.error("Database connection failed:", error);
            res.status(500).send(`Database connection failed error => ${error}`);
        } else {
            console.log(`Connected as ID ${connection.threadId}`);
            //res.send("Database connection successful");
            //connection.release(); // always release back to pool
        }

        const idNum = parseInt(req.params.id);
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

/*
//update user
app.patch('/:id', (req, res) => {
    pool.getConnection((error, connection) => {
        if(error){
            console.error("Database connection faild:", error);
            res.status(500).send(`Database connection faild error: => ${error}`);
        }else{
            console.log(`Connected as ID ${connection.threadId}`);
        }

        const idNum = parseInt(req.params.id);
        const title = req.body || {};

        if(Object.keys(title).length === 0){
            connection.release();
            return res.status(400).json({error: "No fields to update"});
        }

        connection.query(
            "UPDATE posts SET ? WHERE id = ?",
            [title, id],
            (error, result) => {
                connection.release();

                if(error) return res.status(500).json({error: "Query failed"});
                if(result.affectedRows === 0){
                    return res.status(404).json({error: "Post not found"});
                }

                console.log(`Post with ID ${idNum} updated successfully`);
                res.json({message: `Post with ID ${idNum} updated successfully`});
            }
        );
    });
});*/

//update title
app.put('/:id',(req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    pool.getConnection((error, connection) => {
        if(error){
            console.error("Database connection faild:", error);
            res.status(500).send(`Database connection faild error: => ${error}`);
        }else{
            console.log(`Connected as ID ${connection.threadId}`);
        }

        connection.query(
            "UPDATE posts SET title = ? WHERE id = ?",
            [title, id],
            (error, result) => {
                connection.release();

                if(error) return res.status(500).json({error: "Query failed"});
                if(result.affectedRows === 0){
                    return res.status(404).json({error: "Post not found"});
                }

                console.log(`Post with ID ${id} updated successfully`);
                res.json({message: `Post with ID ${id} updated successfully`});
            }
        );
    });
});


// Call the function before starting the server
createTables();

app.listen((port), () => {
    console.log(`server running on port ${port}`);
});
