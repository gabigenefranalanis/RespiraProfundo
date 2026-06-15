-- ====================================================================
-- ESQUEMA DE BASE DE DATOS REGIONAL COMPLETO - "RESPIRA PROFUNDO"
-- ====================================================================
-- Este script PostgreSQL contiene el diseño de tablas DDL, triggers de descuento
-- automático y datos DML iniciales (4 instructores, 30 clases semanales,
-- y alumnos de prueba) para mitigar las ineficiencias de Valentina.

-- 1. LIMPIEZA DE TABLAS PREVIAS (Por seguridad al reiniciar)
DROP TRIGGER IF EXISTS trg_check_attendance ON bookings;
DROP FUNCTION IF EXISTS fn_descontar_clase();
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS class_schedule CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. DEFINICIÓN DE TABLAS (DDL)

-- Tabla de Usuarios (Soporta alumnos, instructores y administradores)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('alumno', 'instructor', 'admin'))
);

-- Tabla de Paquetes de Clases (Planes de precios de Respira Profundo)
CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL, -- 'Pack 10', 'Pack 20', 'Ilimitado'
    precio DECIMAL(10, 2) NOT NULL,
    cantidad_clases INTEGER NOT NULL -- Cantidad de clases asignadas (999 para ilimitado)
);

-- Tabla de Membresías (Asignación de paquetes adquiridos a alumnos)
CREATE TABLE memberships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id INTEGER NOT NULL REFERENCES packages(id),
    clases_restantes INTEGER NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'vencido'))
);

-- Tabla de Horarios de Clases (Planificación semanal con capacidad máxima)
CREATE TABLE class_schedule (
    id SERIAL PRIMARY KEY,
    instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    nombre_clase VARCHAR(100) NOT NULL,
    dia_semana VARCHAR(20) NOT NULL CHECK (dia_semana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')),
    hora_inicio TIME NOT NULL,
    cupo_maximo INTEGER NOT NULL DEFAULT 30
);

-- Tabla de Reservas de Alumnos
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_id INTEGER NOT NULL REFERENCES class_schedule(id) ON DELETE CASCADE,
    fecha_clase DATE NOT NULL,
    asistencia BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, schedule_id, fecha_clase)
);

-- 3. LOGICA DE DESCUENTO AUTOMÁTICO (Triggers)
-- Cuando el instructor marca asistencia = TRUE en bookings, se descuenta de memberships
CREATE OR REPLACE FUNCTION fn_descontar_clase()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica si se marcó asistencia: cambia de FALSE/NULL a TRUE
    IF NEW.asistencia = TRUE AND (OLD.asistencia IS NULL OR OLD.asistencia = FALSE) THEN
        UPDATE memberships 
        SET clases_restantes = clases_restantes - 1
        WHERE user_id = NEW.user_id 
          AND estado = 'activo'
          AND clases_restantes > 0
          -- Solo si el paquete no es Ilimitado (cantidad_clases >= 999 se asume Ilimitado)
          AND package_id NOT IN (
              SELECT id FROM packages WHERE nombre ILIKE '%Ilimitado%' OR cantidad_clases >= 999
          );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_attendance
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION fn_descontar_clase();


-- 4. INSERCIÓN DE DATOS INICIALES (DML)

-- Insertar roles administrativos e Instructores
INSERT INTO users (nombre, email, rol) VALUES 
('Valentina Admin', 'valentina@respiraprofundo.com', 'admin'),
('Laura Gómez', 'laura@respiraprofundo.com', 'instructor'),
('Carlos Ruiz', 'carlos@respiraprofundo.com', 'instructor'),
('Elena Paz', 'elena@respiraprofundo.com', 'instructor'),
('Mariana Sosa', 'mariana@respiraprofundo.com', 'instructor');

-- Alumnos de Prueba
INSERT INTO users (nombre, email, rol) VALUES
('Maria Alumna', 'maria@cliente.com', 'alumno'),
('Juan Pérez', 'juan.perez@cliente.com', 'alumno'),
('Sofía Torres', 'sofia.torres@cliente.com', 'alumno'),
('Diego Ramírez', 'diego.ramirez@cliente.com', 'alumno'),
('Ana Martínez', 'ana.martinez@cliente.com', 'alumno'),
('Luis Herrera', 'luis.herrera@cliente.com', 'alumno'),
('Carmen Ortiz', 'carmen.ortiz@cliente.com', 'alumno');

-- Paquetes comerciales
INSERT INTO packages (nombre, precio, cantidad_clases) VALUES 
('Pack 10', 50.00, 10),
('Pack 20', 85.00, 20),
('Ilimitado', 120.00, 999);

-- Membresías iniciales asignadas
INSERT INTO memberships (user_id, package_id, clases_restantes, fecha_vencimiento, estado) VALUES
(6, 1, 4, CURRENT_DATE + INTERVAL '15 days', 'activo'),      -- Maria Alumna: Le quedan 4 clases del Pack 10
(7, 2, 18, CURRENT_DATE + INTERVAL '25 days', 'activo'),     -- Juan Pérez: Le quedan 18 clases
(8, 3, 999, CURRENT_DATE + INTERVAL '30 days', 'activo'),    -- Sofía Torres: Ilimitado
(9, 1, 1, CURRENT_DATE - INTERVAL '1 days', 'vencido'),      -- Diego Ramírez: Expulsado/Vencido (dormido)
(10, 1, 2, CURRENT_DATE + INTERVAL '2 days', 'activo'),      -- Ana Martínez: Por vencer (clases < 3)
(11, 2, 1, CURRENT_DATE + INTERVAL '10 days', 'activo'),     -- Luis Herrera: Por vencer (clases < 3)
(12, 1, 8, CURRENT_DATE - INTERVAL '20 days', 'vencido');    -- Carmen Ortiz: Vencido (dormido)

-- 5. PLANIFICACIÓN DE LAS 30 CLASES SEMANALES (users 2, 3, 4, 5 son los instructores)
INSERT INTO class_schedule (instructor_id, nombre_clase, dia_semana, hora_inicio, cupo_maximo) VALUES
-- Lunes (5 clases)
(2, 'Hatha Yoga', 'Lunes', '08:00', 30),
(3, 'Vinyasa Flow', 'Lunes', '10:00', 30),
(4, 'Yin Yoga', 'Lunes', '17:00', 30),
(5, 'Power Yoga', 'Lunes', '18:30', 30),
(2, 'Meditación Guiada', 'Lunes', '20:00', 30),

-- Martes (5 clases)
(3, 'Vinyasa Flow', 'Martes', '07:00', 30),
(4, 'Hatha Yoga', 'Martes', '09:00', 30),
(5, 'Ashtanga Yoga', 'Martes', '11:00', 30),
(2, 'Yoga Restaurativo', 'Martes', '18:00', 30),
(3, 'Power Yoga', 'Martes', '19:30', 30),

-- Miércoles (4 clases)
(4, 'Yin Yoga', 'Miércoles', '08:30', 30),
(5, 'Vinyasa Flow', 'Miércoles', '10:00', 30),
(2, 'Hatha Yoga', 'Miércoles', '18:00', 30),
(3, 'Meditación Pranayama', 'Miércoles', '19:30', 30),

-- Jueves (5 clases)
(5, 'Ashtanga Yoga', 'Jueves', '07:00', 30),
(2, 'Yoga Prenatal', 'Jueves', '09:00', 30),
(3, 'Vinyasa Pilates', 'Jueves', '17:30', 30),
(4, 'Yin Yoga & Meditación', 'Jueves', '19:30', 30),
(5, 'Power Yoga', 'Jueves', '20:45', 30),

-- Viernes (4 clases)
(2, 'Hatha Flow', 'Viernes', '08:00', 30),
(3, 'Vinyasa Dinámico', 'Viernes', '10:00', 30),
(4, 'Kundalini Yoga', 'Viernes', '18:00', 30),
(5, 'Yoga Nidra', 'Viernes', '19:30', 30),

-- Sábado (4 clases)
(2, 'Hatha Despertar', 'Sábado', '09:00', 30),
(3, 'Vinyasa Advanced', 'Sábado', '10:30', 30),
(4, 'Yin Deep Stretch', 'Sábado', '12:00', 30),
(5, 'Kundalini & Sonoterapia', 'Sábado', '17:00', 30),

-- Domingo (3 clases)
(3, 'Vinyasa Yoga Recreativo', 'Domingo', '10:00', 30),
(4, 'Hatha Yoga Suave', 'Domingo', '11:30', 30),
(2, 'Círculo de Meditación', 'Domingo', '18:00', 30);


-- 6. RESERVAS INICIALES DE PRUEBA
-- Alumnos reservando en clases de la semana
INSERT INTO bookings (user_id, schedule_id, fecha_clase, asistencia) VALUES
(6, 1, CURRENT_DATE, TRUE),   -- Maria reservó Hatha Yoga Lunes y asistió (Descuenta de su membresía)
(6, 6, CURRENT_DATE + INTERVAL '1 days', FALSE), -- Maria reservó Vinyasa Flow Martes (Pendiente)
(7, 1, CURRENT_DATE, TRUE),   -- Juan reservó y asistió
(7, 4, CURRENT_DATE, FALSE),  -- Juan reservó Power Yoga Lunes (Pendiente)
(8, 2, CURRENT_DATE, TRUE),   -- Sofía asistió (Ilimitado - no descuenta saldo)
(8, 6, CURRENT_DATE + INTERVAL '1 days', FALSE), -- Sofía reservó Martes
(10, 1, CURRENT_DATE, TRUE);  -- Ana reservó y asistió (Descuenta)
