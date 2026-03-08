import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
    const token = req?.headers?.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({ error: 'No token provided' });
    }
    try{
    const decoded_token = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {_id: decoded_token.id};
    next();
    }catch(error){
        return res.status(401).json({ error: 'Token verification failed', message: error.message });
    }
}

export { protect };