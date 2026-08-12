const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'clientes.json');
const DIA_MS = 24 * 60 * 60 * 1000;

const COSTO_MEMBRESIA = 500; // pesos
const DURACION_DIAS = 30; // "1 mes" = 30 dias

function leer() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '[]', 'utf-8');
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function guardar(clientes) {
  fs.writeFileSync(DB_PATH, JSON.stringify(clientes, null, 2), 'utf-8');
}

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function sumarDias(fechaISO, dias) {
  const f = new Date(fechaISO);
  f.setDate(f.getDate() + dias);
  return f.toISOString().slice(0, 10);
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

// Calcula estado y dias restantes de un cliente
function calcularEstado(cliente) {
  const hoy = hoyISO();
  const fin = cliente.fechaFin;
  const diasRestantes = Math.ceil((new Date(fin) - new Date(hoy)) / DIA_MS);
  const estado = fin >= hoy ? 'activa' : 'vencida';
  return { ...cliente, estado, diasRestantes };
}

function listar() {
  return leer().map(calcularEstado).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

function obtener(id) {
  const cliente = leer().find(c => c.id === id);
  return cliente ? calcularEstado(cliente) : null;
}

function crear(datos) {
  const clientes = leer();
  const inicio = hoyISO();
  const nuevo = {
    id: generarId(),
    nombre: datos.nombre.trim(),
    telefono: (datos.telefono || '').trim(),
    email: (datos.email || '').trim(),
    fechaRegistro: inicio,
    fechaInicio: inicio,
    fechaFin: sumarDias(inicio, DURACION_DIAS),
    pagos: [{ fecha: inicio, monto: COSTO_MEMBRESIA, concepto: 'Alta de membresia (1 mes)' }]
  };
  clientes.push(nuevo);
  guardar(clientes);
  return nuevo;
}

function actualizar(id, datos) {
  const clientes = leer();
  const idx = clientes.findIndex(c => c.id === id);
  if (idx === -1) return null;
  clientes[idx].nombre = datos.nombre.trim();
  clientes[idx].telefono = (datos.telefono || '').trim();
  clientes[idx].email = (datos.email || '').trim();
  guardar(clientes);
  return clientes[idx];
}

function eliminar(id) {
  const clientes = leer().filter(c => c.id !== id);
  guardar(clientes);
}

// Renovar membresia: si sigue activa, la extiende desde fechaFin; si esta vencida, arranca desde hoy
function renovar(id) {
  const clientes = leer();
  const idx = clientes.findIndex(c => c.id === id);
  if (idx === -1) return null;
  const cliente = clientes[idx];
  const hoy = hoyISO();
  const base = cliente.fechaFin >= hoy ? cliente.fechaFin : hoy;
  cliente.fechaInicio = base === hoy ? hoy : cliente.fechaInicio;
  cliente.fechaFin = sumarDias(base, DURACION_DIAS);
  cliente.pagos = cliente.pagos || [];
  cliente.pagos.push({ fecha: hoy, monto: COSTO_MEMBRESIA, concepto: 'Renovacion de membresia (1 mes)' });
  guardar(clientes);
  return cliente;
}

function resumen() {
  const clientes = listar();
  const activas = clientes.filter(c => c.estado === 'activa');
  const vencidas = clientes.filter(c => c.estado === 'vencida');
  const ingresos = clientes.reduce((acc, c) => acc + (c.pagos || []).reduce((s, p) => s + p.monto, 0), 0);
  return {
    total: clientes.length,
    activas: activas.length,
    vencidas: vencidas.length,
    ingresos,
    porVencerPronto: activas.filter(c => c.diasRestantes <= 5).length
  };
}

module.exports = {
  COSTO_MEMBRESIA,
  DURACION_DIAS,
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  renovar,
  resumen,
  hoyISO
};
