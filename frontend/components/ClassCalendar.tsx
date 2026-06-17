import React from 'react';
import { ClassSchedule } from '../types';

interface ClassCalendarProps {
  schedules: ClassSchedule[];
  loading: boolean;
  onReserve: (scheduleId: number) => void;
  onCancel: (bookingId: number) => void;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function ClassCalendar({
  schedules,
  loading,
  onReserve,
  onCancel,
  selectedDay,
  setSelectedDay,
  searchQuery,
  setSearchQuery
}: ClassCalendarProps) {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Calendario de Clases</h2>
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            placeholder="Buscar clase..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors ${
              selectedDay === day 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {day}
          </button>
        ))}
        <button
            onClick={() => setSelectedDay("")}
            className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors ${
              selectedDay === "" 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Todos
          </button>
      </div>

      <div className="space-y-4">
        {schedules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay clases programadas.
          </div>
        ) : (
          schedules.map(schedule => (
            <div key={schedule.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">{schedule.nombre_clase}</h3>
                <p className="text-sm text-gray-500">{schedule.dia_semana} • {schedule.hora_inicio} - {schedule.hora_fin}</p>
                <p className="text-sm text-gray-500">Instructor: {schedule.instructor_name || 'Sin asignar'}</p>
              </div>
              <button 
                onClick={() => onReserve(schedule.id)}
                className="px-6 py-2 bg-pink-100 text-pink-700 hover:bg-pink-200 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
              >
                Reservar Cupo
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
