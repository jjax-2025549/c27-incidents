// ============================================================
// REPOSITORIO DE INCIDENTES
// Aquí vive toda la lógica de persistencia.
// Usamos un JSON como "base de datos" para la fase 1.
// En la fase 2 esto se conecta a una DB real sin cambiar nada más.
// ============================================================

import * as fs from "fs";
import * as path from "path";
import { Incidente, FiltrosIncidente } from "../types";

// La ruta donde guardamos los datos — relativa al proyecto
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "incidentes.json");

// Nos aseguramos de que la carpeta data exista antes de escribir
function asegurarDirectorio(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Leer todos los incidentes del archivo JSON
// Si el archivo no existe, devolvemos array vacío — primera vez que corre
function leerTodos(): Incidente[] {
  asegurarDirectorio();

  if (!fs.existsSync(DB_FILE)) {
    return [];
  }

  try {
    const contenido = fs.readFileSync(DB_FILE, "utf-8");
    const datos = JSON.parse(contenido);

    // Las fechas vienen como string del JSON, hay que convertirlas a Date
    return datos.map((inc: Incidente) => ({
      ...inc,
      fechaCreacion: new Date(inc.fechaCreacion),
      fechaActualizacion: inc.fechaActualizacion
        ? new Date(inc.fechaActualizacion)
        : undefined,
      fechaResolucion: inc.fechaResolucion
        ? new Date(inc.fechaResolucion)
        : undefined,
    }));
  } catch {
    // Si el archivo está corrupto, empezamos de cero
    console.error("⚠️  Archivo de datos corrupto. Iniciando base limpia.");
    return [];
  }
}

// Escribir todos los incidentes al archivo
function escribirTodos(incidentes: Incidente[]): void {
  asegurarDirectorio();
  fs.writeFileSync(DB_FILE, JSON.stringify(incidentes, null, 2), "utf-8");
}

// Generar un ID único — simple pero efectivo para la fase 1
// Formato: INC-2025-001, INC-2025-002, etc.
function generarId(incidentes: Incidente[]): string {
  const anio = new Date().getFullYear();
  const ultimo = incidentes
    .filter((i) => i.id.startsWith(`INC-${anio}`))
    .length;
  const numero = String(ultimo + 1).padStart(3, "0");
  return `INC-${anio}-${numero}`;
}

// ============================================================
// FUNCIONES PÚBLICAS DEL REPOSITORIO
// ============================================================

// Traer todos los incidentes, con filtros opcionales
export function obtenerTodos(filtros?: FiltrosIncidente): Incidente[] {
  let incidentes = leerTodos();

  // Aplicar cada filtro si viene en los parámetros
  if (filtros?.estado) {
    incidentes = incidentes.filter((i) => i.estado === filtros.estado);
  }

  if (filtros?.prioridad) {
    incidentes = incidentes.filter((i) => i.prioridad === filtros.prioridad);
  }

  if (filtros?.fechaDesde) {
    incidentes = incidentes.filter(
      (i) => i.fechaCreacion >= filtros.fechaDesde!
    );
  }

  if (filtros?.fechaHasta) {
    incidentes = incidentes.filter(
      (i) => i.fechaCreacion <= filtros.fechaHasta!
    );
  }

  if (filtros?.reportadoPor) {
    incidentes = incidentes.filter((i) =>
      i.reportadoPor
        .toLowerCase()
        .includes(filtros.reportadoPor!.toLowerCase())
    );
  }

  return incidentes;
}

// Buscar un incidente específico por ID
export function obtenerPorId(id: string): Incidente | undefined {
  return leerTodos().find((i) => i.id === id);
}

// Guardar un nuevo incidente — el ID y la fecha los asigna el sistema
export function guardar(
  datos: Omit<Incidente, "id" | "fechaCreacion" | "estado">
): Incidente {
  const incidentes = leerTodos();

  const nuevo: Incidente = {
    ...datos,
    id: generarId(incidentes),
    estado: "abierto",           // Todo ticket nace abierto
    fechaCreacion: new Date(),
    salon: datos.salon || "C-27", // Por default es el C-27
  };

  incidentes.push(nuevo);
  escribirTodos(incidentes);

  return nuevo;
}

// Actualizar un incidente existente
export function actualizar(
  id: string,
  cambios: Partial<Omit<Incidente, "id" | "fechaCreacion">>
): Incidente | null {
  const incidentes = leerTodos();
  const indice = incidentes.findIndex((i) => i.id === id);

  if (indice === -1) {
    return null; // No encontramos el incidente
  }

  // Si lo están resolviendo, guardamos la fecha de resolución automáticamente
  if (cambios.estado === "resuelto" && !incidentes[indice].fechaResolucion) {
    cambios.fechaResolucion = new Date();
  }

  incidentes[indice] = {
    ...incidentes[indice],
    ...cambios,
    fechaActualizacion: new Date(),
  };

  escribirTodos(incidentes);
  return incidentes[indice];
}

// Eliminar un incidente — con cuidado, esto es permanente
export function eliminar(id: string): boolean {
  const incidentes = leerTodos();
  const nuevos = incidentes.filter((i) => i.id !== id);

  if (nuevos.length === incidentes.length) {
    return false; // No se encontró el ID
  }

  escribirTodos(nuevos);
  return true;
}

// Contar incidentes por estado — útil para el dashboard
export function contarPorEstado(): Record<string, number> {
  const incidentes = leerTodos();
  return {
    abiertos: incidentes.filter((i) => i.estado === "abierto").length,
    enProgreso: incidentes.filter((i) => i.estado === "en progreso").length,
    resueltos: incidentes.filter((i) => i.estado === "resuelto").length,
  };
}
