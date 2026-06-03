const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agencia_viajes_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Comprobación inicial asíncrona
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a la base de datos MySQL.');
        connection.release();
    } catch (err) {
        console.error('❌ Error crítico de enlace con la base de datos MySQL:', err.message);
    }
})();

module.exports = pool;