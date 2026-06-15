import React from "react";
import { Membership } from "../types";
import { RefreshCw, Sparkles, Calendar, BadgeAlert, Sparkle } from "lucide-react";

interface BalanceCardProps {
  membership: Membership | null;
  reservesCount: number;
  onRenew: () => void;
}

export default function BalanceCard({ membership, reservesCount, onRenew }: BalanceCardProps) {
  const isPositive = membership && (membership.clases_restantes > 0 || membership.packageName.toLowerCase().includes("ilimitado"));
  const isUnlimited = membership && (membership.packageName.toLowerCase().includes("ilimitado") || membership.clases_restantes >= 999);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_10px_30px_rgba(128,72,123,0.06)] border border-orange-50 relative overflow-hidden transition-all duration-300 hover:shadow-[0_15px_35px_rgba(128,72,123,0.12)]">
      {/* Decorative calm pastel background glow */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#fcf1f6] rounded-full blur-3xl pointer-events-none opacity-60"></div>
      <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-[#ffd7f6]/10 rounded-full blur-2xl pointer-events-none opacity-40"></div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left Side: General membership description and title */}
        <div className="md:col-span-7 flex flex-col justify-center text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Tu Estado Zen</span>
          </div>
          
          <h3 className="font-sans font-bold text-2xl md:text-3xl text-gray-800 leading-tight">
            {membership 
              ? `Paquete Actual: ${membership.packageName}`
              : "Sin Membresía Activa"}
          </h3>
          
          <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-sm">
            {membership
              ? `Mantén tu práctica constante. Tu paquete vence el ${new Date(membership.fecha_vencimiento).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}.`
              : "Actualmente no posees ningún paquete contratado. Únete hoy a Respira Profundo para programar tus clases."}
          </p>

          <div className="flex flex-wrap gap-4 mt-5">
            <div className="flex items-center gap-2 bg-[#fcf1f6]/60 px-4 py-2 rounded-2xl border border-pink-50">
              <Calendar className="w-4 h-4 text-pink-500" />
              <span className="text-xs font-semibold text-gray-700">
                {reservesCount} Reservas agendadas
              </span>
            </div>

            {membership && (
              <div className="flex items-center gap-2 bg-[#fff7f9] px-4 py-2 rounded-2xl border border-purple-50">
                <Sparkle className="w-4 h-4 text-[#80487b]" />
                <span className="text-xs font-semibold text-gray-700">
                  Vence en: {Math.max(0, Math.ceil((new Date(membership.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} días
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Large central visual circle as requested */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative group">
            {/* The Circle Container as specified in Rule: #F3F4F6 as background */}
            <div 
              className="w-36 h-36 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center transition-transform duration-500 hover:scale-105"
              style={{ 
                backgroundColor: "#F3F4F6", /* #F3F4F6 background */
                boxShadow: "inset 0 4px 12px rgba(0,0,0,0.03), 0 10px 20px rgba(128,72,123,0.04)"
              }}
              id="student-balance-circle"
            >
              {isUnlimited ? (
                <>
                  <span className="text-4xl text-[#10B981] font-bold">∞</span>
                  <span className="text-[11px] font-semibold tracking-wider text-gray-400 mt-1 uppercase">Clases</span>
                  <span className="text-[10px] text-gray-400 font-medium font-mono">Ilimitado</span>
                </>
              ) : (
                <>
                  <span 
                    className="text-4xl md:text-5xl font-extrabold"
                    style={{ color: isPositive ? "#10B981" : "#EF4444" }} /* #10B981 text color if positive */
                  >
                    {membership ? membership.clases_restantes : 0}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-1">Clases</span>
                  <span className="text-[10px] text-gray-400 font-medium">disponibles</span>
                </>
              )}
            </div>

            {/* Micro aesthetic decorative element */}
            <div className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-md border border-gray-100 group-hover:rotate-45 transition-transform duration-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          
          <button
            onClick={onRenew}
            className="mt-4 flex items-center gap-2 bg-[#80487b] hover:bg-[#80487b]/90 text-white font-semibold text-xs py-2 px-5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Renovar o Comprar Paquete
          </button>
        </div>

      </div>
    </div>
  );
}
