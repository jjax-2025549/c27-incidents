// ============================================================
// PUNTO DE ENTRADA — src/index.ts
// Aquí arranca todo el sistema. Detecta el modo de ejecución
// y decide si muestra el menú interactivo o un comando directo
// ============================================================

import { iniciarCLI } from "./utils/cli";
import { mostrarDashboard } from "./utils/dashboard";
import {
  generarReporteDiario,
  generarReporteMensual,
  mostrarReporteDiario,
  mostrarReporteMensual,
} from "./reports/reporteService";
import {
  validarCliente,
  validarProducto,
  mostrarResultadosValidacion,
} from "./models/validaciones";
import { clientesSimulados, productosSimulados } from "./models/datosSimulados";

// Leemos los argumentos que pasa el usuario desde la terminal
// Ejemplo: ts-node src/index.ts report daily
const args = process.argv.slice(2);
const comando = args[0];

async function main(): Promise<void> {
  // Sin argumentos → menú interactivo completo
  if (!comando) {
    await iniciarCLI();
    return;
  }

  // Comandos directos — útiles para scripts y automatización
  switch (comando) {
    case "dashboard":
      mostrarDashboard();
      break;

    case "report": {
      const tipoReporte = args[1];

      if (tipoReporte === "daily" || tipoReporte === "diario") {
        const reporte = generarReporteDiario();
        mostrarReporteDiario(reporte);
      } else if (tipoReporte === "monthly" || tipoReporte === "mensual") {
        const mes = args[2] ? parseInt(args[2]) : undefined;
        const anio = args[3] ? parseInt(args[3]) : undefined;
        const reporte = generarReporteMensual(mes, anio);
        mostrarReporteMensual(reporte);
      } else {
        console.log("Uso: ts-node src/index.ts report [daily|monthly] [mes] [año]");
      }
      break;
    }

    // Comando especial de la Actividad 1 — corre las validaciones
    case "validar":
    case "validate": {
      console.log("\n🔍 Ejecutando validaciones de Actividad 1...");
      console.log("   Analizando clientes y productos simulados...\n");

      // Validar todos los clientes simulados
      const resultadosClientes = clientesSimulados.map(validarCliente);

      // Validar todos los productos simulados
      const resultadosProductos = productosSimulados.map(validarProducto);

      // Mostrar el reporte completo
      mostrarResultadosValidacion([
        ...resultadosClientes,
        ...resultadosProductos,
      ]);
      break;
    }

    default:
      console.log(`
╔════════════════════════════════════════════════════╗
║   🖥️  C-27 INCIDENT CONTROL — COMANDOS DISPONIBLES  ║
╠════════════════════════════════════════════════════╣
║  (sin args)          → Menú interactivo            ║
║  dashboard           → Ver panel de control        ║
║  report daily        → Reporte del día             ║
║  report monthly      → Reporte del mes actual      ║
║  report monthly 6 2025 → Reporte junio 2025        ║
║  validar             → Validar datos Actividad 1   ║
╚════════════════════════════════════════════════════╝
      `);
  }
}

// Arrancar — capturamos cualquier error no manejado para no colapsar feo
main().catch((error) => {
  console.error("\n💥 Error crítico del sistema:", error);
  process.exit(1);
});
