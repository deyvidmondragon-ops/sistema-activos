

DROP TABLE IF EXISTS adjunto_mantenimiento CASCADE;
DROP TABLE IF EXISTS mantenimiento         CASCADE;
DROP TABLE IF EXISTS activo                CASCADE;
DROP TABLE IF EXISTS tipo_mantenimiento    CASCADE;
DROP TABLE IF EXISTS tipo_activo           CASCADE;
DROP TABLE IF EXISTS ubicacion             CASCADE;
DROP TABLE IF EXISTS usuario               CASCADE;
DROP TABLE IF EXISTS rol                   CASCADE;

-- ROLES Y USUARIOS
CREATE TABLE rol (
    id_rol       SERIAL       PRIMARY KEY,
    nombre       VARCHAR(50)  NOT NULL UNIQUE,
    descripcion  VARCHAR(200)
);

CREATE TABLE usuario (
    id_usuario      SERIAL        PRIMARY KEY,
    nombre          VARCHAR(100)  NOT NULL,
    correo          VARCHAR(150)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,          -- nunca guardar la contraseña en texto plano
    id_rol          INT           NOT NULL REFERENCES rol(id_rol),
    activo          BOOLEAN       NOT NULL DEFAULT TRUE,
    fecha_creacion  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- CATÁLOGOS
CREATE TABLE ubicacion (
    id_ubicacion  SERIAL        PRIMARY KEY,
    nombre        VARCHAR(100)  NOT NULL UNIQUE,
    descripcion   VARCHAR(200)
);

CREATE TABLE tipo_activo (
    id_tipo_activo  SERIAL        PRIMARY KEY,
    nombre          VARCHAR(80)   NOT NULL UNIQUE,
    descripcion     VARCHAR(200)
);

CREATE TABLE tipo_mantenimiento (
    id_tipo_mantenimiento  SERIAL       PRIMARY KEY,
    nombre                 VARCHAR(80)  NOT NULL UNIQUE,
    descripcion            VARCHAR(200)
);


-- ACTIVOS
CREATE TABLE activo (
    id_activo       SERIAL        PRIMARY KEY,
    codigo          VARCHAR(30)   NOT NULL UNIQUE,
    id_tipo_activo  INT           NOT NULL REFERENCES tipo_activo(id_tipo_activo),
    marca           VARCHAR(80),
    modelo          VARCHAR(80),
    numero_serie    VARCHAR(100)  UNIQUE,
    estado          VARCHAR(20)   NOT NULL DEFAULT 'Disponible'
                    CHECK (estado IN ('Disponible', 'En uso', 'En mantenimiento', 'Dado de baja')),
    id_ubicacion    INT           NOT NULL REFERENCES ubicacion(id_ubicacion),
    id_responsable  INT           REFERENCES usuario(id_usuario),   -- puede no tener responsable asignado
    fecha_registro  TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- MANTENIMIENTOS
CREATE TABLE mantenimiento (
    id_mantenimiento       SERIAL       PRIMARY KEY,
    id_activo              INT          NOT NULL REFERENCES activo(id_activo),
    id_tipo_mantenimiento  INT          NOT NULL REFERENCES tipo_mantenimiento(id_tipo_mantenimiento),
    id_responsable         INT          NOT NULL REFERENCES usuario(id_usuario),
    fecha_programada       DATE         NOT NULL,
    fecha_realizada        DATE,                              -- NULL mientras no se haya ejecutado
    descripcion            TEXT,
    estado                 VARCHAR(20)  NOT NULL DEFAULT 'Programado'
                           CHECK (estado IN ('Programado', 'En proceso', 'Completado', 'Cancelado')),
    fecha_registro         TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Archivos mantenimiento
CREATE TABLE adjunto_mantenimiento (
    id_adjunto        SERIAL        PRIMARY KEY,
    id_mantenimiento  INT           NOT NULL REFERENCES mantenimiento(id_mantenimiento) ON DELETE CASCADE,
    nombre_archivo    VARCHAR(200)  NOT NULL,
    s3_key            VARCHAR(500)  NOT NULL,
    fecha_subida      TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- ÍNDICES
CREATE INDEX idx_usuario_rol            ON usuario(id_rol);
CREATE INDEX idx_activo_ubicacion       ON activo(id_ubicacion);
CREATE INDEX idx_activo_responsable     ON activo(id_responsable);
CREATE INDEX idx_activo_estado          ON activo(estado);
CREATE INDEX idx_mant_activo            ON mantenimiento(id_activo);
CREATE INDEX idx_mant_fecha_programada  ON mantenimiento(fecha_programada);
CREATE INDEX idx_adjunto_mant           ON adjunto_mantenimiento(id_mantenimiento);


-- DATOS
INSERT INTO rol (nombre, descripcion) VALUES
  ('Administrador',          'Gestiona usuarios e información general del sistema'),
  ('Administrador técnico',  'Registra, consulta y actualiza activos'),
  ('Administrador de servicio', 'Registra mantenimientos y consulta historial');

-- password_hash prueba(bcrypt Node.js)
INSERT INTO usuario (nombre, correo, password_hash, id_rol) VALUES
  ('Ana Torres',   'ana.torres@ejemplo.com',   'HASH_DE_PRUEBA', 1),
  ('Carlos Ruiz',  'carlos.ruiz@ejemplo.com',  'HASH_DE_PRUEBA', 2),
  ('Laura Gómez',  'laura.gomez@ejemplo.com',  'HASH_DE_PRUEBA', 3),
  ('Pedro Díaz',   'pedro.diaz@ejemplo.com',   'HASH_DE_PRUEBA', 3);

INSERT INTO ubicacion (nombre, descripcion) VALUES
  ('Sala de servidores', 'Piso 1, cuarto técnico'),
  ('Oficina administrativa', 'Piso 2'),
  ('Laboratorio de cómputo', 'Piso 3'),
  ('Bodega', 'Sótano, equipos sin asignar');

INSERT INTO tipo_activo (nombre, descripcion) VALUES
  ('Computador de escritorio', NULL),
  ('Portátil', NULL),
  ('Servidor', NULL),
  ('Equipo de red', 'Switches, routers, access points'),
  ('Impresora', NULL);

INSERT INTO tipo_mantenimiento (nombre, descripcion) VALUES
  ('Preventivo', 'Programado para evitar fallas'),
  ('Correctivo', 'Reparación de una falla existente');

INSERT INTO activo (codigo, id_tipo_activo, marca, modelo, numero_serie, estado, id_ubicacion, id_responsable) VALUES
  ('ACT-0001', 3, 'Dell',    'PowerEdge R450', 'SN-DELL-001', 'En uso',           1, 2),
  ('ACT-0002', 4, 'Cisco',   'Catalyst 2960',  'SN-CISC-002', 'En uso',           1, 2),
  ('ACT-0003', 2, 'Lenovo',  'ThinkPad E14',   'SN-LENO-003', 'En uso',           2, 2),
  ('ACT-0004', 1, 'HP',      'ProDesk 400',    'SN-HP-004',   'En mantenimiento', 3, 2),
  ('ACT-0005', 5, 'Epson',   'L3250',          'SN-EPSO-005', 'Disponible',       4, NULL);

INSERT INTO mantenimiento (id_activo, id_tipo_mantenimiento, id_responsable, fecha_programada, fecha_realizada, descripcion, estado) VALUES
  (1, 1, 3, '2026-08-15', '2026-08-15', 'Limpieza de hardware y revisión de discos', 'Completado'),
  (2, 1, 3, '2026-09-01', '2026-09-02', 'Actualización de firmware',                 'Completado'),
  (4, 2, 4, '2026-09-20', NULL,         'Falla en fuente de poder, en revisión',      'En proceso'),
  (3, 1, 3, '2026-10-05', NULL,         'Mantenimiento preventivo semestral',         'Programado');


-- CONSULTAS DE VERIFICACIÓN


--a) Activos con tipo, ubicación y responsable
SELECT a.codigo, t.nombre AS tipo, a.marca, a.modelo, a.estado,
        u.nombre AS ubicacion, r.nombre AS responsable
FROM activo a
JOIN tipo_activo t ON t.id_tipo_activo = a.id_tipo_activo
JOIN ubicacion u   ON u.id_ubicacion   = a.id_ubicacion
LEFT JOIN usuario r ON r.id_usuario    = a.id_responsable
ORDER BY a.codigo;

-- b) Historial de mantenimiento de un activo
SELECT a.codigo, tm.nombre AS tipo, m.fecha_programada, m.fecha_realizada,
        m.estado, m.descripcion, us.nombre AS realizado_por
 FROM mantenimiento m
 JOIN activo a              ON a.id_activo = m.id_activo
 JOIN tipo_mantenimiento tm ON tm.id_tipo_mantenimiento = m.id_tipo_mantenimiento
 JOIN usuario us            ON us.id_usuario = m.id_responsable
 WHERE a.codigo = 'ACT-0001'
 ORDER BY m.fecha_programada DESC;

-- c) Mantenimientos pendientes 
 SELECT a.codigo, m.fecha_programada, m.estado
 FROM mantenimiento m JOIN activo a ON a.id_activo = m.id_activo
 WHERE m.estado IN ('Programado', 'En proceso')
 ORDER BY m.fecha_programada;
