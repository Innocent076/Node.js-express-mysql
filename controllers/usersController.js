import bcrypt from 'bcrypt';
import pool from '../config/dbConfig.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import axios from 'axios';

// temporary stores
const verificationCodes = {};
const pendingUsers = {};

// email sending setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// REGISTER
export const registerUser = async (req, res) => {
    const { email, name, surname, password, role } = req.body;

    if (!email || !password || !name || !surname) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    //validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    /*
    //choose email validity using MailboxlayerAPI
    try {
        const response = await axios.get(`http://apilayer.net/api/check?access_key=${process.env.MAILBOXLAYER_API_KEY}&email=${email}&smtp=1&format=1`);
        const data = response.data;

        if(!data.format_valid || !data.smtp_check){
            return res.status(400).json({ error: `Invalid or none existent email address`});

        }
    } catch (error) {
        console.error("Mailboxlayer API error", error.message);
        return res.status(400).json({ error: "Failed to verify email"});
    }*/

    pool.query("SELECT * FROM users WHERE email = ?", [email], (error, results) => {
        if (error) {
            console.error("DB error:", error.message);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: "User already exists" });
        }

        const code = Math.floor(1000 + Math.random() * 9000);
        verificationCodes[email] = code;

        pendingUsers[email] = { email, name, surname, password, role: role || 'user' };

        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify your email",
            text: `Your verification code is: ${code}`
        }, (error) => {
            if (error) {
                console.error("Failed to send email", error);
                return res.status(500).json({ error: "Failed to send email" });
            }

            console.log(`Verification code for ${email}: ${code}`);
            res.status(200).json({ message: "Verification code sent to your email" });
        });
    });
};

// VERIFY
export const verifyUser = (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: "Email and code are required" });
    }

    if (verificationCodes[email] != code) {
        return res.status(400).json({ error: "Invalid verification code" });
    }

    const userData = pendingUsers[email];
    if (!userData) {
        return res.status(400).json({ error: "No registration found for this email" });
    }

    bcrypt.hash(userData.password, 10, (error, hash) => {
        if (error) {
            console.error("Error hashing password", error);
            return res.status(500).json({ error: "Password hashing failed" });
        }

        const user = {
            email: userData.email,
            name: userData.name,
            surname: userData.surname,
            password: hash,
            role: userData.role
        };

        pool.query("INSERT INTO users SET ?", user, (error) => {
            if (error) {
                console.error("Error registering user", error.message);
                return res.status(500).json({ error: "Failed to register user" });
            }

            delete verificationCodes[email];
            delete pendingUsers[email];

            const token = jwt.sign(
                { email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            const refreshToken = jwt.sign(
                { email: user.email, role: user.role },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                message: "User verified and registered successfully",
                user: { email: user.email, name: user.name, surname: user.surname, role: user.role },
                token,
                refreshToken
            });
        });
    });
};

// LOGIN
export const loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    pool.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) {
            console.error("DB error:", err.message);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Email not found, please register" });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, passwordMatch) => {
            if (err) {
                console.error("Error comparing passwords:", err.message);
                return res.status(500).json({ error: "Password comparison failed" });
            }

            if (!passwordMatch) {
                return res.status(401).json({ error: "Incorrect password" });
            }

            const token = jwt.sign(
                { email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            const refreshToken = jwt.sign(
                { email: user.email, role: user.role },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: "User login successful",
                email: user.email,
                role: user.role,
                token,
                refreshToken
            });
        });
    });
};

export const userProfile = (req, res) => {
    res.json({ message: `Welcome user, ${req.user.email}`});
};

export const adminDashboard = (req, res) => {
    res.json({ message: `Welcome Admin, ${req.user.email}!` });
};