const express = require('express');
const router = express.Router();
const catalogos = require('../controllers/catalogos.controller');

router.get('/tipos-activo', catalogos.tiposActivo);
router.get('/tipos-mantenimiento', catalogos.tiposMantenimiento);
router.get('/ubicaciones', catalogos.ubicaciones);
router.get('/roles', catalogos.roles);

module.exports = router;