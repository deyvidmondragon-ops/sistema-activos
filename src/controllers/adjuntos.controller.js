const adjuntosService = require('../services/adjuntos.service');

async function registrarAdjunto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Debes enviar un archivo en el campo "archivo"' });
    }
    const adjunto = await adjuntosService.subirAdjunto(req.params.id_mantenimiento, req.file);
    res.status(201).json(adjunto);
  } catch (error) {
    console.error('Error al subir adjunto:', error.message);
    res.status(500).json({ error: 'Error interno al subir el archivo' });
  }
}

async function obtenerAdjuntos(req, res) {
  try {
    const adjuntos = await adjuntosService.listarAdjuntos(req.params.id_mantenimiento);
    res.status(200).json(adjuntos);
  } catch (error) {
    console.error('Error al listar adjuntos:', error.message);
    res.status(500).json({ error: 'Error interno al consultar los adjuntos' });
  }
}

module.exports = { registrarAdjunto, obtenerAdjuntos }; 