const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuariosService = require('../services/usuarios.service');

async function login(req, res) {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const usuario = await usuariosService.buscarPorCorreo(correo);
    const passwordValida = usuario && await bcrypt.compare(password, usuario.password_hash);

    // Mismo mensaje para todos los fallos, para no revelar si el correo existe
    if (!passwordValida || !usuario.activo) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '8h' }
    );

    res.status(200).json({
      token,
      usuario: { id_usuario: usuario.id_usuario, nombre: usuario.nombre, rol: usuario.rol },
    });
  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({ error: 'Error interno al iniciar sesión' });
  }
}

module.exports = { login };