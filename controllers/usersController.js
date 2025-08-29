import bcrypt, { hash } from 'bcrypt';
import pool from '../config/dbConfig.js';
import jwt from 'jsonwebtoken';


//register user
export  const registerUser = async (req, res) => {
    const { email, name, surname, password } = req.body;

    //basic validation
    if (!email) {
        return res.status(400).json({ error: 'Email field must not be empty' });
    } else if (!password) {
        return res.status(400).json({ error: 'Password field must not be empty' });
    }else if(!name){
        return res.status(400).json({ error: 'Name field must not be empty' });
    }else if(!surname){
        return res.status(400).json({ error: 'Surname field must not be empty' });
    }

    //check if user exists
    pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (error, results) => {
            if(error){
                console.error("DB error:", err.message);
                return res.status(500).json({ error: "Database error" });
            }

            if(results.length > 0){
                return res.status(409).json({ error: "User already exists"});
            }

            //hash password
           bcrypt.hash(password, 10, (error, hash) => {
            if(error){
                console.error("Error hashing password");
                return res.status(500).json({ error: "Password hasing faild"});
            }

            const user = { email, name, surname, password: hash};

            //now insert user
            pool.query("INSERT INTO users SET ? ",
                user,
            (error, results) => {
                if(error){
                    console.error("Error registering user", error.message);
                    return res.status(500).json({ error: "Faild to register user"});
                }

                // generate JWT token
                const token = jwt.sign(
                    { email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: '2h' }
                );

                const refreshToken = jwt.sign(
                    { email: user.email },
                    process.env.JWT_REFRESH_SECRET,
                    { expiresIn: '7d' }
                );

                res.status(201).json({
                    message: "User registered successfully",
                    user: { email: user.email },
                    name: user.name,
                    surname: user.surname
                });
            });

           });
        }
    );

};



// login
export const loginUser = (req, res) => {
    const { email, password } = req.body;

    // basic validation
    if (!email) {
        return res.status(400).json({ error: 'Email field must not be empty' });
    } else if (!password) {
        return res.status(400).json({ error: 'Password field must not be empty' });
    }

    // check if user exists
    pool.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) {
            console.error("DB error:", err.message);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Email not found, please register" });
        }

        const user = results[0];

        // compare hashed passwords
        bcrypt.compare(password, user.password, (err, passwordMatch) => {
            if (err) {
                console.error("Error comparing passwords:", err.message);
                return res.status(500).json({ error: "Password comparison failed" });
            }

            if (!passwordMatch) {
                console.error("Incorrect password");
                return res.status(401).json({ error: "Incorrect password, please enter correct password" });
            }

            const token = jwt.sign(
                { email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            const refreshToken = jwt.sign(
                { email: user.email },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: "User login successful",
                email: user.email,
                token,
                refreshToken
            });
        });
    });
};