const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

router.post('/', usuariosController.registrarUsuario);
router.get('/', usuariosController.obtenerUsuarios);
router.patch('/:id_usuario', usuariosController.editarUsuario);

module.exports = router;