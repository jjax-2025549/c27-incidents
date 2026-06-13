// ============================================================
// TIPOS E INTERFACES DEL SISTEMA DE INCIDENTES - SALON C-27
// Aquí definimos las reglas del negocio en TypeScript puro
// ============================================================

// Prioridad: solo puede ser baja, media o alta. Ni más, ni menos.
// Si alguien intenta pasar "urgente" o "crítico", TypeScript le grita.
export type Prioridad = "baja" | "media" | "alta";

// Estado del incidente: el ciclo de vida de un ticket desde que nace hasta que muere
// Abierto → En Progreso → Resuelto. Así de simple.
export type EstadoIncidente = "abierto" | "en progreso" | "resuelto";

// La interfaz principal — esto es lo que queda guardado en la "base de datos"
// El ID es readonly: una vez asignado, nadie lo toca. Punto.
export interface Incidente {
  readonly id: string;         // Solo lectura — el ID es sagrado
  titulo: string;              // Título corto del problema
  descripcion: string;         // Descripción detallada de lo que pasó
  reportadoPor: string;        // Nombre del maestro o usuario que reportó
  prioridad: Prioridad;        // baja | media | alta
  estado: EstadoIncidente;     // abierto | en progreso | resuelto
  fechaCreacion: Date;         // Cuándo se abrió el ticket
  fechaActualizacion?: Date;   // Cuándo fue la última vez que se tocó (opcional)
  fechaResolucion?: Date;      // Cuándo se cerró (solo si ya está resuelto)
  equipoAfectado?: string;     // Qué equipo físico está involucrado (PC, proyector, etc.)
  salon: string;               // En este caso siempre será C-27
}

// Para crear un incidente nuevo no necesitamos ID ni fechas — eso lo genera el sistema
// Omit<> es genial para esto: agarramos la interfaz y le quitamos los campos automáticos
export type CrearIncidente = Omit<
  Incidente,
  "id" | "fechaCreacion" | "fechaActualizacion" | "fechaResolucion" | "estado"
>;

// Para actualizar, todo es opcional menos el ID (que viene por fuera)
// Partial<> hace que todos los campos sean opcionales — perfecto para ediciones parciales
export type ActualizarIncidente = Partial<
  Omit<Incidente, "id" | "fechaCreacion">
>;

// ============================================================
// ENTIDADES ADICIONALES DEL SISTEMA
// (para las próximas entregas del proyecto)
// ============================================================

// Un equipo/máquina del laboratorio C-27
// Cada PC, proyector, o router tiene su propio registro
export interface Equipo {
  readonly id: string;
  nombre: string;              // Ejemplo: "PC-15", "Proyector-Central"
  tipo: TipoEquipo;
  salon: string;
  activo: boolean;
  numeroSerie?: string;
  descripcion?: string;
}

// Los tipos de equipo que puede haber en el laboratorio
export type TipoEquipo =
  | "computadora"
  | "proyector"
  | "router"
  | "switch"
  | "impresora"
  | "otro";

// Un usuario del sistema — puede ser maestro o técnico de soporte
export interface Usuario {
  readonly id: string;
  nombre: string;
  rol: RolUsuario;
  email?: string;
  activo: boolean;
}

// Los roles que manejamos — el técnico resuelve, el maestro reporta
export type RolUsuario = "maestro" | "tecnico" | "admin";

// ============================================================
// TIPOS PARA REPORTES
// ============================================================

// Lo que necesitamos para generar un reporte diario
export interface ReporteDiario {
  fecha: Date;
  totalIncidentes: number;
  incidentesAbiertos: number;
  incidentesEnProgreso: number;
  incidentesResueltos: number;
  incidentesPorPrioridad: Record<Prioridad, number>;
  tiempoPromedioResolucion?: number;  // En horas
  incidentes: Incidente[];
}

// Para el reporte mensual necesitamos un poco más de contexto
export interface ReporteMensual {
  mes: number;       // 1-12
  anio: number;
  totalIncidentes: number;
  incidentesResueltos: number;
  incidentesPendientes: number;
  tasaResolucion: number;         // Porcentaje de tickets resueltos
  equiposMasFallidos: string[];   // Los equipos que más dan lata
  incidentesPorPrioridad: Record<Prioridad, number>;
  resumenSemanal: ResumenSemana[];
}

// Cada semana dentro del reporte mensual
export interface ResumenSemana {
  semana: number;
  totalIncidentes: number;
  resueltos: number;
}

// Filtros para buscar incidentes — todo opcional para que sea flexible
export interface FiltrosIncidente {
  estado?: EstadoIncidente;
  prioridad?: Prioridad;
  fechaDesde?: Date;
  fechaHasta?: Date;
  reportadoPor?: string;
}
