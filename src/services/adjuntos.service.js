const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('../config/s3');
const pool = require('../config/db');

async function subirAdjunto(id_mantenimiento, archivo) {
  const s3_key = `mantenimientos/${id_mantenimiento}/${Date.now()}-${archivo.originalname}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: s3_key,
    Body: archivo.buffer,
    ContentType: archivo.mimetype,
  }));

  const query = `
    INSERT INTO adjunto_mantenimiento (id_mantenimiento, nombre_archivo, s3_key)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const resultado = await pool.query(query, [id_mantenimiento, archivo.originalname, s3_key]);
  return resultado.rows[0];
}

async function listarAdjuntos(id_mantenimiento) {
  const query = `
    SELECT id_adjunto, nombre_archivo, s3_key, fecha_subida
    FROM adjunto_mantenimiento
    WHERE id_mantenimiento = $1
    ORDER BY fecha_subida DESC;
  `;
  const resultado = await pool.query(query, [id_mantenimiento]);

  // Genera una URL firmada por cada adjunto, válida 10 minutos
  const conUrls = await Promise.all(resultado.rows.map(async (fila) => {
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: fila.s3_key }),
      { expiresIn: 600 }
    );
    return { ...fila, url };
  }));

  return conUrls;
}

module.exports = { subirAdjunto, listarAdjuntos };