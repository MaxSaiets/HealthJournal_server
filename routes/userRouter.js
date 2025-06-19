const Router = require('express')
const router = new Router() 
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const { body } = require('express-validator')

// Валідація для оновлення профілю
const profileValidation = [
    body('name').optional().isLength({ min: 2, max: 50 }).withMessage('Ім\'я має бути від 2 до 50 символів'),
    body('height').optional().isInt({ min: 100, max: 250 }).withMessage('Зріст має бути від 100 до 250 см'),
    body('weight').optional().isFloat({ min: 30, max: 300 }).withMessage('Вага має бути від 30 до 300 кг'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Неправильна стать'),
    body('activityLevel').optional().isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']).withMessage('Неправильний рівень активності')
]

// Валідація для зміни паролю
const passwordValidation = [
    body('currentPassword').notEmpty().withMessage('Поточний пароль обов\'язковий'),
    body('newPassword').isLength({ min: 6 }).withMessage('Новий пароль має бути мінімум 6 символів')
]

// Валідація для видалення акаунту
const deleteAccountValidation = [
    body('password').notEmpty().withMessage('Пароль обов\'язковий для підтвердження')
]

// Захищені роути (потребують авторизації)
router.use(authMiddleware)

// Отримання профілю
router.get('/profile', userController.getProfile)

// Оновлення профілю
router.put('/profile', profileValidation, userController.updateProfile)

// Зміна паролю
router.put('/change-password', passwordValidation, userController.changePassword)

// Отримання статистики
router.get('/stats', userController.getUserStats)

// Отримання історії активності
router.get('/activity-history', userController.getActivityHistory)

// Видалення акаунту
router.delete('/account', deleteAccountValidation, userController.deleteAccount)

// Перевірка авторизації
router.get('/auth', userController.checkAuth)

module.exports = router

