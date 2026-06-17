import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Pool } from "pg";
import dotenv from "dotenv";
import dns from "dns";

// Supabase and others may fail with IPv6. Force IPv4 resolution
dns.setDefaultResultOrder("ipv4first");

// Cargar variables de entorno (como DATABASE_URL)
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
}
dotenv.config(); // fallback a .env si está

const PORT = 3000;

// Configuración de conexión a PostgreSQL
// Render, Supabase, Neon proporcionan una URL de conexión segura
const isLocalhost = process.env.DATABASE_URL?.includes("localhost") || process.env.DATABASE_URL?.includes("127.0.0.1");

// Create pool conditionally to avert connection attempts to local 127.0.0.1 when no URL is provided
const actualPool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !isLocalhost
    ? { rejectUnauthorized: false } 
    : undefined,
}) : null;

// Evitar que el servidor Node.js crashee si la base de datos lanza errores en background (ej. ECONNREFUSED)
if (actualPool) {
  actualPool.on('error', (err) => {
    console.error('⚠️ Error inesperado en el cliente de base de datos:', err.message || err);
  });
}

// Proxy query method to return empty rows when DB is not configured
const pool = {
  query: async (...args: any[]) => {
    if (actualPool) return actualPool.query(args[0], args[1]);
    return { rows: [] };
  }
};

// Variable simulada para desarrollo rápido (quien está logueado)
let current_user_id = 6; 

// === Función para generar automáticamente las tablas ===
async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ No DATABASE_URL provided. Configure su .env antes de usar postgres.");
    return;
  }
  try {
    // Comprobar si la tabla users existe
    const res = await pool.query("SELECT to_regclass('public.users') as table_exists;");
    if (!res.rows[0].table_exists) {
      console.log("🛠️ Tablas no detectadas. Procediendo a inicializar estructura...");
      const initSql = fs.readFileSync(path.join(process.cwd(), "db", "init.sql"), "utf-8");
      
      // Ejecutar todo el conjunto de queries del init.sql
      await pool.query(initSql);
      console.log("✅ Base de datos PostgreSQL inicializada exitosamente desde init.sql.");
    } else {
      console.log("✅ Tablas de la base de datos detectadas. Saltando migración.");
    }
  } catch (err: any) {
    console.error("❌ Error verificando/inicializando la base de datos:", err.message || err);
    if (err.code === 'ENOTFOUND' && process.env.DATABASE_URL?.includes('supabase.co')) {
      console.error("\n💡 TIP para Supabase: El error ENOTFOUND suele ocurrir porque Supabase usa IPv6 por defecto y tu red local no lo soporta.");
      console.error("1. Ve a tu panel de Supabase -> Settings -> Database -> Connection String.");
      console.error("2. Activa la opción 'Use connection pooling' (IPv4) y copia esa URL (termina en el puerto 6543 o usa pooler.supabase.com).");
      console.error("3. Recuerda codificar caracteres especiales de tu contraseña en la URL (ej: el símbolo '!' debe escribirse como '%21').\n");
    }
  }
}

async function startServer() {
  // Genera migración antes del arranque del servidor
  await initializeDatabase();

  const app = express();
  app.use(express.json());

  // === ENDPOINTS DE CONFIGURACIÓN Y UTILIDADES ===

  // Obtener todos los usuarios del sistema
  app.get("/api/users", async (req, res) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users");
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error de conexión a la BD." });
    }
  });

  // Cambiar usuario actual
  app.post("/api/select-user", async (req, res) => {
    try {
      const { userId } = req.body;
      const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [parseInt(userId)]);
      if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
      
      current_user_id = rows[0].id;
      res.json({ success: true, user: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error de conexión a la BD." });
    }
  });

  // Registrar nuevo alumno
  app.post("/api/register", async (req, res) => {
    try {
      const { nombre, email } = req.body;
      if (!nombre || !email) return res.status(400).json({ error: "Nombre y email son requeridos." });

      const existingUser = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
      if (existingUser.rows.length > 0) return res.status(400).json({ error: "El email ya está registrado." });

      const result = await pool.query(
        "INSERT INTO users (nombre, email, rol) VALUES ($1, $2, 'alumno') RETURNING *",
        [nombre, email]
      );
      res.json({ success: true, user: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  });

  // GET /api/me/status: Saldo y vencimiento del alumno
  app.get("/api/me/status", async (req, res) => {
    try {
      const { rows: userRows } = await pool.query("SELECT * FROM users WHERE id = $1", [current_user_id]);
      if (userRows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
      const user = userRows[0];

      const { rows: membershipRows } = await pool.query(`
        SELECT m.*, p.nombre as "packageName", p.precio, p.cantidad_clases as cantidad_total
        FROM memberships m
        JOIN packages p ON m.package_id = p.id
        WHERE m.user_id = $1 AND m.estado = 'activo'
        LIMIT 1
      `, [user.id]);

      let packageDetails = membershipRows.length > 0 ? membershipRows[0] : null;
      if (packageDetails) {
        packageDetails.fecha_vencimiento = new Date(packageDetails.fecha_vencimiento).toISOString().split('T')[0];
      }

      const { rows: reserveRows } = await pool.query(`
        SELECT b.*, s.nombre_clase, s.dia_semana, s.hora_inicio, i.nombre as instructor_name
        FROM bookings b
        JOIN class_schedule s ON b.schedule_id = s.id
        LEFT JOIN users i ON s.instructor_id = i.id
        WHERE b.user_id = $1
      `, [user.id]);

      res.json({
        user,
        membership: packageDetails,
        reserves_count: reserveRows.length,
        bookings: reserveRows.map(b => ({
          ...b,
          fecha_clase: new Date(b.fecha_clase).toISOString().split('T')[0]
        }))
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // POST /api/me/subscribe
  app.post("/api/me/subscribe", async (req, res) => {
    try {
      const { userId, packageId } = req.body;
      if (!userId || !packageId) return res.status(400).json({ error: "Faltan datos." });
      
      const { rows: userRows } = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
      if (userRows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

      const { rows: pkgRows } = await pool.query("SELECT * FROM packages WHERE id = $1", [packageId]);
      if (pkgRows.length === 0) return res.status(404).json({ error: "Paquete no encontrado" });
      const pkg = pkgRows[0];

      await pool.query("DELETE FROM memberships WHERE user_id = $1", [userId]);

      const dateVenc = new Date();
      dateVenc.setDate(dateVenc.getDate() + 30);
      const formattedDate = dateVenc.toISOString().split("T")[0];

      const { rows: memRows } = await pool.query(`
        INSERT INTO memberships (user_id, package_id, clases_restantes, fecha_vencimiento, estado)
        VALUES ($1, $2, $3, $4, 'activo') RETURNING *
      `, [userId, packageId, pkg.cantidad_clases, formattedDate]);

      res.json({ success: true, membership: memRows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // GET /api/classes/available
  app.get("/api/classes/available", async (req, res) => {
    try {
      const { dia } = req.query;
      let queryStr = `
        SELECT s.*, u.id as instructor_id, u.nombre as instructor_nombre, u.email as instructor_email, u.rol as instructor_rol
        FROM class_schedule s
        JOIN users u ON s.instructor_id = u.id
      `;
      let params: any[] = [];
      if (dia) {
        queryStr += ` WHERE LOWER(s.dia_semana) = LOWER($1)`;
        params.push(dia);
      }

      const { rows: schedules } = await pool.query(queryStr, params);

      // Usado para reservar en la fecha 2026-06-15 mockup
      const countsRes = await pool.query(`
        SELECT schedule_id, count(id) as reserved_count
        FROM bookings
        WHERE fecha_clase = '2026-06-15'
        GROUP BY schedule_id
      `);
      const countsMap = Object.fromEntries(countsRes.rows.map((r: any) => [r.schedule_id, parseInt(r.reserved_count)]));

      const myBookingsRes = await pool.query(`SELECT schedule_id FROM bookings WHERE user_id = $1`, [current_user_id]);
      const myBookingsSet = new Set(myBookingsRes.rows.map((r: any) => r.schedule_id));

      const mapped = schedules.map(s => ({
        id: s.id,
        nombre_clase: s.nombre_clase,
        dia_semana: s.dia_semana,
        hora_inicio: s.hora_inicio,
        cupo_maximo: s.cupo_maximo,
        instructor: { id: s.instructor_id, nombre: s.instructor_nombre, email: s.instructor_email, rol: s.instructor_rol },
        cupos_reservados: countsMap[s.id] || 0,
        isReservedByMe: myBookingsSet.has(s.id),
      }));

      res.json(mapped);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener clases disponibles." });
    }
  });

  // POST /api/bookings/reserve
  app.post("/api/bookings/reserve", async (req, res) => {
    try {
      const { scheduleId, fechaClase } = req.body;
      const targetDate = fechaClase || "2026-06-15";

      const { rows: userRows } = await pool.query("SELECT * FROM users WHERE id = $1", [current_user_id]);
      if (userRows.length === 0) return res.status(404).json({ error: "Alumno no encontrado" });
      const user = userRows[0];

      const { rows: scheduleRows } = await pool.query("SELECT * FROM class_schedule WHERE id = $1", [scheduleId]);
      if (scheduleRows.length === 0) return res.status(404).json({ error: "Horario de clase no encontrado" });
      const schedule = scheduleRows[0];

      const { rows: countRows } = await pool.query(`SELECT count(id) as c FROM bookings WHERE schedule_id = $1 AND fecha_clase = $2`, [scheduleId, targetDate]);
      if (parseInt(countRows[0].c) >= schedule.cupo_maximo) {
        return res.status(400).json({ error: "La clase superó su capacidad máxima." });
      }

      const { rows: alreadyBooked } = await pool.query(`SELECT id FROM bookings WHERE user_id = $1 AND schedule_id = $2 AND fecha_clase = $3`, [user.id, scheduleId, targetDate]);
      if (alreadyBooked.length > 0) return res.status(400).json({ error: "Ya has reservado esta clase para esa fecha." });

      const { rows: membershipRows } = await pool.query(`
        SELECT m.*, p.nombre as "packageName", p.cantidad_clases as total_package_clases
        FROM memberships m JOIN packages p ON m.package_id = p.id
        WHERE m.user_id = $1 AND m.estado = 'activo'
      `, [user.id]);
      
      if (membershipRows.length === 0) return res.status(400).json({ error: "No tienes membresía activa." });
      const membership = membershipRows[0];
      const isUnlimited = membership.packageName.toLowerCase().includes("ilimitado") || membership.total_package_clases >= 999;
      if (!isUnlimited && membership.clases_restantes <= 0) return res.status(400).json({ error: "Saldo insuficiente." });

      const { rows: insertBkg } = await pool.query(`
        INSERT INTO bookings (user_id, schedule_id, fecha_clase, asistencia) VALUES ($1, $2, $3, false) RETURNING *
      `, [user.id, scheduleId, targetDate]);

      res.json({ success: true, booking: insertBkg[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // POST /api/bookings/cancel
  app.post("/api/bookings/cancel", async (req, res) => {
    try {
      const { bookingId } = req.body;
      const { rows: bkgRows } = await pool.query("SELECT * FROM bookings WHERE id = $1", [bookingId]);
      if (bkgRows.length === 0) return res.status(404).json({ error: "Reserva no encontrada." });
      const booking = bkgRows[0];

      if (booking.asistencia) {
        const { rows: mRows } = await pool.query(`
          SELECT m.*, p.nombre as "packageName", p.cantidad_clases as total_package_clases
          FROM memberships m JOIN packages p ON m.package_id = p.id
          WHERE m.user_id = $1 AND m.estado = 'activo'
        `, [booking.user_id]);
        
        if (mRows.length > 0) {
          const m = mRows[0];
          const isU = m.packageName.toLowerCase().includes("ilimitado") || m.total_package_clases >= 999;
          if (!isU) await pool.query("UPDATE memberships SET clases_restantes = clases_restantes + 1 WHERE id = $1", [m.id]);
        }
      }

      await pool.query("DELETE FROM bookings WHERE id = $1", [bookingId]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // GET /api/admin/stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const { rows: users } = await pool.query("SELECT * FROM users");
      const { rows: memberships } = await pool.query(`SELECT m.*, p.nombre as "packageName", p.precio as package_precio FROM memberships m JOIN packages p ON m.package_id = p.id`);
      const { rows: schedules } = await pool.query(`SELECT s.*, u.nombre as instructor_name FROM class_schedule s JOIN users u ON s.instructor_id = u.id`);
      const { rows: bookings } = await pool.query("SELECT * FROM bookings");

      // 1. Demanda
      const demandMap: { [key: string]: any } = {};
      bookings.forEach(b => {
        const s = schedules.find((sch: any) => sch.id === b.schedule_id);
        if (!s) return;
        const key = `${s.nombre_clase}-${s.instructor_id}`;
        if (!demandMap[key]) demandMap[key] = { instructor: s.instructor_name, clase: s.nombre_clase, total: 0, scheduleId: s.id };
        demandMap[key].total += 1;
      });
      const demandList = Object.values(demandMap).sort((a: any, b: any) => b.total - a.total);
      const topDemand = demandList.length > 0 ? demandList[0] : { instructor: "Sin datos", clase: "Sin datos", total: 0, scheduleId: 1 };

      // 2. Estado clientes
      const students = users.filter((u: any) => u.rol === "alumno");
      let activos = 0, porVencer = 0, dormidos = 0;

      const studentStatusList = students.map((std: any) => {
        const m = memberships.find((mem: any) => mem.user_id === std.id);
        const stdBookings = bookings.filter((b: any) => b.user_id === std.id);
        const hasRecentBooking = stdBookings.some((b: any) => {
          const bd = new Date(b.fecha_clase);
          const fD = new Date("2026-06-14");
          fD.setDate(fD.getDate() - 15);
          return bd >= fD;
        });

        let status = "dormido";
        if (std.status === 'bloqueado') {
          status = "bloqueado";
        } else if (!m || m.estado === "vencido") {
          status = "dormido"; dormidos++;
        } else {
          const isU = m.package_id === 3;
          if (!isU && m.clases_restantes < 3) { status = "por_vencer"; porVencer++; }
          else if (!hasRecentBooking && stdBookings.length > 0) { status = "dormido"; dormidos++; }
          else { status = "activo"; activos++; }
        }

        return {
          id: std.id, nombre: std.nombre, email: std.email, status, account_status: std.status,
          clases_restantes: m ? m.clases_restantes : 0,
          fecha_vencimiento: m ? new Date(m.fecha_vencimiento).toISOString().split('T')[0] : "N/A",
          packageName: m ? m.packageName : "Ninguno"
        };
      });

      // 3. Ventas Totales
      let totalSalesValue = 0;
      memberships.forEach((m: any) => totalSalesValue += Number(m.package_precio));
      const avgRevenue = students.length > 0 ? Math.round(totalSalesValue / students.length) : 0;

      res.json({
        metrics: {
          peakDemand: topDemand,
          clients: { activos, porVencer, dormidos, total: students.length, list: studentStatusList },
          avgRevenue, totalSalesValue
        },
        demandRanking: demandList
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error DB Stats" });
    }
  });

  try {
    // Check if users exist to avoid running without valid pool
    await pool.query("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status_asistencia VARCHAR(20) DEFAULT 'pendiente'");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'activo'");
  } catch (e) {
    // ignore
  }

  // POST /api/admin/user-status
  app.post("/api/admin/user-status", async (req, res) => {
    try {
      const { userId, status } = req.body;
      const result = await pool.query("UPDATE users SET status = $1 WHERE id = $2 RETURNING *", [status, userId]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado." });
      res.json({ success: true, user: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating user status" });
    }
  });

  // POST /api/admin/attendance
  app.post("/api/admin/attendance", async (req, res) => {
    try {
      const { bookingId, status } = req.body;
      const { rows: bkgRows } = await pool.query("SELECT * FROM bookings WHERE id = $1", [bookingId]);
      if (bkgRows.length === 0) return res.status(404).json({ error: "Reserva no encontrada." });
      
      const booking = bkgRows[0];
      const prevStatus = booking.status_asistencia || 'pendiente';
      
      await pool.query("UPDATE bookings SET status_asistencia = $1 WHERE id = $2", [status, bookingId]);

      // Deduct class if marked from non-presente to presente
      if (status === 'presente' && prevStatus !== 'presente') {
        const { rows: mRows } = await pool.query(`SELECT m.*, p.cantidad_clases FROM memberships m JOIN packages p ON m.package_id = p.id WHERE m.user_id = $1 AND m.estado = 'activo'`, [booking.user_id]);
        if (mRows.length > 0) {
          const isU = mRows[0].package_id === 3 || mRows[0].cantidad_clases >= 999;
          if (!isU) await pool.query("UPDATE memberships SET clases_restantes = GREATEST(0, clases_restantes - 1) WHERE id = $1", [mRows[0].id]);
        }
      } 
      // Return class if marked from presente to something else (pendiente or falta)
      else if (prevStatus === 'presente' && status !== 'presente') {
        const { rows: mRows } = await pool.query(`SELECT m.*, p.cantidad_clases FROM memberships m JOIN packages p ON m.package_id = p.id WHERE m.user_id = $1 AND m.estado = 'activo'`, [booking.user_id]);
        if (mRows.length > 0) {
          const isU = mRows[0].package_id === 3 || mRows[0].cantidad_clases >= 999;
          if (!isU) await pool.query("UPDATE memberships SET clases_restantes = clases_restantes + 1 WHERE id = $1", [mRows[0].id]);
        }
      }
      res.json({ success: true, booking: { ...booking, status_asistencia: status } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error Attendance" });
    }
  });

  // GET /api/admin/bookings
  app.get("/api/admin/bookings", async (req, res) => {
    try {
      const { rows: bookings } = await pool.query(`
        SELECT b.*, u.nombre as student_nombre, u.email as student_email,
               s.nombre_clase, s.dia_semana, s.hora_inicio, i.nombre as instructor_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN class_schedule s ON b.schedule_id = s.id
        LEFT JOIN users i ON s.instructor_id = i.id
      `);
      res.json(bookings.map((b: any) => ({
        id: b.id, fecha_clase: new Date(b.fecha_clase).toISOString().split('T')[0], 
        status_asistencia: b.status_asistencia || 'pendiente',
        student: { id: b.user_id, nombre: b.student_nombre, email: b.student_email },
        classDetails: { id: b.schedule_id, nombre_clase: b.nombre_clase, dia_semana: b.dia_semana, hora_inicio: b.hora_inicio, instructor_name: b.instructor_name }
      })));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error bookings server" });
    }
  });

  // POST /api/admin/add-student
  app.post("/api/admin/add-student", async (req, res) => {
    try {
      const { nombre, email, packageId } = req.body;
      const exists = await pool.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [email]);
      if (exists.rows.length > 0) return res.status(400).json({ error: "El correo ya existe." });

      const { rows: uRows } = await pool.query("INSERT INTO users (nombre, email, rol) VALUES ($1, $2, 'alumno') RETURNING *", [nombre, email]);
      const pkgId = parseInt(packageId) || 1;
      const { rows: pRows } = await pool.query("SELECT * FROM packages WHERE id = $1", [pkgId]);
      const pkg = pRows.length > 0 ? pRows[0] : (await pool.query("SELECT * FROM packages LIMIT 1")).rows[0];

      const dateVenc = new Date();
      dateVenc.setDate(dateVenc.getDate() + 30);
      const fDate = dateVenc.toISOString().split("T")[0];

      const { rows: mRows } = await pool.query(`
        INSERT INTO memberships (user_id, package_id, clases_restantes, fecha_vencimiento, estado)
        VALUES ($1, $2, $3, $4, 'activo') RETURNING *
      `, [uRows[0].id, pkg.id, pkg.cantidad_clases, fDate]);

      res.json({ success: true, user: uRows[0], membership: mRows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server err add-student" });
    }
  });

  // POST /api/admin/add-class
  app.post("/api/admin/add-class", async (req, res) => {
    try {
      const { nombreClase, instructorId, diaSemana, horaInicio, cupoMaximo } = req.body;
      const { rows: idx } = await pool.query("SELECT * FROM users WHERE id = $1 AND rol = 'instructor'", [instructorId]);
      if (idx.length === 0) return res.status(400).json({ error: "Instructor inválido." });

      const result = await pool.query(`
        INSERT INTO class_schedule (instructor_id, nombre_clase, dia_semana, hora_inicio, cupo_maximo)
        VALUES ($1, $2, $3, $4, $5) RETURNING *
      `, [instructorId, nombreClase, diaSemana, horaInicio, parseInt(cupoMaximo) || 30]);

      res.json({ success: true, class: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server add-class err" });
    }
  });


  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
