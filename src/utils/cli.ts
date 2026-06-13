// ============================================================
// INTERFAZ DE LÍNEA DE COMANDOS (CLI)
// Aquí el usuario interactúa con el sistema desde la terminal
// Comandos claros, mensajes de error útiles, nada de tecnicismos
// ============================================================

import * as readline from "readline";
import {
  crearIncidente,
  listarIncidentes,
  actualizarIncidente,
  cambiarEstado,
  resolverIncidente,
  eliminarIncidente,
  buscarPorId,
} from "../services/incidenteService";
import {
  generarReporteDiario,
  generarReporteMensual,
  mostrarReporteDiario,
  mostrarReporteMensual,
} from "../reports/reporteService";
import { mostrarDashboard } from "./dashboard";
import { Prioridad, EstadoIncidente } from "../types";

// Creamos la interfaz de lectura de la terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper para hacer preguntas de forma promisificada (más limpio con async/await)
function preguntar(texto: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(texto, (respuesta) => {
      resolve(respuesta.trim());
    });
  });
}

// Muestra el menú principal
function mostrarMenu(): void {
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║   🖥️  C-27 INCIDENT CONTROL SYSTEM         ║");
  console.log("╠════════════════════════════════════════════╣");
  console.log("║  1. Dashboard                              ║");
  console.log("║  2. Nuevo incidente                        ║");
  console.log("║  3. Listar incidentes                      ║");
  console.log("║  4. Ver incidente específico               ║");
  console.log("║  5. Actualizar estado                      ║");
  console.log("║  6. Editar incidente                       ║");
  console.log("║  7. Reporte diario                         ║");
  console.log("║  8. Reporte mensual                        ║");
  console.log("║  9. Eliminar incidente                     ║");
  console.log("║  0. Salir                                  ║");
  console.log("╚════════════════════════════════════════════╝");
}

// ============================================================
// FLUJOS DE CADA OPCIÓN
// ============================================================

// Opción 2: Crear nuevo incidente paso a paso
async function flujoNuevoIncidente(): Promise<void> {
  console.log("\n📝 NUEVO INCIDENTE - Salon C-27");
  console.log("─".repeat(40));

  const titulo = await preguntar("Título del problema: ");
  const descripcion = await preguntar("Descripción detallada: ");
  const reportadoPor = await preguntar("Tu nombre (quien reporta): ");

  // Validar prioridad
  let prioridad: Prioridad;
  while (true) {
    const p = await preguntar("Prioridad (baja / media / alta): ");
    if (p === "baja" || p === "media" || p === "alta") {
      prioridad = p;
      break;
    }
    console.log("⚠️  Solo se acepta: baja, media o alta");
  }

  const equipo = await preguntar("Equipo afectado (ej: PC-15, proyector) [opcional]: ");

  try {
    const incidente = crearIncidente({
      titulo,
      descripcion,
      reportadoPor,
      prioridad,
      equipoAfectado: equipo || undefined,
      salon: "C-27",
    });

    console.log("\n✅ ¡Incidente registrado exitosamente!");
    console.log(`   ID: ${incidente.id}`);
    console.log(`   Estado: ${incidente.estado}`);
    console.log(`   Prioridad: ${incidente.prioridad}`);
  } catch (error) {
    console.log(`\n❌ Error: ${(error as Error).message}`);
  }
}

// Opción 3: Listar con filtros opcionales
async function flujoListarIncidentes(): Promise<void> {
  console.log("\n📋 LISTAR INCIDENTES");
  console.log("─".repeat(40));

  const filtrarPor = await preguntar(
    "Filtrar por estado (abierto/en progreso/resuelto/todos): "
  );

  const incidentes =
    filtrarPor === "todos" || filtrarPor === ""
      ? listarIncidentes()
      : listarIncidentes({
          estado: filtrarPor as EstadoIncidente,
        });

  if (incidentes.length === 0) {
    console.log("\nNo hay incidentes con esos criterios.");
    return;
  }

  console.log(`\nEncontrados: ${incidentes.length} incidentes\n`);
  console.log(
    "ID".padEnd(14) +
      "TÍTULO".padEnd(30) +
      "PRIORIDAD".padEnd(10) +
      "ESTADO".padEnd(14) +
      "REPORTADO POR"
  );
  console.log("─".repeat(80));

  incidentes.forEach((inc) => {
    const estadoEmoji = {
      abierto: "🔴",
      "en progreso": "🟡",
      resuelto: "🟢",
    }[inc.estado];

    console.log(
      inc.id.padEnd(14) +
        inc.titulo.substring(0, 28).padEnd(30) +
        inc.prioridad.padEnd(10) +
        `${estadoEmoji} ${inc.estado}`.padEnd(16) +
        inc.reportadoPor
    );
  });
}

// Opción 4: Ver detalle de un incidente
async function flujoVerIncidente(): Promise<void> {
  const id = await preguntar("\nIngresa el ID del incidente: ");

  try {
    const inc = buscarPorId(id.toUpperCase());

    console.log("\n" + "═".repeat(50));
    console.log(`  📌 ${inc.id} — ${inc.titulo}`);
    console.log("═".repeat(50));
    console.log(`  Estado:        ${inc.estado}`);
    console.log(`  Prioridad:     ${inc.prioridad}`);
    console.log(`  Reportado por: ${inc.reportadoPor}`);
    console.log(`  Salón:         ${inc.salon}`);

    if (inc.equipoAfectado) {
      console.log(`  Equipo:        ${inc.equipoAfectado}`);
    }

    console.log(`  Creado:        ${inc.fechaCreacion.toLocaleString("es-GT")}`);

    if (inc.fechaActualizacion) {
      console.log(
        `  Actualizado:   ${inc.fechaActualizacion.toLocaleString("es-GT")}`
      );
    }

    if (inc.fechaResolucion) {
      console.log(
        `  Resuelto:      ${inc.fechaResolucion.toLocaleString("es-GT")}`
      );
    }

    console.log(`\n  Descripción:\n  ${inc.descripcion}`);
    console.log("═".repeat(50));
  } catch (error) {
    console.log(`\n❌ ${(error as Error).message}`);
  }
}

// Opción 5: Cambiar estado rápidamente
async function flujoActualizarEstado(): Promise<void> {
  const id = await preguntar("\nID del incidente: ");

  try {
    const inc = buscarPorId(id.toUpperCase());
    console.log(`\nEstado actual: ${inc.estado}`);

    let nuevoEstado: EstadoIncidente;
    while (true) {
      const e = await preguntar(
        "Nuevo estado (abierto / en progreso / resuelto): "
      );
      if (e === "abierto" || e === "en progreso" || e === "resuelto") {
        nuevoEstado = e;
        break;
      }
      console.log("⚠️  Estado inválido. Opciones: abierto, en progreso, resuelto");
    }

    const actualizado = cambiarEstado(id.toUpperCase(), nuevoEstado);
    console.log(`\n✅ Estado actualizado: ${inc.estado} → ${actualizado.estado}`);

    if (actualizado.estado === "resuelto") {
      console.log(`   🎉 Incidente ${id} marcado como resuelto.`);
    }
  } catch (error) {
    console.log(`\n❌ ${(error as Error).message}`);
  }
}

// Opción 6: Editar campos del incidente
async function flujoEditarIncidente(): Promise<void> {
  const id = await preguntar("\nID del incidente a editar: ");

  try {
    const inc = buscarPorId(id.toUpperCase());
    console.log(`\nEditando: ${inc.titulo}`);
    console.log("(Deja vacío para no cambiar el campo)\n");

    const titulo = await preguntar(`Título [${inc.titulo}]: `);
    const descripcion = await preguntar("Nueva descripción: ");
    const equipo = await preguntar(`Equipo afectado [${inc.equipoAfectado || "N/A"}]: `);

    // Solo enviamos lo que el usuario cambió
    const cambios: Record<string, string> = {};
    if (titulo) cambios.titulo = titulo;
    if (descripcion) cambios.descripcion = descripcion;
    if (equipo) cambios.equipoAfectado = equipo;

    if (Object.keys(cambios).length === 0) {
      console.log("\nℹ️  No se realizaron cambios.");
      return;
    }

    actualizarIncidente(id.toUpperCase(), cambios);
    console.log("\n✅ Incidente actualizado correctamente.");
  } catch (error) {
    console.log(`\n❌ ${(error as Error).message}`);
  }
}

// Opción 9: Eliminar con confirmación doble
async function flujoEliminar(): Promise<void> {
  const id = await preguntar("\nID del incidente a eliminar: ");

  try {
    const inc = buscarPorId(id.toUpperCase());
    console.log(`\n⚠️  Vas a eliminar: "${inc.titulo}"`);

    const confirmacion = await preguntar(
      'Esta acción es PERMANENTE. Escribe "CONFIRMAR" para continuar: '
    );

    if (confirmacion !== "CONFIRMAR") {
      console.log("Operación cancelada.");
      return;
    }

    eliminarIncidente(id.toUpperCase());
    console.log(`\n✅ Incidente ${id} eliminado.`);
  } catch (error) {
    console.log(`\n❌ ${(error as Error).message}`);
  }
}

// ============================================================
// LOOP PRINCIPAL DEL CLI
// ============================================================

export async function iniciarCLI(): Promise<void> {
  console.log("\n🖥️  Sistema de Control de Incidentes - Salon C-27");
  console.log("   Fase 1 — Terminal Mode (sin frontend)");

  let corriendo = true;

  while (corriendo) {
    mostrarMenu();
    const opcion = await preguntar("\n👉 Selecciona una opción: ");

    switch (opcion) {
      case "1":
        mostrarDashboard();
        break;

      case "2":
        await flujoNuevoIncidente();
        break;

      case "3":
        await flujoListarIncidentes();
        break;

      case "4":
        await flujoVerIncidente();
        break;

      case "5":
        await flujoActualizarEstado();
        break;

      case "6":
        await flujoEditarIncidente();
        break;

      case "7": {
        const reporte = generarReporteDiario();
        mostrarReporteDiario(reporte);
        break;
      }

      case "8": {
        const mesStr = await preguntar("Mes (1-12, Enter para mes actual): ");
        const anioStr = await preguntar("Año (Enter para año actual): ");

        const mes = mesStr ? parseInt(mesStr) : undefined;
        const anio = anioStr ? parseInt(anioStr) : undefined;

        const reporte = generarReporteMensual(mes, anio);
        mostrarReporteMensual(reporte);
        break;
      }

      case "9":
        await flujoEliminar();
        break;

      case "0":
        console.log("\n👋 Hasta luego. Sistema cerrado.\n");
        corriendo = false;
        break;

      default:
        console.log("\n⚠️  Opción no válida. Intenta de nuevo.");
    }

    if (corriendo) {
      await preguntar("\nPresiona Enter para continuar...");
    }
  }

  rl.close();
}
