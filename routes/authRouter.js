const Router = require('express');
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');

const router = new Router();

router.post('/registration',
    [
        body('email').isEmail().withMessage('Невірний формат email'),
        body('password').isLength({ min: 6 }).withMessage('Пароль повинен бути не менше 6 символів'),
        body('name').notEmpty().withMessage('Ім\'я не може бути порожнім')
    ],
    authController.registration
);

router.post('/login',
    [
        body('email').isEmail().withMessage('Невірний формат email'),
        body('password').notEmpty().withMessage('Пароль не може бути порожнім')
    ],
    authController.login
);

router.get('/me', authMiddleware, authController.getMe);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router; 