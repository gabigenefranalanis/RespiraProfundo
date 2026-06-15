import React from "react";
import { 
  Sunset, Check, Sparkles, Heart, Calendar, 
  ArrowRight, ShieldCheck, Award, MessageCircle, Moon
} from "lucide-react";

interface Plan {
  id: number;
  nombre: string;
  precio: number;
  precioFormateado: string;
  clases: string;
  descripcion: string;
  caracteristicas: string[];
  popular: boolean;
}

interface LandingPageProps {
  onLoginClick: () => void;
  onSelectPlan: (planId: number) => void;
}

export default function LandingPage({ onLoginClick, onSelectPlan }: LandingPageProps) {
  const planes: Plan[] = [
    {
      id: 1,
      nombre: "Pack 10",
      precio: 45000,
      precioFormateado: "$45.000",
      clases: "10 Clases",
      descripcion: "Perfecto para quienes asisten 1 o 2 veces por semana y desean complementar su rutina.",
      caracteristicas: [
        "Válido por 30 días corridos",
        "Acceso a todas las disciplinas",
        "Reserva en cualquier horario semanal",
        "Cancelación con hasta 4 horas de anticipación"
      ],
      popular: false
    },
    {
      id: 2,
      nombre: "Pack 20",
      precio: 75000,
      precioFormateado: "$75.000",
      clases: "20 Clases",
      descripcion: "El plan ideal para practicantes frecuentes que quieren ver un cambio real en mente y cuerpo.",
      caracteristicas: [
        "Válido por 30 días corridos",
        "Acceso preferencial a workshops",
        "Reserva en cualquier horario semanal",
        "Soporte personalizado vía Whatsapp",
        "Asistencia y feedback técnico de profesores"
      ],
      popular: true
    },
    {
      id: 3,
      nombre: "Ilimitado",
      precio: 110000,
      precioFormateado: "$110.000",
      clases: "Clases Ilimitadas",
      descripcion: "Inmersión absoluta en tu bienestar. Practica sin límites cuando quieras.",
      caracteristicas: [
        "Válido por 30 días corridos",
        "Asistencia ilimitada presencial y virtual",
        "Reserva libre en el portal diario",
        "1 clase de sonoterapia mensual gratis",
        "Sin penalización por cancelación tardía"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfbf7] via-[#fff7f9] to-[#fffefd] text-[#1f1a1e] font-sans overflow-x-hidden selection:bg-pink-100 selection:text-[#80487b]">
      
      {/* 1. HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-pink-100/40 py-4 px-6 md:px-12 flex items-center justify-between shadow-[0_2px_15px_rgba(128,72,123,0.02)] transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-[#80487b]/10 text-[#80487b] p-2.5 rounded-2xl">
            <Sunset className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h1 className="font-sans font-black text-sm md:text-base text-[#80487b] tracking-wider uppercase leading-none">
              Respira Profundo
            </h1>
            <span className="text-[9px] text-gray-400 font-extrabold tracking-widest uppercase mt-1 block">Yoga & Wellness</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-600">
          <a href="#inicio" className="hover:text-[#80487b] transition-colors">Inicio</a>
          <a href="#nosotros" className="hover:text-[#80487b] transition-colors">Nosotros</a>
          <a href="#clases" className="hover:text-[#80487b] transition-colors">Disciplinas</a>
          <a href="#planes" className="hover:text-[#80487b] transition-colors-accent text-[#80487b] font-extrabold border-b-2 border-[#80487b]/50 pb-1">Planes & Precios</a>
        </nav>

        <div>
          <button
            onClick={onLoginClick}
            id="login-landing-nav-btn"
            className="bg-[#80487b] hover:bg-[#80487b]/90 text-white font-bold text-xs py-2.5 px-6 rounded-full transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
          >
            Acceso Alumnos
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section id="inicio" className="relative py-16 md:py-28 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        {/* Subtle glow background */}
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-[#fcf1f6] rounded-full blur-3xl opacity-65 pointer-events-none"></div>
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="md:col-span-7 space-y-6 text-left relative z-10" id="hero-statement">
          <div className="inline-flex items-center gap-2 bg-[#fcf1f6] border border-pink-100/60 py-1.5 px-4 rounded-full text-[11px] font-bold text-[#80487b] uppercase tracking-wider animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-pink-600" />
            <span>Respira Profundo • Santiago de Chile</span>
          </div>

          <h2 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl text-gray-800 leading-tight tracking-tight">
            Encuentra tu centro, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80487b] to-pink-600">
              cura tu energía.
            </span>
          </h2>

          <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-xl">
            Bienvenido al estudio de yoga líder de la capital. Ofrecemos más de 30 clases semanales de Hatha Yoga, Vinyasa Flow, Yin Yoga y Meditación del sonido diseñadas para restaurar tu paz mental y empoderar tu fuerza corporal física.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a
              href="#planes"
              className="bg-[#80487b] hover:bg-[#80487b]/95 text-white font-black text-xs py-4 px-8 rounded-2xl text-center shadow-lg shadow-[#80487b]/10 hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              Comprar Plan Chileno
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <button
              onClick={onLoginClick}
              className="border border-[#80487b]/20 hover:bg-[#80487b]/5 text-[#80487b] font-bold text-xs py-4 px-8 rounded-2xl text-center transition-all flex items-center justify-center gap-2"
            >
              Portal de Reservas
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-4 pt-10 border-t border-pink-150/50 mt-10">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-[#80487b] block">30+</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Clases Semanales</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-[#80487b] block">5+</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Profesores Pro</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-[#80487b] block">100%</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Comunidad Zen</span>
            </div>
          </div>
        </div>

        {/* Elegant illustration / mockup box */}
        <div className="md:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-sm aspect-square bg-[#80487b]/5 rounded-[3rem] border border-pink-50 p-6 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_rgba(128,72,123,0.04)] hover:shadow-[0_30px_60px_rgba(128,72,123,0.08)] transition-all duration-500">
            {/* Ambient sunset colors inside frame */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#fff0f5] rounded-full blur-2xl opacity-80"></div>
            <div className="absolute -bottom-20 -left-12 w-52 h-52 bg-amber-50/50 rounded-full blur-3xl opacity-50"></div>

            <div className="relative z-10 flex justify-between items-start">
              <span className="bg-[#80487b]/10 text-[#80487b] p-3 rounded-2xl inline-block">
                <Sunset className="w-6 h-6" />
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold uppercase px-3 py-1 rounded-full flex items-center gap-1.5 animate-bounce">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Horarios Disponibles
              </span>
            </div>

            <div className="relative z-10 mt-8">
              <h3 className="font-sans font-black text-2xl text-gray-800 tracking-tight">
                Respira Profundo
              </h3>
              <p className="text-xs text-gray-400 font-bold tracking-wider uppercase mt-1">
                Yoga & Meditación Studio
              </p>
              
              <div className="space-y-2 mt-6">
                <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-pink-50/50 flex justify-between items-center text-xs font-semibold text-gray-700">
                  <span>Hatha Yoga (Mañana)</span>
                  <span className="text-[#80487b] font-bold">08:00 hrs</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-pink-50/50 flex justify-between items-center text-xs font-semibold text-gray-700">
                  <span>Vinyasa Flow (Tarde)</span>
                  <span className="text-[#80487b] font-bold">18:30 hrs</span>
                </div>
              </div>
            </div>

            {/* Tiny accent decoration */}
            <div className="relative z-10 text-[10px] font-bold text-gray-400 mt-6 flex justify-between items-center bg-[#80487b]/5 px-3 py-2 rounded-xl border border-pink-50/40">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                Mat y props incluidos en sala
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE BENEFITS & EXPERIENCES */}
      <section id="nosotros" className="py-20 px-6 md:px-12 bg-white/70 border-y border-pink-100/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-[#80487b] text-xs font-extrabold uppercase tracking-widest block">Beneficios de la práctica</span>
            <h3 className="font-sans font-black text-3xl sm:text-4xl text-gray-800">
              Un estudio pensado en tu calma corporal y mental
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Equipamiento de alta gama, lockers amplios, excelente ventilación e instructores certificados internacionalmente en la tradicional India Kundalini y Ashtanga Yoga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-pink-50/50 shadow-[0_10px_25px_rgba(128,72,123,0.02)] hover:shadow-[0_15px_30px_rgba(128,72,123,0.05)] transition-all duration-300 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-[#fff1f6] rounded-full blur-2xl group-hover:bg-[#80487b]/5 transition-colors"></div>
              <div className="bg-[#80487b]/10 text-[#80487b] p-3 rounded-2xl inline-block mb-6">
                <Award className="w-6 h-6 text-[#80487b]" />
              </div>
              <h4 className="font-sans font-extrabold text-lg text-gray-800 mb-2">Clases de Excelencia</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Nuestras clases atienden la alineación corporal detallada y se ajustan dinámicamente si tienes alguna lesión previa.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-pink-50/50 shadow-[0_10px_25px_rgba(128,72,123,0.02)] hover:shadow-[0_15px_30px_rgba(128,72,123,0.05)] transition-all duration-300 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-[#fff1f6] rounded-full blur-2xl group-hover:bg-[#80487b]/5 transition-colors"></div>
              <div className="bg-[#80487b]/10 text-[#80487b] p-3 rounded-2xl inline-block mb-6">
                <Calendar className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="font-sans font-extrabold text-lg text-gray-800 mb-2">Horario Flexible Semanal</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Reserva de manera fluida clases desde las 07:00 AM hasta las 20:45 PM desde tu portal autónomo.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-pink-50/50 shadow-[0_10px_25px_rgba(128,72,123,0.02)] hover:shadow-[0_15px_30px_rgba(128,72,123,0.05)] transition-all duration-300 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-[#fff1f6] rounded-full blur-2xl group-hover:bg-[#80487b]/5 transition-colors"></div>
              <div className="bg-[#80487b]/10 text-[#80487b] p-3 rounded-2xl inline-block mb-6">
                <ShieldCheck className="w-6 h-6 text-[#80487b]" />
              </div>
              <h4 className="font-sans font-extrabold text-lg text-gray-800 mb-2">Transparencia Total</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Revisa tus asistencias y saldos comerciales en pesos chilenos actualizados al instante en tu estado zen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DISCIPLINAS Y TALLERES */}
      <section id="clases" className="py-20 px-6 md:px-12 max-w-7xl mx-auto text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 space-y-4">
            <span className="text-[#80487b] text-xs font-extrabold uppercase tracking-widest block">Nuestra Oferta</span>
            <h3 className="font-sans font-black text-3xl sm:text-4xl text-gray-800 leading-tight">
              Disciplinas que sanan cuerpo y mente
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Ofrecemos diferentes niveles de complejidad para adaptarnos tanto a personas que inician como a yoguis experimentados en búsqueda de desafíos posturales.
            </p>
            <div className="pt-4">
              <button
                onClick={onLoginClick}
                className="text-xs font-black text-[#80487b] hover:text-[#80487b]/80 flex items-center gap-2 group"
              >
                Ver Cronograma de Horarios Completo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/50 p-6 rounded-2xl border border-pink-50 hover:bg-white transition-all">
              <h4 className="font-sans font-extrabold text-base text-gray-800">Hatha Yoga</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Posturas sostenidas y ejercicios de respiración (Pranayama) para cimentar musculatura y equilibrio corporal básico. Muy terapéutico.
              </p>
            </div>

            <div className="bg-white/50 p-6 rounded-2xl border border-pink-50 hover:bg-white transition-all">
              <h4 className="font-sans font-extrabold text-base text-gray-800">Vinyasa Flow</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Dinámica de secuencias sincronizadas con la inhalación y exhalación continua. Ritmo cardiovascular moderado y liberación mental.
              </p>
            </div>

            <div className="bg-white/50 p-6 rounded-2xl border border-pink-50 hover:bg-white transition-all">
              <h4 className="font-sans font-extrabold text-base text-gray-800">Yin Yoga & Meditación</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Estiramientos profundos de tejido conectivo en estado pasivo. Meditación guiada para bajar el estrés e inducir un sueño reparador en la noche.
              </p>
            </div>

            <div className="bg-white/50 p-6 rounded-2xl border border-pink-50 hover:bg-white transition-all">
              <h4 className="font-sans font-extrabold text-base text-gray-800">Kundalini & Sonoterapia</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Activación de tu energía vital a través de cantos repetidos (mantras) y relajación receptiva profunda al ritmo de cuencos de cuarzo y gongs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING PLANS (PESOS CHILENOS CLP ACCORDING TO USER MANDATE) */}
      <section id="planes" className="py-24 px-6 md:px-12 bg-[#80487b]/5 relative">
        <div className="absolute inset-0 bg-[#ffd7f6]/5 rounded-[4rem] blur-3xl pointer-events-none opacity-40"></div>
        
        <div className="max-w-7xl mx-auto relative z-10" id="pricing-context">
          <div className="text-center max-w-2xl mx-auto space-y-3.5 mb-16">
            <span className="text-[#80487b] text-xs font-black uppercase tracking-widest block">Inversión en Bienestar</span>
            <h3 className="font-sans font-black text-3xl sm:text-4xl text-gray-800">
              Nuestras Membresías del Estudio
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-semibold">
              Precios transparentes y sin cobros sorpresa. Elige en pesos chilenos (CLP) el paquete que más se ajuste a tu práctica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {planes.map((plan) => (
              <div 
                key={plan.id}
                id={`plan-card-${plan.id}`}
                className={`bg-white rounded-[2rem] p-8 border hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between relative shadow-[0_12px_30px_rgba(128,72,123,0.03)] hover:shadow-[0_20px_40px_rgba(128,72,123,0.1)] ${
                  plan.popular 
                    ? "border-[#80487b] ring-2 ring-[#80487b]/10" 
                    : "border-pink-100/40"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#80487b] to-pink-600 text-white font-extrabold text-[10px] tracking-widest uppercase px-4 py-1.5 rounded-full shadow-sm">
                    ★ El Más Elegido
                  </span>
                )}

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-sans font-black text-xl text-gray-800">{plan.nombre}</span>
                    <span className="bg-[#80487b]/5 text-[#80487b] text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                      {plan.clases}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 mb-6 leading-relaxed min-h-[44px]">
                    {plan.descripcion}
                  </p>

                  <div className="mb-6">
                    <span className="text-3xl sm:text-4xl font-sans font-black text-[#80487b]">{plan.precioFormateado}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1.5">CLP / mes</span>
                  </div>

                  <div className="space-y-3.5 border-t border-pink-50/50 pt-6">
                    {plan.caracteristicas.map((feat, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs font-semibold text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => onSelectPlan(plan.id)}
                    className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all ${
                      plan.popular 
                        ? "bg-[#80487b] hover:bg-[#80487b]/90 text-white shadow-md shadow-[#80487b]/10 hover:shadow-lg" 
                        : "bg-gray-50 hover:bg-[#80487b]/5 text-gray-700 hover:text-[#80487b] border border-gray-100"
                    }`}
                  >
                    Comprar Membresía
                  </button>
                  <p className="text-[9px] text-center text-gray-400 font-bold mt-3 uppercase tracking-wider">
                    Deducible automáticamente por clases agendadas
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ & TRUST BADGES */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[#80487b] text-xs font-extrabold uppercase tracking-widest block">Preguntas de Socios</span>
          <h3 className="font-sans font-black text-2xl sm:text-3xl text-gray-800">Preguntas Frecuentes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-xs">
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-gray-800">¿Cómo funciona la asignación en pesos chilenos?</h4>
            <p className="text-gray-500 leading-relaxed">
              Todos nuestros planes se cotizan en CLP. Una vez que ingreses y escojas o te registren en un paquete comercial, se habilita una billetera de sesiones. Cada asistencia tomada disminuye libremente tu saldo según las reglas coordinadas por Valentina.
            </p>
          </div>
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-gray-800">¿Qué pasa si mi paquete expira en 30 días?</h4>
            <p className="text-gray-500 leading-relaxed">
              Las membresías tienen una vigencia mensual de 30 días corridos. Si tienes clases restantes pero tu paquete expira, el sistema automáticamente actualizará tu estado zen a "Dormido/Expirado", requiriendo una renovación simple para recuperar la práctica habitual.
            </p>
          </div>
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-gray-800">¿Puedo cancelar la asistencia agendada?</h4>
            <p className="text-gray-500 leading-relaxed">
              Sí. De acuerdo a los reglamentos del estudio, puedes cancelar una clase agendada sin cobro directo de tu membresía con hasta 4 horas de anticipación. De esta forma, liberamos el cupo de la sala para otro alumno en espera.
            </p>
          </div>
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-gray-800">¿Tengo que llevar mi propio mat de Yoga?</h4>
            <p className="text-gray-500 leading-relaxed">
              No es obligatorio. Respira Profundo provee mats autolimpiables de microfibra, bloques de corcho, y mantas de lana orgánica de manera libre y gratuita para todos los alumnos en sala. Por supuesto, si deseas traer el tuyo propio eres muy bienvenido.
            </p>
          </div>
        </div>
      </section>

      {/* 7. REVOLUTIONARY BOTTOM CALL-TO-ACTION */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-tr from-[#80487b] to-pink-700 text-white text-center rounded-[3rem] max-w-7xl mx-auto my-12 relative overflow-hidden shadow-2xl">
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <Sunset className="w-12 h-12 text-pink-300 mx-auto animate-spin-slow" />
          <h3 className="font-sans font-black text-3xl sm:text-4xl">
            Comienza tu Transformación Consciente
          </h3>
          <p className="text-pink-100 text-sm sm:text-base leading-relaxed">
            Únete a cientos de alumnos activos que ya han cambiado su relación con el estrés y el cuerpo en Santiago. Registra tu cuenta y reserva hoy.
          </p>

          <div className="pt-4">
            <button
              onClick={onLoginClick}
              id="landing-bottom-cta-btn"
              className="bg-white text-[#80487b] hover:bg-pink-50 font-black text-xs py-4 px-10 rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              Comenzar Práctica Ahora
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-pink-100/30 py-12 px-6 md:px-12 text-xs text-gray-400 mt-16 bg-white flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-1.5 text-gray-500 font-bold">
          <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
          <span>Respira Profundo Yoga Studio</span>
        </div>
        <p className="max-w-md text-center text-[10px] leading-relaxed text-gray-400">
          Ubicado en Av. Providencia 1450, Santiago, Chile • Teléfono: +56 2 4596 3215
          <br />
          Todos los derechos reservados © 2026 Respira Profundo.
        </p>
      </footer>

    </div>
  );
}
