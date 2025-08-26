import express from 'express';
import pool from '../config/dbConfig.js';

const router = express.Router();

//register user
router.post('/register', async (req, res) => {
    const { email, password} = req.body;
    if(!email || !password){
        return res.json({error: 'Missing required fields.'});
    }

    pool.getConnection((error, connection) => {
        if(error){
            console.error("Database connection faild", error);
            return res.status(500).json({ error: "Database connection faild"});
        }

        const user = { email, password };

        connection.query(
            "INSERT INTO users SET ?", 
            user, (error, results) => {
                connection.release();

                if(error){
                    console.error("Faild to register user:", error.message);
                    return res.status(500).json({ error: "Faild to register user."});
                }

                res.status(201).json({ message: "User registered successfully"});
            });
    });

});

//Login user
router.post('/login', async (req, res) =>{
    const { email, password } = req.body;

    if(!email, !password){
        console.error("missing required fields");
        return res.status(400).json({ error: 'Missing required fields.'});
    }

    pool.getConnection((error, connection) => {
        if(error){
                    console.error("Faild to register user:", error.message);
                    return res.status(500).json({ error: "Faild to register user."});
        }

        //check if email exists
        connection.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            (error, results) => {
                connection.release();

                if(error){
                    console.error('Query error:', err);
                    return res.status(500).json({ error: 'Login failed' });
                }

                if(results.length === 0){
                    return res.status(404).json({ error: 'Email not found, please register.'});
                }

                const user = results[0];

                if(password !== user.password){
                    return res.status(401).json({ error: 'Incorrect password, please enter correct password.'});
                }

                res.json({ 
                    user_email: user.email,
                    user_password: user.password
                });
            });
    });
});

//update user
router.put('/update/:email', (req, res) => {
    const { email } = req.params;
    const { password } = req.body;
    
    pool.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [password, email],
        (error, results) => {
            if(error){
                console.error("Failed to update user");
                return res.json({error: "faild to update user"});
            }
            console.error("User updted");
            res.status(200).json({message: "User updated"});
        } 
    );
    
});

//delete user
router.delete('/delete/:email', (req, res) =>{
    const { email } = req.params;
    
    pool.query(
        "SELECT * FROM users WHERE email =? ",
        [email],
        (error, results) =>{
            if(error){
               console.error("Error checking user", error);
               return res.json({message: "Error checking user"}); 
            }

            if(results.length === 0){
                console.log("User not found");
                return res.json({message: "User not found"});
            }

       
    pool.query(
        "DELETE FROM users WHERE email = ?",
        [email],
        (error, results) => {
            if(error){
                console.error("Faild to delete user", error);
                req.json({error: "Faild to delete user"});
            }

            console.log("User deleted");
            res.json({message: "User deleted."});
        });
    });
});

export default router;