import React, { useState } from "react";
import { ClassSchedule } from "../types";
import { Calendar, Search, User, Clock, CheckCircle2, ChevronRight, ShieldAlert, Sparkles } from "lucide-react";

interface ClassCalendarProps {
  schedules: ClassSchedule[];
  loading: boolean;
  onReserve: (scheduleId: number) => void;
  onCancel: (scheduleId: number) => void;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DAYS_OF_WEEK = ["Todos", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function ClassCalendar({
  schedules,
  loading,
  onReserve,
  onCancel,
  selectedDay,
  setSelectedDay,
  searchQuery,
  setSearchQuery,
}: ClassCalendarProps) {
  
  // Filter schedules locally based on both Day and Search input
  const filteredSchedules = schedules.filter((schedule) => {
    const dayMatches = selectedDay === "Todos" || schedule.dia_semana.toLowerCase() === selectedDay.toLowerCase();
    
    const searchLower = searchQuery.toLowerCase();
    const txtMatches = schedule.nombre_clase.toLowerCase().includes(searchLower) ||
                       schedule.instructor.nombre.toLowerCase().includes(searchLower) ||
                       schedule.dia_semana.toLowerCase().includes(searchLower);
                       
    return dayMatches && txtMatches;
  });

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(128,72,123,0.06)] border border-pink-50 flex flex-col gap-6">
      
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans font-bold text-xl text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#80487b]" />
            Calendario de Clases Semanales
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Explora 30 clases semanales dinámicas. Elige tu ritmo, reserva tu cupo y respira hondo.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar clase o instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-64 bg-gray-50 rounded-full border border-gray-100 hover:border-purple-200 focus:bg-white focus:border-[#80487b] focus:ring-1 focus:ring-[#80487b] outline-none transition-all text-sm text-gray-700"
          />
        </div>
      </div>

      {/* Week Day Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay.toLowerCase() === day.toLowerCase();
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                isSelected
                  ? "bg-[#80487b] text-white shadow-sm"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Vertical Stack List of Simple Cards */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#80487b] mx-auto mb-3"></div>
            Cargando horarios de clases...
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No se encontraron clases programadas para esta selección. Prueba escribiendo otro término.
          </div>
        ) : (
          filteredSchedules.map((schedule) => {
            const isFull = schedule.cupos_reservados >= schedule.cupo_maximo;
            const isReserved = schedule.isReservedByMe;

            // Simple difficulty badge styles based on class names
            let levelBadge = "bg-emerald-50 text-emerald-600 border-emerald-100";
            if (schedule.nombre_clase.toLowerCase().includes("advanced") || schedule.nombre_clase.toLowerCase().includes("ashtanga")) {
              levelBadge = "bg-rose-50 text-rose-600 border-rose-100";
            } else if (schedule.nombre_clase.toLowerCase().includes("vinyasa") || schedule.nombre_clase.toLowerCase().includes("power")) {
              levelBadge = "bg-indigo-50 text-indigo-600 border-indigo-100";
            } else if (schedule.nombre_clase.toLowerCase().includes("meditaci") || schedule.nombre_clase.toLowerCase().includes("yin")) {
              levelBadge = "bg-[#fcf1f6] text-[#80487b] border-pink-100";
            }

            return (
              <article
                key={schedule.id}
                className={`bg-white rounded-2xl p-5 border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[#80487b]/2 hover:shadow-[0_12px_24px_rgba(128,72,123,0.08)] ${
                  isReserved
                    ? "border-emerald-200 bg-emerald-50/10"
                    : "border-gray-100 hover:border-[#80487b]/10"
                }`}
              >
                {/* Details Section */}
                <div className="flex gap-4 items-start md:items-center w-full">
                  {/* Instructor Avatar Icon wrapper */}
                  <div className="w-12 h-12 rounded-full sm:w-14 sm:h-14 bg-purple-50 text-[#80487b] flex items-center justify-center flex-shrink-0 border border-purple-100">
                    <User className="w-6 h-6 text-[#80487b] opacity-80" />
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-sans font-bold text-base md:text-lg text-gray-800 leading-snug truncate">
                        {schedule.nombre_clase}
                      </h4>
                      <span className={`text-[10px] font-semibold px-2 px-2.5 py-0.5 rounded-full border ${levelBadge}`}>
                        {schedule.dia_semana}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-1.5 font-medium">
                      <span>Prof. {schedule.instructor.nombre}</span>
                      <span className="text-gray-300">•</span>
                      <span>{schedule.instructor.email}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                      {/* Hour */}
                      <p className="text-gray-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {schedule.hora_inicio} hrs
                      </p>

                      {/* Capacity Indicator and Progress meter */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 whitespace-nowrap">
                          Cupos: <span className="font-bold text-gray-700">{schedule.cupos_reservados}</span> / {schedule.cupo_maximo}
                        </span>
                        
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFull ? "bg-red-400" : isReserved ? "bg-emerald-400" : "bg-[#80487b]/70"
                            }`} 
                            style={{ width: `${Math.min(100, (schedule.cupos_reservados / schedule.cupo_maximo) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reservation Action Button with visual state changes */}
                <div className="w-full md:w-auto flex justify-end shrink-0 md:pl-4">
                  {isReserved ? (
                    <button
                      onClick={() => onCancel(schedule.id)}
                      className="w-full md:w-auto bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs px-5 py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-colors duration-300 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Reservado (Cancelar)
                    </button>
                  ) : isFull ? (
                    <button
                      disabled
                      className="w-full md:w-auto bg-gray-100 text-gray-400 font-semibold text-xs px-5 py-2.5 rounded-full flex items-center justify-center gap-1.5 cursor-not-allowed border border-gray-200"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Clase Llena
                    </button>
                  ) : (
                    <button
                      onClick={() => onReserve(schedule.id)}
                      className="w-full md:w-auto bg-[#80487b] hover:bg-[#80487b]/90 text-white font-bold text-xs px-6 py-2.5 rounded-full transition-colors duration-300 flex items-center justify-center gap-1 shadow-sm hover:shadow"
                      id={`reserve-btn-${schedule.id}`}
                    >
                      Reservar Cupo
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
