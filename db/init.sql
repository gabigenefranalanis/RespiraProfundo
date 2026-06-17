-- Creación de tabla: Usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    rol VARCHAR(50) CHECK (rol IN ('alumno', 'instructor', 'admin')) NOT NULL
);

-- Creación de tabla: Paquetes
CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    cantidad_clases INTEGER NOT NULL -- 999 para ilimitado
);

-- Creación de tabla: Membresías
CREATE TABLE memberships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    package_id INTEGER REFERENCES packages(id),
    clases_restantes INTEGER NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(50) CHECK (estado IN ('activo', 'vencido')) NOT NULL
);

-- Creación de tabla: Horarios de Clases
CREATE TABLE class_schedule (
    id SERIAL PRIMARY KEY,
    instructor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    nombre_clase VARCHAR(255) NOT NULL,
    dia_semana VARCHAR(50) NOT NULL,
    hora_inicio TIME NOT NULL,
    cupo_maximo INTEGER NOT NULL
);

-- Creación de tabla: Reservas
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    schedule_id INTEGER REFERENCES class_schedule(id) ON DELETE CASCADE,
    fecha_clase DATE NOT NULL,
    asistencia BOOLEAN DEFAULT FALSE
);

-- ==========================================
-- INSERCIÓN DE DATOS INICIALES (SEED)
-- ==========================================

INSERT INTO users (id, nombre, email, rol) VALUES
(1, 'Valentina Admin', 'valentina@respiraprofundo.com', 'admin'),
(2, 'Laura Gómez', 'laura@respiraprofundo.com', 'instructor'),
(3, 'Carlos Ruiz', 'carlos@respiraprofundo.com', 'instructor'),
(4, 'Elena Paz', 'elena@respiraprofundo.com', 'instructor'),
(5, 'Mariana Sosa', 'mariana@respiraprofundo.com', 'instructor'),
(6, 'Maria Alumna', 'maria@cliente.com', 'alumno'),
(7, 'Juan Pérez', 'juan.perez@cliente.com', 'alumno'),
(8, 'Sofía Torres', 'sofia.torres@cliente.com', 'alumno'),
(9, 'Diego Ramírez', 'diego.ramirez@cliente.com', 'alumno'),
(10, 'Ana Martínez', 'ana.martinez@cliente.com', 'alumno'),
(11, 'Luis Herrera', 'luis.herrera@cliente.com', 'alumno'),
(12, 'Carmen Ortiz', 'carmen.ortiz@cliente.com', 'alumno');

-- Reiniciar la secuencia de ID de accounts (PostgreSQL específico)
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

INSERT INTO packages (id, nombre, precio, cantidad_clases) VALUES
(1, 'Pack 10', 45000, 10),
(2, 'Pack 20', 75000, 20),
(3, 'Ilimitado', 110000, 999);

SELECT setval('packages_id_seq', (SELECT MAX(id) FROM packages));

INSERT INTO memberships (id, user_id, package_id, clases_restantes, fecha_vencimiento, estado) VALUES
(1, 6, 1, 4, '2026-06-30', 'activo'),
(2, 7, 2, 18, '2026-07-10', 'activo'),
(3, 8, 3, 999, '2026-07-15', 'activo'),
(4, 9, 1, 1, '2026-06-13', 'vencido'),
(5, 10, 1, 2, '2026-06-16', 'activo'),
(6, 11, 2, 1, '2026-06-25', 'activo'),
(7, 12, 1, 8, '2026-05-24', 'vencido');

SELECT setval('memberships_id_seq', (SELECT MAX(id) FROM memberships));

INSERT INTO class_schedule (id, instructor_id, nombre_clase, dia_semana, hora_inicio, cupo_maximo) VALUES
(1, 2, 'Hatha Yoga', 'Lunes', '08:00', 30),
(2, 3, 'Vinyasa Flow', 'Lunes', '10:00', 30),
(3, 4, 'Yin Yoga', 'Lunes', '17:00', 30),
(4, 5, 'Power Yoga', 'Lunes', '18:30', 30),
(5, 2, 'Meditación Guiada', 'Lunes', '20:00', 30),
(6, 3, 'Vinyasa Flow', 'Martes', '07:00', 30),
(7, 4, 'Hatha Yoga', 'Martes', '09:00', 30),
(8, 5, 'Ashtanga Yoga', 'Martes', '11:00', 30),
(9, 2, 'Yoga Restaurativo', 'Martes', '18:00', 30),
(10, 3, 'Power Yoga', 'Martes', '19:30', 30),
(11, 4, 'Yin Yoga', 'Miércoles', '08:30', 30),
(12, 5, 'Vinyasa Flow', 'Miércoles', '10:00', 30),
(13, 2, 'Hatha Yoga', 'Miércoles', '18:00', 30),
(14, 3, 'Meditación Pranayama', 'Miércoles', '19:30', 30),
(15, 5, 'Ashtanga Yoga', 'Jueves', '07:00', 30),
(16, 2, 'Yoga Prenatal', 'Jueves', '09:00', 30),
(17, 3, 'Vinyasa Pilates', 'Jueves', '17:30', 30),
(18, 4, 'Yin Yoga & Meditación', 'Jueves', '19:30', 30),
(19, 5, 'Power Yoga', 'Jueves', '20:45', 30),
(20, 2, 'Hatha Flow', 'Viernes', '08:00', 30),
(21, 3, 'Vinyasa Dinámico', 'Viernes', '10:00', 30),
(22, 4, 'Kundalini Yoga', 'Viernes', '18:00', 30),
(23, 5, 'Yoga Nidra', 'Viernes', '19:30', 30),
(24, 2, 'Hatha Despertar', 'Sábado', '09:00', 30),
(25, 3, 'Vinyasa Advanced', 'Sábado', '10:30', 30),
(26, 4, 'Yin Deep Stretch', 'Sábado', '12:00', 30),
(27, 5, 'Kundalini & Sonoterapia', 'Sábado', '17:00', 30),
(28, 3, 'Vinyasa Yoga Recreativo', 'Domingo', '10:00', 30),
(29, 4, 'Hatha Yoga Suave', 'Domingo', '11:30', 30),
(30, 2, 'Círculo de Meditación', 'Domingo', '18:00', 30);

SELECT setval('class_schedule_id_seq', (SELECT MAX(id) FROM class_schedule));

INSERT INTO bookings (id, user_id, schedule_id, fecha_clase, asistencia) VALUES
(1, 6, 1, '2026-06-14', true),
(2, 6, 6, '2026-06-15', false),
(3, 7, 1, '2026-06-14', true),
(4, 7, 4, '2026-06-14', false),
(5, 8, 2, '2026-06-14', true),
(6, 8, 6, '2026-06-15', false),
(7, 10, 1, '2026-06-14', true),
(8, 9, 3, '2026-06-10', true);

SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings));
