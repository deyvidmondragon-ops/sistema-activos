const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  try {
    const resultado = await pool.query(
      `SELECT u.id_usuario, u.activo, r.nombre AS rol
       FROM usuario u
       JOIN rol r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = $1`,
      [payload.id_usuario]
    );
    const usuario = resultado.rows[0];

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Usuario inactivo o inexistente' });
    }

    req.usuario = { id_usuario: usuario.id_usuario, rol: usuario.rol };
    next();
  } catch (error) {
    console.error('Error al verificar usuario:', error.message);
    res.status(500).json({ error: 'Error interno al verificar la sesión' });
  }
}


function requerirRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }
    next();
  };
}

module.exports = { verificarToken, requerirRol };