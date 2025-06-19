const { HealthEntry } = require('../models/models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

class HealthEntryController {
    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {
                date,
                mood,
                sleepHours,
                waterIntake,
                activityMinutes,
                activityType,
                steps,
                caloriesBurned,
                notes,
                tags
            } = req.body;

            const entry = await HealthEntry.create({
                userId: req.user.id,
                date,
                mood,
                sleepHours,
                waterIntake,
                activityMinutes,
                activityType,
                steps,
                caloriesBurned,
                notes,
                tags: tags || []
            });

            return res.status(201).json(entry);
        } catch (error) {
            console.error('Create entry error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async getAll(req, res) {
        try {
            console.log('Getting entries for user:', req.user.id);
            
            const { 
                startDate, 
                endDate,
                page = 1,
                limit = 10,
                entryType = '',
                sortField = '',
                sortOrder = 'desc'
            } = req.query;

            const where = { userId: req.user.id };

            if (startDate && endDate) {
                where.date = {
                    [Op.between]: [startDate, endDate]
                };
            }

            // Фільтрація по entryType
            if (entryType && entryType !== 'full') {
                if (['water', 'sleep', 'activity', 'mood'].includes(entryType)) {
                    const fieldMap = {
                        water: 'waterIntake',
                        sleep: 'sleepHours',
                        activity: 'activityMinutes',
                        mood: 'mood'
                    };
                    where[fieldMap[entryType]] = { [Op.not]: null };
                }
            }

            const offset = (page - 1) * limit;

            // Сортування
            let order = [['date', 'DESC']];
            if (sortField && sortField !== 'date') {
                order = [[sortField, sortOrder.toUpperCase()]];
            } else if (sortField === 'date') {
                order = [['date', sortOrder.toUpperCase()]];
            }

            console.log('Query parameters:', { where, limit, offset, order });

            const { count, rows: entries } = await HealthEntry.findAndCountAll({
                where,
                order,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            console.log(`Found ${count} entries`);

            const totalPages = Math.ceil(count / limit);

            return res.json({
                entries,
                totalPages,
                currentPage: parseInt(page),
                totalEntries: count
            });
        } catch (error) {
            console.error('Get all entries error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    async getOne(req, res) {
        try {
            const entry = await HealthEntry.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!entry) {
                return res.status(404).json({ message: 'Запис не знайдено' });
            }

            return res.json(entry);
        } catch (error) {
            console.error('Get one entry error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const numericFields = ['mood', 'sleepHours', 'waterIntake', 'activityMinutes', 'steps', 'caloriesBurned'];
            numericFields.forEach(field => {
                if (req.body[field] === '') req.body[field] = null;
            });

            const {
                date,
                mood,
                sleepHours,
                waterIntake,
                activityMinutes,
                activityType,
                steps,
                caloriesBurned,
                notes,
                tags
            } = req.body;

            const entry = await HealthEntry.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!entry) {
                return res.status(404).json({ message: 'Запис не знайдено' });
            }

            await entry.update({
                date,
                mood,
                sleepHours,
                waterIntake,
                activityMinutes,
                activityType,
                steps,
                caloriesBurned,
                notes,
                tags: tags || []
            });

            return res.json(entry);
        } catch (error) {
            console.error('Update entry error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            const entry = await HealthEntry.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!entry) {
                return res.status(404).json({ message: 'Запис не знайдено' });
            }

            await entry.destroy();
            return res.json({ message: 'Запис видалено' });
        } catch (error) {
            console.error('Delete entry error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async getStatistics(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const where = { userId: req.user.id };

            if (startDate && endDate) {
                where.date = {
                    [Op.between]: [startDate, endDate]
                };
            }

            const entries = await HealthEntry.findAll({
                where,
                attributes: [
                    'date',
                    'mood',
                    'sleepHours',
                    'waterIntake',
                    'activityMinutes',
                    'activityType',
                    'steps',
                    'caloriesBurned',
                    'tags'
                ],
                order: [['date', 'ASC']]
            });

            // Групування даних
            const groupedData = entries.reduce((acc, entry) => {
                const date = entry.date;
                if (!acc[date]) {
                    acc[date] = {
                        date,
                        entries: [],
                        totalWater: 0,
                        totalActivity: 0,
                        totalSteps: 0,
                        totalCalories: 0,
                        moods: []
                    };
                }

                acc[date].entries.push(entry);
                if (entry.waterIntake) acc[date].totalWater += entry.waterIntake;
                if (entry.activityMinutes) acc[date].totalActivity += entry.activityMinutes;
                if (entry.steps) acc[date].totalSteps += entry.steps;
                if (entry.caloriesBurned) acc[date].totalCalories += entry.caloriesBurned;
                if (entry.mood) acc[date].moods.push(entry.mood);

                return acc;
            }, {});

            // Обчислення середніх значень
            const statistics = Object.values(groupedData).map(day => ({
                ...day,
                averageMood: day.moods.length > 0
                    ? day.moods.reduce((sum, mood) => sum + mood, 0) / day.moods.length
                    : null
            }));

            // Обчислення загальної статистики
            const summary = {
                totalEntries: entries.length,
                averageMood: entries.length > 0
                    ? entries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / entries.length
                    : 0,
                totalWater: entries.reduce((sum, entry) => sum + (entry.waterIntake || 0), 0),
                totalActivity: entries.reduce((sum, entry) => sum + (entry.activityMinutes || 0), 0),
                totalSteps: entries.reduce((sum, entry) => sum + (entry.steps || 0), 0),
                totalCalories: entries.reduce((sum, entry) => sum + (entry.caloriesBurned || 0), 0)
            };

            return res.json({
                statistics,
                summary
            });
        } catch (error) {
            console.error('Get statistics error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }
}

module.exports = new HealthEntryController(); 