const pool = require('../config/db');

async function crearMantenimiento(datos) {
  const {
    id_activo,
    id_tipo_mantenimiento,
    id_responsable,
    fecha_programada,
    descripcion,
  } = datos;

  const query = `
    INSERT INTO mantenimiento (id_activo, id_tipo_mantenimiento, id_responsable, fecha_programada, descripcion)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const valores = [id_activo, id_tipo_mantenimiento, id_responsable, fecha_programada, descripcion || null];

  const resultado = await pool.query(query, valores);
  return resultado.rows[0];
}

async function historialPorActivo(id_activo) {
  const query = `
    SELECT
      m.id_mantenimiento, m.fecha_programada, m.fecha_realizada, m.estado, m.descripcion,
      tm.nombre AS tipo,
      us.nombre AS responsable
    FROM mantenimiento m
    JOIN tipo_mantenimiento tm ON tm.id_tipo_mantenimiento = m.id_tipo_mantenimiento
    JOIN usuario us            ON us.id_usuario = m.id_responsable
    WHERE m.id_activo = $1
    ORDER BY m.fecha_programada DESC;
  `;
  const resultado = await pool.query(query, [id_activo]);
  return resultado.rows;
}


async function listarMantenimientos(estado) {
  const query = `
    SELECT
      m.id_mantenimiento, a.codigo AS activo, tm.nombre AS tipo,
      m.fecha_programada, m.fecha_realizada, m.estado, m.descripcion,
      us.nombre AS responsable
    FROM mantenimiento m
    JOIN activo a              ON a.id_activo = m.id_activo
    JOIN tipo_mantenimiento tm ON tm.id_tipo_mantenimiento = m.id_tipo_mantenimiento
    JOIN usuario us            ON us.id_usuario = m.id_responsable
    WHERE ($1::text IS NULL OR m.estado = $1)
    ORDER BY m.fecha_programada;
  `;
  const resultado = await pool.query(query, [estado || null]);
  return resultado.rows;
}

const CAMPOS_EDITABLES_MANT = [
  'id_tipo_mantenimiento', 'id_responsable', 'fecha_programada',
  'fecha_realizada', 'descripcion', 'estado',
];


async function sincronizarEstadoActivo(client, id_activo) {
  const { rows } = await client.query(
    `SELECT EXISTS (
       SELECT 1 FROM mantenimiento WHERE id_activo = $1 AND estado = 'En proceso'
     ) AS en_proceso`,
    [id_activo]
  );

  if (rows[0].en_proceso) {
    await client.query(
      `UPDATE activo SET estado = 'En mantenimiento'
       WHERE id_activo = $1 AND estado <> 'Dado de baja'`,
      [id_activo]
    );
  } else {

    await client.query(
      `UPDATE activo
       SET estado = CASE WHEN id_responsable IS NULL THEN 'Disponible' ELSE 'En uso' END
       WHERE id_activo = $1 AND estado = 'En mantenimiento'`,
      [id_activo]
    );
  }
}

async function actualizarMantenimiento(id_mantenimiento, datos) {
  const campos = Object.keys(datos).filter(c => CAMPOS_EDITABLES_MANT.includes(c));

  if (campos.length === 0) {
    const error = new Error('Sin campos válidos para actualizar');
    error.code = 'SIN_CAMPOS';
    throw error;
  }

  const sets = campos.map((c, i) => `${c} = $${i + 1}`);

  // Al completar un mantenimiento sin indicar fecha, se usa la fecha de hoy
  if (datos.estado === 'Completado' && !campos.includes('fecha_realizada')) {
    sets.push('fecha_realizada = COALESCE(fecha_realizada, CURRENT_DATE)');
  }

  const valores = campos.map(c => datos[c]);
  valores.push(id_mantenimiento);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const resultado = await client.query(
      `UPDATE mantenimiento SET ${sets.join(', ')}
       WHERE id_mantenimiento = $${campos.length + 1} RETURNING *;`,
      valores
    );
    const mantenimiento = resultado.rows[0];

    if (mantenimiento) {
      await sincronizarEstadoActivo(client, mantenimiento.id_activo);
    }

    await client.query('COMMIT');
    return mantenimiento || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;   // el controlador sigue traduciendo los códigos de error igual que antes
  } finally {
    client.release();
  }
}

module.exports = { crearMantenimiento, historialPorActivo, listarMantenimientos, actualizarMantenimiento };