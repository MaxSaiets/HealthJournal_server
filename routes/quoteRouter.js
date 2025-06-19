const Router = require('express');
const quoteController = require('../controllers/quoteController');
const { body } = require('express-validator');

const router = new Router();

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

router.get('/categories/list', quoteController.getCategories);

router.get('/random/quote', quoteController.getRandom);

router.get('/daily/quote', quoteController.getDaily);

router.get('/', quoteController.getAll);

router.post('/',
    [
        body('text').notEmpty().withMessage('Текст цитати не може бути порожнім'),
        body('author').optional().isString().withMessage('Автор повинен бути рядком'),
        body('category').optional().isString().withMessage('Категорія повинна бути рядком')
    ],
    handleValidationErrors,
    quoteController.create
);

router.get('/:id', quoteController.getOne);

router.put('/:id',
    [
        body('text').optional().notEmpty().withMessage('Текст цитати не може бути порожнім'),
        body('author').optional().isString().withMessage('Автор повинен бути рядком'),
        body('category').optional().isString().withMessage('Категорія повинна бути рядком')
    ],
    handleValidationErrors,
    quoteController.update
);

router.delete('/:id', quoteController.delete);

module.exports = router; 