# FORJA Gym · Sistema de administracion

Proyecto en Node.js + Express + EJS para administrar los clientes de un gimnasio,
con membresias de **1 mes** a **$500 MXN**.

## Instalacion

```bash
npm install
npm start
```

Abre [http://localhost:3000](http://localhost:3000)

Para desarrollo con recarga automatica (Node 18.11+):

```bash
npm run dev
```

## Estructura

```
gym-app/
├── server.js              # Rutas Express (dashboard, CRUD, membresias)
├── data/
│   ├── db.js              # Logica de datos y calculo de estado de membresia
│   └── clientes.json      # "Base de datos" en JSON (se crea/actualiza sola)
├── views/                  # Plantillas EJS
│   ├── partials/layout.ejs
│   ├── index.ejs           # Panel general
│   ├── clientes/index.ejs  # Listado + CRUD
│   ├── clientes/form.ejs   # Alta / edicion
│   └── membresias/index.ejs
└── public/css/style.css
```

## Funcionalidad

- **Panel general** (`/`): total de clientes, membresias activas/vencidas,
  proximas a vencer e ingresos acumulados.
- **Clientes** (`/clientes`): alta, edicion, eliminacion, busqueda por nombre
  /telefono/correo y filtro por estado. Cada alta cobra automaticamente
  $500 y activa 30 dias de acceso.
- **Renovar**: sea desde el listado de clientes o desde `/membresias`, suma
  otro ciclo de 30 dias (si la membresia sigue activa, se extiende desde su
  fecha de fin; si ya vencio, arranca desde hoy) y registra el pago de $500.
- **Membresias** (`/membresias`): vista dedicada con barra de progreso por
  cliente para ver de un vistazo cuanto tiempo le queda (o cuanto lleva
  vencida), con pestañas para filtrar activas/vencidas.

## Notas tecnicas

- No requiere base de datos externa: los datos se guardan en
  `data/clientes.json`, para que el proyecto corra sin configuracion adicional.
- Si prefieres una base de datos real (SQLite, MySQL, Postgres), la logica
  esta aislada en `data/db.js`: basta con reemplazar sus funciones
  (`listar`, `crear`, `actualizar`, `eliminar`, `renovar`) manteniendo la
  misma firma.
- El costo ($500) y la duracion (30 dias) estan centralizados como
  constantes en `data/db.js` (`COSTO_MEMBRESIA`, `DURACION_DIAS`) por si
  necesitas ajustarlos.
