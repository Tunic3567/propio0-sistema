// Cargar variables de entorno
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Cliente = require('./models/Cliente');
const Vendedor = require('./models/Vendedor');
const Administrador = require('./models/Administrador');
const Pago = require('./models/Pago');
const Ruta = require('./models/Ruta');
const Egreso = require('./models/Egreso');
const Ingreso = require('./models/Ingreso');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static('public'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/propio0', {
})
.then(() => console.log('Conectado a MongoDB'))
.catch((err) => console.error('Error conectando a MongoDB:', err));

// Ruta principal - servir la aplicación Vue
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Ruta de prueba de API
app.get('/api', (req, res) => {
  res.json({ mensaje: 'API funcionando correctamente' });
});

// Rutas CRUD para clientes
const router = express.Router();

// Listar todos los clientes
router.get('/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    const clienteIds = clientes.map(c => c._id);
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Crear un nuevo cliente
router.post('/clientes', async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.status(201).json(cliente);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear cliente', detalles: err.message });
  }
});

// Obtener cliente por ID
router.get('/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(400).json({ error: 'ID inválido' });
  }
});

// Actualizar cliente
router.put('/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar cliente' });
  }
});

// Eliminar cliente
router.delete('/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ mensaje: 'Cliente eliminado' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar cliente' });
  }
});

// RUTAS CRUD PARA VENDEDORES
// Listar vendedores por código de vinculación
router.get('/vendedores', async (req, res) => {
  try {
    const { codigoVinculacion } = req.query;
    const filtro = codigoVinculacion ? { codigoVinculacion } : {};
    const vendedores = await Vendedor.find(filtro);
    res.json(vendedores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener vendedores' });
  }
});


// Endpoint para abrir ruta (registrar fecha/hora de apertura)
router.patch('/vendedores/:id/abrir-ruta', async (req, res) => {
  try {
    const vendedor = await Vendedor.findByIdAndUpdate(
      req.params.id,
      { fechaAperturaRuta: new Date() },
      { new: true }
    );
    if (!vendedor) return res.status(404).json({ error: 'Vendedor no encontrado' });
    res.json({ exito: true, fechaAperturaRuta: vendedor.fechaAperturaRuta });
  } catch (err) {
    res.status(400).json({ error: 'Error al abrir ruta', detalles: err.message });
  }
});

// Endpoint de login para admin y vendedor
router.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body;
  try {
    // Buscar primero en administradores
    let user = await Administrador.findOne({ usuario });
    if (user && user.contrasena === contrasena) {
      return res.json({ 
        exito: true, 
        rol: 'administrador', 
        nombre: user.nombre, 
        id: user._id,
        codigoVinculacion: user.codigoVinculacion
      });
    }
    // Buscar en vendedores
    user = await Vendedor.findOne({ usuario });
   if (user && user.contrasena === contrasena) {
    return res.json({ 
      exito: true, 
      rol: 'vendedor', 
      nombre: user.nombre, 
      id: user._id,
      codigoVinculacion: user.codigoVinculacion
    });
  }
    // Si no se encuentra
    res.status(401).json({ exito: false, mensaje: 'Usuario o contraseña incorrectos' });
  } catch (err) {
    res.status(500).json({ exito: false, mensaje: 'Error en el servidor' });
  }
});

// RUTAS CRUD PARA PAGOS
// Crear un nuevo pago
router.post('/pagos', async (req, res) => {
  try {
    const { cliente, tipo, valor, numParcelas } = req.body;
    const clienteDoc = await Cliente.findById(cliente);
    if (!clienteDoc) return res.status(404).json({ error: 'Cliente no encontrado' });
    const valorParcela = clienteDoc.parcela;

    // 1. Contar parcelas atrasadas (pagos tipo 'No pago' y cubierto: false)
    const atrasadas = await Pago.countDocuments({ cliente, tipo: 'No pago', cubierto: { $ne: true } });

    // 2. Sumar todos los pagos de tipo 'Parcela' y 'Abono' (no 'No pago')
    const pagos = await Pago.find({ cliente, tipo: { $in: ['Parcela', 'Abono'] } });
    const totalPagado = pagos.reduce((sum, p) => sum + (p.valor || 0), 0) + (tipo !== 'No pago' ? valor : 0);

    // 3. Calcular cuántas cuotas cubre el total pagado
    const cuotasCubiertas = Math.floor(totalPagado / valorParcela);

    // 4. Si cubre al menos (atrasadas + 1), marca como cubiertos los pagos 'No pago'
    if (tipo !== 'No pago' && cuotasCubiertas >= atrasadas + 1 && atrasadas > 0) {
      // Marca como cubiertos los más antiguos primero
      const pagosAtrasados = await Pago.find({ cliente, tipo: 'No pago', cubierto: { $ne: true } }).sort({ fecha: 1 }).limit(atrasadas);
      const idsAtrasados = pagosAtrasados.map(p => p._id);
      await Pago.updateMany({ _id: { $in: idsAtrasados } }, { $set: { cubierto: true } });
    }

    // 5. Registrar el nuevo pago
    const pago = new Pago(req.body);
    await pago.save();
    res.status(201).json(pago);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear pago', detalles: err.message });
  }
});

// Listar todos los pagos
router.get('/pagos', async (req, res) => {
  try {
    const pagos = await Pago.find();
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

// Endpoint para editar un pago por ID
router.put('/pagos/:id', async (req, res) => {
  try {
    const { tipo, valor } = req.body;
    const pago = await Pago.findByIdAndUpdate(
      req.params.id,
      { tipo, valor },
      { new: true }
    );
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });

    // Recalcular el saldo del cliente sumando todos los pagos de ese cliente
    const pagosCliente = await Pago.find({ cliente: pago.cliente });
    const totalPagado = pagosCliente.reduce((sum, p) => sum + (p.valor || 0), 0);
    // Obtener el cliente
    const cliente = await Cliente.findById(pago.cliente);
    if (cliente) {
      const nuevoSaldo = Math.max(0, (cliente.saldo_inicial || 0) - totalPagado);
      cliente.total = nuevoSaldo;
      await cliente.save();
    }

    res.json(pago);
  } catch (err) {
    res.status(400).json({ error: 'Error al editar pago', detalles: err.message });
  }
});

// Abrir ruta
app.post('/api/rutas/abrir', async (req, res) => {
  const { vendedorId } = req.body;
  // Verifica si ya hay una ruta abierta
  const rutaAbierta = await Ruta.findOne({ vendedor: vendedorId, abierta: true });
  if (rutaAbierta) return res.status(400).json({ msg: 'Ya hay una ruta abierta' });

  const nuevaRuta = new Ruta({ vendedor: vendedorId });
  await nuevaRuta.save();
  res.json(nuevaRuta);
});

// Cerrar ruta
app.post('/api/rutas/cerrar', async (req, res) => {
  const { vendedorId } = req.body;
  const ruta = await Ruta.findOne({ vendedor: vendedorId, abierta: true });
  if (!ruta) return res.status(400).json({ msg: 'No hay ruta abierta' });

  ruta.abierta = false;
  ruta.fechaCierre = new Date();
  await ruta.save();
  res.json(ruta);
});

// Obtener ruta actual
app.get('/api/rutas/actual/:vendedorId', async (req, res) => {
  const { vendedorId } = req.params;
  const ruta = await Ruta.findOne({ vendedor: vendedorId, abierta: true });
  if (!ruta) return res.json(null);
  res.json(ruta);
});

    // Resumen para panel de administrador
router.get('/vendedores/:id/panel', async (req, res) => {
  try {
    console.log('Buscando vendedor con ID:', req.params.id);
    const vendedor = await Vendedor.findById(req.params.id);
    if (!vendedor) {
      console.log('Vendedor no encontrado');
      return res.status(404).json({ error: 'Vendedor no encontrado' });
    }
    console.log('Vendedor encontrado:', vendedor.nombre);

    // Ruta actual o última
    const ruta = await Ruta.findOne({ vendedor: vendedor._id }).sort({ fechaApertura: -1 });
    console.log('Ruta encontrada:', ruta ? 'Sí' : 'No');

    // Clientes asociados al vendedor
    const clientes = await Cliente.find({ vendedor: vendedor._id });
    console.log('Clientes encontrados:', clientes.length);
    const clienteIds = clientes.map(c => c._id);

    // Filtrar clientes activos y por cobrar en la ruta actual
    let clientesPorCobrar = [];
    if (ruta) {
      const fechaLimite = ruta.fechaCierre ? new Date(ruta.fechaCierre) : new Date();
      clientesPorCobrar = clientes.filter(c => {
        return !c.cancelado && new Date(c.createdAt) <= fechaLimite;
      });
    }

    // Filtrar clientes de la ruta actual para nuevos, renovados y cancelados
    let clientesRuta = clientes;
    if (ruta) {
      clientesRuta = clientes.filter(c => {
        const created = new Date(c.createdAt);
        return created >= new Date(ruta.fechaApertura) && created <= (ruta.fechaCierre ? new Date(ruta.fechaCierre) : new Date());
      });
    }

    // Resúmenes de clientes
    const nuevos = clientesRuta.filter(c => !c.renovado && !c.cancelado).length;
    const renovados = clientesRuta.filter(c => c.renovado && !c.cancelado).length;
    const cancelados = clientesRuta.filter(c => c.cancelado).length;
    const totalActivos = clientes.filter(c => !c.cancelado).length;

    // Cálculo del recaudo actual (suma de TODOS los pagos realizados en la ruta actual)
    let recaudado = 0;
    if (ruta) {
      const pagos = await Pago.find({ ruta: ruta._id, tipo: { $in: ['Parcela', 'Abono'] } });
      recaudado = pagos.reduce((sum, p) => sum + (p.valor || 0), 0);
      console.log('Pagos encontrados:', pagos.length, 'Recaudado:', recaudado);
    }

    // Cálculo de ingresos (suma de ingresos NO relacionados con ventas)
    let ingresos = 0;
    if (ruta) {
      const ingresosDocs = await Ingreso.find({ ruta: ruta._id });
      ingresos = ingresosDocs.reduce((sum, i) => sum + (i.valor || 0), 0);
      console.log('Ingresos encontrados:', ingresosDocs.length, 'Total ingresos:', ingresos);
    }

    // Cálculo de ventas (suma de TODAS las ventas realizadas - tanto al contado como a crédito)
    let ventas = 0;
    if (ruta) {
      // Ventas al contado: pagos de tipo 'Parcela' que cubren completamente el saldo inicial
      const pagosParcela = await Pago.find({ ruta: ruta._id, tipo: 'Parcela' });
      const ventasContado = pagosParcela.reduce((sum, p) => sum + (p.valor || 0), 0);
      
      // Ventas a crédito: clientes creados en esta ruta (valor inicial de la deuda)
      const clientesRuta = clientes.filter(c => {
        const created = new Date(c.createdAt);
        return created >= new Date(ruta.fechaApertura) && created <= (ruta.fechaCierre ? new Date(ruta.fechaCierre) : new Date());
      });
      const ventasCredito = clientesRuta.reduce((sum, c) => sum + (c.saldo_inicial || 0), 0);
      
      ventas = ventasContado + ventasCredito;
      console.log('Ventas al contado:', ventasContado, 'Ventas a crédito:', ventasCredito, 'Total ventas:', ventas);
    }

    // Cálculo de retiros (suma de egresos de tipo 'Retiro de caja' en la ruta actual)
    let retiros = 0;
    if (ruta) {
      const retirosDocs = await Egreso.find({ ruta: ruta._id, tipo: 'Retiro de caja' });
      retiros = retirosDocs.reduce((sum, e) => sum + (e.valor || 0), 0);
      console.log('Retiros encontrados:', retirosDocs.length, 'Total retiros:', retiros);
    }

    // Cálculo de egresos (suma de gastos NO retiros en la ruta actual)
    let egresos = 0;
    if (ruta) {
      const egresosDocs = await Egreso.find({ ruta: ruta._id, tipo: { $ne: 'Retiro de caja' } });
      egresos = egresosDocs.reduce((sum, e) => sum + (e.valor || 0), 0);
      console.log('Egresos (sin retiros) encontrados:', egresosDocs.length, 'Total egresos:', egresos);
    }

    // Valores iniciales desde la ruta (editables)
    const cajaInicial = ruta?.cajaInicial || 0;
    const carteraInicial = ruta?.carteraInicial || 0;
    
    // Cálculo del recaudo pretendido del día (suma de parcelas de clientes activos creados ANTES de esta ruta)
    let recaudadoPretendido = 0;
    if (ruta) {
      recaudadoPretendido = clientes
        .filter(c => !c.cancelado && new Date(c.createdAt) < new Date(ruta.fechaApertura))
        .reduce((sum, c) => sum + (c.parcela || 0), 0);
    } else {
      // Si no hay ruta, incluir todos los clientes activos
      recaudadoPretendido = clientes
        .filter(c => !c.cancelado)
        .reduce((sum, c) => sum + (c.parcela || 0), 0);
    }

    // Cálculo de caja final y cartera final según las fórmulas especificadas
    const cajaFinal = cajaInicial + recaudado + ingresos - retiros - egresos;
    const carteraFinal = carteraInicial + ventas - recaudado;
    
    console.log('Resumen de cálculos:');
    console.log('- Caja inicial:', cajaInicial);
    console.log('- Cartera inicial:', carteraInicial);
    console.log('- Recaudo pretendido:', recaudadoPretendido);
    console.log('- Recaudo actual:', recaudado);
    console.log('- Total ingresos:', ingresos);
    console.log('- Ventas:', ventas);
    console.log('- Retiros (Retiro de caja):', retiros);
    console.log('- Egresos (sin retiros):', egresos);
    console.log('- Total gastos (retiros + egresos):', retiros + egresos);
    console.log('- Caja final:', cajaFinal);
    console.log('- Cartera final:', carteraFinal);

    res.json({
      vendedor: {
        nombre: vendedor.nombre,
        pais: vendedor.pais,
        ciudad: vendedor.ciudad
      },
      ruta: ruta ? {
        fechaApertura: ruta.fechaApertura,
        fechaCierre: ruta.fechaCierre,
        abierta: ruta.abierta,
        recaudado,
        cajaInicial,
        carteraInicial,
        recaudadoPretendido,
        ingresos,
        ventas,
        retiros,
        egresos,
        cajaFinal,
        carteraFinal
      } : null,
      clientes: clientesPorCobrar,
      resumen: {
        total: totalActivos,
        nuevos,
        renovados,
        cancelados
      }
    });
  } catch (err) {
    console.error('Error en panel de vendedor:', err);
    res.status(500).json({ error: 'Error al obtener resumen', detalles: err.message, stack: err.stack });
  }
});

// Endpoint para obtener los pagos de la ruta activa de un vendedor
app.get('/api/vendedor/:vendedorId/registros', async (req, res) => {
  try {
    const { vendedorId } = req.params;
    // Buscar la ruta activa
    const rutaActiva = await Ruta.findOne({ vendedor: vendedorId, abierta: true });
    if (!rutaActiva) {
      return res.json([]); // No hay ruta activa, no hay registros
    }
    // Buscar los pagos de esa ruta, incluyendo datos del cliente
    const pagos = await Pago.find({ ruta: rutaActiva._id })
      .populate('cliente', 'nombres apellidos apodo celular direccion_residencial')
      .sort({ fecha: -1 });

    // Formatear la respuesta
    const registros = pagos.map(pago => ({
      _id: pago._id,
      cliente: pago.cliente,
      valor: pago.valor,
      tipo: pago.tipo,
      fecha: pago.fecha,
    }));

    res.json(registros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los registros' });
  }
});

// Endpoint para que el admin vea todas las rutas con datos del vendedor
app.get('/api/admin/rutas', async (req, res) => {
  try {
    const rutas = await Ruta.find()
      .populate('vendedor', 'nombre usuario pais ciudad')
      .sort({ fechaApertura: -1 });
    res.json(rutas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener rutas', detalles: err.message });
  }
});

// Endpoint para que el admin vea los pagos de una ruta específica
app.get('/api/admin/rutas/:rutaId/pagos', async (req, res) => {
  try {
    const { rutaId } = req.params;
    const pagos = await Pago.find({ ruta: rutaId })
      .populate('cliente', 'nombres apellidos apodo celular direccion_residencial')
      .populate({ path: 'ruta', populate: { path: 'vendedor', select: 'nombre' } })
      .sort({ fecha: -1 });
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pagos de la ruta', detalles: err.message });
  }
});

// Endpoint para registrar un egreso
app.post('/api/egresos', async (req, res) => {
  try {
    const egreso = new Egreso(req.body);
    await egreso.save();
    res.status(201).json(egreso);
  } catch (err) {
    res.status(400).json({ error: 'Error al registrar egreso', detalles: err.message });
  }
});

// Endpoint para listar egresos por vendedor y ruta
app.get('/api/egresos', async (req, res) => {
  try {
    const { vendedor, ruta } = req.query;
    const filtro = {};
    if (vendedor) filtro.vendedor = vendedor;
    if (ruta) filtro.ruta = ruta;
    const egresos = await Egreso.find(filtro)
      .sort({ fecha: -1 })
      .populate('vendedor', 'nombre')
      .populate({ path: 'ruta', populate: { path: 'vendedor', select: 'nombre' } });
    res.json(egresos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener egresos', detalles: err.message });
  }
});

// Endpoint para registrar un ingreso
app.post('/api/ingresos', async (req, res) => {
  try {
    const ingreso = new Ingreso(req.body);
    await ingreso.save();
    res.status(201).json(ingreso);
  } catch (err) {
    res.status(400).json({ error: 'Error al registrar ingreso', detalles: err.message });
  }
});

// Endpoint para listar ingresos por vendedor y ruta
app.get('/api/ingresos', async (req, res) => {
  try {
    const { vendedor, ruta, tipo } = req.query;
    const filtro = {};
    if (vendedor) filtro.vendedor = vendedor;
    if (ruta) filtro.ruta = ruta;
    if (tipo) filtro.tipo = tipo;
    const ingresos = await Ingreso.find(filtro)
      .sort({ fecha: -1 })
      .populate('vendedor', 'nombre ciudad')
      .populate({ path: 'ruta', populate: { path: 'vendedor', select: 'nombre' } });
    res.json(ingresos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ingresos', detalles: err.message });
  }
});

// Endpoint para obtener todas las rutas
app.get('/api/rutas', async (req, res) => {
  try {
    const rutas = await Ruta.find()
      .populate('vendedor', 'nombre ciudad')
      .sort({ fechaApertura: -1 });
    res.json(rutas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener rutas', detalles: err.message });
  }
});

// Endpoint para actualizar valores de la ruta por vendedor
app.put('/api/vendedores/:vendedorId/ruta', async (req, res) => {
  try {
    const { vendedorId } = req.params;
    const { cajaInicial, carteraInicial } = req.body;
    
    // Buscar la ruta actual del vendedor
    const ruta = await Ruta.findOne({ vendedor: vendedorId }).sort({ fechaApertura: -1 });
    if (!ruta) return res.status(404).json({ error: 'No se encontró ruta para este vendedor' });
    
    // Actualizar la ruta
    const rutaActualizada = await Ruta.findByIdAndUpdate(
      ruta._id,
      { cajaInicial, carteraInicial },
      { new: true }
    );
    
    res.json(rutaActualizada);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar ruta', detalles: err.message });
  }
});


app.use('/api', router);

// Aquí se agregarán las rutas de la API (clientes, vendedores, pagos, etc.)

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
}); 