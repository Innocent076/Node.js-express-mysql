import express from 'express';
import pool from '../config/dbConfig.js';
import bcrypt from 'bcrypt';
import { registerUser, loginUser } from '../controllers/usersController.js';

const router = express.Router();

//routes
router.post('/register', registerUser);
router.post('/login', loginUser);


export default router;