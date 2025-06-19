const Router = require('express');
const quoteController = require('../controllers/quoteController');
const { body } = require('express-validator');

const router = new Router();

// Middleware для обробки помилок валідації
const handleValidationErrors = (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Помилка валідації',
            errors: errors.array()
        });
    }
    next();
};

// Отримання категорій (спочатку специфічні роути)
router.get('/categories/list', quoteController.getCategories);

// Отримання випадкової цитати
router.get('/random/quote', quoteController.getRandom);

// Отримання цитати дня
router.get('/daily/quote', quoteController.getDaily);

// Отримання всіх цитат (з пагінацією та пошуком)
router.get('/', quoteController.getAll);

// Створення цитати
router.post('/',
    [
        body('text').notEmpty().withMessage('Текст цитати не може бути порожнім'),
        body('author').optional().isString().withMessage('Автор повинен бути рядком'),
        body('category').optional().isString().withMessage('Категорія повинна бути рядком')
    ],
    handleValidationErrors,
    quoteController.create
);

// Отримання конкретної цитати (після всіх інших роутів)
router.get('/:id', quoteController.getOne);

// Оновлення цитати
router.put('/:id',
    [
        body('text').optional().notEmpty().withMessage('Текст цитати не може бути порожнім'),
        body('author').optional().isString().withMessage('Автор повинен бути рядком'),
        body('category').optional().isString().withMessage('Категорія повинна бути рядком')
    ],
    handleValidationErrors,
    quoteController.update
);

// Видалення цитати
router.delete('/:id', quoteController.delete);

module.exports = router; 