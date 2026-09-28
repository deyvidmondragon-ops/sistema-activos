require('dotenv').config();
const { Pool, types } = require('pg');
types.setTypeParser(1082, valor => valor);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Prueba de conexión: se ejecuta una sola vez al iniciar el servidor
pool.connect()
  .then(client => {
    console.log('✅ Conexión a PostgreSQL exitosa');
    client.release();
  })
  .catch(err => {
    console.error('❌ Error al conectar con PostgreSQL:', err.message);
  });

module.exports = pool;