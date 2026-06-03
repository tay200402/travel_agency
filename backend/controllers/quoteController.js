const db = require('../config/database');

exports.crearCotizacion = async (req, res) => {
    const { paqueteId, personas } = req.body;
    const usuarioId = req.user.id; 

    try {
        // Consultar costo del plan elegido
        const [pRows] = await db.query('SELECT precio FROM paquetes WHERE id = ?', [paqueteId]);
        if (pRows.length === 0) return res.status(404).json({ error: 'El paquete especificado no existe.' });

        const total = pRows[0].precio * personas;

        // Registrar en la tabla transaccional de MySQL
        const [result] = await db.query(
            'INSERT INTO cotizaciones (usuario_id, paquete_id, personas, total) VALUES (?, ?, ?, ?)',
            [usuarioId, paqueteId, personas, total]
        );

        res.status(201).json({
            message: 'Cotización guardada exitosamente.',
            cotizacionId: result.insertId,
            total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};