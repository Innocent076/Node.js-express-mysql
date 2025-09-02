import express from 'express';
import pool from '../config/dbConfig.js';
import bcrypt from 'bcrypt';
import { registerUser, verifyUser, loginUser, userProfile, adminDashboard } from '../controllers/usersController.js';
import { authorize } from '../middleware/authMiddleware.js'

const router = express.Router();

//routes
router.post('/register', registerUser);
router.post('/register/verify', verifyUser);
router.post('/login', loginUser);

//protected routes
router.get('/user/profile', authorize(['user', 'admin']), userProfile);
router.get('/admin/dashboard', authorize(['admin']), adminDashboard);

export default router;