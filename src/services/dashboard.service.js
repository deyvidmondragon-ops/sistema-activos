const pool = require('../config/db');

async function obtenerDashboard() {
  const [porEstado, porTipo, porMes, cumplimiento] = await Promise.all([
    pool.query('SELECT * FROM vista_activos_por_estado'),
    pool.query('SELECT * FROM vista_activos_por_tipo'),
    pool.query('SELECT * FROM vista_mantenimientos_por_mes'),
    pool.query('SELECT * FROM vista_cumplimiento_mantenimiento'),
  ]);

  return {
    activos_por_estado: porEstado.rows,
    activos_por_tipo: porTipo.rows,
    mantenimientos_por_mes: porMes.rows,
    cumplimiento: cumplimiento.rows[0],
  };
}

module.exports = { obtenerDashboard };