from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timedelta
from typing import List, Dict, Any

from .database import get_db
from . import models, schemas

app = FastAPI(title="Respira Profundo - Yoga API Backend", version="1.0.0")

# Permitir CORS para desarrollo con React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# === SIMULACIÓN DE SEGURIDAD JWT (MOCK PARA VALENTINA Y ALUMNOS) ===
# Para fines ilustrativos y de facilidad en la revisión (con opción a simular token),
# pasamos un User ID de cabecera 'X-User-Id' o usamos un alumno por defecto (Maria, id=6).
def get_current_user(db: Session = Depends(get_db)):
    # En producción real, se descifraría un JWT. Aquí extraemos el ID para simulación rápida.
    # Por defecto simulamos a Maria Alumna (ID 6)
    user_id = 6 
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


# ====================================================================
# MÓDULO DE ALUMNO (APP)
# ====================================================================

@app.get("/me/status", response_model=schemas.StudentStatusResponse)
def get_me_status(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Devuelve el saldo de clases, vigencia, tipo de paquete y total de reservas
    activas del alumno autenticado.
    """
    membership = (
        db.query(models.Membership)
        .filter(models.Membership.user_id == current_user.id, models.Membership.estado == "activo")
        .first()
    )
    
    count_reservations = (
        db.query(models.Booking)
        .filter(models.Booking.user_id == current_user.id)
        .count()
    )

    return {
        "user": current_user,
        "membership": membership,
        "reserves_count": count_reservations
    }


@app.get("/classes/available", response_model=List[schemas.ClassScheduleResponse])
def get_available_classes(dia: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Lista el horario semanal de clases con indicación de su capacidad disponible,
    con opción de filtrar por día de la semana.
    """
    query = db.query(models.ClassSchedule)
    if dia:
        query = query.filter(models.ClassSchedule.dia_semana == dia)
        
    schedules = query.all()
    results = []
    
    for schedule in schedules:
        # Calcular reservas para esta clase en la fecha más próxima (p. ej. hoy)
        count_bookings = (
            db.query(models.Booking)
            .filter(models.Booking.schedule_id == schedule.id, models.Booking.fecha_clase == date.today())
            .count()
        )
        
        # Enriquecer respuesta pydantic
        results.append({
            "id": schedule.id,
            "nombre_clase": schedule.nombre_clase,
            "dia_semana": schedule.dia_semana,
            "hora_inicio": schedule.hora_inicio,
            "cupo_maximo": schedule.cupo_maximo,
            "instructor": schedule.instructor,
            "cupos_reservados": count_bookings
        })
        
    return results


@app.post("/bookings/reserve", response_model=schemas.BookingResponse)
def reserve_class(payload: schemas.BookingCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Crea un registro de booking (reserva) validando:
    1. Si la clase seleccionada no ha excedido su cupo_maximo.
    2. Si el alumno tiene un paquete activo con clases_restantes > 0 (o ilimitado).
    """
    # 1. Validar existencia del horario
    schedule = db.query(models.ClassSchedule).filter(models.ClassSchedule.id == payload.schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="El horario de clase no existe")

    # 2. Validar capacidad máxima de la clase (Regla de oro #1)
    bookings_count = (
        db.query(models.Booking)
        .filter(models.Booking.schedule_id == payload.schedule_id, models.Booking.fecha_clase == payload.fecha_clase)
        .count()
    )
    if bookings_count >= schedule.cupo_maximo:
        raise HTTPException(status_code=400, detail="Clase llena. Cupo máximo alcanzado (30 cupos)")

    # 3. Validar membresía del alumno (Regla de oro #2)
    membership = (
        db.query(models.Membership)
        .filter(models.Membership.user_id == current_user.id, models.Membership.estado == "activo")
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=403, 
            detail="No posees una membresía activa o el paquete ha expirado. Por favor, renueva."
        )

    # Verificar si el paquete no es ilimitado y ya no le quedan clases
    is_unlimited = "ilimitado" in membership.package.nombre.lower() or membership.package.cantidad_clases >= 999
    if not is_unlimited and membership.clases_restantes <= 0:
        raise HTTPException(
            status_code=400, 
            detail="Saldo insuficiente. Te quedan 0 clases en tu paquete actual."
        )

    # 4. Validar si ya está reservado para prevenir duplicación
    existing_booking = (
        db.query(models.Booking)
        .filter(
            models.Booking.user_id == current_user.id,
            models.Booking.schedule_id == payload.schedule_id,
            models.Booking.fecha_clase == payload.fecha_clase
        ).first()
    )
    if existing_booking:
        raise HTTPException(status_code=400, detail="Ya tienes una reserva activa para esta clase con esta fecha")

    # 5. Insertar la reserva
    new_booking = models.Booking(
        user_id=current_user.id,
        schedule_id=payload.schedule_id,
        fecha_clase=payload.fecha_clase,
        asistencia=False
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    return new_booking


# ====================================================================
# MÓDULO ADMINISTRATIVO (DASHBOARD DE VALENTINA)
# ====================================================================

@app.get("/admin/stats/demand")
def get_admin_stats_demand(db: Session = Depends(get_db)):
    """
    Determina qué instructor y horario tiene mayor demanda histórica acumulada.
    """
    demand_query = (
        db.query(
            models.ClassSchedule.nombre_clase,
            models.ClassSchedule.dia_semana,
            models.ClassSchedule.hora_inicio,
            models.User.nombre.label("instructor_name"),
            func.count(models.Booking.id).label("total_bookings")
        )
        .join(models.Booking, models.Booking.schedule_id == models.ClassSchedule.id)
        .join(models.User, models.User.id == models.ClassSchedule.instructor_id)
        .group_by(models.ClassSchedule.id, models.User.id)
        .order_by(func.count(models.Booking.id).desc())
        .all()
    )

    if not demand_query:
        return {"message": "No hay suficientes datos de reservas aún", "data": []}

    formatted_list = []
    for row in demand_query:
        formatted_list.append({
            "instructor_name": row.instructor_name,
            "nombre_clase": row.nombre_clase,
            "dia_semana": row.dia_semana,
            "hora_inicio": str(row.hora_inicio),
            "total_bookings": row.total_bookings
        })

    return {
        "highest_demand_peek": formatted_list[0] if formatted_list else None,
        "demand_ranking": formatted_list
    }


@app.get("/admin/stats/clients")
def get_admin_stats_clients(db: Session = Depends(get_db)):
    """
    Filtra alumnos por:
    - Próximos a vencer (clases_restantes < 3 en membresía activa)
    - Dormidos (sin reservas en los últimos 15 días o con membresías expiradas/vencidas)
    """
    fifteen_days_ago = date.today() - timedelta(days=15)
    
    # 1. Alumnos "por vencer" (clases_restantes < 3 y activos)
    por_vencer_query = (
        db.query(models.User)
        .join(models.Membership)
        .filter(
            models.User.rol == "alumno",
            models.Membership.clases_restantes < 3,
            models.Membership.estado == "activo"
        ).all()
    )

    # 2. Alumnos con membresía "vencida" o sin reservas en los últimos 15 días ("dormidos")
    # Obtener IDs de alumnos que sí hicieron reservas en los últimos 15 días
    active_booking_user_ids = (
        db.query(models.Booking.user_id)
        .filter(models.Booking.fecha_clase >= fifteen_days_ago)
        .distinct()
        .all()
    )
    active_ids = [r[0] for r in active_booking_user_ids]

    dormidos_query = (
        db.query(models.User)
        .filter(models.User.rol == "alumno")
        .filter(
            # O tienen la membresía en estado 'vencido'
            models.User.id.in_(
                db.query(models.Membership.user_id).filter(models.Membership.estado == "vencido")
            ) |
            # O simplemente no han hecho reservas en 15 días
            ~models.User.id.in_(active_ids)
        ).all()
    )

    # 3. Total Activos totales (sin vencer ni dormidos, simplemente con paquete activo)
    activos_count = (
        db.query(models.User)
        .join(models.Membership)
        .filter(models.Membership.estado == "activo", models.Membership.clases_restantes >= 3)
        .count()
    )

    return {
        "summary": {
            "activos": activos_count,
            "por_vencer": len(por_vencer_query),
            "dormidos": len(dormidos_query),
            "total_registrados": db.query(models.User).filter(models.User.rol == "alumno").count()
        },
        "details": {
            "por_vencer_list": por_vencer_query,
            "dormidos_list": dormidos_query
        }
    }


@app.get("/admin/stats/revenue")
def get_admin_stats_revenue(db: Session = Depends(get_db)):
    """
    Calcula el ingreso promedio por alumno (Total ventas de paquetes / Total alumnos registrados).
    """
    total_revenue_query = db.query(func.sum(models.Package.precio)).join(models.Membership, models.Membership.package_id == models.Package.id).scalar() or 0.0
    total_students = db.query(models.User).filter(models.User.rol == "alumno").count()

    avg_revenue = 0.0
    if total_students > 0:
        avg_revenue = float(total_revenue_query) / total_students

    return {
        "total_revenue": float(total_revenue_query),
        "total_students": total_students,
        "average_revenue_per_student": round(avg_revenue, 2)
    }
