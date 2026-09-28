const usuariosService = require('../services/usuarios.service');

async function registrarUsuario(req, res) {
  try {
    const { nombre, correo, password, id_rol } = req.body;

    if (!nombre || !correo || !password || !id_rol) {
      return res.status(400).json({ error: 'Los campos nombre, correo, password e id_rol son obligatorios' });
    }
    if (!/^\S+@\S+\.\S+$/.test(correo)) {
      return res.status(400).json({ error: 'El correo no tiene un formato válido' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const usuario = await usuariosService.crearUsuario(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
    }
    if (error.code === '23503') {
      return res.status(404).json({ error: 'El rol indicado no existe' });
    }
    console.error('Error al registrar usuario:', error.message);
    res.status(500).json({ error: 'Error interno al registrar el usuario' });
  }
}

async function obtenerUsuarios(req, res) {
  try {
    const usuarios = await usuariosService.listarUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al listar usuarios:', error.message);
    res.status(500).json({ error: 'Error interno al consultar los usuarios' });
  }
}

async function editarUsuario(req, res) {
  try {
    const usuario = await usuariosService.actualizarUsuario(req.params.id_usuario, req.body);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(usuario);
  } catch (error) {
    if (error.code === 'SIN_CAMPOS') {
      return res.status(400).json({ error: 'Debes enviar al menos un campo editable (nombre, id_rol, activo)' });
    }
    if (error.code === '22P02') {
      return res.status(400).json({ error: 'Formato inválido en el id o en un campo (activo debe ser true o false)' });
    }
    if (error.code === '23503') {
      return res.status(404).json({ error: 'El rol indicado no existe' });
    }
    console.error('Error al editar usuario:', error.message);
    res.status(500).json({ error: 'Error interno al editar el usuario' });
  }
}

module.exports = { registrarUsuario, obtenerUsuarios, editarUsuario };