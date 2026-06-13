// ============================================================
// MODELOS: CLIENTE Y PRODUCTO - ACTIVIDAD 1 FUNDACIÓN KINAL
// Aquí viven los enums e interfaces del sistema de ventas
// que se integra con el control de incidentes del C-27
// ============================================================

// ============================================================
// ENUMERACIONES — valores fijos que no cambian nunca
// TypeScript nos ayuda a que nadie invente valores raros
// ============================================================

// Tipo de cliente: ¿quién nos está comprando?
// Regular = cliente normal de mostrador
// Corporativo = empresa con cuenta
// VIP = cliente frecuente con beneficios especiales
export enum TipoCliente {
  Regular     = "regular",
  Corporativo = "corporativo",
  VIP         = "vip",
}

// Estado del cliente en el sistema
export enum EstadoCliente {
  Activo   = "activo",
  Inactivo = "inactivo",
  Suspendido = "suspendido", // Por deuda o problema
}

// Categoría del producto — lo que vendemos en el laboratorio/tienda
export enum CategoriaProducto {
  Tecnologia  = "tecnologia",  // Computadoras, periféricos, accesorios
  Hogar       = "hogar",       // Mobiliario, eléctricos del salón
  Servicios   = "servicios",   // Mantenimiento, soporte técnico
  Software    = "software",    // Licencias, antivirus, Office
  Consumibles = "consumibles", // Tóner, papel, cables, etc.
}

// Estado del producto — ¿está disponible para vender?
export enum EstadoProducto {
  Disponible    = "disponible",
  Agotado       = "agotado",
  Descontinuado = "descontinuado",
  EnRevision    = "en_revision", // Lo separaron para revisar calidad
}

// ============================================================
// INTERFAZ: CLIENTE
// Toda la info que necesitamos de quien nos compra o reporta
// ============================================================
export interface Cliente {
  readonly id: string;          // ID único e inmutable — nadie lo toca
  nombre: string;               // Nombre completo del cliente
  identificacion: string;       // DPI, NIT, carnet universitario
  tipoCliente: TipoCliente;     // Regular | Corporativo | VIP
  estado: EstadoCliente;        // Activo | Inactivo | Suspendido
  email?: string;               // Opcional — no todos dan correo
  telefono?: string;            // Opcional — contacto de emergencia
  direccion?: string;           // Dirección física (opcional)
  fechaRegistro: Date;          // Cuándo entró al sistema
  creditoDisponible?: number;   // Solo aplica a corporativos y VIP
  historialCompras?: number;    // Cuántas compras lleva — calculado
}

// Para crear un cliente nuevo no le pedimos ID ni fecha — eso es automático
export type CrearCliente = Omit<
  Cliente,
  "id" | "fechaRegistro" | "historialCompras"
>;

// ============================================================
// INTERFAZ: PRODUCTO
// Lo que el laboratorio o tienda tiene para vender o asignar
// ============================================================
export interface Producto {
  readonly id: string;             // ID único — sagrado e inmutable
  nombre: string;                  // Nombre descriptivo del producto
  codigoProducto: string;          // Código interno: ej. "TECH-001"
  categoria: CategoriaProducto;    // Tecnologia | Hogar | Servicios...
  precio: number;                  // Precio en Quetzales (GTQ)
  estado: EstadoProducto;          // Disponible | Agotado | etc.
  existencia: number;              // Unidades en inventario
  descripcion?: string;            // Descripción adicional (opcional)
  proveedor?: string;              // De dónde viene el producto
  fechaIngreso: Date;              // Cuándo entró al inventario
  stockMinimo: number;             // Alerta cuando baje de aquí
}

// Para crear producto nuevo, el sistema asigna ID y fecha automáticamente
export type CrearProducto = Omit<Producto, "id" | "fechaIngreso">;

// ============================================================
// INTERFAZ: VENTA
// La relación entre Cliente y Producto — el corazón del negocio
// Conecta las tres entidades principales del sistema
// ============================================================
export interface Venta {
  readonly id: string;
  clienteId: string;         // Referencia al cliente
  productos: LineaVenta[];   // Los productos que compró
  total: number;             // Total calculado automáticamente
  estado: EstadoVenta;       // Pendiente | Completada | Cancelada
  fechaVenta: Date;
  observaciones?: string;
}

// Cada línea del ticket de venta
export interface LineaVenta {
  productoId: string;
  cantidad: number;
  precioUnitario: number;    // El precio en el momento de la venta
  subtotal: number;          // cantidad × precioUnitario
}

// Estado del proceso de venta
export enum EstadoVenta {
  Pendiente   = "pendiente",
  Completada  = "completada",
  Cancelada   = "cancelada",
  Reembolsada = "reembolsada",
}
