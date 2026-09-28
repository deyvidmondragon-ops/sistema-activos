const pool = require('../config/db');

async function consultar(sql) {
  const resultado = await pool.query(sql);
  return resultado.rows;
}

module.exports = {
  listarTiposActivo: () => consultar('SELECT id_tipo_activo, nombre, descripcion FROM tipo_activo ORDER BY nombre'),
  listarTiposMantenimiento: () => consultar('SELECT id_tipo_mantenimiento, nombre, descripcion FROM tipo_mantenimiento ORDER BY nombre'),
  listarUbicaciones: () => consultar('SELECT id_ubicacion, nombre, descripcion FROM ubicacion ORDER BY nombre'),
  listarRoles: () => consultar('SELECT id_rol, nombre, descripcion FROM rol ORDER BY id_rol'),
};