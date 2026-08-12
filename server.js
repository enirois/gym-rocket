const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const db = require('./data/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'partials/layout');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Dashboard ----------
app.get('/', (req, res) => {
  const resumen = db.resumen();
  const recientes = db.listar().slice(0, 5);
  res.render('index', { titulo: 'Panel general', activeNav: 'inicio', resumen, recientes });
});

// ---------- CRUD de clientes ----------
app.get('/clientes', (req, res) => {
  const { q, estado } = req.query;
  let clientes = db.listar();

  if (q) {
    const query = q.toLowerCase();
    clientes = clientes.filter(c =>
      c.nombre.toLowerCase().includes(query) ||
      c.telefono.includes(query) ||
      c.email.toLowerCase().includes(query)
    );
  }
  if (estado === 'activa' || estado === 'vencida') {
    clientes = clientes.filter(c => c.estado === estado);
  }

  res.render('clientes/index', {
    titulo: 'Clientes',
    activeNav: 'clientes',
    clientes,
    q: q || '',
    estado: estado || '',
    costo: db.COSTO_MEMBRESIA
  });
});

app.get('/clientes/nuevo', (req, res) => {
  res.render('clientes/form', {
    titulo: 'Nuevo cliente',
    activeNav: 'clientes',
    cliente: null,
    costo: db.COSTO_MEMBRESIA,
    duracion: db.DURACION_DIAS
  });
});

app.post('/clientes', (req, res) => {
  const { nombre, telefono, email } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.redirect('/clientes/nuevo');
  }
  db.crear({ nombre, telefono, email });
  res.redirect('/clientes');
});

app.get('/clientes/:id/editar', (req, res) => {
  const cliente = db.obtener(req.params.id);
  if (!cliente) return res.redirect('/clientes');
  res.render('clientes/form', {
    titulo: 'Editar cliente',
    activeNav: 'clientes',
    cliente,
    costo: db.COSTO_MEMBRESIA,
    duracion: db.DURACION_DIAS
  });
});

app.put('/clientes/:id', (req, res) => {
  const { nombre, telefono, email } = req.body;
  db.actualizar(req.params.id, { nombre, telefono, email });
  res.redirect('/clientes');
});

app.delete('/clientes/:id', (req, res) => {
  db.eliminar(req.params.id);
  res.redirect('/clientes');
});

app.post('/clientes/:id/renovar', (req, res) => {
  db.renovar(req.params.id);
  res.redirect(req.get('referer') || '/clientes');
});

// ---------- Membresias (activas / vencidas) ----------
app.get('/membresias', (req, res) => {
  const filtro = req.query.estado || 'todas';
  let clientes = db.listar();
  if (filtro === 'activa' || filtro === 'vencida') {
    clientes = clientes.filter(c => c.estado === filtro);
  }
  const resumen = db.resumen();
  res.render('membresias/index', {
    titulo: 'Membresias',
    activeNav: 'membresias',
    clientes,
    filtro,
    resumen
  });
});

app.use((req, res) => {
  res.status(404).render('404', { titulo: 'No encontrado', activeNav: '' });
});

app.listen(PORT, () => {
  console.log(`Gym CRM corriendo en http://localhost:${PORT}`);
});
