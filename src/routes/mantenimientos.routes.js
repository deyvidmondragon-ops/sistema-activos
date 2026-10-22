const express = require('express');
const router = express.Router();
const mantenimientosController = require('../controllers/mantenimientos.controller');
const { requerirRol } = require('../middleware/auth.middleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const adjuntosController = require('../controllers/adjuntos.controller');

const puedeEscribir = requerirRol('Administrador', 'Administrador de servicio');

router.post('/', puedeEscribir, mantenimientosController.registrarMantenimiento);
router.get('/', mantenimientosController.obtenerMantenimientos);
router.get('/activo/:id_activo', mantenimientosController.obtenerHistorial);
router.patch('/:id_mantenimiento', puedeEscribir, mantenimientosController.editarMantenimiento);
router.post('/:id_mantenimiento/adjuntos', puedeEscribir, upload.single('archivo'), adjuntosController.registrarAdjunto);
router.get('/:id_mantenimiento/adjuntos', adjuntosController.obtenerAdjuntos);

module.exports = router;