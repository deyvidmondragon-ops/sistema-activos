const pool = require('../config/db');

async function crearActivo(datos) {
  const { codigo, id_tipo_activo, marca, modelo, numero_serie, id_ubicacion, id_responsable } = datos;

  const query = `
    INSERT INTO activo (codigo, id_tipo_activo, marca, modelo, numero_serie, id_ubicacion, id_responsable)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const valores = [codigo, id_tipo_activo, marca, modelo, numero_serie, id_ubicacion, id_responsable || null];

  const resultado = await pool.query(query, valores);
  return resultado.rows[0];
}

async function listarActivos() {
  const query = `
    SELECT
      a.id_activo, a.codigo, a.marca, a.modelo, a.numero_serie, a.estado,
      t.nombre AS tipo,
      u.nombre AS ubicacion,
      r.nombre AS responsable
    FROM activo a
    JOIN tipo_activo t   ON t.id_tipo_activo = a.id_tipo_activo
    JOIN ubicacion u     ON u.id_ubicacion   = a.id_ubicacion
    LEFT JOIN usuario r  ON r.id_usuario     = a.id_responsable
    ORDER BY a.codigo;
  `;
  const resultado = await pool.query(query);
  return resultado.rows;
}

async function obtenerActivoPorId(id_activo) {
  const query = `
    SELECT
      a.id_activo, a.codigo, a.marca, a.modelo, a.numero_serie, a.estado,
      t.nombre AS tipo,
      u.nombre AS ubicacion,
      r.nombre AS responsable
    FROM activo a
    JOIN tipo_activo t   ON t.id_tipo_activo = a.id_tipo_activo
    JOIN ubicacion u     ON u.id_ubicacion   = a.id_ubicacion
    LEFT JOIN usuario r  ON r.id_usuario     = a.id_responsable
    WHERE a.id_activo = $1;
  `;
  const resultado = await pool.query(query, [id_activo]);
  return resultado.rows[0] || null;
}

// Solo estos campos se pueden editar
const CAMPOS_EDITABLES = [
  'id_tipo_activo', 'marca', 'modelo', 'numero_serie',
  'estado', 'id_ubicacion', 'id_responsable',
];

async function actualizarActivo(id_activo, datos) {
  const campos = Object.keys(datos).filter(c => CAMPOS_EDITABLES.includes(c));

  if (campos.length === 0) {
    const error = new Error('Sin campos válidos para actualizar');
    error.code = 'SIN_CAMPOS';
    throw error;
  }

  // Los nombres de columna salen de la lista blanca, nunca directo del usuario
  const sets = campos.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const valores = campos.map(c => datos[c]);
  valores.push(id_activo);

  const query = `UPDATE activo SET ${sets} WHERE id_activo = $${campos.length + 1} RETURNING *;`;
  const resultado = await pool.query(query, valores);
  return resultado.rows[0] || null;
}

module.exports = { crearActivo, listarActivos, obtenerActivoPorId, actualizarActivo }; 