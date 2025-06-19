const jwt = require('jsonwebtoken');
const { User, RefreshToken } = require('../models/models');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

function generateAccessToken(userId) {
    return jwt.sign({ id: userId }, process.env.SECRET_KEY, { expiresIn: '15m' });
}

function generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
}

class AuthController {
    async registration(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, name } = req.body;

            const candidate = await User.findOne({ where: { email } });
            if (candidate) {
                return res.status(400).json({ message: 'Користувач з таким email вже існує' });
            }

            const user = await User.create({ email, password, name });
            const accessToken = generateAccessToken(user.id);
            const refreshToken = generateRefreshToken();
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 днів
            await RefreshToken.create({ userId: user.id, token: refreshToken, expiresAt });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            return res.status(201).json({
                token: accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            // Log the error details
            console.error('Registration error:', error);
            
            // Send more detailed error response
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(400).json({ message: 'Користувача не знайдено' });
            }

            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Невірний пароль' });
            }

            const accessToken = generateAccessToken(user.id);
            const refreshToken = generateRefreshToken();
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 днів
            await RefreshToken.create({ userId: user.id, token: refreshToken, expiresAt });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            return res.json({
                token: accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    async getMe(req, res) {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: { exclude: ['password'] }
            });
            return res.json(user);
        } catch (error) {
            console.error('GetMe error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    async refresh(req, res) {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) return res.status(401).json({ message: 'Refresh token missing' });
            const tokenInDb = await RefreshToken.findOne({ where: { token: refreshToken } });
            if (!tokenInDb || tokenInDb.expiresAt < new Date()) {
                return res.status(401).json({ message: 'Refresh token invalid or expired' });
            }
            const user = await User.findByPk(tokenInDb.userId);
            if (!user) return res.status(401).json({ message: 'User not found' });
            const newAccessToken = generateAccessToken(user.id);
            return res.json({ token: newAccessToken });
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async logout(req, res) {
        try {
            const { refreshToken } = req.cookies;
            if (refreshToken) {
                await RefreshToken.destroy({ where: { token: refreshToken } });
                res.clearCookie('refreshToken');
            }
            return res.json({ message: 'Logged out' });
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

module.exports = new AuthController(); 