// ============================================================
// VALIDACIONES — CLIENTES Y PRODUCTOS
// Aquí detectamos qué datos están bien y cuáles hay que corregir
// Cada validación tiene nombre, descripción y resultado claro
// ============================================================

import { Cliente, Producto, EstadoProducto, TipoCliente } from "./clienteProducto";

// Estructura de un resultado de validación — claro y fácil de reportar
export interface ResultadoValidacion {
  entidad: string;       // "Cliente" o "Producto"
  id: string;            // El ID del registro analizado
  nombre: string;        // Para identificarlo rápido
  esValido: boolean;     // ¿Pasó todas las validaciones?
  errores: string[];     // Lista de problemas encontrados
  advertencias: string[]; // Cosas que no son error pero hay que revisar
}

// ============================================================
// VALIDACIONES DE CLIENTE
// ============================================================

export function validarCliente(cliente: Cliente): ResultadoValidacion {
  const errores: string[] = [];
  const advertencias: string[] = [];

  // REGLA 1: El nombre no puede estar vacío
  if (!cliente.nombre || cliente.nombre.trim().length === 0) {
    errores.push("El nombre del cliente es obligatorio y no puede estar vacío.");
  }

  // REGLA 2: Nombre muy corto — probablemente incompleto
  if (cliente.nombre && cliente.nombre.trim().length < 3) {
    errores.push(`Nombre demasiado corto: "${cliente.nombre}". Mínimo 3 caracteres.`);
  }

  // REGLA 3: Identificación — DPI tiene 13 dígitos, NIT tiene formato con guión
  if (!cliente.identificacion || cliente.identificacion.trim().length === 0) {
    errores.push("La identificación (DPI o NIT) es obligatoria.");
  } else {
    const soloDpi = cliente.identificacion.replace(/\D/g, ""); // Solo números
    const esNit = /^\d{1,7}-\d$/.test(cliente.identificacion.trim()); // Formato NIT

    if (!esNit && soloDpi.length !== 13) {
      errores.push(
        `Identificación inválida: "${cliente.identificacion}". ` +
          "DPI debe tener 13 dígitos o NIT con formato XXXXXXX-X."
      );
    }
  }

  // REGLA 4: Email — si lo dan, debe tener formato válido
  if (cliente.email && cliente.email.trim().length > 0) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(cliente.email)) {
      errores.push(
        `Email inválido: "${cliente.email}". Formato esperado: usuario@dominio.com`
      );
    }
  } else {
    // No tener email no es error, pero sí una advertencia
    advertencias.push("No se registró email de contacto. Se recomienda tenerlo.");
  }

  // REGLA 5: Cliente corporativo o VIP debería tener crédito definido
  if (
    (cliente.tipoCliente === TipoCliente.Corporativo ||
      cliente.tipoCliente === TipoCliente.VIP) &&
    (cliente.creditoDisponible === undefined || cliente.creditoDisponible < 0)
  ) {
    advertencias.push(
      `Cliente tipo ${cliente.tipoCliente} sin crédito definido. ` +
        "Considere asignar un límite de crédito."
    );
  }

  // REGLA 6: Crédito no puede ser negativo si está definido
  if (cliente.creditoDisponible !== undefined && cliente.creditoDisponible < 0) {
    errores.push(
      `El crédito disponible no puede ser negativo: Q${cliente.creditoDisponible}`
    );
  }

  return {
    entidad: "Cliente",
    id: cliente.id,
    nombre: cliente.nombre || "(sin nombre)",
    esValido: errores.length === 0,
    errores,
    advertencias,
  };
}

// ============================================================
// VALIDACIONES DE PRODUCTO
// ============================================================

export function validarProducto(producto: Producto): ResultadoValidacion {
  const errores: string[] = [];
  const advertencias: string[] = [];

  // REGLA 1: Nombre obligatorio
  if (!producto.nombre || producto.nombre.trim().length === 0) {
    errores.push("El nombre del producto es obligatorio.");
  }

  // REGLA 2: Código de producto obligatorio y con formato
  if (!producto.codigoProducto || producto.codigoProducto.trim().length === 0) {
    errores.push("El código de producto es obligatorio.");
  } else {
    // El código debe tener formato XXXX-000 (letras guión números)
    const regexCodigo = /^[A-Z]{2,6}-\d{3}$/;
    if (!regexCodigo.test(producto.codigoProducto.trim())) {
      advertencias.push(
        `Código "${producto.codigoProducto}" no sigue el formato estándar (ej: TECH-001).`
      );
    }
  }

  // REGLA 3: Precio debe ser mayor a cero — siempre
  if (producto.precio === undefined || producto.precio === null) {
    errores.push("El precio del producto es obligatorio.");
  } else if (producto.precio <= 0) {
    errores.push(
      `Precio inválido: Q${producto.precio}. El precio debe ser mayor a Q0.00`
    );
  }

  // REGLA 4: Existencia no puede ser negativa
  if (producto.existencia < 0) {
    errores.push(
      `Existencia inválida: ${producto.existencia}. No puede ser negativa.`
    );
  }

  // REGLA 5: Stock mínimo no puede ser negativo
  if (producto.stockMinimo < 0) {
    errores.push(
      `Stock mínimo inválido: ${producto.stockMinimo}. No puede ser negativo.`
    );
  }

  // REGLA 6: Si la existencia es 0, el estado debería ser Agotado
  if (
    producto.existencia === 0 &&
    producto.estado === EstadoProducto.Disponible
  ) {
    errores.push(
      `Inconsistencia: existencia es 0 pero el estado dice "disponible". ` +
        "Debería marcarse como agotado."
    );
  }

  // REGLA 7: Alerta si la existencia bajó del stock mínimo
  if (
    producto.existencia > 0 &&
    producto.existencia < producto.stockMinimo &&
    producto.estado === EstadoProducto.Disponible
  ) {
    advertencias.push(
      `⚠️ Stock bajo: quedan ${producto.existencia} unidades pero el mínimo es ${producto.stockMinimo}. ` +
        "Considere hacer un pedido pronto."
    );
  }

  return {
    entidad: "Producto",
    id: producto.id,
    nombre: producto.nombre || "(sin nombre)",
    esValido: errores.length === 0,
    errores,
    advertencias,
  };
}

// ============================================================
// REPORTE DE VALIDACIONES — muestra todo en consola
// ============================================================

export function mostrarResultadosValidacion(
  resultados: ResultadoValidacion[]
): void {
  const validos = resultados.filter((r) => r.esValido);
  const invalidos = resultados.filter((r) => !r.esValido);
  const conAdvertencias = resultados.filter((r) => r.advertencias.length > 0);

  console.log("\n" + "═".repeat(60));
  console.log("  🔍 REPORTE DE VALIDACIONES - ACTIVIDAD 1 KINAL");
  console.log("═".repeat(60));

  console.log(`\n  ✅ Registros válidos:     ${validos.length}`);
  console.log(`  ❌ Registros inválidos:   ${invalidos.length}`);
  console.log(`  ⚠️  Con advertencias:      ${conAdvertencias.length}`);
  console.log(`  📊 Total analizados:      ${resultados.length}`);

  // Mostrar los que pasaron
  if (validos.length > 0) {
    console.log("\n  ✅ REGISTROS QUE PASARON LA VALIDACIÓN:");
    console.log("  " + "─".repeat(54));
    validos.forEach((r) => {
      const adv =
        r.advertencias.length > 0
          ? ` (${r.advertencias.length} advertencia/s)`
          : "";
      console.log(`  ✔ [${r.id}] ${r.nombre}${adv}`);
      if (r.advertencias.length > 0) {
        r.advertencias.forEach((a) => console.log(`      ⚠️  ${a}`));
      }
    });
  }

  // Mostrar los que fallaron con sus errores detallados
  if (invalidos.length > 0) {
    console.log("\n  ❌ REGISTROS CON ERRORES (REQUIEREN CORRECCIÓN):");
    console.log("  " + "─".repeat(54));

    invalidos.forEach((r) => {
      console.log(`\n  ✗ [${r.id}] ${r.nombre}`);
      r.errores.forEach((e) => {
        console.log(`      ❌ ${e}`);
      });
      if (r.advertencias.length > 0) {
        r.advertencias.forEach((a) => console.log(`      ⚠️  ${a}`));
      }
    });
  }

  // Conclusión final
  const porcentajeValido =
    resultados.length > 0
      ? Math.round((validos.length / resultados.length) * 100)
      : 0;

  console.log("\n  📋 CONCLUSIÓN:");
  console.log(
    `  El ${porcentajeValido}% de los registros pasó la validación correctamente.`
  );

  if (porcentajeValido < 100) {
    console.log(
      `  Se encontraron ${invalidos.reduce((s, r) => s + r.errores.length, 0)} ` +
        "errores que deben corregirse antes de procesar los datos."
    );
  } else {
    console.log("  Todos los registros cumplen con las reglas del negocio. ✅");
  }

  console.log("\n" + "═".repeat(60) + "\n");
}
