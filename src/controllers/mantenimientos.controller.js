const mantenimientosService = require('../services/mantenimientos.service');

async function registrarMantenimiento(req, res) {
  try {
    const { id_activo, id_tipo_mantenimiento, id_responsable, fecha_programada } = req.body;

    if (!id_activo || !id_tipo_mantenimiento || !id_responsable || !fecha_programada) {
      return res.status(400).json({
        error: 'Los campos id_activo, id_tipo_mantenimiento, id_responsable y fecha_programada son obligatorios',
      });
    }

    const nuevoMantenimiento = await mantenimientosService.crearMantenimiento(req.body);
    res.status(201).json(nuevoMantenimiento);

  } catch (error) {
    console.error('Error al registrar mantenimiento:', error.message);

    // Código 23503 de PostgreSQL = violación de FOREIGN KEY (el activo, tipo o responsable no existen)
    if (error.code === '23503') {
      return res.status(404).json({ error: 'El activo, tipo de mantenimiento o responsable indicado no existe' });
    }

    res.status(500).json({ error: 'Error interno al registrar el mantenimiento' });
  }
}
  async function obtenerHistorial(req, res) {
  try {
    const { id_activo } = req.params;
    const historial = await mantenimientosService.historialPorActivo(id_activo);
    res.status(200).json(historial);
  } catch (error) {
    console.error('Error al consultar historial:', error.message);
    res.status(500).json({ error: 'Error interno al consultar el historial' });
  }
}
async function obtenerHistorial(req, res) {
  try {
    const { id_activo } = req.params;
    const historial = await mantenimientosService.historialPorActivo(id_activo);
    res.status(200).json(historial);
  } catch (error) {
    console.error('Error al consultar historial:', error.message);
    res.status(500).json({ error: 'Error interno al consultar el historial' });
  }
}


async function obtenerMantenimientos(req, res) {
  try {
    // Filtro opcional: /api/mantenimientos?estado=Programado
    const lista = await mantenimientosService.listarMantenimientos(req.query.estado);
    res.status(200).json(lista);
  } catch (error) {
    console.error('Error al listar mantenimientos:', error.message);
    res.status(500).json({ error: 'Error interno al consultar los mantenimientos' });
  }
}

async function editarMantenimiento(req, res) {
  try {
    const mantenimiento = await mantenimientosService.actualizarMantenimiento(req.params.id_mantenimiento, req.body);
    if (!mantenimiento) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }
    res.status(200).json(mantenimiento);
  } catch (error) {
    if (error.code === 'SIN_CAMPOS') {
      return res.status(400).json({ error: 'Debes enviar al menos un campo editable' });
    }
    if (error.code === '22P02') {   // id o fecha con formato inválido
      return res.status(400).json({ error: 'Formato inválido en el id o en una fecha (usa AAAA-MM-DD)' });
    }
    if (error.code === '23514') {   // CHECK: estado inválido
      return res.status(400).json({ error: 'Estado inválido. Usa: Programado, En proceso, Completado o Cancelado' });
    }
    if (error.code === '23503') {   // FK: tipo o responsable inexistentes
      return res.status(404).json({ error: 'El tipo de mantenimiento o el responsable no existe' });
    }
    console.error('Error al editar mantenimiento:', error.message);
    res.status(500).json({ error: 'Error interno al editar el mantenimiento' });
  }
}

module.exports = { registrarMantenimiento, obtenerHistorial, obtenerMantenimientos, editarMantenimiento };