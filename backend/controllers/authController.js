const db = require('../config/database');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Usuario no registrado en la base de datos.' });

        const usuario = rows[0];
        // Comparación simple directa solicitada para fines académicos
        if (password !== usuario.password) return res.status(401).json({ error: 'Credenciales inválidas.' });

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
            process.env.JWT_SECRET || 'ClaveSecretaAcademica2026',
            { expiresIn: '3h' }
        );

        res.json({
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};