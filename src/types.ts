export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: "alumno" | "instructor" | "admin";
}

export interface Membership {
  id: number;
  user_id: number;
  package_id: number;
  clases_restantes: number;
  fecha_vencimiento: string;
  estado: "activo" | "vencido";
  packageName: string;
  precio: number;
  cantidad_total: number;
}

export interface ClassSchedule {
  id: number;
  nombre_clase: string;
  dia_semana: string;
  hora_inicio: string;
  cupo_maximo: number;
  instructor: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
  cupos_reservados: number;
  isReservedByMe?: boolean;
}

export interface Booking {
  id: number;
  user_id: number;
  schedule_id: number;
  fecha_clase: string;
  asistencia: boolean;
  nombre_clase: string;
  dia_semana: string;
  hora_inicio: string;
  instructor_name: string;
}

export interface AdminBooking {
  id: number;
  fecha_clase: string;
  asistencia: boolean;
  student: {
    id: number;
    nombre: string;
    email: string;
  };
  classDetails: {
    id: number;
    nombre_clase: string;
    dia_semana: string;
    hora_inicio: string;
    instructor_name: string;
  };
}

export interface ClientStatus {
  id: number;
  nombre: string;
  email: string;
  status: "activo" | "por_vencer" | "dormido";
  clases_restantes: number;
  fecha_vencimiento: string;
  packageName: string;
}

export interface AdminMetrics {
  peakDemand: {
    instructor: string;
    clase: string;
    total: number;
  };
  clients: {
    activos: number;
    porVencer: number;
    dormidos: number;
    total: number;
    list: ClientStatus[];
  };
  avgRevenue: number;
  totalSalesValue: number;
}

export interface DemandRankingItem {
  instructor: string;
  clase: string;
  total: number;
  scheduleId?: number;
}
