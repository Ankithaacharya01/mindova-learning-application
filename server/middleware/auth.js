const jwt = require('jsonwebtoken');

module.exports = (roles = []) => {
    return (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = decoded;
            
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            
            next();
        } catch (err) {
            res.status(401).json({ error: 'Invalid token.' });
        }
    };
};
