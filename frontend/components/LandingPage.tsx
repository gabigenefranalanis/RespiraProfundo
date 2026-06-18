import React from 'react';
import { Sunset, ArrowRight, Wind, Sparkles, Users, Heart } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onSelectPlan: (planId: number) => void;
}

export default function LandingPage({ onLoginClick, onSelectPlan }: LandingPageProps) {
  const scrollToPricing = () => {
    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fffcfdf] flex flex-col font-sans selection:bg-pink-100 selection:text-pink-900">
      
      {/* Header NavBar */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-5 bg-white/80 border-b border-pink-50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <Sunset className="w-6 h-6 text-pink-600" />
           <span className="font-black text-lg text-[#80487b] tracking-tight">Respira Profundo</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={scrollToPricing}
            className="hidden md:block px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Ver Precios
          </button>
          <button 
            onClick={onLoginClick}
            className="px-5 py-2.5 bg-[#80487b] hover:bg-[#80487b]/90 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            Iniciar Sesión
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-24 px-6 relative overflow-hidden bg-gradient-to-br from-white via-pink-50/30 to-[#fdfafb]">
        {/* Background decorative blobs */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-pink-100/50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-96 h-96 bg-[#80487b]/10 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center z-10 space-y-8">
          <span className="inline-block py-1.5 px-4 bg-pink-50 border border-pink-100 text-pink-600 font-bold text-xs uppercase tracking-widest rounded-full mb-2">Yoga & Meditación</span>
          <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tight text-gray-900 leading-tight">
            Sintoniza tu mente. <br /> Domina tu <span className="text-[#80487b]">energía.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
            Bienvenido al estudio de yoga líder de la ciudad. Conecta contigo mismo en nuestras más de 30 sesiones semanales de Hatha, Vinyasa y Meditación, en un espacio pensado para tu bienestar absoluto.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button 
              onClick={scrollToPricing}
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-sm font-bold tracking-wide transition-all shadow-xl shadow-gray-900/10 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Conocer Planes <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={onLoginClick}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-2xl text-sm font-bold tracking-wide transition-all active:scale-[0.98]"
            >
              Ya soy alumno
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Tu refugio en la ciudad</h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Hemos creado cuidadosamente una experiencia integral que combina bienestar físico, mental y emocional en cada detalle de tu práctica.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-pink-50/50 border border-pink-100/50 hover:bg-pink-50 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-pink-600 mb-6 group-hover:scale-110 transition-transform">
                <Wind className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Respiración y Flujo</h3>
              <p className="text-gray-500 leading-relaxed font-medium text-sm">Clases de Vinyasa y Hatha Yoga diseñadas para todos los niveles. Desde la activación dinámica hasta la pausa y el descanso restaurativo.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-pink-50/50 border border-pink-100/50 hover:bg-pink-50 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[#80487b] mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Meditación Sonora</h3>
              <p className="text-gray-500 leading-relaxed font-medium text-sm">Sumérgete en frecuencias y vibraciones profundas con técnicas de mindfulness y cuencos de cuarzo para liberar tu estrés acumulado.</p>
            </div>

            <div className="p-8 rounded-3xl bg-pink-50/50 border border-pink-100/50 hover:bg-pink-50 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-pink-600 mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comunidad Guiada</h3>
              <p className="text-gray-500 leading-relaxed font-medium text-sm">Grupos reducidos y atención personalizada de instructores altamente certificados que te acompañarán en tu crecimiento personal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Immersive Photo Break */}
      <section className="py-24 px-6 relative flex items-center justify-center overflow-hidden min-h-[400px]">
        <div className="absolute inset-0 bg-[#80487b]">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>
        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8 px-4">
          <Heart className="w-10 h-10 text-pink-200 opacity-80 mx-auto" />
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            "El yoga no cambia la forma en que vemos las cosas, transforma a la persona que ve."
          </h2>
          <p className="text-pink-100 font-bold tracking-widest uppercase text-xs">B.K.S. Iyengar</p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-section" className="py-32 px-6 bg-[#fdfafb] relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Elige tu balance ideal</h2>
            <p className="text-gray-500 font-medium max-w-lg mx-auto">
              Nuestros planes de membresía están diseñados para adaptarse a tu ritmo y estilo de vida. Renueva a tu propio tiempo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { id: 1, name: "Pack 10", price: "$45.000", classes: 10, text: "Ideal para venir 1-2 veces por semana y no perder la continuidad.", popular: false },
              { id: 2, name: "Pack 20", price: "$75.000", classes: 20, text: "Para alumnos dedicados que buscan entrenar más veces al mes.", popular: true },
              { id: 3, name: "Ilimitado", price: "$110.000", classes: 999, text: "Para verdaderos entusiastas. Ven las veces que quieras.", popular: false }
            ].map(plan => (
              <div key={plan.id} className={`bg-white p-8 rounded-3xl flex flex-col h-full border ${plan.popular ? 'border-[#80487b] shadow-2xl shadow-[#80487b]/10 relative' : 'border-gray-100 shadow-sm hover:shadow-md transition-shadow'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#80487b] text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
                    Más Recomendado
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">{plan.text}</p>
                
                <div className="mb-8 border-b border-gray-100 pb-8">
                  <span className="text-4xl font-black font-sans text-gray-900 block mb-1">{plan.price}</span>
                  <span className="text-sm font-semibold text-[#80487b]">{plan.classes === 999 ? 'Clases ilimitadas mensuales' : (plan.classes > 1) ? `${plan.classes} clases mensuales` : '1 única clase'}</span>
                </div>
                
                <div className="mt-auto pt-2">
                  <button 
                    onClick={() => onSelectPlan(plan.id)}
                    className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
                      plan.popular 
                        ? "bg-[#80487b] hover:bg-[#80487b]/90 text-white shadow-md shadow-[#80487b]/20" 
                        : "bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200"
                    }`}
                  >
                    Contratar Ahora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs font-semibold text-gray-400 bg-white border-t border-gray-100">
        © {new Date().getFullYear()} Respira Profundo Yoga Studio. Todos los derechos reservados.
      </footer>
    </div>
  );
}
