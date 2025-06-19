const Router = require('express')
const router = new Router() 
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const { body } = require('express-validator')

const profileValidation = [
    body('name').optional().isLength({ min: 2, max: 50 }).withMessage('Ім\'я має бути від 2 до 50 символів'),
    body('height').optional().isInt({ min: 100, max: 250 }).withMessage('Зріст має бути від 100 до 250 см'),
    body('weight').optional().isFloat({ min: 30, max: 300 }).withMessage('Вага має бути від 30 до 300 кг'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Неправильна стать'),
    body('activityLevel').optional().isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']).withMessage('Неправильний рівень активності')
]

const passwordValidation = [
    body('currentPassword').notEmpty().withMessage('Поточний пароль обов\'язковий'),
    body('newPassword').isLength({ min: 6 }).withMessage('Новий пароль має бути мінімум 6 символів')
]

const deleteAccountValidation = [
    body('password').notEmpty().withMessage('Пароль обов\'язковий для підтвердження')
]

router.use(authMiddleware)

router.get('/profile', userController.getProfile)

router.put('/profile', profileValidation, userController.updateProfile)

router.put('/change-password', passwordValidation, userController.changePassword)

router.get('/stats', userController.getUserStats)

router.get('/activity-history', userController.getActivityHistory)

router.delete('/account', deleteAccountValidation, userController.deleteAccount)

router.get('/auth', userController.checkAuth)

module.exports = router

