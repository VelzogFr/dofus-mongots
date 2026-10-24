import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import authRoutes from './features/auth/auth.route';
import userRoutes from './features/users/user.route';

export const app = express();

// Global Middleware
app.use(express.json());     
app.use(express.urlencoded({ extended: true })); 
app.use(cors());              
app.use(helmet());      
app.use(compression());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);