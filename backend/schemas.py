from pydantic import BaseModel, EmailStr, Field
from datetime import date, time
from typing import List, Optional
from decimal import Decimal

# Schemas de Usuario
class UserBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


# Schemas de Paquete
class PackageResponse(BaseModel):
    id: int
    nombre: str
    precio: Decimal
    cantidad_clases: int

    class Config:
        from_attributes = True


# Schemas de Membresía
class MembershipBase(BaseModel):
    clases_restantes: int
    fecha_vencimiento: date
    estado: str

class MembershipResponse(MembershipBase):
    id: int
    user_id: int
    package: PackageResponse

    class Config:
        from_attributes = True


# Schemas de Horarios
class ClassScheduleBase(BaseModel):
    nombre_clase: str
    dia_semana: str
    hora_inicio: time
    cupo_maximo: int

class ClassScheduleResponse(ClassScheduleBase):
    id: int
    instructor: UserResponse
    cupos_reservados: int

    class Config:
        from_attributes = True


# Schemas para Reservas
class BookingCreate(BaseModel):
    schedule_id: int
    fecha_clase: date

class BookingResponse(BaseModel):
    id: int
    user_id: int
    schedule_id: int
    fecha_clase: date
    asistencia: bool

    class Config:
        from_attributes = True


# Respuestas de Estado Personalizado
class StudentStatusResponse(BaseModel):
    user: UserResponse
    membership: Optional[MembershipResponse] = None
    reserves_count: int


# Schemas de Estadísticas Administrativas
class DemandStat(BaseModel):
    instructor_name: str
    nombre_clase: str
    dia_semana: str
    hora_inicio: str
    total_bookings: int

class ClientStatsBreakdown(BaseModel):
    activos: int
    por_vencer: int # clases_restantes < 3 o por vencer en 7 dias
    dormidos: int # sin reservas en 15 dias o membresía vencida
    total: int

class ClientListGroup(BaseModel):
    por_vencer_list: List[UserResponse]
    dormidos_list: List[UserResponse]

class AdminStatsResponse(BaseModel):
    demand_peak: DemandStat
    clients_breakdown: ClientStatsBreakdown
    average_revenue_per_student: float
