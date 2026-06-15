import React, { useState, useEffect } from "react";
import { AdminMetrics, DemandRankingItem, AdminBooking, User, ClassSchedule } from "../types";
import { 
  TrendingUp, Users, Wallet, Check, Search, Calendar, Plus, 
  Trash2, UserCheck, Timer, Sparkles, PlusCircle, Activity, Award
} from "lucide-react";

interface AdminDashboardProps {
  metrics: AdminMetrics;
  demandRanking: DemandRankingItem[];
  bookings: AdminBooking[];
  classes: ClassSchedule[];
  loading: boolean;
  onMarkAttendance: (bookingId: number, asistencia: boolean) => void;
  onAddStudent: (nombre: string, email: string, packageId: number) => Promise<boolean>;
  onAddClass: (nombreClase: string, instructorId: number, diaSemana: string, horaInicio: string, cupoMaximo: number) => Promise<boolean>;
  instructors: User[];
  onRefresh: () => void;
  activeTab?: "metrics" | "bookings" | "students" | "add-controls";
  setActiveTab?: (tab: "metrics" | "bookings" | "students" | "add-controls") => void;
}

export default function AdminDashboard({
  metrics,
  demandRanking,
  bookings,
  classes,
  loading,
  onMarkAttendance,
  onAddStudent,
  onAddClass,
  instructors,
  onRefresh,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
}: AdminDashboardProps) {
  
  const [internalActiveTab, setInternalActiveTab] = useState<"metrics" | "bookings" | "students" | "add-controls">("bookings");
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = (tab: "metrics" | "bookings" | "students" | "add-controls") => {
    if (externalSetActiveTab) {
      externalSetActiveTab(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };
  
  // Search state inside tables
  const [bookingSearch, setBookingSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  // Form states
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentPkg, setNewStudentPkg] = useState<number>(1);
  const [studentFormMsg, setStudentFormMsg] = useState({ success: false, text: "" });

  const [newClassName, setNewClassName] = useState("");
  const [newClassInst, setNewClassInst] = useState<number>(2); // Default to first instructor
  const [newClassDay, setNewClassDay] = useState("Lunes");
  const [newClassHour, setNewClassHour] = useState("08:00");
  const [newClassCapacity, setNewClassCapacity] = useState<number>(30);
  const [classFormMsg, setClassFormMsg] = useState({ success: false, text: "" });

  // Handle adding student
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) {
      setStudentFormMsg({ success: false, text: "Por favor, completa todos los campos" });
      return;
    }
    const succ = await onAddStudent(newStudentName, newStudentEmail, newStudentPkg);
    if (succ) {
      setStudentFormMsg({ success: true, text: "¡Alumno registrado y membresía asignada con éxito!" });
      setNewStudentName("");
      setNewStudentEmail("");
      // Clear msg after 3s
      setTimeout(() => setStudentFormMsg({ success: false, text: "" }), 4000);
    } else {
      setStudentFormMsg({ success: false, text: "Error. El correo electrónico ya podría estar registrado." });
    }
  };

  // Handle adding class
  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName || !newClassHour) {
      setClassFormMsg({ success: false, text: "Por favor, completa todos los campos" });
      return;
    }
    const succ = await onAddClass(newClassName, newClassInst, newClassDay, newClassHour, newClassCapacity);
    if (succ) {
      setClassFormMsg({ success: true, text: `¡Clase de ${newClassName} agregada exitosamente!` });
      setNewClassName("");
      setNewClassHour("08:00");
      setTimeout(() => setClassFormMsg({ success: false, text: "" }), 4000);
    } else {
      setClassFormMsg({ success: false, text: "Error. No se pudo agendar la clase." });
    }
  };

  // Filter bookings list
  const filteredBookings = bookings.filter((b) => {
    const term = bookingSearch.toLowerCase();
    return b.student.nombre.toLowerCase().includes(term) ||
           b.student.email.toLowerCase().includes(term) ||
           b.classDetails.nombre_clase.toLowerCase().includes(term) ||
           b.classDetails.instructor_name.toLowerCase().includes(term);
  });

  // Filter student list
  const filteredStudents = metrics.clients.list.filter((std) => {
    const term = studentSearch.toLowerCase();
    return std.nombre.toLowerCase().includes(term) ||
           std.email.toLowerCase().includes(term) ||
           std.packageName.toLowerCase().includes(term);
  });

  // Calculate percentages and dynamic classes
  const totalClients = metrics.clients.total || 1;
  const pActivos = Math.round((metrics.clients.activos / totalClients) * 100);
  const pPorVencer = Math.round((metrics.clients.porVencer / totalClients) * 100);
  const pDormidos = Math.round((metrics.clients.dormidos / totalClients) * 100);

  return (
    <div className="flex flex-col gap-8">
      
      {/* 3-Column Grid for Metrics Dashboard - visible only on 'metrics' view */}
      {activeTab === "metrics" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Card 1: Demanda (Busiest Schedule Bar Graph representation matching Stitch mockup) */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(128,72,123,0.06)] border border-pink-50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[200px]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-gray-400 font-semibold text-xs tracking-wider uppercase">Porcentaje de Demanda</h4>
                <h3 className="font-sans font-extrabold text-lg text-gray-800 mt-1">Saturación por Horarios</h3>
              </div>
              <span className="p-2.5 rounded-full bg-pink-50 text-[#80487b]">
                <TrendingUp className="w-5 h-5" />
              </span>
            </div>

            {/* Dynamic bar charts representing demand ranking */}
            <div className="flex-grow flex items-end gap-3 h-24 mt-2">
              {demandRanking.slice(0, 4).map((rank, idx) => {
                // Map heights based on idx or rank.total
                const maxTotal = Math.max(...demandRanking.map(r => r.total)) || 1;
                const hPercent = Math.max(25, Math.ceil((rank.total / maxTotal) * 100));
                
                return (
                  <div key={idx} className="w-1/4 flex flex-col items-center group relative cursor-help">
                    {/* Tooltip */}
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 font-semibold text-[10px] text-white bg-gray-800 px-2 py-1 rounded-lg pointer-events-none transition-all duration-300 z-10 whitespace-nowrap shadow-md">
                      {rank.clase}: {rank.total} res
                    </span>
                    {/* Bar */}
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        idx === 0 
                          ? "bg-[#80487b]" 
                          : "bg-[#ffd7f6] hover:bg-[#80487b]/60"
                      }`}
                      style={{ height: `${hPercent}%` }}
                    ></div>
                    <span className="text-[10px] text-gray-400 mt-2 font-semibold truncate max-w-full">
                      {rank.clase.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-400 mt-4 leading-relaxed border-t border-gray-50 pt-3">
              Pico de Demanda: <span className="font-bold text-[#80487b]">{metrics.peakDemand.clase}</span> con <span className="font-bold text-gray-700">{metrics.peakDemand.instructor}</span>.
            </p>
          </div>

          {/* Card 2: Estado de Clientes (Progress indicators for Activos / Sleeping / Expiring) */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(128,72,123,0.06)] border border-pink-50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[200px]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-gray-400 font-semibold text-xs tracking-wider uppercase">Métricas de Alumnos</h4>
                <h3 className="font-sans font-extrabold text-lg text-gray-800 mt-1">Estado de Clientes</h3>
              </div>
              <span className="p-2.5 rounded-full bg-purple-50 text-[#80487b]">
                <Users className="w-5 h-5" />
              </span>
            </div>

            <div className="space-y-3.5 flex-grow justify-center flex flex-col">
              {/* Activos */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Activos
                  </span>
                  <span>{metrics.clients.activos} alumnos ({pActivos}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${pActivos}%` }}></div>
                </div>
              </div>

              {/* Por Vencer */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Por Vencer (&lt; 3 clas)
                  </span>
                  <span>{metrics.clients.porVencer} alumnos ({pPorVencer}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${pPorVencer}%` }}></div>
                </div>
              </div>

              {/* Dormidos / Expired */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    Dormidos / Expirados
                  </span>
                  <span>{metrics.clients.dormidos} alumnos ({pDormidos}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400" style={{ width: `${pDormidos}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Rentabilidad (Financial overview calculated from metrics list) */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(128,72,123,0.06)] border border-pink-50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[200px]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-gray-400 font-semibold text-xs tracking-wider uppercase">Rentabilidad Mensual</h4>
                <h3 className="font-sans font-extrabold text-lg text-gray-800 mt-1">Ingreso Promedio</h3>
              </div>
              <span className="p-2.5 rounded-full bg-emerald-50 text-emerald-600">
                <Wallet className="w-5 h-5" />
              </span>
            </div>

            <div className="flex-grow flex flex-col justify-center my-2">
              <span className="text-xs text-gray-400 font-semibold">Promedio por Alumno</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black text-[#80487b]">
                  {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(metrics.avgRevenue)}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +5.2%
                </span>
              </div>
              <span className="text-[11px] text-gray-400 mt-1 font-medium font-mono">
                Calculado sobre {metrics.clients.total} alumnos registrados
              </span>
            </div>

            <p className="text-xs text-gray-400 border-t border-gray-50 pt-3 leading-relaxed flex justify-between">
              <span>Volumen de Ventas Total:</span>
              <span className="font-extrabold text-gray-700">
                {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(metrics.totalSalesValue)}
              </span>
            </p>
          </div>

        </div>
      )}

      {/* Conditionally show Tab Selector if not managed by an external sidebar */}
      {!externalActiveTab && (
        <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center gap-2 self-start">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === "bookings"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#80487b]" />
            Marcar Asistencia ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === "students"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            Ver Alumnos ({metrics.clients.list.length})
          </button>
          <button
            onClick={() => setActiveTab("add-controls")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === "add-controls"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <PlusCircle className="w-4 h-4 text-pink-500" />
            Nuevas Altas / Clases
          </button>
        </div>
      )}

      {/* Tab Contents Container */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(128,72,123,0.06)] border border-pink-50">
        
        {/* Tab 0: Analytical dashboard detail loaded for metrics view */}
        {activeTab === "metrics" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-fade-in">
            
            {/* Complete list demand */}
            <div className="lg:col-span-7">
              <h3 className="font-sans font-bold text-lg text-[#80487b] flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-[#80487b]" />
                Saturación y Demanda Completa
              </h3>
              <p className="text-xs text-gray-400 mb-6 font-normal">
                Análisis de popularidad en base a la concurrencia y agenda de sesiones en el estudio de yoga.
              </p>
              
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                {demandRanking.map((rank, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-pink-50/10 border border-pink-50 rounded-2xl text-xs hover:bg-[#fcf1f6]/30 transition-all">
                    <div>
                      <span className="font-extrabold text-gray-800 block">{rank.clase}</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Prof. {rank.instructor}</span>
                    </div>
                    <span className="font-extrabold text-[#80487b] bg-[#80487b]/10 px-3 py-1 rounded-full text-[10px]">
                      {rank.total} Reservas
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick action card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#80487b]/5 via-[#fcf1f6]/30 to-[#fffefd] p-6 rounded-3xl border border-pink-50 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="bg-[#80487b]/10 text-[#80487b] p-2.5 rounded-2xl inline-block">
                  <Sparkles className="w-5 h-5 text-[#80487b] animate-pulse" />
                </span>
                <h3 className="font-sans font-black text-xl text-gray-800">
                  Resumen de Gestión
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                  Métricas Operacionales
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Para optimizar la facturación y flujos de caja, Valentina realiza auditorías diarias en la pestaña de asistencia, amortizando de manera sincrónica el saldo de membresías de alumnos.
                </p>
              </div>

              <div className="pt-6 border-t border-pink-100 mt-6 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-semibold">Alumnos activos:</span>
                  <span className="font-extrabold text-emerald-600">{metrics.clients.activos}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-semibold">Por vencer (&lt; 3 clas):</span>
                  <span className="font-extrabold text-amber-500">{metrics.clients.porVencer}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-semibold">Alumnos dormidos / exp:</span>
                  <span className="font-extrabold text-red-500">{metrics.clients.dormidos}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 1: Bookings & Attendance List */}
        {activeTab === "bookings" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans font-bold text-lg text-gray-800">
                  Control Operativo y Control de Asistencia diaria
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Marca asistencia para descontar automáticamente 1 clase del saldo del alumno (Reglas técnicas de Valentina).
                </p>
              </div>

              {/* Booking Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar por alumno, clase..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-gray-50 w-full sm:w-60 rounded-full border border-gray-100 focus:bg-white focus:border-[#80487b] focus:ring-1 focus:ring-[#80487b] outline-none text-xs text-gray-700 transition-all font-medium"
                />
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha y Clase</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Alumno</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Instructor Asignado</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Asistencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-400 bg-gray-50/20">
                        No hay reservas activas registradas con ese filtro actualmente.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((bk) => {
                      return (
                        <tr key={bk.id} className="hover:bg-[#fcf1f6]/20 transition-all">
                          <td className="p-4">
                            <span className="font-extrabold text-gray-800 block text-sm">
                              {bk.classDetails.nombre_clase}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {bk.fecha_clase} • {bk.classDetails.dia_semana}, {bk.classDetails.hora_inicio} hrs
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-gray-800 block">{bk.student.nombre}</span>
                            <span className="text-[10px] text-gray-400">{bk.student.email}</span>
                          </td>
                          <td className="p-4 text-gray-600 font-semibold">
                            Prof. {bk.classDetails.instructor_name}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {bk.asistencia ? (
                                <button
                                  onClick={() => onMarkAttendance(bk.id, false)}
                                  className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-emerald-200 transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Presente (Deducción Activa)
                                </button>
                              ) : (
                                <button
                                  onClick={() => onMarkAttendance(bk.id, true)}
                                  className="border border-[#80487b]/30 text-[#80487b] hover:bg-[#80487b] hover:text-white font-bold px-3 py-1.5 rounded-full transition-all duration-300"
                                >
                                  Marcar Asistencia
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Students List Detailed with Balances and Expdates */}
        {activeTab === "students" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans font-bold text-lg text-gray-800">
                  Directorio de Alumnos Registrados
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Inspecciona el saldo comercial por cada cliente y sus fechas de vencimiento.
                </p>
              </div>

              {/* Student Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar alumnos o paquetes..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-gray-50 w-full sm:w-60 rounded-full border border-gray-100 focus:bg-white focus:border-[#80487b] focus:ring-1 focus:ring-[#80487b] outline-none text-xs text-gray-700 transition-all font-medium"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Paquete Contratado</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo de Clases</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vencimiento</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado Alumno</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 bg-gray-50/20">
                        No se encontraron alumnos con ese nombre.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((std) => {
                      const isSleeping = std.status === "dormido";
                      const isExpiring = std.status === "por_vencer";

                      let statusBadge = "bg-emerald-50 text-emerald-800 border-emerald-100";
                      if (isSleeping) {
                        statusBadge = "bg-red-50 text-red-800 border-red-100";
                      } else if (isExpiring) {
                        statusBadge = "bg-amber-50 text-amber-800 border-amber-100";
                      }

                      return (
                        <tr key={std.id} className="hover:bg-[#fcf1f6]/20 transition-all">
                          <td className="p-4">
                            <span className="font-extrabold text-gray-800 block text-sm">{std.nombre}</span>
                            <span className="text-[10px] text-gray-400">{std.email}</span>
                          </td>
                          <td className="p-4 font-bold text-[#80487b]">
                            {std.packageName}
                          </td>
                          <td className="p-4">
                            <span className={`text-sm font-black ${isExpiring ? "text-amber-500" : isSleeping ? "text-red-400" : "text-emerald-500"}`}>
                              {std.clases_restantes >= 999 ? "∞ Ilimitado" : `${std.clases_restantes} clases`}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 font-semibold">
                            {std.fecha_vencimiento !== "N/A" 
                              ? new Date(std.fecha_vencimiento).toLocaleDateString("es-ES") 
                              : "Sin membresía"}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${statusBadge}`}>
                              {std.status === "activo" && "Activo"}
                              {std.status === "por_vencer" && "Por Vencer"}
                              {std.status === "dormido" && "Dormido / Exp"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Forms to add new students and agenda classes */}
        {activeTab === "add-controls" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Form 1: Add Student */}
            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-sans font-bold text-base text-gray-800 flex items-center gap-2 mb-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Registrar Nuevo Alumno comercial
              </h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Asigna de inmediato un paquete (Pack 10, Pack 20 o Ilimitado) para corregir el caos de saldos de Valentina.
              </p>

              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#80487b] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Email del Alumno</label>
                  <input
                    type="email"
                    required
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="Ej. j.perez@cliente.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#80487b] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Elegir Paquete Comercial</label>
                  <select
                    value={newStudentPkg}
                    onChange={(e) => setNewStudentPkg(parseInt(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#80487b] bg-white font-medium"
                  >
                    <option value={1}>Pack 10 Clases ($45.000 CLP)</option>
                    <option value={2}>Pack 20 Clases ($75.000 CLP)</option>
                    <option value={3}>Paquete Ilimitado ($110.000 CLP)</option>
                  </select>
                </div>

                {studentFormMsg.text && (
                  <div className={`p-3 rounded-xl text-xs font-medium ${studentFormMsg.success ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-red-50 text-red-800"}`}>
                    {studentFormMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#80487b] hover:bg-[#80487b]/90 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  Registrar Alumno y Facturar
                </button>
              </form>
            </div>

            {/* Form 2: Add Class */}
            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-sans font-bold text-base text-gray-800 flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-pink-500" />
                Agendar Nueva Clase Semanal
              </h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Añade nuevas horas de yoga al calendario de 30 clases semanales del estudio "Respira Profundo".
              </p>

              <form onSubmit={handleClassSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nombre de la Clase</label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Ej. Vinyasa Flow Avanzado"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#80487b] bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Día de Semana</label>
                    <select
                      value={newClassDay}
                      onChange={(e) => setNewClassDay(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#80487b] bg-white font-medium"
                    >
                      <option value="Lunes">Lunes</option>
                      <option value="Martes">Martes</option>
                      <option value="Miércoles">Miércoles</option>
                      <option value="Jueves">Jueves</option>
                      <option value="Viernes">Viernes</option>
                      <option value="Sábado">Sábado</option>
                      <option value="Domingo">Domingo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Hora Inicio</label>
                    <input
                      type="text"
                      required
                      value={newClassHour}
                      onChange={(e) => setNewClassHour(e.target.value)}
                      placeholder="Ej. 18:30"
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#80487b] bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Instructor Asignado</label>
                    <select
                      value={newClassInst}
                      onChange={(e) => setNewClassInst(parseInt(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#80487b] bg-white font-medium"
                    >
                      {instructors.map((inst) => (
                        <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Cupo Máximo</label>
                    <input
                      type="number"
                      required
                      value={newClassCapacity}
                      onChange={(e) => setNewClassCapacity(parseInt(e.target.value))}
                      placeholder="30"
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#80487b] bg-white"
                    />
                  </div>
                </div>

                {classFormMsg.text && (
                  <div className={`p-3 rounded-xl text-xs font-medium ${classFormMsg.success ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-red-50 text-red-800"}`}>
                    {classFormMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#80487b] hover:bg-[#80487b]/90 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  Agendar Nueva Clase Semanal
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
