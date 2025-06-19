//jsonwebtoken - для створення самого jwt токена
//bcrypt - для хеширования паролів і тп. щоб не зберігати у відкритому доступі
const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User, HealthEntry } = require('../models/models')
const { Op } = require('sequelize')
const { validationResult } = require('express-validator')

const generateJwt = (id, email, role) => {
    return jwt.sign(
        {id, email, role}, 
        process.env.SECRET_KEY,
        { expiresIn: '24h', algorithm: 'HS256' } // опції, час життя
    )
}

class UserController {
    // Function to get or create a new user in the database
    async getOrsaveNewUserInDatabase(req, res, next) {
        const { email, token, userData } = req.body;

        if (!email || !token) {
            return next(ApiError.badRequest('Invalid email or token'));
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;

            let user = await User.findOne({ where: { uid } });

            if (!user) {
                // user = await User.create({ email, role: "ADMIN", uid, name: userData.name, photoURL: userData.photoURL });
                user = await User.create({ email, role: "ADMIN", uid });
            }

            return res.json({ user });
        } catch (error) {
            console.log("ERROR with getOrsaveNewUserInDatabase", error);
            return next(ApiError.internal('Error while verifying the token'));
        }
    }

   // Function to get a user from the database
    async getUserFromDatabase(req, res, next) {
        const bearerHeader = req.headers.authorization;
        if (!bearerHeader) {
            return next(ApiError.badRequest('Token not provided'));
        }

        const bearer = bearerHeader.split(' ');
        const token = bearer[1];

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);

            const uid = decodedToken.uid;

            const user = await User.findOne({ where: { uid } });

            if (!user) { 
                return next(ApiError.internal('User not found'));
            }
            return res.json({ user });
        } catch (error) {
            console.log("ERROR with getUserFromDatabase", error);
            return next(ApiError.internal('Error while verifying the token'));
        }
    }

    // Отримання профілю користувача
    async getProfile(req, res) {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: { exclude: ['password'] }
            });

            if (!user) {
                return res.status(404).json({ message: 'Користувача не знайдено' });
            }

            return res.json(user);
        } catch (error) {
            console.error('Get profile error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    // Оновлення профілю користувача
    async updateProfile(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {
                name,
                avatar,
                dateOfBirth,
                gender,
                height,
                weight,
                activityLevel,
                healthGoals,
                preferences
            } = req.body;

            const user = await User.findByPk(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'Користувача не знайдено' });
            }

            let safeDateOfBirth = dateOfBirth;
            if (!dateOfBirth || isNaN(Date.parse(dateOfBirth))) {
                safeDateOfBirth = null;
            }

            await user.update({
                name: name || user.name,
                avatar,
                dateOfBirth: safeDateOfBirth,
                gender,
                height,
                weight,
                activityLevel,
                healthGoals,
                preferences: { ...user.preferences, ...preferences }
            });

            const updatedUser = await User.findByPk(req.user.id, {
                attributes: { exclude: ['password'] }
            });

            return res.json(updatedUser);
        } catch (error) {
            console.error('Update profile error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    // Зміна паролю
    async changePassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { currentPassword, newPassword } = req.body;

            const user = await User.findByPk(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'Користувача не знайдено' });
            }

            // Перевірка поточного паролю
            const isValidPassword = await user.validatePassword(currentPassword);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Неправильний поточний пароль' });
            }

            // Оновлення паролю
            user.password = newPassword;
            await user.save();

            return res.json({ message: 'Пароль успішно змінено' });
        } catch (error) {
            console.error('Change password error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    // Отримання статистики користувача
    async getUserStats(req, res) {
        try {
            const userId = req.user.id;
            const { period = '30' } = req.query; // днів

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(period));

            // Отримання записів за період
            const entries = await HealthEntry.findAll({
                where: {
                    userId,
                    date: {
                        [Op.gte]: startDate
                    }
                },
                order: [['date', 'ASC']]
            });

            // Розрахунок статистики
            const stats = {
                totalEntries: entries.length,
                averageMood: 0,
                totalWater: 0,
                totalActivity: 0,
                totalSteps: 0,
                totalCalories: 0,
                averageSleep: 0,
                streakDays: 0,
                goals: {
                    waterGoal: 2000,
                    sleepGoal: 8,
                    activityGoal: 30
                },
                achievements: []
            };

            if (entries.length > 0) {
                stats.averageMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
                stats.totalWater = entries.reduce((sum, entry) => sum + entry.waterIntake, 0);
                stats.totalActivity = entries.reduce((sum, entry) => sum + entry.activityMinutes, 0);
                stats.totalSteps = entries.reduce((sum, entry) => sum + (entry.steps || 0), 0);
                stats.totalCalories = entries.reduce((sum, entry) => sum + (entry.caloriesBurned || 0), 0);
                stats.averageSleep = entries.reduce((sum, entry) => sum + entry.sleepHours, 0) / entries.length;

                // Розрахунок streak (днів поспіль)
                const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
                let currentStreak = 0;
                let maxStreak = 0;
                let lastDate = null;

                for (const entry of sortedEntries) {
                    const entryDate = new Date(entry.date);
                    if (!lastDate || (entryDate - lastDate) / (1000 * 60 * 60 * 24) === 1) {
                        currentStreak++;
                        maxStreak = Math.max(maxStreak, currentStreak);
                    } else {
                        currentStreak = 1;
                    }
                    lastDate = entryDate;
                }
                stats.streakDays = maxStreak;
            }

            // Розрахунок досягнень
            if (stats.totalEntries >= 7) stats.achievements.push('Перший тиждень');
            if (stats.totalEntries >= 30) stats.achievements.push('Місяць ведення щоденника');
            if (stats.streakDays >= 7) stats.achievements.push('Тиждень поспіль');
            if (stats.averageMood >= 4) stats.achievements.push('Позитивний настрій');
            if (stats.averageSleep >= 7) stats.achievements.push('Здоровий сон');

            return res.json(stats);
        } catch (error) {
            console.error('Get user stats error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    // Видалення акаунту
    async deleteAccount(req, res) {
        try {
            const { password } = req.body;

            const user = await User.findByPk(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'Користувача не знайдено' });
            }

            // Перевірка паролю
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Неправильний пароль' });
            }

            // Видалення всіх записів користувача
            await HealthEntry.destroy({ where: { userId: req.user.id } });

            // Видалення користувача
            await user.destroy();

            return res.json({ message: 'Акаунт успішно видалено' });
        } catch (error) {
            console.error('Delete account error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    // Перевірка авторизації
    async checkAuth(req, res) {
        try {
            const token = generateJwt(req.user.id, req.user.email, req.user.role);
            
            // Оновлення часу останнього входу
            await User.update(
                { lastLoginAt: new Date() },
                { where: { id: req.user.id } }
            );

            return res.json({ token });
        } catch (error) {
            console.error('Check auth error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    // Отримання історії активності
    async getActivityHistory(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows: entries } = await HealthEntry.findAndCountAll({
                where: { userId: req.user.id },
                order: [['date', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                attributes: ['id', 'date', 'mood', 'sleepHours', 'waterIntake', 'activityMinutes', 'activityType', 'steps', 'caloriesBurned', 'notes']
            });

            const totalPages = Math.ceil(count / limit);

            return res.json({
                entries,
                totalPages,
                currentPage: parseInt(page),
                totalEntries: count
            });
        } catch (error) {
            console.error('Get activity history error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }
}

module.exports = new UserController()


//const query = req.query
/* const {id} = req.query //Деструктуризация(щоб витянути одразу id) можна також query.id
if(!id){
    return next(ApiError.badRequest('Не вказаний id'))
}
res.json (id) */