const express = require('express');
const router = express.Router();
const mantenimientosController = require('../controllers/mantenimientos.controller');
const { requerirRol } = require('../middleware/auth.middleware');

const puedeEscribir = requerirRol('Administrador', 'Administrador de servicio');

router.post('/', puedeEscribir, mantenimientosController.registrarMantenimiento);
router.get('/', mantenimientosController.obtenerMantenimientos);
router.get('/activo/:id_activo', mantenimientosController.obtenerHistorial);
router.patch('/:id_mantenimiento', puedeEscribir, mantenimientosController.editarMantenimiento);

module.exports = router;