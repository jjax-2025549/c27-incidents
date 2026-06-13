// ============================================================
// DATOS SIMULADOS — CLIENTES Y PRODUCTOS
// Estos representan casos reales que podrían darse en C-27
// Algunos datos están bien, otros tienen errores a propósito
// para probar las validaciones (spoiler: los detectamos todos)
// ============================================================

import {
  Cliente,
  Producto,
  TipoCliente,
  EstadoCliente,
  CategoriaProducto,
  EstadoProducto,
} from "./clienteProducto";

// ============================================================
// CLIENTES SIMULADOS
// Mezcla de casos válidos y casos con errores intencionales
// ============================================================
export const clientesSimulados: Cliente[] = [
  {
    // ✅ Cliente válido — todo en orden
    id: "CLI-001",
    nombre: "Carlos Mendoza López",
    identificacion: "2456789012345",  // DPI válido de 13 dígitos
    tipoCliente: TipoCliente.Regular,
    estado: EstadoCliente.Activo,
    email: "cmendoza@correo.com",
    telefono: "5512-3456",
    fechaRegistro: new Date("2024-01-15"),
    historialCompras: 8,
  },
  {
    // ✅ Cliente VIP con crédito disponible
    id: "CLI-002",
    nombre: "Empresa Tecnológica S.A.",
    identificacion: "123456-7",       // NIT de empresa
    tipoCliente: TipoCliente.Corporativo,
    estado: EstadoCliente.Activo,
    email: "compras@empresatech.gt",
    telefono: "2234-5678",
    direccion: "Zona 10, Ciudad de Guatemala",
    fechaRegistro: new Date("2023-06-01"),
    creditoDisponible: 15000.00,
    historialCompras: 45,
  },
  {
    // ❌ ERROR: nombre vacío — campo obligatorio
    id: "CLI-003",
    nombre: "",                        // ← INVÁLIDO: nombre requerido
    identificacion: "9876543210123",
    tipoCliente: TipoCliente.VIP,
    estado: EstadoCliente.Activo,
    fechaRegistro: new Date("2024-03-20"),
  },
  {
    // ❌ ERROR: email con formato inválido
    id: "CLI-004",
    nombre: "María García",
    identificacion: "1122334455667",
    tipoCliente: TipoCliente.Regular,
    estado: EstadoCliente.Activo,
    email: "maria.sindominio",         // ← INVÁLIDO: falta @dominio.com
    fechaRegistro: new Date("2024-04-10"),
  },
  {
    // ✅ Cliente con estado suspendido — válido en el sistema
    id: "CLI-005",
    nombre: "Roberto Tzul",
    identificacion: "3344556677889",
    tipoCliente: TipoCliente.Regular,
    estado: EstadoCliente.Suspendido,
    telefono: "4478-9012",
    fechaRegistro: new Date("2023-11-05"),
    historialCompras: 3,
  },
  {
    // ❌ ERROR: identificación muy corta (DPI debe tener 13 dígitos)
    id: "CLI-006",
    nombre: "Ana Revolorio",
    identificacion: "12345",           // ← INVÁLIDO: demasiado corta
    tipoCliente: TipoCliente.Regular,
    estado: EstadoCliente.Activo,
    fechaRegistro: new Date("2025-01-08"),
  },
];

// ============================================================
// PRODUCTOS SIMULADOS
// Lo que el laboratorio C-27 podría tener en inventario
// También mezclamos válidos con errores para las validaciones
// ============================================================
export const productosSimulados: Producto[] = [
  {
    // ✅ Producto válido — computadora de laboratorio
    id: "PROD-001",
    nombre: "Computadora HP ProDesk 400 G7",
    codigoProducto: "TECH-001",
    categoria: CategoriaProducto.Tecnologia,
    precio: 4500.00,
    estado: EstadoProducto.Disponible,
    existencia: 15,
    descripcion: "PC de escritorio para uso en laboratorio",
    proveedor: "HP Guatemala",
    fechaIngreso: new Date("2024-02-10"),
    stockMinimo: 3,
  },
  {
    // ✅ Producto válido — servicio de mantenimiento
    id: "PROD-002",
    nombre: "Mantenimiento Preventivo PC",
    codigoProducto: "SERV-001",
    categoria: CategoriaProducto.Servicios,
    precio: 350.00,
    estado: EstadoProducto.Disponible,
    existencia: 999,  // Los servicios no se agotan como tal
    descripcion: "Limpieza y mantenimiento de equipo de cómputo",
    fechaIngreso: new Date("2023-01-01"),
    stockMinimo: 0,
  },
  {
    // ❌ ERROR: precio negativo — absolutamente inválido
    id: "PROD-003",
    nombre: "Cable HDMI 2m",
    codigoProducto: "CONS-001",
    categoria: CategoriaProducto.Consumibles,
    precio: -25.00,                    // ← INVÁLIDO: precio debe ser > 0
    estado: EstadoProducto.Disponible,
    existencia: 30,
    fechaIngreso: new Date("2024-05-15"),
    stockMinimo: 5,
  },
  {
    // ❌ ERROR: existencia menor al stock mínimo — alerta de inventario
    id: "PROD-004",
    nombre: "Tóner HP LaserJet",
    codigoProducto: "CONS-002",
    categoria: CategoriaProducto.Consumibles,
    precio: 450.00,
    estado: EstadoProducto.Disponible, // ← INCONSISTENTE: dice disponible pero stock bajo
    existencia: 1,                     // ← PROBLEMA: está por debajo del mínimo
    proveedor: "OfficeDepot Guatemala",
    fechaIngreso: new Date("2024-06-01"),
    stockMinimo: 5,                    // ← El mínimo es 5 y solo hay 1
  },
  {
    // ✅ Producto agotado — registrado correctamente
    id: "PROD-005",
    nombre: "Licencia Microsoft Office 2024",
    codigoProducto: "SOFT-001",
    categoria: CategoriaProducto.Software,
    precio: 1200.00,
    estado: EstadoProducto.Agotado,
    existencia: 0,
    descripcion: "Licencia anual para un usuario",
    proveedor: "Microsoft Guatemala",
    fechaIngreso: new Date("2024-01-20"),
    stockMinimo: 2,
  },
  {
    // ❌ ERROR: nombre vacío — campo requerido
    id: "PROD-006",
    nombre: "",                        // ← INVÁLIDO: nombre obligatorio
    codigoProducto: "TECH-002",
    categoria: CategoriaProducto.Tecnologia,
    precio: 800.00,
    estado: EstadoProducto.Disponible,
    existencia: 5,
    fechaIngreso: new Date("2024-07-01"),
    stockMinimo: 1,
  },
];
