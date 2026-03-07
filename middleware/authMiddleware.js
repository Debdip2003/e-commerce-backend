import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
    //frontend send the token in the header as AuthorizationL: Bearer <token>, so we need to split the token and get the actual token
    const token = req?.headers?.authorization?.split(' ')[1];
    // Check if the token is present
    if(!token){
        return res.status(401).json({ error: 'No token provided' });
    }
    try{
    const decoded_token = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the secret key and get the decoded payload
    req.user = {_id: decoded_token.id}; // Attach the user ID to the request object for further use in the route handlers
    next(); // If the token is valid, proceed to the next middleware or route handler
    }catch(error){
        return res.status(401).json({ error: 'Token verification failed', message: error.message });
    }
}

export { protect };