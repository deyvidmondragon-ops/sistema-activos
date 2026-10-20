const dashboardService = require('../services/dashboard.service');

async function obtenerResumen(req, res) {
  try {
    const datos = await dashboardService.obtenerDashboard();
    res.status(200).json(datos);
  } catch (error) {
    console.error('Error al generar el dashboard:', error.message);
    res.status(500).json({ error: 'Error interno al generar el dashboard' });
  }
}

module.exports = { obtenerResumen };