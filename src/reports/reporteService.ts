// ============================================================
// GENERADOR DE REPORTES - DIARIOS Y MENSUALES
// Aquí construimos los reportes que el profe necesita ver
// Sin frontend por ahora — todo en la terminal, bien bonito
// ============================================================

import * as repo from "../repositories/incidenteRepository";
import {
  Incidente,
  Prioridad,
  ReporteDiario,
  ReporteMensual,
  ResumenSemana,
} from "../types";

// ============================================================
// REPORTE DIARIO
// ============================================================

// Genera el reporte de un día específico (por defecto hoy)
export function generarReporteDiario(fecha?: Date): ReporteDiario {
  const diaObjetivo = fecha || new Date();

  // Calculamos el rango completo del día (de medianoche a medianoche)
  const inicio = new Date(diaObjetivo);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(diaObjetivo);
  fin.setHours(23, 59, 59, 999);

  // Filtramos solo los incidentes de ese día
  const todos = repo.obtenerTodos();
  const delDia = todos.filter(
    (i) => i.fechaCreacion >= inicio && i.fechaCreacion <= fin
  );

  // Calculamos tiempo promedio de resolución para los que ya se resolvieron hoy
  const resueltos = delDia.filter(
    (i) => i.estado === "resuelto" && i.fechaResolucion
  );

  let tiempoPromedio: number | undefined;
  if (resueltos.length > 0) {
    const totalHoras = resueltos.reduce((suma, inc) => {
      const diff =
        inc.fechaResolucion!.getTime() - inc.fechaCreacion.getTime();
      return suma + diff / 3600000; // Convertir ms a horas
    }, 0);
    tiempoPromedio = Math.round((totalHoras / resueltos.length) * 10) / 10;
  }

  return {
    fecha: diaObjetivo,
    totalIncidentes: delDia.length,
    incidentesAbiertos: delDia.filter((i) => i.estado === "abierto").length,
    incidentesEnProgreso: delDia.filter((i) => i.estado === "en progreso")
      .length,
    incidentesResueltos: resueltos.length,
    incidentesPorPrioridad: contarPorPrioridad(delDia),
    tiempoPromedioResolucion: tiempoPromedio,
    incidentes: delDia,
  };
}

// ============================================================
// REPORTE MENSUAL
// ============================================================

// Genera el reporte de un mes completo
export function generarReporteMensual(
  mes?: number,
  anio?: number
): ReporteMensual {
  const hoy = new Date();
  const mesObjetivo = mes || hoy.getMonth() + 1; // getMonth() devuelve 0-11
  const anioObjetivo = anio || hoy.getFullYear();

  // Primer y último día del mes
  const inicio = new Date(anioObjetivo, mesObjetivo - 1, 1);
  const fin = new Date(anioObjetivo, mesObjetivo, 0, 23, 59, 59, 999);

  const todos = repo.obtenerTodos();
  const delMes = todos.filter(
    (i) => i.fechaCreacion >= inicio && i.fechaCreacion <= fin
  );

  const resueltos = delMes.filter((i) => i.estado === "resuelto").length;
  const pendientes = delMes.filter(
    (i) => i.estado === "abierto" || i.estado === "en progreso"
  ).length;

  const tasaResolucion =
    delMes.length > 0 ? Math.round((resueltos / delMes.length) * 100) : 0;

  // Los equipos que más dan lata ese mes
  const equiposMasFallidos = obtenerEquiposMasFallidos(delMes);

  // Dividir el mes en semanas para el resumen semanal
  const resumenSemanal = calcularResumenSemanal(delMes, inicio, fin);

  return {
    mes: mesObjetivo,
    anio: anioObjetivo,
    totalIncidentes: delMes.length,
    incidentesResueltos: resueltos,
    incidentesPendientes: pendientes,
    tasaResolucion,
    equiposMasFallidos,
    incidentesPorPrioridad: contarPorPrioridad(delMes),
    resumenSemanal,
  };
}

// ============================================================
// FUNCIONES DE DISPLAY — Para pintar bonito en la terminal
// ============================================================

// Imprime el reporte diario en la consola con formato visual
export function mostrarReporteDiario(reporte: ReporteDiario): void {
  const fecha = reporte.fecha.toLocaleDateString("es-GT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  console.log("\n" + "═".repeat(60));
  console.log("  📋 REPORTE DIARIO - SALON C-27");
  console.log(`  📅 ${fecha.toUpperCase()}`);
  console.log("═".repeat(60));

  console.log("\n  RESUMEN DE INCIDENTES:");
  console.log(`  • Total del día:      ${reporte.totalIncidentes}`);
  console.log(
    `  • 🔴 Abiertos:        ${reporte.incidentesAbiertos}`
  );
  console.log(
    `  • 🟡 En Progreso:     ${reporte.incidentesEnProgreso}`
  );
  console.log(
    `  • 🟢 Resueltos:       ${reporte.incidentesResueltos}`
  );

  if (reporte.tiempoPromedioResolucion !== undefined) {
    console.log(
      `  • ⏱  T. Promedio Res: ${reporte.tiempoPromedioResolucion} hrs`
    );
  }

  console.log("\n  POR PRIORIDAD:");
  console.log(`  • 🔺 Alta:  ${reporte.incidentesPorPrioridad.alta}`);
  console.log(`  • ➡️  Media: ${reporte.incidentesPorPrioridad.media}`);
  console.log(`  • 🔻 Baja:  ${reporte.incidentesPorPrioridad.baja}`);

  if (reporte.incidentes.length > 0) {
    console.log("\n  DETALLE DE INCIDENTES:");
    console.log("  " + "-".repeat(56));

    reporte.incidentes.forEach((inc) => {
      const estadoEmoji = {
        abierto: "🔴",
        "en progreso": "🟡",
        resuelto: "🟢",
      }[inc.estado];

      const prioridadEmoji = {
        alta: "🔺",
        media: "➡️ ",
        baja: "🔻",
      }[inc.prioridad];

      console.log(
        `  ${estadoEmoji} [${inc.id}] ${inc.titulo.substring(0, 35)}`
      );
      console.log(
        `     ${prioridadEmoji} ${inc.prioridad.toUpperCase()} | Reportado por: ${inc.reportadoPor}`
      );
    });
  } else {
    console.log("\n  ✅ Sin incidentes registrados en este día.");
  }

  console.log("\n" + "═".repeat(60) + "\n");
}

// Imprime el reporte mensual con barras de progreso visuales
export function mostrarReporteMensual(reporte: ReporteMensual): void {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  console.log("\n" + "═".repeat(60));
  console.log("  📊 REPORTE MENSUAL - SALON C-27");
  console.log(
    `  📅 ${meses[reporte.mes - 1].toUpperCase()} ${reporte.anio}`
  );
  console.log("═".repeat(60));

  // Barra de tasa de resolución — visual y rápido de entender
  const barraCompleta = Math.floor(reporte.tasaResolucion / 5);
  const barraVacia = 20 - barraCompleta;
  const barra =
    "█".repeat(barraCompleta) + "░".repeat(barraVacia);

  console.log(`\n  TASA DE RESOLUCIÓN: ${reporte.tasaResolucion}%`);
  console.log(`  [${barra}]`);

  console.log("\n  TOTALES DEL MES:");
  console.log(`  • Total incidentes:   ${reporte.totalIncidentes}`);
  console.log(`  • Resueltos:          ${reporte.incidentesResueltos}`);
  console.log(`  • Pendientes:         ${reporte.incidentesPendientes}`);

  console.log("\n  POR PRIORIDAD:");
  console.log(`  • 🔺 Alta:  ${reporte.incidentesPorPrioridad.alta}`);
  console.log(`  • ➡️  Media: ${reporte.incidentesPorPrioridad.media}`);
  console.log(`  • 🔻 Baja:  ${reporte.incidentesPorPrioridad.baja}`);

  if (reporte.equiposMasFallidos.length > 0) {
    console.log("\n  EQUIPOS QUE MÁS FALLARON:");
    reporte.equiposMasFallidos
      .slice(0, 5)
      .forEach((eq, i) => console.log(`  ${i + 1}. ${eq}`));
  }

  console.log("\n  RESUMEN SEMANAL:");
  reporte.resumenSemanal.forEach((semana) => {
    const tasaSem =
      semana.totalIncidentes > 0
        ? Math.round((semana.resueltos / semana.totalIncidentes) * 100)
        : 100;
    console.log(
      `  Semana ${semana.semana}: ${semana.totalIncidentes} incidentes | ` +
        `${semana.resueltos} resueltos (${tasaSem}%)`
    );
  });

  console.log("\n" + "═".repeat(60) + "\n");
}

// ============================================================
// HELPERS PRIVADOS
// ============================================================

function contarPorPrioridad(
  incidentes: Incidente[]
): Record<Prioridad, number> {
  return {
    alta: incidentes.filter((i) => i.prioridad === "alta").length,
    media: incidentes.filter((i) => i.prioridad === "media").length,
    baja: incidentes.filter((i) => i.prioridad === "baja").length,
  };
}

// Encuentra los equipos que más aparecen en incidentes
function obtenerEquiposMasFallidos(incidentes: Incidente[]): string[] {
  const conteo: Record<string, number> = {};

  incidentes
    .filter((i) => i.equipoAfectado)
    .forEach((i) => {
      const equipo = i.equipoAfectado!;
      conteo[equipo] = (conteo[equipo] || 0) + 1;
    });

  // Ordenar por frecuencia de mayor a menor
  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .map(([equipo]) => equipo);
}

// Divide los incidentes del mes en semanas
function calcularResumenSemanal(
  incidentes: Incidente[],
  inicio: Date,
  _fin: Date
): ResumenSemana[] {
  const semanas: ResumenSemana[] = [];

  // Iteramos semana por semana dentro del mes
  for (let semana = 1; semana <= 5; semana++) {
    const inicioSemana = new Date(inicio);
    inicioSemana.setDate(inicio.getDate() + (semana - 1) * 7);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    const delaSemana = incidentes.filter(
      (i) => i.fechaCreacion >= inicioSemana && i.fechaCreacion <= finSemana
    );

    // Solo agregamos la semana si tiene datos o cabe dentro del mes
    if (delaSemana.length > 0 || semana <= 4) {
      semanas.push({
        semana,
        totalIncidentes: delaSemana.length,
        resueltos: delaSemana.filter((i) => i.estado === "resuelto").length,
      });
    }
  }

  return semanas;
}
