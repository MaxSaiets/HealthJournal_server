const { Quote } = require('../models/models');
const { Op, Sequelize } = require('sequelize');

class QuoteController {
    async getAll(req, res) {
        try {
            const { category, page = 1, limit = 20, search } = req.query;
            const where = {};
            const offset = (page - 1) * limit;

            if (category) {
                where.category = category;
            }

            if (search) {
                where[Op.or] = [
                    { text: { [Op.iLike]: `%${search}%` } },
                    { author: { [Op.iLike]: `%${search}%` } }
                ];
            }

            const { count, rows: quotes } = await Quote.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']]
            });

            res.json({
                quotes,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                totalQuotes: count
            });
        } catch (error) {
            console.error('Get all quotes error:', error);
            res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async getOne(req, res) {
        try {
            const quote = await Quote.findByPk(req.params.id);
            
            if (!quote) {
                return res.status(404).json({ message: 'Цитату не знайдено' });
            }

            res.json(quote);
        } catch (error) {
            console.error('Get one quote error:', error);
            res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async getRandom(req, res) {
        try {
            const { category, mood } = req.query;
            const where = {};

            if (category) {
                where.category = category;
            }

            // Фільтрація за настроєм (якщо передано)
            if (mood) {
                const moodCategories = {
                    1: ['motivation', 'inspiration', 'hope'],
                    2: ['motivation', 'encouragement'],
                    3: ['balance', 'wisdom'],
                    4: ['success', 'achievement'],
                    5: ['celebration', 'joy', 'success']
                };
                
                if (moodCategories[mood]) {
                    where.category = { [Op.in]: moodCategories[mood] };
                }
            }

            const count = await Quote.count({ where });
            
            if (count === 0) {
                // Якщо немає цитат з фільтром, беремо будь-яку
                const fallbackQuote = await Quote.findOne({
                    order: Sequelize.literal('RANDOM()')
                });
                
                if (!fallbackQuote) {
                    return res.status(404).json({ message: 'Цитати не знайдено' });
                }
                
                return res.json(fallbackQuote);
            }

            const random = Math.floor(Math.random() * count);
            const quote = await Quote.findOne({
                where,
                offset: random
            });

            res.json(quote);
        } catch (error) {
            console.error('Get random quote error:', error);
            res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async getDaily(req, res) {
        try {
            const today = new Date();
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            
            // Використовуємо день року для визначення цитати дня
            const count = await Quote.count();
            const quoteIndex = dayOfYear % count;
            
            const quote = await Quote.findOne({
                offset: quoteIndex
            });

            if (!quote) {
                return res.status(404).json({ message: 'Цитату дня не знайдено' });
            }

            res.json(quote);
        } catch (error) {
            console.error('Get daily quote error:', error);
            res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async create(req, res) {
        try {
            const { text, author, category } = req.body;

            if (!text) {
                return res.status(400).json({ message: 'Текст цитати обов\'язковий' });
            }

            const quote = await Quote.create({
                text,
                author: author || 'Невідомий автор',
                category: category || 'general'
            });

            res.status(201).json(quote);
        } catch (error) {
            console.error('Create quote error:', error);
            res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const { text, author, category } = req.body;
            const quote = await Quote.findByPk(req.params.id);

            if (!quote) {
                return res.status(404).json({ message: 'Цитату не знайдено' });
            }

            await quote.update({
                text: text || quote.text,
                author: author || quote.author,
                category: category || quote.category
            });

            res.json(quote);
        } catch (error) {
            console.error('Update quote error:', error);
            res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            const quote = await Quote.findByPk(req.params.id);

            if (!quote) {
                return res.status(404).json({ message: 'Цитату не знайдено' });
            }

            await quote.destroy();
            res.json({ message: 'Цитату видалено' });
        } catch (error) {
            console.error('Delete quote error:', error);
            res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }

    async getCategories(req, res) {
        try {
            const categories = await Quote.findAll({
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('category')), 'category']],
                raw: true
            });

            const categoryList = categories.map(cat => cat.category).filter(Boolean);
            res.json(categoryList);
        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({ 
                message: 'Помилка сервера',
                error: error.message
            });
        }
    }
}

module.exports = new QuoteController(); 