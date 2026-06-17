import React, { useState } from 'react';
import { AdminMetrics, DemandRankingItem, Booking, ClassSchedule, User } from '../types';

interface AdminDashboardProps {
  metrics: AdminMetrics;
  demandRanking: DemandRankingItem[];
  bookings: Booking[];
  classes: ClassSchedule[];
  loading: boolean;
  onMarkAttendance: (bookingId: number, attended: boolean) => void;
  onAddStudent: (userData: any) => void;
  onAddClass: (classData: any) => void;
  onUpdateUserStatus: (userId: number, status: string) => void;
  instructors: User[];
  onRefresh: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
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
  onUpdateUserStatus,
  instructors,
  onRefresh,
  activeTab = 'metrics',
  setActiveTab
}: AdminDashboardProps) {

  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newClassInstructor, setNewClassInstructor] = useState("");
  const [newClassDay, setNewClassDay] = useState("Lunes");
  const [newClassTime, setNewClassTime] = useState("");
  const [newClassCapacity, setNewClassCapacity] = useState("10");

  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // -- View: Metrics --
  const renderMetrics = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Alumnos", value: metrics.clients?.total || 0 },
          { label: "Alumnos Activos", value: metrics.clients?.activos || 0 },
          { label: "Ingreso Promedio", value: `$${metrics.avgRevenue?.toLocaleString() || 0}` },
          { label: "Ingresos Totales", value: `$${metrics.totalSalesValue?.toLocaleString() || 0}` }
        ].map((metric, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1.5">{metric.label}</p>
            <p className="text-4xl font-black font-sans text-[#80487b]">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-wide">Demanda de Clases (Ranking)</h2>
        <div className="space-y-4">
          {demandRanking.length === 0 ? (
             <p className="text-gray-500 text-sm">No hay datos suficientes para mostrar.</p>
          ) : (
             demandRanking.map((item: any, index) => (
               <div key={item.scheduleId || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <div className="flex flex-col">
                   <span className="font-extrabold text-[#80487b]">{index + 1}. {item.clase}</span>
                   <span className="text-xs text-gray-500 font-semibold">{item.instructor}</span>
                 </div>
                 <span className="font-black text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">{item.total} reservas</span>
               </div>
             ))
          )}
        </div>
      </div>
    </div>
  );

  // -- View: Bookings/Attendance --
  const renderBookings = () => (
    <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
      <h2 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-wide border-b border-gray-100 pb-4">Control de Asistencia de Hoy</h2>
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No hay clases o reservas para gestionar asistencia hoy.</p>
        ) : (
          bookings.map((booking: any) => (
            <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 gap-4">
              <div>
                <p className="font-extrabold text-gray-900">{booking.student?.nombre || booking.userName}</p>
                 <p className="text-xs text-[#80487b] font-bold mt-1">{booking.classDetails?.nombre_clase || booking.claseName} • {booking.fecha_clase || booking.fecha}</p>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => onMarkAttendance(booking.id, 'presente')} 
                   disabled={booking.status_asistencia === 'presente'}
                   className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${booking.status_asistencia === 'presente' ? 'bg-emerald-100 text-emerald-700 opacity-50 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'}`}
                 >
                   {booking.status_asistencia === 'presente' ? 'Asistió' : 'Marcar Presente'}
                 </button>
                 
                 <button 
                   onClick={() => onMarkAttendance(booking.id, 'falta')} 
                   disabled={booking.status_asistencia === 'falta'}
                   className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${booking.status_asistencia === 'falta' ? 'bg-red-100 text-red-700 opacity-50 cursor-not-allowed' : 'bg-white text-red-500 border border-red-100 hover:bg-red-50'}`}
                 >
                   {booking.status_asistencia === 'falta' ? 'Faltó' : 'Falta'}
                 </button>

                 {booking.status_asistencia !== 'pendiente' && (
                   <button 
                     onClick={() => onMarkAttendance(booking.id, 'pendiente')} 
                     className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-gray-500 border border-gray-100 hover:bg-gray-50 transition-all ml-4"
                   >
                     Deshacer
                   </button>
                 )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // -- View: Add Controls --
  const renderAddControls = () => (
    <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
       <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-black text-[#80487b] mb-6 uppercase tracking-wide">Alta de Nuevo Alumno</h2>
          <form className="space-y-4" onSubmit={async (e) => {
             e.preventDefault();
             setIsLoadingAction(true);
             await onAddStudent({ nombre: newStudentName, email: newStudentEmail });
             setNewStudentName(""); setNewStudentEmail("");
             setIsLoadingAction(false);
          }}>
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Nombre</label>
               <input type="text" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} required className="w-full text-sm p-3 rounded-xl border border-gray-100 bg-gray-50 focus:border-[#80487b] focus:ring-1 focus:ring-[#80487b] outline-none transition-all" placeholder="Nombre del alumno" />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Correo</label>
               <input type="email" value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} required className="w-full text-sm p-3 rounded-xl border border-gray-100 bg-gray-50 focus:border-[#80487b] focus:ring-1 focus:ring-[#80487b] outline-none transition-all" placeholder="correo@ejemplo.com" />
             </div>
             <button disabled={isLoadingAction} type="submit" className="w-full py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-all shadow-md">Registrar Alumno</button>
          </form>
       </div>

       <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-black text-[#80487b] mb-6 uppercase tracking-wide">Programar Clase Nueva</h2>
          <form className="space-y-4" onSubmit={async (e) => {
             e.preventDefault();
             setIsLoadingAction(true);
             await onAddClass({ nombreClase: newClassName, instructorId: Number(newClassInstructor), diaSemana: newClassDay, horaInicio: newClassTime, cupoMaximo: Number(newClassCapacity) });
             setNewClassName(""); setNewClassTime("");
             setIsLoadingAction(false);
          }}>
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Nombre Clase</label>
               <input type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)} required className="w-full text-sm p-3 rounded-xl border border-gray-100 bg-gray-50 focus:border-[#80487b] focus:ring-1 focus:ring-[#80487b] outline-none transition-all" placeholder="Ej. Hatha Yoga Base" />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Día</label>
                 <select value={newClassDay} onChange={e => setNewClassDay(e.target.value)} className="w-full text-sm p-3 rounded-xl border border-gray-100 bg-gray-50 focus:border-[#80487b] focus:ring-1 focus:ring-[#80487b] outline-none transition-all">
                   {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Hora</label>
                 <input type="time" value={newClassTime} onChange={e => setNewClassTime(e.target.value)} required className="w-full text-sm p-3 rounded-xl border border-gray-100 bg-gray-50 focus:border-[#80487b] outline-none transition-all" />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Instructor</label>
                 <select value={newClassInstructor} onChange={e => setNewClassInstructor(e.target.value)} required className="w-full text-sm p-3 rounded-xl border border-gray-100 bg-gray-50 focus:border-[#80487b] outline-none transition-all">
                   <option value="" disabled>Seleccione...</option>
                   {instructors.map(ins => <option key={ins.id} value={ins.id}>{ins.nombre}</option>)}
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Capacidad</label>
                 <input type="number" min="1" value={newClassCapacity} onChange={e => setNewClassCapacity(e.target.value)} required className="w-full text-sm p-3 rounded-xl border border-gray-100 bg-gray-50 focus:border-[#80487b] outline-none transition-all" />
               </div>
             </div>
             <button disabled={isLoadingAction} type="submit" className="w-full py-3 bg-pink-100 text-[#80487b] font-black text-sm rounded-xl hover:bg-pink-200 transition-all">Crear Clase</button>
          </form>
       </div>
    </div>
  );

  // -- View: Students Registry --
  const renderStudents = () => (
    <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
       <h2 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-wide border-b border-gray-100 pb-4">Planilla Virtual de Clientes</h2>
       <div className="overflow-x-auto">
         <table className="w-full text-left">
           <thead>
             <tr className="border-b border-gray-100 text-xs text-gray-400 font-bold uppercase tracking-wider">
               <th className="pb-3 px-2">ID</th>
               <th className="pb-3 px-2">Nombre</th>
               <th className="pb-3 px-2">Estado</th>
               <th className="pb-3 px-2">Acciones</th>
             </tr>
           </thead>
           <tbody className="text-sm border-b border-gray-50">
             {metrics.clients?.list?.map((cl: any) => (
                <tr key={cl.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-4 px-2 font-mono text-gray-400">#{cl.id}</td>
                  <td className="py-4 px-2 font-bold text-gray-800">{cl.nombre}</td>
                  <td className="py-4 px-2">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${cl.status === 'activo' ? 'bg-emerald-50 text-emerald-600' : cl.status === 'por_vencer' ? 'bg-orange-50 text-orange-600' : cl.status === 'bloqueado' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                      {cl.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    {cl.account_status !== 'bloqueado' ? (
                       <button onClick={() => onUpdateUserStatus(cl.id, 'bloqueado')} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors">
                         Bloquear
                       </button>
                    ) : (
                       <button onClick={() => onUpdateUserStatus(cl.id, 'activo')} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
                         Desbloquear
                       </button>
                    )}
                  </td>
                </tr>
             ))}
             {!metrics.clients?.list?.length && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400 text-xs">Aún no hay clientes registrados o con membresías.</td></tr>
             )}
           </tbody>
         </table>
       </div>
    </div>
  );

  return (
    <>
      {activeTab === 'metrics' && renderMetrics()}
      {activeTab === 'bookings' && renderBookings()}
      {activeTab === 'add-controls' && renderAddControls()}
      {activeTab === 'students' && renderStudents()}
    </>
  );
}
