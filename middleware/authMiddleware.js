const jwt = require('jsonwebtoken')

module.exports = function(req, res, next){
    if(req.method === 'OPTIONS'){
        next()
    }
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({message: 'Не авторизований! Відсутній заголовок авторизації'})
        }
        
        const token = authHeader.split(' ')[1] 
        if(!token){
            return res.status(401).json({message: 'Не авторизований! Відсутній токен'})
        }
        
        const decode = jwt.verify(token, process.env.SECRET_KEY)
        req.user = decode
        next()
    } catch(err){
        console.error('Auth middleware error:', err);
        res.status(401).json({message: 'Користувач не авторизований - невалідний токен'})
    }
}