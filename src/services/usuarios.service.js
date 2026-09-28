const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function crearUsuario({ nombre, correo, password, id_rol }) {
  const password_hash = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO usuario (nombre, correo, password_hash, id_rol)
    VALUES ($1, $2, $3, $4)
    RETURNING id_usuario, nombre, correo, id_rol, activo, fecha_creacion;
  `;
  const resultado = await pool.query(query, [nombre, correo.toLowerCase(), password_hash, id_rol]);
  return resultado.rows[0];
}

async function listarUsuarios() {
  const query = `
    SELECT u.id_usuario, u.nombre, u.correo, u.activo, r.nombre AS rol
    FROM usuario u
    JOIN rol r ON r.id_rol = u.id_rol
    ORDER BY u.id_usuario;
  `;
  const resultado = await pool.query(query);
  return resultado.rows;
}

const CAMPOS_EDITABLES_USUARIO = ['nombre', 'id_rol', 'activo'];

async function actualizarUsuario(id_usuario, datos) {
  const campos = Object.keys(datos).filter(c => CAMPOS_EDITABLES_USUARIO.includes(c));

  if (campos.length === 0) {
    const error = new Error('Sin campos válidos para actualizar');
    error.code = 'SIN_CAMPOS';
    throw error;
  }

  const sets = campos.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const valores = campos.map(c => datos[c]);
  valores.push(id_usuario);

  const query = `
    UPDATE usuario SET ${sets}
    WHERE id_usuario = $${campos.length + 1}
    RETURNING id_usuario, nombre, correo, id_rol, activo;
  `;
  const resultado = await pool.query(query, valores);
  return resultado.rows[0] || null;
}

// Solo se usa en el login: es la única consulta que trae el hash
async function buscarPorCorreo(correo) {
  const query = `
    SELECT u.id_usuario, u.nombre, u.correo, u.password_hash, u.activo, r.nombre AS rol
    FROM usuario u
    JOIN rol r ON r.id_rol = u.id_rol
    WHERE u.correo = $1;
  `;
  const resultado = await pool.query(query, [correo.toLowerCase()]);
  return resultado.rows[0] || null;
}

module.exports = { crearUsuario, listarUsuarios, actualizarUsuario, buscarPorCorreo };