import React, { useState, useEffect } from "react";
import { User, Membership, ClassSchedule, Booking, AdminMetrics, DemandRankingItem } from "./types";
import BalanceCard from "./components/BalanceCard";
import ClassCalendar from "./components/ClassCalendar";
import AdminDashboard from "./components/AdminDashboard";
import LandingPage from "./components/LandingPage";
import { 
  Sparkles, ShieldCheck, Heart, UserCircle, LogOut, Check, 
  AlertCircle, Smile, BookOpen, Clock, Sunset, Menu, X, 
  Calendar, TrendingUp, Users, PlusCircle, Wallet, HelpCircle, RefreshCcw, ArrowLeft
} from "lucide-react";

export default function App() {
  // Global API states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [reservesCount, setReservesCount] = useState(0);
  const [scheduleList, setScheduleList] = useState<ClassSchedule[]>([]);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
  const [adminBookings, setAdminBookings] = useState<any[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);
  const [demandRanking, setDemandRanking] = useState<DemandRankingItem[]>([]);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Authentication & Navigation states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [showPlansModal, setShowPlansModal] = useState(false); // For logged-in users who want to buy a plan
  const [currentView, setCurrentView] = useState("calendar"); // default for student, will override to metrics for admin
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState("");

  // Filter & query states
  const [selectedDay, setSelectedDay] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  // Notifications
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Helper trigger to display flash notifications
  const triggerAlert = (text: string, type: "success" | "error" = "success") => {
    setAlert({ text, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Fetch all necessary data on load and session sync
  const loadData = async (targetUserId?: number) => {
    setLoading(true);
    try {
      // 1. Fetch all users first for auth checking & instructors list
      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();
      const usersList: User[] = usersData || [];
      setSystemUsers(usersList);

      // Determine active user ID
      let activeId = targetUserId;
      if (!activeId) {
        const savedEmail = localStorage.getItem("respira_logged_in_email");
        if (savedEmail) {
          const matched = usersList.find(u => u.email.trim().toLowerCase() === savedEmail.trim().toLowerCase());
          if (matched) {
            activeId = matched.id;
            setIsLoggedIn(true);
            setCurrentView(matched.rol === "admin" ? "metrics" : "calendar");
          }
        }
      }

      // If we have an active user, sync server side state
      if (activeId) {
        await fetch("/api/select-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: activeId }),
        });
      }

      // 2. Fetch current student status
      const userRes = await fetch("/api/me/status");
      const userData = await userRes.json();
      if (userData && !userData.error) {
        setCurrentUser(userData.user);
        setMembership(userData.membership);
        setReservesCount(userData.reserves_count);
        setBookingHistory(userData.bookings || []);
      }

      // 3. Fetch classes available
      const classRes = await fetch("/api/classes/available");
      const classData = await classRes.json();
      setScheduleList(classData || []);

      // 4. Fetch administrative stats
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();
      if (statsData && statsData.metrics) {
        setAdminMetrics(statsData.metrics);
        setDemandRanking(statsData.demandRanking || []);
      }

      // 5. Fetch administrative bookings
      const adminBookingsRes = await fetch("/api/admin/bookings");
      const adminBookingsData = await adminBookingsRes.json();
      setAdminBookings(adminBookingsData || []);

    } catch (err) {
      console.error("Error loading server-side api state:", err);
      triggerAlert("Error de conexión con el servidor. Reintentando...", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError("Por favor ingresa un correo electrónico.");
      return;
    }

    setLoading(true);
    setLoginError("");
    try {
      // Re-fetch users list
      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();
      const usersList: User[] = usersData || [];
      setSystemUsers(usersList);

      const matchedUser = usersList.find(u => u.email.trim().toLowerCase() === loginEmail.trim().toLowerCase());
      if (!matchedUser) {
        setLoginError("Este correo electrónico no se encuentra registrado.");
        setLoading(false);
        return;
      }

      // Sync active user with database server
      const selectRes = await fetch("/api/select-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: matchedUser.id }),
      });
      const selectData = await selectRes.json();

      if (selectData.success) {
        localStorage.setItem("respira_logged_in_email", matchedUser.email);
        setIsLoggedIn(true);
        setCurrentUser(matchedUser);
        setCurrentView(matchedUser.rol === "admin" ? "metrics" : "calendar");
        
        let planAction = "";
        if (selectedPlanId && matchedUser.rol === "alumno") {
          try {
            await fetch("/api/me/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: matchedUser.id, packageId: selectedPlanId }),
            });
            planAction = " Tu membresía ha sido adquirida.";
            setSelectedPlanId(null);
          } catch(e) {}
        }
        
        triggerAlert(`✨ ¡Bienvenido de vuelta, ${matchedUser.nombre}!${planAction}`);
        await loadData(matchedUser.id);
      } else {
        setLoginError("Error al sincronizar sesión con el servidor.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Hubo un error de red al intentar iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    if (!registerName.trim() || !loginEmail.trim()) {
      setLoginError("Por favor completa nombre y correo.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: registerName, email: loginEmail }),
      });
      const data = await res.json();

      if (data.error) {
        setLoginError(data.error);
        setLoading(false);
        return;
      }

      // Automatically login
      const newUser = data.user;
      const selectRes = await fetch("/api/select-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: newUser.id }),
      });
      const selectData = await selectRes.json();
      if (selectData.success) {
        localStorage.setItem("respira_logged_in_email", newUser.email);
        setIsLoggedIn(true);
        setCurrentUser(newUser);
        setCurrentView("calendar"); // always 'alumno'
        
        let planAction = "Tu cuenta ha sido creada.";
        if (selectedPlanId) {
          try {
            await fetch("/api/me/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: newUser.id, packageId: selectedPlanId }),
            });
            planAction = "Tu cuenta y plan han sido activados.";
            setSelectedPlanId(null);
          } catch(e) {}
        }
        
        triggerAlert(`✨ ¡Bienvenido/a, ${newUser.nombre}! ${planAction}`);
        await loadData(newUser.id);
      }
    } catch (err) {
      console.error(err);
      setLoginError("Error al registrar cuenta.");
    } finally {
      setLoading(false);
    }
  };

  // Switch account immediately via quick action
  const handleQuickLogin = async (email: string) => {
    setLoginEmail(email);
    setLoading(true);
    setLoginError("");
    try {
      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();
      const usersList: User[] = usersData || [];
      const matchedUser = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matchedUser) {
        await fetch("/api/select-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: matchedUser.id }),
        });
        localStorage.setItem("respira_logged_in_email", matchedUser.email);
        setIsLoggedIn(true);
        setCurrentUser(matchedUser);
        setCurrentView(matchedUser.rol === "admin" ? "metrics" : "calendar");
        
        let planAction = "";
        if (selectedPlanId && matchedUser.rol === "alumno") {
           try {
              await fetch("/api/me/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: matchedUser.id, packageId: selectedPlanId }),
              });
              planAction = " Se ha aplicado el plan seleccionado.";
              setSelectedPlanId(null);
           } catch(e) {}
        }
        
        triggerAlert(`✨ Iniciando sesión como ${matchedUser.nombre}...${planAction}`);
        await loadData(matchedUser.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("respira_logged_in_email");
    setIsLoggedIn(false);
    setShowLogin(false);
    setCurrentUser(null);
    setMembership(null);
    setBookingHistory([]);
    setLoginEmail("");
    triggerAlert("🔒 Sesión cerrada correctamente. Volviendo al Portal.");
  };

  // Perform class booking
  const handleReserve = async (scheduleId: number) => {
    try {
      const res = await fetch("/api/bookings/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId }),
      });
      const data = await res.json();
      if (data.error) {
        triggerAlert(data.error, "error");
      } else {
        triggerAlert("🧘 ¡Reserva confirmada con éxito! Revisa tu saldo actualizado.");
        await loadData(currentUser?.id);
      }
    } catch (err) {
      console.error(err);
      triggerAlert("Hubo un problema al realizar la reserva", "error");
    }
  };

  // Cancel reservation
  const handleCancelBooking = async (scheduleId: number) => {
    const myBooking = bookingHistory.find(b => b.schedule_id === scheduleId);
    if (!myBooking) return;

    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: myBooking.id }),
      });
      const data = await res.json();
      if (data.error) {
        triggerAlert(data.error, "error");
      } else {
        triggerAlert("Cancelada con éxito. Clases devueltas (si corresponde)");
        await loadData(currentUser?.id);
      }
    } catch (err) {
      console.error(err);
      triggerAlert("Error al intentar cancelar la reserva", "error");
    }
  };

  // Mark attendance (Admin action - trigger simulator)
  const handleMarkAttendance = async (bookingId: number, asistencia: boolean) => {
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, asistencia }),
      });
      const data = await res.json();
      if (data.error) {
        triggerAlert(data.error, "error");
      } else {
        triggerAlert(
          asistencia 
            ? "✓ Asistencia tomada. Clase deducida de la membresía del alumno." 
            : "✓ Asistencia cancelada. Clase devuelta al alumno."
        );
        await loadData(currentUser?.id);
      }
    } catch (err) {
      console.error(err);
      triggerAlert("Error al marcar la asistencia", "error");
    }
  };

  // Register a new student
  const handleAddStudent = async (nombre: string, email: string, packageId: number): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/add-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, packageId }),
      });
      const data = await res.json();
      if (data.success) {
        await loadData(currentUser?.id);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Add scheduled classes
  const handleAddClass = async (nombreClase: string, instructorId: number, diaSemana: string, horaInicio: string, cupoMaximo: number): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/add-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreClase, instructorId, diaSemana, horaInicio, cupoMaximo }),
      });
      const data = await res.json();
      if (data.success) {
        await loadData(currentUser?.id);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Renew current student membership quickly for testing
  const handleRenewPackage = async () => {
    if (!currentUser) return;
    setShowPlansModal(true);
  };

  const instructorsList = systemUsers.filter(u => u.rol === "instructor");

  // RENDER METHOD 1: LANDING PAGE or LOGIN SCREEN
  if (!isLoggedIn) {
    if (!showLogin) {
      return (
        <>
          {alert && (
            <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-lg border text-sm max-w-sm flex items-center gap-3 animate-fade-in bg-emerald-50 text-emerald-800 border-emerald-100">
              <Check className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="font-medium">{alert.text}</span>
            </div>
          )}
          <LandingPage 
            onLoginClick={() => setShowLogin(true)} 
            onSelectPlan={(planId) => {
              setSelectedPlanId(planId);
              setIsRegisterMode(true);
              setShowLogin(true);
              triggerAlert("Crea tu cuenta para confirmar y adquirir la membresía seleccionada.", "success");
            }} 
          />
        </>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#fcf1f6] via-[#fff7f9] to-[#fffefd] text-[#1f1a1e] flex flex-col items-center justify-center p-6 font-sans">
        
        {/* Banner de alerta */}
        {alert && (
          <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-lg border text-sm max-w-sm flex items-center gap-3 animate-fade-in bg-emerald-50 text-emerald-800 border-emerald-100">
            <Check className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="font-medium">{alert.text}</span>
          </div>
        )}

        {/* Botón de retroceso a la landing page */}
        <button
          onClick={() => { setShowLogin(false); setSelectedPlanId(null); }}
          id="back-to-landing-btn"
          className="mb-6 flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#80487b] bg-white hover:bg-pink-50/40 px-5 py-2.5 rounded-full border border-pink-105 shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </button>

        {/* Card Principal */}
        <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl shadow-[0_15px_40px_rgba(128,72,123,0.06)] border border-pink-50 text-center animate-fade-in">
          
          <div className="flex justify-center mb-4">
            <div className="bg-[#80487b]/10 text-[#80487b] p-3 rounded-2xl">
              <Sunset className="w-8 h-8 text-pink-600" />
            </div>
          </div>

          <h2 className="font-sans font-black text-2xl text-[#80487b] tracking-tight mb-2">
            Respira Profundo
          </h2>
          <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase mb-6">
            Yoga & Meditación Studio
          </p>

          <form onSubmit={isRegisterMode ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4 text-left">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full text-xs p-3.5 rounded-2xl border border-gray-100 outline-none focus:border-[#80487b] focus:ring-1 focus:ring-[#80487b] bg-gray-50 focus:bg-white transition-all font-medium"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="ejemplo@cliente.com"
                className="w-full text-xs p-3.5 rounded-2xl border border-gray-100 outline-none focus:border-[#80487b] focus:ring-1 focus:ring-[#80487b] bg-gray-50 focus:bg-white transition-all font-medium"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5 bg-red-50 p-3 rounded-xl border border-red-100 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#80487b] hover:bg-[#80487b]/90 text-white font-bold text-xs rounded-2xl transition-all shadow-md hover:shadow-lg disabled:bg-gray-200 disabled:text-gray-400"
            >
              {loading ? "Procesando..." : (isRegisterMode ? "Registrar Cuenta" : "Iniciar Sesión")}
            </button>
          </form>

          <div className="mt-6 text-xs text-gray-500">
            {isRegisterMode ? (
              <p>
                ¿Ya eres alumno?{" "}
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(false); setLoginError(""); }}
                  className="text-[#80487b] font-bold hover:underline py-1"
                >
                  Inicia sesión aquí
                </button>
              </p>
            ) : (
              <p>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(true); setLoginError(""); }}
                  className="text-[#80487b] font-bold hover:underline py-1"
                >
                  Regístrate como alumno
                </button>
              </p>
            )}
          </div>

          {/* Cuentas de Demostración */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-left">
            <h4 className="text-xs font-bold text-gray-400 mb-3 tracking-wide uppercase">
              Cuentas de Demostración
            </h4>
            
            <div className="space-y-2.5">
              <button
                onClick={() => handleQuickLogin("valentina@respiraprofundo.com")}
                className="w-full text-xs p-3 border border-pink-50 bg-pink-50/10 hover:bg-[#80487b]/5 rounded-xl transition-all font-medium flex items-center justify-between text-[#80487b]"
              >
                <div>
                  <span className="font-extrabold block">Valentina (Admin)</span>
                  <span className="text-[10px] text-gray-400 font-normal">valentina@respiraprofundo.com</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-[#80487b]/10 text-[#80487b] px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </button>

              <button
                onClick={() => handleQuickLogin("maria@cliente.com")}
                className="w-full text-xs p-3 border border-pink-50 bg-pink-50/10 hover:bg-[#80487b]/5 rounded-xl transition-all font-medium flex items-center justify-between text-gray-805"
              >
                <div>
                  <span className="font-extrabold block">Maria (Alumna)</span>
                  <span className="text-[10px] text-gray-400 font-normal">maria@cliente.com</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                  Pack 10
                </span>
              </button>

              <button
                onClick={() => handleQuickLogin("sofia.torres@cliente.com")}
                className="w-full text-xs p-3 border border-pink-50 bg-pink-50/10 hover:bg-[#80487b]/5 rounded-xl transition-all font-medium flex items-center justify-between text-gray-805"
              >
                <div>
                  <span className="font-extrabold block">Sofía Torres (Alumna Exclusiva)</span>
                  <span className="text-[10px] text-gray-400 font-normal">sofia.torres@cliente.com</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-pink-100/40 text-[#80487b] px-2 py-0.5 rounded-full">
                  Ilimitado
                </span>
              </button>

              <button
                onClick={() => handleQuickLogin("diego.ramirez@cliente.com")}
                className="w-full text-xs p-3 border border-pink-50 bg-pink-50/10 hover:bg-[#80487b]/5 rounded-xl transition-all font-medium flex items-center justify-between text-gray-805"
              >
                <div>
                  <span className="font-extrabold block">Diego Ramírez (Alumno)</span>
                  <span className="text-[10px] text-gray-400 font-normal">diego.ramirez@cliente.com</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                  Expirado
                </span>
              </button>
            </div>
          </div>

        </div>

        <footer className="mt-8 text-center text-[10px] text-gray-400 font-semibold tracking-wider">
          Om Shanti — Portal Administrativo y de Socios V1.2.0
        </footer>
      </div>
    );
  }

  // RENDER METHOD 2: SIDEBAR + MAIN INTERFACE FOR LOGGED-IN USERS
  return (
    <div className="min-h-screen bg-[#fff7f9] text-[#1f1a1e] flex flex-col md:flex-row">
      
      {/* Alert system */}
      {alert && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-lg border text-sm max-w-sm flex items-center gap-3 animate-fade-in ${
            alert.type === "success" 
              ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
              : "bg-red-50 text-red-800 border-red-100"
          }`}
        >
          {alert.type === "success" ? <Check className="w-5 h-5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
          <span className="font-medium">{alert.text}</span>
        </div>
      )}

      {/* MOBILE HEADER */}
      <div className="sticky top-0 z-40 md:hidden flex items-center justify-between bg-white border-b border-pink-100 py-3.5 px-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#80487b]/10 text-[#80487b] p-1.5 rounded-lg">
            <Sunset className="w-5 h-5 text-pink-600" />
          </div>
          <span className="font-black text-sm text-[#80487b] tracking-tight">Respira Profundo</span>
          <span className="text-[8px] bg-pink-50 border border-pink-100 text-[#80487b] px-1.5 py-0.5 rounded-full uppercase font-bold">
            {currentUser?.rol}
          </span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded-lg text-gray-500 hover:bg-gray-50 outline-none transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-[#80487b]" /> : <Menu className="w-6 h-6 text-[#80487b]" />}
        </button>
      </div>

      {/* MOBILE NAVIGATION OVERLAY DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          
          <div className="relative w-72 max-w-sm bg-white h-full flex flex-col p-6 animate-slide-in shadow-2xl border-r border-pink-100">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-pink-50">
              <div className="flex items-center gap-2.5">
                <Sunset className="w-6 h-6 text-[#80487b]" />
                <span className="font-extrabold text-[#80487b] text-base">Respira Profundo</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links inside mobile drawer */}
            <nav className="flex-grow space-y-1">
              {currentUser?.rol === "admin" ? (
                <>
                  <button
                    onClick={() => { setCurrentView("metrics"); setMobileMenuOpen(false); }}
                    className={`w-full text-left font-bold text-xs p-3.5 rounded-xl flex items-center gap-3 transition-all ${
                      currentView === "metrics" ? "bg-[#80487b] text-white" : "text-gray-500 hover:bg-pink-50/50 hover:text-[#80487b]"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Métricas Operacionales
                  </button>
                  <button
                    onClick={() => { setCurrentView("bookings"); setMobileMenuOpen(false); }}
                    className={`w-full text-left font-bold text-xs p-3.5 rounded-xl flex items-center gap-3 transition-all ${
                      currentView === "bookings" ? "bg-[#80487b] text-white" : "text-gray-500 hover:bg-pink-50/50 hover:text-[#80487b]"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    Control de Asistencia
                  </button>
                  <button
                    onClick={() => { setCurrentView("students"); setMobileMenuOpen(false); }}
                    className={`w-full text-left font-bold text-xs p-3.5 rounded-xl flex items-center gap-3 transition-all ${
                      currentView === "students" ? "bg-[#80487b] text-white" : "text-gray-500 hover:bg-pink-50/50 hover:text-[#80487b]"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Planilla de Alumnos
                  </button>
                  <button
                    onClick={() => { setCurrentView("add-controls"); setMobileMenuOpen(false); }}
                    className={`w-full text-left font-bold text-xs p-3.5 rounded-xl flex items-center gap-3 transition-all ${
                      currentView === "add-controls" ? "bg-[#80487b] text-white" : "text-gray-500 hover:bg-pink-50/50 hover:text-[#80487b]"
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Nuevas Altas / Clases
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setCurrentView("calendar"); setMobileMenuOpen(false); }}
                    className={`w-full text-left font-bold text-xs p-3.5 rounded-xl flex items-center gap-3 transition-all ${
                      currentView === "calendar" ? "bg-[#80487b] text-white" : "text-gray-500 hover:bg-pink-50/50 hover:text-[#80487b]"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Calendario de Clases
                  </button>
                  <button
                    onClick={() => { setCurrentView("membership"); setMobileMenuOpen(false); }}
                    className={`w-full text-left font-bold text-xs p-3.5 rounded-xl flex items-center gap-3 transition-all ${
                      currentView === "membership" ? "bg-[#80487b] text-white" : "text-gray-500 hover:bg-pink-50/50 hover:text-[#80487b]"
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    Mi Membresía y Saldo
                  </button>
                  <button
                    onClick={() => { setCurrentView("bookings"); setMobileMenuOpen(false); }}
                    className={`w-full text-left font-bold text-xs p-3.5 rounded-xl flex items-center gap-3 transition-all ${
                      currentView === "bookings" ? "bg-[#80487b] text-white" : "text-gray-500 hover:bg-pink-50/50 hover:text-[#80487b]"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Tus Próximas Clases
                  </button>
                </>
              )}
            </nav>

            <div className="pt-6 border-t border-pink-50 bg-pink-50/15 rounded-2xl p-4 mt-auto">
              <div className="flex items-center gap-2.5 mb-3.5">
                <UserCircle className="w-10 h-10 text-[#80487b]/60 shrink-0" />
                <div className="min-w-0">
                  <span className="font-extrabold text-xs text-gray-800 block truncate">{currentUser?.nombre}</span>
                  <span className="text-[10px] text-gray-400 block truncate leading-tight">{currentUser?.email}</span>
                </div>
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-red-100"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR - FIXED LEFT PANEL */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 bg-white border-r border-pink-100/60 shadow-[4px_0_30px_rgba(128,72,123,0.02)]">
        {/* Branding Title */}
        <div className="p-6 border-b border-pink-50 flex items-center gap-3">
          <div className="bg-[#80487b]/10 text-[#80487b] p-2.5 rounded-2xl">
            <Sunset className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h2 className="font-sans font-black text-sm text-[#80487b] tracking-wider uppercase leading-none">
              Respira Profundo
            </h2>
            <span className="text-[9px] text-gray-400 font-black tracking-widest uppercase mt-1 block">Yoga & Wellness</span>
          </div>
        </div>

        {/* Navigation Option Items */}
        <nav className="flex-grow px-4 py-6 space-y-1.5 overflow-y-auto">
          {currentUser?.rol === "admin" ? (
            <>
              <button
                onClick={() => setCurrentView("metrics")}
                className={`w-full text-left font-bold text-xs p-3.5 rounded-2xl flex items-center gap-3.5 transition-all ${
                  currentView === "metrics" 
                    ? "bg-[#80487b] text-white shadow-md shadow-[#80487b]/10" 
                    : "text-gray-500 hover:bg-[#80487b]/5 hover:text-[#80487b]"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Métricas Operacionales
              </button>
              <button
                onClick={() => setCurrentView("bookings")}
                className={`w-full text-left font-bold text-xs p-3.5 rounded-2xl flex items-center gap-3.5 transition-all ${
                  currentView === "bookings" 
                    ? "bg-[#80487b] text-white shadow-md shadow-[#80487b]/10" 
                    : "text-gray-500 hover:bg-[#80487b]/5 hover:text-[#80487b]"
                }`}
              >
                <Check className="w-4 h-4" />
                Control de Asistencia
              </button>
              <button
                onClick={() => setCurrentView("students")}
                className={`w-full text-left font-bold text-xs p-3.5 rounded-2xl flex items-center gap-3.5 transition-all ${
                  currentView === "students" 
                    ? "bg-[#80487b] text-white shadow-md shadow-[#80487b]/10" 
                    : "text-gray-500 hover:bg-[#80487b]/5 hover:text-[#80487b]"
                }`}
              >
                <Users className="w-4 h-4" />
                Planilla de Alumnos
              </button>
              <button
                onClick={() => setCurrentView("add-controls")}
                className={`w-full text-left font-bold text-xs p-3.5 rounded-2xl flex items-center gap-3.5 transition-all ${
                  currentView === "add-controls" 
                    ? "bg-[#80487b] text-white shadow-md shadow-[#80487b]/10" 
                    : "text-gray-500 hover:bg-[#80487b]/5 hover:text-[#80487b]"
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Nuevas Altas / Clases
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentView("calendar")}
                className={`w-full text-left font-bold text-xs p-3.5 rounded-2xl flex items-center gap-3.5 transition-all ${
                  currentView === "calendar" 
                    ? "bg-[#80487b] text-white shadow-md shadow-[#80487b]/10" 
                    : "text-gray-500 hover:bg-[#80487b]/5 hover:text-[#80487b]"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Calendario de Clases
              </button>
              <button
                onClick={() => setCurrentView("membership")}
                className={`w-full text-left font-bold text-xs p-3.5 rounded-2xl flex items-center gap-3.5 transition-all ${
                  currentView === "membership" 
                    ? "bg-[#80487b] text-white shadow-md shadow-[#80487b]/10" 
                    : "text-gray-500 hover:bg-[#80487b]/5 hover:text-[#80487b]"
                }`}
              >
                <Wallet className="w-4 h-4" />
                Mi Membresía y Saldo
              </button>
              <button
                onClick={() => setCurrentView("bookings")}
                className={`w-full text-left font-bold text-xs p-3.5 rounded-2xl flex items-center gap-3.5 transition-all ${
                  currentView === "bookings" 
                    ? "bg-[#80487b] text-white shadow-md shadow-[#80487b]/10" 
                    : "text-gray-500 hover:bg-[#80487b]/5 hover:text-[#80487b]"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Tus Próximas Clases
              </button>
            </>
          )}
        </nav>

        {/* Profile Details and Logout at Bottom of Sidebar */}
        <div className="p-4 border-t border-pink-50 bg-pink-50/10">
          <div className="flex items-center gap-2.5 mb-3.5 p-1">
            <UserCircle className="w-10 h-10 text-[#80487b]/60 shrink-0" />
            <div className="min-w-0">
              <span className="font-extrabold text-xs text-gray-800 block truncate">{currentUser?.nombre}</span>
              <span className="text-[10px] text-gray-400 block truncate mt-0.5 leading-none">{currentUser?.email}</span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-red-100"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER CONTENT AREA */}
      <main className="flex-grow min-w-0 md:pl-64 flex flex-col min-h-screen">
        
        {/* TOP BAR INFORMATION HEADER */}
        <div className="hidden md:flex bg-white/80 backdrop-blur-md border-b border-pink-100/40 py-4 px-8 sticky top-0 z-30 flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-semibold text-xs uppercase tracking-wider">Mundo de Bienestar</span>
            <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-xl font-mono">
              Om Shanti
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100/50 px-3 py-1.5 rounded-xl">
              Rol: <span className="font-extrabold text-[#80487b] capitalize">{currentUser?.rol}</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100/50 px-3 py-1.5 rounded-xl">
              <Sunset className="w-3.5 h-3.5 text-amber-500" />
              Respira Profundo V1.2.0
            </span>
          </div>
        </div>

        {/* MAIN BODY LAYOUT GRID */}
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-8 py-8 flex flex-col gap-8 flex-grow">
          
          {/* Header titles matching the selected active navigation section */}
          <header className="border-b border-pink-100/40 pb-5">
            <h1 className="font-sans font-black text-2xl lg:text-3xl text-[#80487b] tracking-tight">
              {currentView === "metrics" ? "Resumen de Operación" : ""}
              {currentView === "bookings" && currentUser?.rol === "admin" ? "Control de Asistencia de Clientes" : ""}
              {currentView === "bookings" && currentUser?.rol === "alumno" ? "Mis Sesiones de Yoga Reservadas" : ""}
              {currentView === "students" ? "Planilla Virtual de Clientes" : ""}
              {currentView === "add-controls" ? "Altas Operacionales del Estudio" : ""}
              {currentView === "calendar" ? "Calendario Semanal de Yoga" : ""}
              {currentView === "membership" ? "Detalles de Membresía y Saldo" : ""}
            </h1>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">
              {currentUser?.rol === "admin" 
                ? "Gestión de las operaciones del estudio. Respeta las reglas operativas de Valentina."
                : `Hola, ${currentUser?.nombre}. Sintoniza tu mente, reserva tus sesiones y equilibra tu energía.`}
            </p>
          </header>

          {/* DYNAMIC COMPONENT LOADER BASED ON ROLE AND VIEW */}
          {loading ? (
            <div className="flex-grow flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#80487b] mb-4"></div>
              <p className="text-xs font-semibold">Espíritus respirando profundo... actualizando datos...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 flex-grow">
              
              {/* ADMIN MODE MAIN ROOT VIEW RENDER */}
              {currentUser?.rol === "admin" && adminMetrics && (
                <AdminDashboard 
                  metrics={adminMetrics}
                  demandRanking={demandRanking}
                  bookings={adminBookings}
                  classes={scheduleList}
                  loading={loading}
                  onMarkAttendance={handleMarkAttendance}
                  onAddStudent={handleAddStudent}
                  onAddClass={handleAddClass}
                  instructors={instructorsList}
                  onRefresh={loadData}
                  activeTab={currentView as any}
                  setActiveTab={(tab) => setCurrentView(tab)}
                />
              )}

              {/* ALUMNO MODE DASHBOARD VIEWS */}
              {currentUser?.rol === "alumno" && (
                <div className="animate-fade-in flex flex-col gap-8">
                  
                  {/* VIEW 1: CLASS CALENDAR FINDER & RESERVER */}
                  {currentView === "calendar" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      <div className="lg:col-span-12">
                        <ClassCalendar 
                          schedules={scheduleList}
                          loading={loading}
                          onReserve={handleReserve}
                          onCancel={handleCancelBooking}
                          selectedDay={selectedDay}
                          setSelectedDay={setSelectedDay}
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                        />
                      </div>
                    </div>
                  )}

                  {/* VIEW 2: ACTIVE BALANCE & MEMBERSHIP CARD */}
                  {currentView === "membership" && (
                    <div className="max-w-2xl mx-auto w-full">
                      <BalanceCard 
                        membership={membership}
                        reservesCount={reservesCount}
                        onRenew={handleRenewPackage}
                      />
                    </div>
                  )}

                  {/* VIEW 3: PERSONAL BOOKINGS LIST & AGENDA ACTIONS */}
                  {currentView === "bookings" && (
                    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_10px_30px_rgba(128,72,123,0.04)] border border-pink-50/50 max-w-3xl mx-auto w-full">
                      <h3 className="font-sans font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#80487b]" />
                        Próximas Sesiones Agendadas
                      </h3>
                      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                        Estas son tus próximas clases agendadas de la semana. Por favor asiste puntualmente al salón.
                      </p>

                      <div className="flex flex-col gap-4">
                        {bookingHistory.length === 0 ? (
                          <div className="text-center py-12 text-xs text-gray-400 border border-dashed border-gray-150 rounded-2xl bg-gray-50/40">
                            No posees reservas vigentes. ¡Comienza agendando una en el Calendario!
                          </div>
                        ) : (
                          bookingHistory.map((bk) => {
                            const dateObj = new Date(bk.fecha_clase);
                            const formattedDate = dateObj.toLocaleDateString("es-ES", {
                              weekday: "long",
                              day: "numeric",
                              month: "long"
                            });

                            return (
                              <div 
                                key={bk.id} 
                                className="bg-[#fcf1f6]/20 border border-pink-50/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-all animate-fade-in"
                              >
                                <div>
                                  <span className="font-extrabold text-gray-855 text-sm block">
                                    {bk.nombre_clase}
                                  </span>
                                  <span className="text-xs text-[#80487b] font-bold block mt-1">
                                    {formattedDate} • {bk.hora_inicio} hrs
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                                    Instructor calificado: {bk.instructor_name}
                                  </span>
                                </div>

                                <button
                                  onClick={() => handleCancelBooking(bk.schedule_id)}
                                  className="text-[11px] font-extrabold text-red-500 hover:text-red-700 hover:bg-red-50/80 bg-red-50/30 border border-red-50/60 px-4 py-2 rounded-xl transition-all self-start sm:self-center"
                                >
                                  Cancelar Reserva
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

        {/* Minimalist Zen Decorative Footer */}
        <footer className="mt-auto border-t border-pink-50 py-6 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-1.5 px-8">
          <div className="flex items-center gap-1 text-gray-500 font-semibold">
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>Respira Profundo Yoga Studio</span>
          </div>
          <p className="max-w-md text-[10px] leading-relaxed">
            Plataforma interna integrada para socios y control administrativo de Valentina.
          </p>
        </footer>

      </main>

      {/* PLANS MODAL */}
      {showPlansModal && (
        <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-pink-100 max-w-2xl w-full p-8 relative animate-scale-in">
            <button
              onClick={() => setShowPlansModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-sans font-black text-2xl text-gray-800 mb-2">Selecciona un Plan</h3>
            <p className="text-xs text-gray-500 mb-8">
              Nuestras membresías se cotizan en pesos chilenos (CLP).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 1, name: "Pack 10", price: "$45.000", classes: "10 Clases" },
                { id: 2, name: "Pack 20", price: "$75.000", classes: "20 Clases", popular: true },
                { id: 3, name: "Ilimitado", price: "$110.000", classes: "Clases Ilimitadas" }
              ].map(plan => (
                <div 
                  key={plan.id}
                  onClick={async () => {
                    try {
                      await fetch("/api/me/subscribe", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: currentUser?.id, packageId: plan.id }),
                      });
                      triggerAlert(`¡Has adquirido el plan ${plan.name} exitosamente!`);
                      if(currentUser) loadData(currentUser.id);
                      setShowPlansModal(false);
                    } catch(e) {}
                  }}
                  className={`cursor-pointer rounded-2xl p-6 border transition-all text-center flex flex-col justify-between ${
                    plan.popular ? "bg-[#80487b]/5 border-[#80487b] hover:shadow-md" : "bg-white border-gray-100 hover:border-pink-200"
                  }`}
                >
                  {plan.popular && <span className="text-[9px] font-black uppercase text-[#80487b] tracking-wider mb-2 block">★ Más Elegido</span>}
                  <h4 className="font-extrabold text-gray-800 text-lg">{plan.name}</h4>
                  <span className="text-[#80487b] font-black text-xl my-4 block">{plan.price}</span>
                  <span className="text-xs font-semibold text-gray-500">{plan.classes}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
