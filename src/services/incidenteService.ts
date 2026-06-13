// ============================================================
// SERVICIO DE INCIDENTES
// La capa de negocio — aquí van las validaciones y reglas
// El repositorio maneja datos, el servicio maneja LOGICA
// ============================================================

import * as repo from "../repositories/incidenteRepository";
import {
  Incidente,
  CrearIncidente,
  ActualizarIncidente,
  EstadoIncidente,
  FiltrosIncidente,
} from "../types";

// Crear un nuevo incidente con todas las validaciones del caso
export function crearIncidente(datos: CrearIncidente): Incidente {
  // Validaciones básicas — no se salva nada vacío
  if (!datos.titulo || datos.titulo.trim().length === 0) {
    throw new Error("El título del incidente no puede estar vacío.");
  }

  if (!datos.descripcion || datos.descripcion.trim().length === 0) {
    throw new Error("La descripción es obligatoria. ¿Qué pasó exactamente?");
  }

  if (!datos.reportadoPor || datos.reportadoPor.trim().length === 0) {
    throw new Error("Debe indicar quién está reportando el incidente.");
  }

  // Todo bien, guardamos
  const incidente = repo.guardar({
    ...datos,
    salon: datos.salon || "C-27",
  });

  return incidente;
}

// Traer todos los incidentes, con o sin filtros
export function listarIncidentes(filtros?: FiltrosIncidente): Incidente[] {
  return repo.obtenerTodos(filtros);
}

// Buscar uno en específico
export function buscarPorId(id: string): Incidente {
  const incidente = repo.obtenerPorId(id);

  if (!incidente) {
    throw new Error(`No existe ningún incidente con ID: ${id}`);
  }

  return incidente;
}

// Actualizar un incidente — validando que el estado tenga sentido
export function actualizarIncidente(
  id: string,
  cambios: ActualizarIncidente
): Incidente {
  // Verificamos que el incidente exista primero
  const existente = repo.obtenerPorId(id);
  if (!existente) {
    throw new Error(`No existe ningún incidente con ID: ${id}`);
  }

  // Validación de flujo de estado — no se puede ir para atrás
  // Un ticket resuelto no puede volver a "abierto" directamente
  if (cambios.estado) {
    validarTransicionEstado(existente.estado, cambios.estado);
  }

  const actualizado = repo.actualizar(id, cambios);

  if (!actualizado) {
    throw new Error("Error inesperado al actualizar el incidente.");
  }

  return actualizado;
}

// Cambiar solo el estado — atajo conveniente para el CLI
export function cambiarEstado(
  id: string,
  nuevoEstado: EstadoIncidente
): Incidente {
  return actualizarIncidente(id, { estado: nuevoEstado });
}

// Resolver un incidente — lo marca como resuelto con fecha automática
export function resolverIncidente(id: string): Incidente {
  return cambiarEstado(id, "resuelto");
}

// Eliminar un incidente (¡cuidado! acción irreversible)
export function eliminarIncidente(id: string): void {
  const existe = repo.obtenerPorId(id);
  if (!existe) {
    throw new Error(`No existe ningún incidente con ID: ${id}`);
  }

  const eliminado = repo.eliminar(id);
  if (!eliminado) {
    throw new Error("No se pudo eliminar el incidente.");
  }
}

// ============================================================
// HELPERS INTERNOS
// ============================================================

// Las transiciones de estado válidas — el flujo siempre va hacia adelante
// abierto → en progreso → resuelto
// No permitimos saltar de abierto a resuelto sin pasar por en progreso
function validarTransicionEstado(
  actual: EstadoIncidente,
  nuevo: EstadoIncidente
): void {
  const transicionesValidas: Record<EstadoIncidente, EstadoIncidente[]> = {
    abierto: ["en progreso"],
    "en progreso": ["resuelto", "abierto"], // Puede regresarse si fue error
    resuelto: [],                            // Un ticket resuelto no se mueve
  };

  const permitidos = transicionesValidas[actual];

  if (!permitidos.includes(nuevo)) {
    throw new Error(
      `No se puede cambiar de "${actual}" a "${nuevo}". ` +
        `Transiciones válidas desde "${actual}": [${permitidos.join(", ")}]`
    );
  }
}

// Estadísticas rápidas para el dashboard
export function obtenerEstadisticas() {
  const todos = repo.obtenerTodos();
  const conteo = repo.contarPorEstado();

  const resueltos = todos.filter((i) => i.estado === "resuelto");
  const tiempos = resueltos
    .filter((i) => i.fechaResolucion)
    .map(
      (i) =>
        (i.fechaResolucion!.getTime() - i.fechaCreacion.getTime()) / 3600000
    ); // En horas

  const tiempoPromedio =
    tiempos.length > 0
      ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length
      : 0;

  return {
    total: todos.length,
    abiertos: conteo.abiertos,
    enProgreso: conteo.enProgreso,
    resueltos: conteo.resueltos,
    tiempoPromedioResolucionHoras: Math.round(tiempoPromedio * 10) / 10,
    porPrioridad: {
      alta: todos.filter((i) => i.prioridad === "alta").length,
      media: todos.filter((i) => i.prioridad === "media").length,
      baja: todos.filter((i) => i.prioridad === "baja").length,
    },
  };
}
