from sqlalchemy import Column, Integer, String, Numeric, Date, Time, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    rol = Column(String(20), nullable=False) # 'alumno', 'instructor', 'admin'

    memberships = relationship("Membership", back_populates="user", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")


class Package(Base):
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False) # 'Pack 10', 'Pack 20', 'Ilimitado'
    precio = Column(Numeric(10, 2), nullable=False)
    cantidad_clases = Column(Integer, nullable=False)


class Membership(Base):
    __tablename__ = "memberships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    clases_restantes = Column(Integer, nullable=False)
    fecha_vencimiento = Column(Date, nullable=False)
    estado = Column(String(20), default="activo") # 'activo', 'vencido'

    user = relationship("User", back_populates="memberships")
    package = relationship("Package")


class ClassSchedule(Base):
    __tablename__ = "class_schedule"

    id = Column(Integer, primary_key=True, index=True)
    instructor_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    nombre_clase = Column(String(100), nullable=False)
    dia_semana = Column(String(20), nullable=False) # 'Lunes', 'Martes', ...
    hora_inicio = Column(Time, nullable=False)
    cupo_maximo = Column(Integer, default=30)

    instructor = relationship("User")
    bookings = relationship("Booking", back_populates="schedule", cascade="all, delete-orphan")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    schedule_id = Column(Integer, ForeignKey("class_schedule.id", ondelete="CASCADE"), nullable=False)
    fecha_clase = Column(Date, nullable=False)
    asistencia = Column(Boolean, default=False)

    user = relationship("User", back_populates="bookings")
    schedule = relationship("ClassSchedule", back_populates="bookings")

    __table_args__ = (
        UniqueConstraint("user_id", "schedule_id", "fecha_clase", name="uq_user_schedule_date"),
    )
