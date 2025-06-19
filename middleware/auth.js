const jwt = require('jsonwebtoken');
const { User } = require('../models/models');

module.exports = async function(req, res, next) {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Необхідна автентифікація' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({ where: { id: decoded.id } });

        if (!user) {
            return res.status(401).json({ message: 'Користувача не знайдено' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Невалідний токен' });
    }
}; 