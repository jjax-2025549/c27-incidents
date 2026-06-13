#  C-27 Incident Control System
**Sistema de Control de Incidentes Técnicos — Salón C-27 | Fundación Kinal**

Proyecto de TypeScript estructurado en módulos. Fase 1: Terminal (sin frontend).

---

## Estructura del Proyecto

```
c27-incidents/
├── src/
│   ├── types/          → Interfaces y tipos del sistema (Incidente, Prioridad...)
│   ├── models/         → Modelos Cliente, Producto, Validaciones (Actividad 1)
│   ├── repositories/   → Persistencia en JSON (capa de datos)
│   ├── services/       → Lógica de negocio (capa de servicio)
│   ├── reports/        → Generación de reportes diarios y mensuales
│   ├── utils/          → Dashboard y CLI interactivo
│   └── index.ts        → Punto de entrada principal
├── data/               → Base de datos JSON (auto-generada)
└── dist/               → Compilado TypeScript (auto-generado)
```

## Comandos

```bash
npm install              # Instalar dependencias
npm run dev              # Menú interactivo
npx ts-node src/index.ts dashboard        # Solo el dashboard
npx ts-node src/index.ts report daily     # Reporte diario
npx ts-node src/index.ts report monthly   # Reporte mensual
npx ts-node src/index.ts validar          # Validaciones Actividad 1
```

## Ramas Git

| Rama | Propósito |
|------|-----------|
| `main` | Producción — código estable |
| `develop` | Integración de features |
| `jjax-2025549` | Desarrollo personal del estudiante |

## Actividad 1 — Modelos implementados

- **Cliente**: enum `TipoCliente` (Regular/Corporativo/VIP), `EstadoCliente`
- **Producto**: enum `CategoriaProducto`, `EstadoProducto`
- **Validaciones**: 6 reglas por entidad con reporte detallado de errores
- **Datos simulados**: 6 clientes + 6 productos (mix de válidos e inválidos)
