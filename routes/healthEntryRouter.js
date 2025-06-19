const Router = require('express');
const healthEntryController = require('../controllers/healthEntryController');
const authMiddleware = require('../middleware/auth');
const { body } = require('express-validator');

const router = new Router();

router.use(authMiddleware);

const entryValidation = [
    body('date').isDate().withMessage('Невірний формат дати'),
    body('mood').isInt({ min: 1, max: 5 }).withMessage('Настрій повинен бути від 1 до 5'),
    body('sleepHours').isFloat({ min: 0, max: 24 }).withMessage('Години сну повинні бути від 0 до 24'),
    body('waterIntake').isInt({ min: 0 }).withMessage('Споживання води не може бути від\'ємним'),
    body('activityMinutes').isInt({ min: 0 }).withMessage('Активність не може бути від\'ємною'),
    body('notes').optional().isString().withMessage('Нотатки повинні бути рядком')
];

router.post('/', entryValidation, healthEntryController.create);

router.get('/', healthEntryController.getAll);

router.get('/statistics', healthEntryController.getStatistics);

router.get('/:id', healthEntryController.getOne);

router.put('/:id', entryValidation, healthEntryController.update);

router.delete('/:id', healthEntryController.delete);

module.exports = router; 