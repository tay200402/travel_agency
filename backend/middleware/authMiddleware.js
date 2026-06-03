const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Acceso denegado: Token inexistente.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ClaveSecretaAcademica2026');
        req.user = decoded; 
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token de autenticación expirado o inválido.' });
    }
};