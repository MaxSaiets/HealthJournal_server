const { Reminder } = require('../models/models');
const { validationResult } = require('express-validator');

class ReminderController {
    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { 
                title, 
                description, 
                time, 
                repeatType = 'none',
                daysOfWeek = [],
                date // ДОДАНО
            } = req.body;

            const reminder = await Reminder.create({
                userId: req.user.id,
                title,
                description,
                time,
                repeatType,
                daysOfWeek,
                date // ДОДАНО
            });

            return res.status(201).json(reminder);
        } catch (error) {
            console.error('Create reminder error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async getAll(req, res) {
        try {
            const { active } = req.query;
            const where = { userId: req.user.id };
            
            if (active !== undefined) {
                where.isActive = active === 'true';
            }

            const reminders = await Reminder.findAll({
                where,
                order: [['time', 'ASC']]
            });

            return res.json(reminders);
        } catch (error) {
            console.error('Get all reminders error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async getOne(req, res) {
        try {
            const reminder = await Reminder.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!reminder) {
                return res.status(404).json({ message: 'Нагадування не знайдено' });
            }

            return res.json(reminder);
        } catch (error) {
            console.error('Get one reminder error:', error);
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

            const { 
                title, 
                description, 
                time, 
                isActive,
                repeatType,
                daysOfWeek,
                date // ДОДАНО
            } = req.body;

            const reminder = await Reminder.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!reminder) {
                return res.status(404).json({ message: 'Нагадування не знайдено' });
            }

            await reminder.update({
                title,
                description,
                time,
                isActive,
                repeatType,
                daysOfWeek,
                date // ДОДАНО
            });

            return res.json(reminder);
        } catch (error) {
            console.error('Update reminder error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async toggleActive(req, res) {
        try {
            const reminder = await Reminder.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!reminder) {
                return res.status(404).json({ message: 'Нагадування не знайдено' });
            }

            await reminder.update({ isActive: !reminder.isActive });

            return res.json(reminder);
        } catch (error) {
            console.error('Toggle reminder error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            const reminder = await Reminder.findOne({
                where: {
                    id: req.params.id,
                    userId: req.user.id
                }
            });

            if (!reminder) {
                return res.status(404).json({ message: 'Нагадування не знайдено' });
            }

            await reminder.destroy();
            return res.json({ message: 'Нагадування видалено' });
        } catch (error) {
            console.error('Delete reminder error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async getTodayReminders(req, res) {
        try {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const todayStr = today.toISOString().slice(0, 10); // 'YYYY-MM-DD'
            const Op = require('sequelize').Op;
            const where = {
                userId: req.user.id,
                isActive: true,
                [Op.or]: [
                    { repeatType: 'daily' },
                    { repeatType: 'weekly', daysOfWeek: { [Op.contains]: [dayOfWeek] } },
                    { repeatType: 'monthly', daysOfWeek: { [Op.contains]: [today.getDate()] } },
                    { repeatType: 'none', date: todayStr }
                ]
            };
            const reminders = await Reminder.findAll({
                where,
                order: [['time', 'ASC']]
            });
            // DEBUG LOG
            console.log('getTodayReminders', {
                userId: req.user.id,
                todayStr,
                dayOfWeek,
                dayOfMonth: today.getDate(),
                where,
                found: reminders.map(r => ({
                    id: r.id,
                    title: r.title,
                    repeatType: r.repeatType,
                    daysOfWeek: r.daysOfWeek,
                    date: r.date,
                    isActive: r.isActive,
                    time: r.time
                }))
            });
            return res.json(reminders);
        } catch (error) {
            console.error('Get today reminders error:', error);
            return res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }
}

module.exports = new ReminderController(); 