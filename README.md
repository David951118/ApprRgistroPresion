# Mini App de Salud Personal

Aplicación móvil multiplataforma para llevar el control diario de tus medidas
de salud. Permite a una persona registrar su perfil y anotar lecturas de
**azúcar en sangre** y **presión arterial**, y luego consultar un resumen con
estadísticas y las últimas medidas registradas.

> Proyecto desarrollado como **Actividad 2 (Grupo 4)** del módulo de
> aplicaciones móviles

##  Funcionalidad

-  **Perfil**: registra tu nombre, edad, peso y altura. La primera vez es un
  alta de bienvenida; después la misma vista te permite editar tus datos.
-  **Inicio**: pantalla de bienvenida con un resumen de tus últimas medidas y
  un botón destacado para añadir una nueva lectura.
-  **Nueva medida**: registra glucosa (mg/dL) o presión arterial
  (sistólica/diastólica + pulso opcional) con notas y validación inline.
-  **Resumen**: estadísticas (recuento, media, mínimo, máximo) calculadas en
  tiempo real para cada tipo de medida + tabla con las últimas 10 lecturas.
-  **Borrado**: cada medida se puede borrar con confirmación desde su card.
-  **Modo oscuro**: la app cambia automáticamente al esquema oscuro/claro
  según la configuración del sistema operativo.

##  Tecnologías y herramientas

| Herramienta | Versión | Para qué se usa |
|-------------|---------|-----------------|
| [Expo](https://expo.dev) | SDK 54 | Framework de React Native, build, simulador |
| [React Native](https://reactnative.dev) | 0.81 | UI multiplataforma iOS/Android |
| [React](https://react.dev) | 19.1 | Librería base de componentes |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Tipado estático del código |
| [Expo Router](https://docs.expo.dev/router/introduction/) | 6.0 | Navegación con Stack + Tabs por sistema de archivos |
| [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) | 16.0 | Persistencia local (perfil + medidas) |
| [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) | 15.0 | Degradados visuales (header, botones) |
| [@expo/vector-icons](https://icons.expokit.app) | 15.0 | Iconos (Ionicons) |
| [Yarn](https://classic.yarnpkg.com) | 1.22 | Gestor de paquetes |
| iOS Simulator (Xcode) | — | Emulador nativo de macOS para pruebas |

##  Cómo arrancar el proyecto

```bash
# 1. Instalar dependencias
yarn install

# 2. Lanzar Metro y abrir en el simulador iOS
yarn ios

# Otras opciones
yarn android   # emulador Android
yarn web       # navegador
yarn start     # solo Metro, eliges plataforma
```

Para verificar tipos y lint:

```bash
yarn tsc --noEmit
yarn lint
```

##  Estructura del proyecto

```
app/
├── _layout.tsx                # Stack raíz: (tabs) + measurement/new
├── (tabs)/
│   ├── _layout.tsx            # Tabs: Inicio, Resumen, Perfil
│   ├── index.tsx              # Pantalla Inicio
│   ├── summary.tsx            # Pantalla Resumen (stats + tabla)
│   └── profile.tsx            # Pantalla Perfil (registro/edición)
└── measurement/
    └── new.tsx                # Pantalla Nueva medida (Stack push)

components/
├── LabeledInput.tsx           # ★ Reutilizable: Perfil + Nueva medida
├── MeasurementCard.tsx        # ★ Reutilizable: Inicio + Resumen
└── StatTile.tsx               # Tarjeta de estadística

hooks/
├── useProfile.ts              # ★ Hook personalizado — CRUD de perfil
└── useMeasurements.ts         # ★ Hook personalizado — CRUD + stats de medidas

db/
└── database.ts                # Esquema y acceso SQLite (tablas profile + measurements)

theme/
├── colors.ts                  # Paletas claro / oscuro
└── useThemeColors.ts          # Hook que selecciona paleta según el sistema

types/
└── health.ts                  # Profile, Measurement (unión discriminada), Stats
```

##  Arquitectura

- **Navegación combinada Stack + Tabs**: el Stack raíz envuelve a las Tabs y
  registra la pantalla de Nueva medida como modal apilado. Esto cumple el
  requisito del enunciado de usar las dos APIs de Expo Router a la vez.
- **Capa de datos aislada**: `db/database.ts` es el único módulo que toca
  `expo-sqlite`. Las pantallas siempre acceden a los datos a través de los
  hooks `useProfile` y `useMeasurements`, lo que mantiene la lógica de negocio
  centralizada y facilita los tests.
- **Tipos discriminados**: `Measurement` es una unión discriminada por `type`
  (`'glucose' | 'pressure'`), de modo que TypeScript fuerza a manejar
  correctamente cada caso en cada pantalla.
- **Sistema de tema**: una paleta para modo claro y otra para modo oscuro,
  consumidas en cada componente con un hook que sigue el esquema del sistema.

##  Requisitos del enunciado

| Requisito | Cómo se cumple |
|-----------|----------------|
| Expo Router con **Stack y Tabs** | `app/_layout.tsx` (Stack) → `(tabs)` (Tabs) + `measurement/new` (modal apilado) |
| Al menos **3 interfaces** | Inicio, Resumen, Perfil, Nueva medida (4) |
| **Componente reutilizable** en ≥ 2 vistas | `LabeledInput` (Perfil + Nueva medida); `MeasurementCard` (Inicio + Resumen) |
| **Hook personalizado** | `useProfile` y `useMeasurements` |
| **SQLite** | Tablas `profile` y `measurements` en `health.db` |

## 👥 Equipo

Actividad 2 — Grupo 4

1. David Sebastián Montes Zarama
2. Vanessa Hernández Maldonado
3. Héctor Fabio Gutiérrez Martínez
