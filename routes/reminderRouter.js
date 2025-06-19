const Router = require('express');
const reminderController = require('../controllers/reminderController');
const authMiddleware = require('../middleware/auth');
const { body } = require('express-validator');

const router = new Router();

router.use(authMiddleware);

// Створення нагадування
router.post('/',
    [
        body('title').notEmpty().withMessage('Назва не може бути порожньою'),
        body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Невірний формат часу (HH:MM)'),
        body('repeatType').optional().isIn(['none', 'daily', 'weekly', 'monthly']).withMessage('Невірний тип повторення'),
        body('daysOfWeek').optional().isArray().withMessage('Дні тижня повинні бути масивом')
    ],
    reminderController.create
);

// Отримання всіх нагадувань (з фільтрацією за активністю)
router.get('/', reminderController.getAll);

// Отримання конкретного нагадування
router.get('/:id', reminderController.getOne);

// Отримання нагадувань на сьогодні
router.get('/today/list', reminderController.getTodayReminders);

// Оновлення нагадування
router.put('/:id',
    [
        body('title').notEmpty().withMessage('Назва не може бути порожньою'),
        body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Невірний формат часу (HH:MM)'),
        body('isActive').optional().isBoolean().withMessage('isActive повинен бути булевим значенням'),
        body('repeatType').optional().isIn(['none', 'daily', 'weekly', 'monthly']).withMessage('Невірний тип повторення'),
        body('daysOfWeek').optional().isArray().withMessage('Дні тижня повинні бути масивом')
    ],
    reminderController.update
);

// Перемикання активності нагадування
router.patch('/:id/toggle', reminderController.toggleActive);

// Видалення нагадування
router.delete('/:id', reminderController.delete);

module.exports = router; 