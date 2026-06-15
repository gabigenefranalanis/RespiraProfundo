import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

// Estructura de base de datos en JSON
interface User {
  id: number;
  nombre: string;
  email: string;
  rol: "alumno" | "instructor" | "admin";
}

interface Package {
  id: number;
  nombre: string; // 'Pack 10', 'Pack 20', 'Ilimitado'
  precio: number;
  cantidad_clases: number; // 999 para ilimitado
}

interface Membership {
  id: number;
  user_id: number;
  package_id: number;
  clases_restantes: number;
  fecha_vencimiento: string;
  estado: "activo" | "vencido";
}

interface ClassSchedule {
  id: number;
  instructor_id: number;
  nombre_clase: string;
  dia_semana: string;
  hora_inicio: string;
  cupo_maximo: number;
}

interface Booking {
  id: number;
  user_id: number;
  schedule_id: number;
  fecha_clase: string;
  asistencia: boolean;
}

interface DatabaseSchema {
  users: User[];
  packages: Package[];
  memberships: Membership[];
  class_schedule: ClassSchedule[];
  bookings: Booking[];
  current_user_id: number;
}

const initialDatabaseData: DatabaseSchema = {
  users: [
    { id: 1, nombre: "Valentina Admin", email: "valentina@respiraprofundo.com", rol: "admin" },
    { id: 2, nombre: "Laura Gómez", email: "laura@respiraprofundo.com", rol: "instructor" },
    { id: 3, nombre: "Carlos Ruiz", email: "carlos@respiraprofundo.com", rol: "instructor" },
    { id: 4, nombre: "Elena Paz", email: "elena@respiraprofundo.com", rol: "instructor" },
    { id: 5, nombre: "Mariana Sosa", email: "mariana@respiraprofundo.com", rol: "instructor" },
    { id: 6, nombre: "Maria Alumna", email: "maria@cliente.com", rol: "alumno" },
    { id: 7, nombre: "Juan Pérez", email: "juan.perez@cliente.com", rol: "alumno" },
    { id: 8, nombre: "Sofía Torres", email: "sofia.torres@cliente.com", rol: "alumno" },
    { id: 9, nombre: "Diego Ramírez", email: "diego.ramirez@cliente.com", rol: "alumno" },
    { id: 10, nombre: "Ana Martínez", email: "ana.martinez@cliente.com", rol: "alumno" },
    { id: 11, nombre: "Luis Herrera", email: "luis.herrera@cliente.com", rol: "alumno" },
    { id: 12, nombre: "Carmen Ortiz", email: "carmen.ortiz@cliente.com", rol: "alumno" },
  ],
  packages: [
    { id: 1, nombre: "Pack 10", precio: 45000, cantidad_clases: 10 },
    { id: 2, nombre: "Pack 20", precio: 75000, cantidad_clases: 20 },
    { id: 3, nombre: "Ilimitado", precio: 110000, cantidad_clases: 999 },
  ],
  memberships: [
    { id: 1, user_id: 6, package_id: 1, clases_restantes: 4, fecha_vencimiento: "2026-06-30", estado: "activo" },
    { id: 2, user_id: 7, package_id: 2, clases_restantes: 18, fecha_vencimiento: "2026-07-10", estado: "activo" },
    { id: 3, user_id: 8, package_id: 3, clases_restantes: 999, fecha_vencimiento: "2026-07-15", estado: "activo" },
    { id: 4, user_id: 9, package_id: 1, clases_restantes: 1, fecha_vencimiento: "2026-06-13", estado: "vencido" }, // Diego: expired, dormido
    { id: 5, user_id: 10, package_id: 1, clases_restantes: 2, fecha_vencimiento: "2026-06-16", estado: "activo" }, // Ana: por vencer (< 3 classes)
    { id: 6, user_id: 11, package_id: 2, clases_restantes: 1, fecha_vencimiento: "2026-06-25", estado: "activo" }, // Luis: por vencer
    { id: 7, user_id: 12, package_id: 1, clases_restantes: 8, fecha_vencimiento: "2026-05-24", estado: "vencido" }, // Carmen: expired, dormido
  ],
  class_schedule: [
    // Lunes (5 clases)
    { id: 1, instructor_id: 2, nombre_clase: "Hatha Yoga", dia_semana: "Lunes", hora_inicio: "08:00", cupo_maximo: 30 },
    { id: 2, instructor_id: 3, nombre_clase: "Vinyasa Flow", dia_semana: "Lunes", hora_inicio: "10:00", cupo_maximo: 30 },
    { id: 3, instructor_id: 4, nombre_clase: "Yin Yoga", dia_semana: "Lunes", hora_inicio: "17:00", cupo_maximo: 30 },
    { id: 4, instructor_id: 5, nombre_clase: "Power Yoga", dia_semana: "Lunes", hora_inicio: "18:30", cupo_maximo: 30 },
    { id: 5, instructor_id: 2, nombre_clase: "Meditación Guiada", dia_semana: "Lunes", hora_inicio: "20:00", cupo_maximo: 30 },
    // Martes (5 clases)
    { id: 6, instructor_id: 3, nombre_clase: "Vinyasa Flow", dia_semana: "Martes", hora_inicio: "07:00", cupo_maximo: 30 },
    { id: 7, instructor_id: 4, nombre_clase: "Hatha Yoga", dia_semana: "Martes", hora_inicio: "09:00", cupo_maximo: 30 },
    { id: 8, instructor_id: 5, nombre_clase: "Ashtanga Yoga", dia_semana: "Martes", hora_inicio: "11:00", cupo_maximo: 30 },
    { id: 9, instructor_id: 2, nombre_clase: "Yoga Restaurativo", dia_semana: "Martes", hora_inicio: "18:00", cupo_maximo: 30 },
    { id: 10, instructor_id: 3, nombre_clase: "Power Yoga", dia_semana: "Martes", hora_inicio: "19:30", cupo_maximo: 30 },
    // Miércoles (4 clases)
    { id: 11, instructor_id: 4, nombre_clase: "Yin Yoga", dia_semana: "Miércoles", hora_inicio: "08:30", cupo_maximo: 30 },
    { id: 12, instructor_id: 5, nombre_clase: "Vinyasa Flow", dia_semana: "Miércoles", hora_inicio: "10:00", cupo_maximo: 30 },
    { id: 13, instructor_id: 2, nombre_clase: "Hatha Yoga", dia_semana: "Miércoles", hora_inicio: "18:00", cupo_maximo: 30 },
    { id: 14, instructor_id: 3, nombre_clase: "Meditación Pranayama", dia_semana: "Miércoles", hora_inicio: "19:30", cupo_maximo: 30 },
    // Jueves (5 clases)
    { id: 15, instructor_id: 5, nombre_clase: "Ashtanga Yoga", dia_semana: "Jueves", hora_inicio: "07:00", cupo_maximo: 30 },
    { id: 16, instructor_id: 2, nombre_clase: "Yoga Prenatal", dia_semana: "Jueves", hora_inicio: "09:00", cupo_maximo: 30 },
    { id: 17, instructor_id: 3, nombre_clase: "Vinyasa Pilates", dia_semana: "Jueves", hora_inicio: "17:30", cupo_maximo: 30 },
    { id: 18, instructor_id: 4, nombre_clase: "Yin Yoga & Meditación", dia_semana: "Jueves", hora_inicio: "19:30", cupo_maximo: 30 },
    { id: 19, instructor_id: 5, nombre_clase: "Power Yoga", dia_semana: "Jueves", hora_inicio: "20:45", cupo_maximo: 30 },
    // Viernes (4 clases)
    { id: 20, instructor_id: 2, nombre_clase: "Hatha Flow", dia_semana: "Viernes", hora_inicio: "08:00", cupo_maximo: 30 },
    { id: 21, instructor_id: 3, nombre_clase: "Vinyasa Dinámico", dia_semana: "Viernes", hora_inicio: "10:00", cupo_maximo: 30 },
    { id: 22, instructor_id: 4, nombre_clase: "Kundalini Yoga", dia_semana: "Viernes", hora_inicio: "18:00", cupo_maximo: 30 },
    { id: 23, instructor_id: 5, nombre_clase: "Yoga Nidra", dia_semana: "Viernes", hora_inicio: "19:30", cupo_maximo: 30 },
    // Sábado (4 clases)
    { id: 24, instructor_id: 2, nombre_clase: "Hatha Despertar", dia_semana: "Sábado", hora_inicio: "09:00", cupo_maximo: 30 },
    { id: 25, instructor_id: 3, nombre_clase: "Vinyasa Advanced", dia_semana: "Sábado", hora_inicio: "10:30", cupo_maximo: 30 },
    { id: 26, instructor_id: 4, nombre_clase: "Yin Deep Stretch", dia_semana: "Sábado", hora_inicio: "12:00", cupo_maximo: 30 },
    { id: 27, instructor_id: 5, nombre_clase: "Kundalini & Sonoterapia", dia_semana: "Sábado", hora_inicio: "17:00", cupo_maximo: 30 },
    // Domingo (3 clases)
    { id: 28, instructor_id: 3, nombre_clase: "Vinyasa Yoga Recreativo", dia_semana: "Domingo", hora_inicio: "10:00", cupo_maximo: 30 },
    { id: 29, instructor_id: 4, nombre_clase: "Hatha Yoga Suave", dia_semana: "Domingo", hora_inicio: "11:30", cupo_maximo: 30 },
    { id: 30, instructor_id: 2, nombre_clase: "Círculo de Meditación", dia_semana: "Domingo", hora_inicio: "18:00", cupo_maximo: 30 },
  ],
  bookings: [
    { id: 1, user_id: 6, schedule_id: 1, fecha_clase: "2026-06-14", asistencia: true },
    { id: 2, user_id: 6, schedule_id: 6, fecha_clase: "2026-06-15", asistencia: false },
    { id: 3, user_id: 7, schedule_id: 1, fecha_clase: "2026-06-14", asistencia: true },
    { id: 4, user_id: 7, schedule_id: 4, fecha_clase: "2026-06-14", asistencia: false },
    { id: 5, user_id: 8, schedule_id: 2, fecha_clase: "2026-06-14", asistencia: true },
    { id: 6, user_id: 8, schedule_id: 6, fecha_clase: "2026-06-15", asistencia: false },
    { id: 7, user_id: 10, schedule_id: 1, fecha_clase: "2026-06-14", asistencia: true },
    { id: 8, user_id: 9, schedule_id: 3, fecha_clase: "2026-06-10", asistencia: true }, // Diego: once active but exp
  ],
  current_user_id: 6, // Maria Alumna por defecto
};

// Cargar o Inicializar base de datos
function readDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading database file, using initial data.", err);
  }
  // Escribir inicial y devolver
  writeDatabase(initialDatabaseData);
  return initialDatabaseData;
}

function writeDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file.", err);
  }
}

// Inicializar Express
async function startServer() {
  const app = express();
  app.use(express.json());

  // === ENDPOINTS DE CONFIGURACIÓN Y UTILIDADES ===

  // Obtener todos los usuarios del sistema
  app.get("/api/users", (req, res) => {
    const db = readDatabase();
    res.json(db.users);
  });

  // Cambiar usuario actual simulado (para probar roles)
  app.post("/api/select-user", (req, res) => {
    const { userId } = req.body;
    const db = readDatabase();
    const user = db.users.find((u) => u.id === parseInt(userId));
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    db.current_user_id = user.id;
    writeDatabase(db);
    res.json({ success: true, user });
  });

  // Registrar nuevo alumno
  app.post("/api/register", (req, res) => {
    const db = readDatabase();
    const { nombre, email } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: "Nombre y email son requeridos." });
    }

    const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado." });
    }

    const newUserId = Math.max(...db.users.map((u) => u.id)) + 1;
    const newUser: User = {
      id: newUserId,
      nombre,
      email,
      rol: "alumno",
    };

    db.users.push(newUser);
    writeDatabase(db);
    res.json({ success: true, user: newUser });
  });

  // === MÓDULO DE ALUMNO (API CONTRACT) ===

  // GET /api/me/status: Saldo y vencimiento del alumno
  app.get("/api/me/status", (req, res) => {
    const db = readDatabase();
    const currentUserId = db.current_user_id;
    const user = db.users.find((u) => u.id === currentUserId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const membership = db.memberships.find(
      (m) => m.user_id === user.id && m.estado === "activo"
    );

    let packageDetails = null;
    if (membership) {
      const pkg = db.packages.find((p) => p.id === membership.package_id);
      if (pkg) {
        packageDetails = {
          ...membership,
          packageName: pkg.nombre,
          precio: pkg.precio,
          cantidad_total: pkg.cantidad_clases,
        };
      }
    }

    const reserves = db.bookings.filter((b) => b.user_id === user.id);

    res.json({
      user,
      membership: packageDetails,
      reserves_count: reserves.length,
      bookings: reserves.map((b) => {
        const schedule = db.class_schedule.find((s) => s.id === b.schedule_id);
        const inst = schedule ? db.users.find((u) => u.id === schedule.instructor_id) : null;
        return {
          ...b,
          nombre_clase: schedule?.nombre_clase || "Clase",
          dia_semana: schedule?.dia_semana || "Lunes",
          hora_inicio: schedule?.hora_inicio || "08:00",
          instructor_name: inst?.nombre || "Instructor",
        };
      }),
    });
  });

  // POST /api/me/subscribe: Contratar un plan
  app.post("/api/me/subscribe", (req, res) => {
    const { userId, packageId } = req.body;
    if (!userId || !packageId) {
      return res.status(400).json({ error: "Faltan datos de suscripción." });
    }
    const db = readDatabase();
    
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    const pkg = db.packages.find((p) => p.id === parseInt(packageId));
    if (!pkg) return res.status(404).json({ error: "Paquete no encontrado." });

    // Remove old membership if any
    db.memberships = db.memberships.filter(m => m.user_id !== userId);

    const newMembershipId = db.memberships.length > 0 ? Math.max(...db.memberships.map((m) => m.id)) + 1 : 1;
    const dateVenc = new Date();
    dateVenc.setDate(dateVenc.getDate() + 30);
    const formattedDate = dateVenc.toISOString().split("T")[0];

    const newMembership: Membership = {
      id: newMembershipId,
      user_id: user.id,
      package_id: pkg.id,
      clases_restantes: pkg.cantidad_clases,
      fecha_vencimiento: formattedDate,
      estado: "activo",
    };

    db.memberships.push(newMembership);
    writeDatabase(db);
    res.json({ success: true, membership: newMembership });
  });

  // GET /api/classes/available: Lista las clases en general o filtrando
  app.get("/api/classes/available", (req, res) => {
    const db = readDatabase();
    const { dia } = req.query;

    let schedules = db.class_schedule;
    if (dia) {
      schedules = schedules.filter((s) => s.dia_semana.toLowerCase() === (dia as string).toLowerCase());
    }

    const mapped = schedules.map((schedule) => {
      const instructor = db.users.find((u) => u.id === schedule.instructor_id);
      
      // Contar reservas en este horario
      const reservedCount = db.bookings.filter(
        (b) => b.schedule_id === schedule.id && b.fecha_clase === "2026-06-15"
      ).length;

      // El usuario actual reservó esta clase?
      const isReservedByMe = db.bookings.some(
        (b) => b.schedule_id === schedule.id && b.user_id === db.current_user_id
      );

      return {
        id: schedule.id,
        nombre_clase: schedule.nombre_clase,
        dia_semana: schedule.dia_semana,
        hora_inicio: schedule.hora_inicio,
        cupo_maximo: schedule.cupo_maximo,
        instructor: {
          id: instructor?.id || 0,
          nombre: instructor?.nombre || "Desconocido",
          email: instructor?.email || "",
          rol: instructor?.rol || "instructor",
        },
        cupos_reservados: reservedCount,
        isReservedByMe,
      };
    });

    res.json(mapped);
  });

  // POST /api/bookings/reserve: Reservar cupo
  app.post("/api/bookings/reserve", (req, res) => {
    const { scheduleId, fechaClase } = req.body;
    const db = readDatabase();
    const currentUserId = db.current_user_id;

    const user = db.users.find((u) => u.id === currentUserId);
    if (!user) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const schedule = db.class_schedule.find((s) => s.id === parseInt(scheduleId));
    if (!schedule) {
      return res.status(404).json({ error: "Horario de clase no encontrado" });
    }

    // Regla de Oro 1: Validación de Cupos (maximo 30 cupos por defecto)
    const activeBookingsOnClass = db.bookings.filter(
      (b) => b.schedule_id === schedule.id && b.fecha_clase === (fechaClase || "2026-06-15")
    );
    if (activeBookingsOnClass.length >= schedule.cupo_maximo) {
      return res.status(400).json({ error: "La clase superó su cupacidad máxima de reservas." });
    }

    // Comprobar si ya está reservado
    const alreadyBooked = db.bookings.some(
      (b) => b.user_id === user.id && b.schedule_id === schedule.id && b.fecha_clase === (fechaClase || "2026-06-15")
    );
    if (alreadyBooked) {
      return res.status(400).json({ error: "Ya has reservado esta clase para esa fecha." });
    }

    // Regla de Oro 2: Balance check
    const membership = db.memberships.find(
      (m) => m.user_id === user.id && m.estado === "activo"
    );
    if (!membership) {
      return res.status(400).json({ error: "No tienes una membresía activa para reservar clases." });
    }

    const pkg = db.packages.find((p) => p.id === membership.package_id);
    const isUnlimited = pkg ? (pkg.nombre.toLowerCase().includes("ilimitado") || pkg.cantidad_clases >= 999) : false;

    if (!isUnlimited && membership.clases_restantes <= 0) {
      return res.status(400).json({ error: "Saldo insuficiente. Te quedan 0 clases en tu paquete actual." });
    }

    // Crear booking (asistencia = false por defecto)
    const newBooking: Booking = {
      id: db.bookings.length > 0 ? Math.max(...db.bookings.map((b) => b.id)) + 1 : 1,
      user_id: user.id,
      schedule_id: schedule.id,
      fecha_clase: fechaClase || "2026-06-15",
      asistencia: false,
    };

    db.bookings.push(newBooking);
    writeDatabase(db);

    res.json({ success: true, booking: newBooking });
  });

  // Cancelar reserva (funcionalidad extra muy agradecida para alumnos)
  app.post("/api/bookings/cancel", (req, res) => {
    const { bookingId } = req.body;
    const db = readDatabase();

    const idx = db.bookings.findIndex((b) => b.id === parseInt(bookingId));
    if (idx === -1) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }

    const booking = db.bookings[idx];

    // Si ya se marcó asistencia como True, y ahora lo cancelamos (o si era paquete de descuento),
    // devolvemos la clase si descontó (en caso de que estuviera marcada asistencia).
    if (booking.asistencia) {
      const membership = db.memberships.find(
        (m) => m.user_id === booking.user_id && m.estado === "activo"
      );
      if (membership) {
        const pkg = db.packages.find((p) => p.id === membership.package_id);
        const isUnlimited = pkg ? (pkg.nombre.toLowerCase().includes("ilimitado") || pkg.cantidad_clases >= 999) : false;
        if (!isUnlimited) {
          membership.clases_restantes += 1;
        }
      }
    }

    db.bookings.splice(idx, 1);
    writeDatabase(db);
    res.json({ success: true });
  });


  // === MÓDULO ADMINISTRATIVO (VALENTINA DASHBOARD) ===

  // GET /api/admin/stats: Métricas clave para Valentina
  app.get("/api/admin/stats", (req, res) => {
    const db = readDatabase();

    // 1. Demanda de Instructores/Horarios
    // Agrupar bookings por clase e instructor para ver demanda
    const demandMap: { [key: string]: { instructor: string; clase: string; total: number; scheduleId: number } } = {};
    db.bookings.forEach((booking) => {
      const schedule = db.class_schedule.find((s) => s.id === booking.schedule_id);
      if (!schedule) return;
      const key = `${schedule.nombre_clase}-${schedule.instructor_id}`;
      if (!demandMap[key]) {
        const instructor = db.users.find((u) => u.id === schedule.instructor_id);
        demandMap[key] = {
          instructor: instructor?.nombre || "Instructor",
          clase: schedule.nombre_clase,
          total: 0,
          scheduleId: schedule.id,
        };
      }
      demandMap[key].total += 1;
    });

    const demandList = Object.values(demandMap).sort((a, b) => b.total - a.total);
    const topDemand = demandList.length > 0 ? demandList[0] : { instructor: "Laura Gómez", clase: "Hatha Yoga", total: 10, scheduleId: 1 };

    // 2. Estado de Clientes: Activos / Por Vencer / Dormidos
    // Alumnos son rol 'alumno'
    const students = db.users.filter((u) => u.rol === "alumno");
    let activos = 0;
    let porVencer = 0;
    let dormidos = 0;

    // Se consideran "dormidos" si no han hecho reservas en los últimos 15 días, o si su membresía está vencida.
    // Simulemos la lógica para cada estudiante.
    const studentStatusList = students.map((std) => {
      const membership = db.memberships.find((m) => m.user_id === std.id);
      const studentBookings = db.bookings.filter((b) => b.user_id === std.id);

      // Revisar si tiene reservas recientes (por ejemplo, fecha_clase >= 2026-06-01)
      const hasRecentBooking = studentBookings.some((b) => {
        const bookingDate = new Date(b.fecha_clase);
        const fifteenDaysAgo = new Date("2026-06-14");
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
        return bookingDate >= fifteenDaysAgo;
      });

      let status: "activo" | "por_vencer" | "dormido" = "dormido";

      if (!membership || membership.estado === "vencido") {
        status = "dormido";
        dormidos++;
      } else {
        // Paquete activo. Revisar número de clases
        const isUnlimited = membership.package_id === 3; // id 3 is unlimited
        if (!isUnlimited && membership.clases_restantes < 3) {
          status = "por_vencer";
          porVencer++;
        } else if (!hasRecentBooking && studentBookings.length > 0) {
          // Si tiene reservas antiguas pero nada en los últimos 15 días
          status = "dormido";
          dormidos++;
        } else {
          status = "activo";
          activos++;
        }
      }

      return {
        id: std.id,
        nombre: std.nombre,
        email: std.email,
        status,
        clases_restantes: membership ? membership.clases_restantes : 0,
        fecha_vencimiento: membership ? membership.fecha_vencimiento : "N/A",
        packageName: membership ? db.packages.find(p => p.id === membership.package_id)?.nombre : "Ninguno"
      };
    });

    // 3. Rentabilidad (Ingreso promedio por alumno = Total Ventas / Total alumnos)
    // Calculado: suma de precios de paquetes comprados por membresias / alumnos totales
    const activeMembershipsCount = db.memberships.length;
    let totalSalesValue = 0;
    db.memberships.forEach((m) => {
      const pkg = db.packages.find((p) => p.id === m.package_id);
      if (pkg) totalSalesValue += pkg.precio;
    });

    const avgRevenue = students.length > 0 ? Math.round(totalSalesValue / students.length) : 0;

    res.json({
      metrics: {
        peakDemand: {
          instructor: topDemand.instructor,
          clase: topDemand.clase,
          total: topDemand.total,
        },
        clients: {
          activos,
          porVencer,
          dormidos,
          total: students.length,
          list: studentStatusList
        },
        avgRevenue,
        totalSalesValue
      },
      demandRanking: demandList.length > 0 ? demandList : [
        { instructor: "Laura Gómez", clase: "Hatha Yoga", total: 4, scheduleId: 1 },
        { instructor: "Carlos Ruiz", clase: "Vinyasa Flow", total: 3, scheduleId: 6 },
        { instructor: "Elena Paz", clase: "Yin Yoga & Meditación", total: 2, scheduleId: 18 },
        { instructor: "Mariana Sosa", clase: "Ashtanga Yoga", total: 1, scheduleId: 8 }
      ],
    });
  });

  // POST /api/admin/attendance: Registrar/marcar asistencia (Trigger simulado)
  app.post("/api/admin/attendance", (req, res) => {
    const { bookingId, asistencia } = req.body;
    const db = readDatabase();

    const booking = db.bookings.find((b) => b.id === parseInt(bookingId));
    if (!booking) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }

    const previousAsistencia = booking.asistencia;
    booking.asistencia = asistencia;

    // Simular el tigger SQL de descuento automático:
    // "al marcar asistencia = True en bookings, reste automáticamente -1 en memberships.clases_restantes, a menos que el paquete sea 'Ilimitado'"
    if (asistencia === true && previousAsistencia === false) {
      const membership = db.memberships.find(
        (m) => m.user_id === booking.user_id && m.estado === "activo"
      );
      if (membership) {
        const pkg = db.packages.find((p) => p.id === membership.package_id);
        const isUnlimited = pkg ? (pkg.nombre.toLowerCase().includes("ilimitado") || pkg.cantidad_clases >= 999) : false;
        
        if (!isUnlimited) {
          membership.clases_restantes = Math.max(0, membership.clases_restantes - 1);
        }
      }
    } 
    // Si desmarcamos la asistencia (de True a False), le devolvemos la clase
    else if (asistencia === false && previousAsistencia === true) {
      const membership = db.memberships.find(
        (m) => m.user_id === booking.user_id && m.estado === "activo"
      );
      if (membership) {
        const pkg = db.packages.find((p) => p.id === membership.package_id);
        const isUnlimited = pkg ? (pkg.nombre.toLowerCase().includes("ilimitado") || pkg.cantidad_clases >= 999) : false;
        
        if (!isUnlimited) {
          membership.clases_restantes = membership.clases_restantes + 1;
        }
      }
    }

    db.bookings = db.bookings.map((b) => b.id === booking.id ? booking : b);
    writeDatabase(db);

    res.json({ success: true, booking });
  });

  // GET /api/admin/bookings: Listar reservas de hoy para marcar asistencia
  app.get("/api/admin/bookings", (req, res) => {
    const db = readDatabase();
    
    // Obtener todas las reservas con detalles de alumnos y clases
    const response = db.bookings.map((booking) => {
      const student = db.users.find((u) => u.id === booking.user_id);
      const schedule = db.class_schedule.find((s) => s.id === booking.schedule_id);
      const instructor = schedule ? db.users.find((u) => u.id === schedule.instructor_id) : null;

      return {
        id: booking.id,
        fecha_clase: booking.fecha_clase,
        asistencia: booking.asistencia,
        student: {
          id: student?.id,
          nombre: student?.nombre,
          email: student?.email,
        },
        classDetails: {
          id: schedule?.id,
          nombre_clase: schedule?.nombre_clase,
          dia_semana: schedule?.dia_semana,
          hora_inicio: schedule?.hora_inicio,
          instructor_name: instructor?.nombre,
        },
      };
    });

    res.json(response);
  });

  // POST /api/admin/add-student: Registrar nuevo alumno con membresía comercial
  app.post("/api/admin/add-student", (req, res) => {
    const { nombre, email, packageId } = req.body;
    const db = readDatabase();

    // Comprobar si el correo ya existe
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: "Ya existe un usuario registrado con este correo electrónico." });
    }

    const newUserId = db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1;
    const newUser: User = {
      id: newUserId,
      nombre,
      email,
      rol: "alumno",
    };

    const targetPkgId = parseInt(packageId) || 1;
    const pkg = db.packages.find((p) => p.id === targetPkgId) || db.packages[0];

    // Crear membresía activa
    const newMembershipId = db.memberships.length > 0 ? Math.max(...db.memberships.map((m) => m.id)) + 1 : 1;
    const dateVenc = new Date();
    dateVenc.setDate(dateVenc.getDate() + 30); // 30 días de vigencia
    const formattedDate = dateVenc.toISOString().split("T")[0];

    const newMembership: Membership = {
      id: newMembershipId,
      user_id: newUserId,
      package_id: pkg.id,
      clases_restantes: pkg.cantidad_clases,
      fecha_vencimiento: formattedDate,
      estado: "activo",
    };

    db.users.push(newUser);
    db.memberships.push(newMembership);
    writeDatabase(db);

    res.json({ success: true, user: newUser, membership: newMembership });
  });

  // POST /api/admin/add-class: Añadir nueva clase al cronograma semanal
  app.post("/api/admin/add-class", (req, res) => {
    const { nombreClase, instructorId, diaSemana, horaInicio, cupoMaximo } = req.body;
    const db = readDatabase();

    const instID = parseInt(instructorId);
    const instructor = db.users.find((u) => u.id === instID && u.rol === "instructor");
    if (!instructor) {
      return res.status(400).json({ error: "Instructor seleccionado no válido." });
    }

    const newScheduleId = db.class_schedule.length > 0 ? Math.max(...db.class_schedule.map((s) => s.id)) + 1 : 1;
    const newSchedule: ClassSchedule = {
      id: newScheduleId,
      instructor_id: instID,
      nombre_clase: nombreClase,
      dia_semana: diaSemana,
      hora_inicio: horaInicio,
      cupo_maximo: parseInt(cupoMaximo) || 30,
    };

    db.class_schedule.push(newSchedule);
    writeDatabase(db);

    res.json({ success: true, class: newSchedule });
  });


  // === VITE MIDDLEWARE CONFIGURATION ===
  if (process.env.NODE_ENV !== "production") {
    // En desarrollo dinámico, Vite maneja los archivos estáticos
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // En producción (build), Express sirve los archivos estáticos desde dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Escuchar servidor
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
