// ============================================================
// DASHBOARD - PANEL PRINCIPAL EN TERMINAL
// El corazón visual del sistema — lo que el profe ve primero
// Sin frontend, puro ASCII art y datos en tiempo real
// ============================================================

import { obtenerEstadisticas } from "../services/incidenteService";
import { obtenerTodos } from "../repositories/incidenteRepository";

// Dibuja el dashboard completo en la terminal
export function mostrarDashboard(): void {
  const stats = obtenerEstadisticas();
  const todos = obtenerTodos();

  // Los últimos 5 incidentes para mostrar en el panel
  const recientes = [...todos]
    .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime())
    .slice(0, 5);

  // Los de alta prioridad que siguen abiertos o en progreso — urgentes
  const urgentes = todos.filter(
    (i) => i.prioridad === "alta" && i.estado !== "resuelto"
  );

  const ahora = new Date().toLocaleString("es-GT", {
    dateStyle: "full",
    timeStyle: "short",
  });

  console.clear(); // Limpiamos la pantalla para el dashboard

  // Header del dashboard
  console.log("\n" + "╔" + "═".repeat(58) + "╗");
  console.log("║" + "  🖥️  SISTEMA DE CONTROL DE INCIDENTES - SALON C-27  " + " ".repeat(5) + "║");
  console.log("║" + `  📅 ${ahora}` + " ".repeat(Math.max(0, 52 - ahora.length)) + "║");
  console.log("╚" + "═".repeat(58) + "╝");

  // Tarjetas de estado — el resumen rápido
  console.log("\n  ┌─────────────────────────────────────────────────────┐");
  console.log("  │                   ESTADO ACTUAL                     │");
  console.log("  ├──────────────┬──────────────┬──────────────────────┤");
  console.log(
    `  │  TOTAL: ${String(stats.total).padEnd(4)} │ 🔴 ${String(stats.abiertos).padEnd(9)}│ ⏱  Prom: ${String(stats.tiempoPromedioResolucionHoras + "h").padEnd(11)}│`
  );
  console.log(
    `  │  Alta:  ${String(stats.porPrioridad.alta).padEnd(4)} │ 🟡 ${String(stats.enProgreso).padEnd(9)}│                      │`
  );
  console.log(
    `  │  Media: ${String(stats.porPrioridad.media).padEnd(4)} │ 🟢 ${String(stats.resueltos).padEnd(9)}│                      │`
  );
  console.log(
    `  │  Baja:  ${String(stats.porPrioridad.baja).padEnd(4)} │              │                      │`
  );
  console.log("  └──────────────┴──────────────┴──────────────────────┘");

  // Alertas urgentes — lo primero que hay que atender
  if (urgentes.length > 0) {
    console.log("\n  ⚠️  ALERTAS - ALTA PRIORIDAD SIN RESOLVER:");
    console.log("  " + "─".repeat(54));
    urgentes.slice(0, 3).forEach((inc) => {
      const estado = inc.estado === "abierto" ? "🔴" : "🟡";
      console.log(
        `  ${estado} [${inc.id}] ${inc.titulo.substring(0, 38)}`
      );
      console.log(
        `     └─ Reportado por: ${inc.reportadoPor} | Estado: ${inc.estado}`
      );
    });

    if (urgentes.length > 3) {
      console.log(`  ... y ${urgentes.length - 3} más de alta prioridad`);
    }
  } else {
    console.log("\n  ✅ Sin alertas urgentes. Todo bajo control.");
  }

  // Últimos incidentes registrados
  console.log("\n  📋 ÚLTIMOS 5 INCIDENTES:");
  console.log("  " + "─".repeat(54));

  if (recientes.length === 0) {
    console.log("  Sin incidentes registrados aún.");
  } else {
    recientes.forEach((inc) => {
      const estadoEmoji = {
        abierto: "🔴",
        "en progreso": "🟡",
        resuelto: "🟢",
      }[inc.estado];

      const fecha = inc.fechaCreacion.toLocaleDateString("es-GT");

      console.log(
        `  ${estadoEmoji} ${inc.id}  ${inc.titulo.substring(0, 30).padEnd(30)} ${fecha}`
      );
    });
  }

  // Barra visual de resolución general
  const tasaGlobal =
    stats.total > 0
      ? Math.round((stats.resueltos / stats.total) * 100)
      : 0;

  const barraLlena = Math.floor(tasaGlobal / 5);
  const barraVacia = 20 - barraLlena;

  console.log("\n  📊 TASA DE RESOLUCIÓN GLOBAL:");
  console.log(
    `  [${"█".repeat(barraLlena)}${"░".repeat(barraVacia)}] ${tasaGlobal}%`
  );

  // Footer con instrucciones rápidas
  console.log("\n" + "─".repeat(60));
  console.log("  💡 Comandos: nuevo | listar | actualizar | resolver | reporte");
  console.log("─".repeat(60) + "\n");
}
