const activosService = require('../services/activos.service');

async function registrarActivo(req, res) {
  try {
    const { codigo, id_tipo_activo, id_ubicacion } = req.body;

    // Validación básica: los campos obligatorios según el modelo
    if (!codigo || !id_tipo_activo || !id_ubicacion) {
      return res.status(400).json({
        error: 'Los campos codigo, id_tipo_activo e id_ubicacion son obligatorios',
      });
    }

    const nuevoActivo = await activosService.crearActivo(req.body);
    res.status(201).json(nuevoActivo);

  } catch (error) {
    console.error('Error al registrar activo:', error.message);

    // Código 23505 de PostgreSQL = violación de UNIQUE (código o serie repetidos)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El código o número de serie ya existe' });
    }

    res.status(500).json({ error: 'Error interno al registrar el activo' });
  }
}

async function obtenerActivos(req, res) {
  try {
    const activos = await activosService.listarActivos();
    res.status(200).json(activos);
  } catch (error) {
    console.error('Error al listar activos:', error.message);
    res.status(500).json({ error: 'Error interno al consultar los activos' });
  }
}


async function obtenerActivo(req, res) {
  try {
    const activo = await activosService.obtenerActivoPorId(req.params.id_activo);
    if (!activo) {
      return res.status(404).json({ error: 'Activo no encontrado' });
    }
    res.status(200).json(activo);
  } catch (error) {
    // 22P02 = valor con formato inválido (por ejemplo, un id que no es número)
    if (error.code === '22P02') {
      return res.status(400).json({ error: 'El id del activo debe ser un número' });
    }
    console.error('Error al consultar activo:', error.message);
    res.status(500).json({ error: 'Error interno al consultar el activo' });
  }
}

async function editarActivo(req, res) {
  try {
    const activo = await activosService.actualizarActivo(req.params.id_activo, req.body);
    if (!activo) {
      return res.status(404).json({ error: 'Activo no encontrado' });
    }
    res.status(200).json(activo);
  } catch (error) {
    if (error.code === 'SIN_CAMPOS') {
      return res.status(400).json({ error: 'Debes enviar al menos un campo editable' });
    }
    if (error.code === '22P02') {
      return res.status(400).json({ error: 'El id del activo debe ser un número' });
    }
    if (error.code === '23514') {   // CHECK: estado inválido
      return res.status(400).json({ error: 'Estado inválido. Usa: Disponible, En uso, En mantenimiento o Dado de baja' });
    }
    if (error.code === '23505') {   // UNIQUE: número de serie repetido
      return res.status(409).json({ error: 'El número de serie ya existe' });
    }
    if (error.code === '23503') {   // FK: ubicación, tipo o responsable inexistentes
      return res.status(404).json({ error: 'El tipo, ubicación o responsable indicado no existe' });
    }
    console.error('Error al editar activo:', error.message);
    res.status(500).json({ error: 'Error interno al editar el activo' });
  }
}


module.exports = { registrarActivo, obtenerActivos, obtenerActivo, editarActivo };