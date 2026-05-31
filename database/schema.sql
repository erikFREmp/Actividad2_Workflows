CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL
);

CREATE TABLE workflows (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estructura JSONB NOT NULL,
    creado_por INTEGER REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE instancias (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES workflows(id),
    estado VARCHAR(30) DEFAULT 'Pending',
    nodo_actual VARCHAR(100),
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP
);

CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    instancia_id INTEGER REFERENCES instancias(id),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    rol_asignado VARCHAR(30),
    usuario_asignado INTEGER REFERENCES usuarios(id),
    estado VARCHAR(30) DEFAULT 'Pending',
    datos_formulario JSONB,
    respuesta JSONB,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_finalizacion TIMESTAMP
);

INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador', 'admin@workflow.com', '$2b$10$jn43.x9EevEoI5Z0ghixgOLc9iX8ntrYuwbm76QO0aVsahyhC8i8W', 'Admin'),
('Diseñador de Procesos', 'disenador@workflow.com', '$2b$10$.6NxIHmBiTtV32H47jtz4.camU9mKpkr3vHM03ksN1UWSXV1IinBK', 'Diseñador'),
('Usuario de Prueba', 'usuario@workflow.com', '$2b$10$b9znY5Xy7SC7RCURsIouleZM0zh9zAIDUBOE4itcqztzZUksFdjYW', 'Usuario');
