const db = require('../config/database');

exports.getAllPackages = async (req, res) => {
    const { destino } = req.query;
    try {
        let query = 'SELECT * FROM paquetes';
        let params = [];
        
        if (destino) {
            query += ' WHERE destino LIKE ?';
            params.push(`%${destino}%`);
        }
        
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPackageById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM paquetes WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Destino inexistente.' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};