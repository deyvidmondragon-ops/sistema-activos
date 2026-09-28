const express = require('express');
const router = express.Router();
const activosController = require('../controllers/activos.controller');
const { requerirRol } = require('../middleware/auth.middleware');

const puedeEscribir = requerirRol('Administrador', 'Administrador técnico');

router.post('/', puedeEscribir, activosController.registrarActivo);
router.get('/', activosController.obtenerActivos);
router.post('/', activosController.registrarActivo);
router.get('/', activosController.obtenerActivos);
router.get('/:id_activo', activosController.obtenerActivo);
router.patch('/:id_activo', puedeEscribir, activosController.editarActivo);

module.exports = router;