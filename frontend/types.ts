export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'alumno' | 'instructor' | 'admin';
  status?: 'activo' | 'bloqueado';
}

export interface Membership {
  id: number;
  user_id: number;
  package_id: number;
  clases_restantes: number;
  estado: string;
  packageName?: string;
  package_precio?: string;
  cantidad_clases?: number;
}

export interface ClassSchedule {
  id: number;
  nombre_clase: string;
  instructor_id: number;
  instructor_name?: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad: number;
}

export interface Booking {
  id: number;
  user_id: number;
  schedule_id: number;
  fecha_clase: string;
  estado: string;
  asistencia: boolean;
}

export interface AdminMetrics {
  peakDemand?: any;
  clients?: { activos: number; porVencer: number; dormidos: number; total: number; list: any[] };
  avgRevenue?: number;
  totalSalesValue?: number;
}

export interface DemandRankingItem {
  id: number;
  nombre_clase: string;
  bookings_count: number;
}
