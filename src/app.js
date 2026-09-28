require('dotenv').config();
const express = require('express');
const pool = require('./config/db');
const activosRoutes = require('./routes/activos.routes');
const mantenimientosRoutes = require('./routes/mantenimientos.routes');
const catalogosRoutes = require('./routes/catalogos.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const authRoutes = require('./routes/auth.routes');
const { verificarToken, requerirRol } = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rutas
app.use('/api/activos', verificarToken, activosRoutes);
app.use('/api/mantenimientos', verificarToken, mantenimientosRoutes);
app.use('/api/catalogos', verificarToken, catalogosRoutes);
app.use('/api/usuarios', verificarToken, requerirRol('Administrador'), usuariosRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Sistema de Gestión de Activos - API funcionando');
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ estado: 'ok', base_de_datos: 'conectada' });
  } catch {
    res.status(503).json({ estado: 'error', base_de_datos: 'sin conexión' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});