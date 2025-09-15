require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Reserva = require('./models/Reserva');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

// Middleware para verificar token admin
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No autorizado' });

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token inválido' });
    req.admin = decoded;
    next();
  });
};

// Rutas

// Crear reserva
app.post('/api/reservas', async (req, res) => {
  try {
    const { nombre, telefono, fecha, hora } = req.body;
    const nuevaReserva = new Reserva({ nombre, telefono, fecha, hora });
    await nuevaReserva.save();
    res.status(201).json({ message: 'Reserva creada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear reserva' });
  }
});

// Obtener todas las reservas (solo admin)
app.get('/api/reservas', verificarToken, async (req, res) => {
  try {
    const reservas = await Reserva.find().sort({ creadoEn: -1 });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
});

// Eliminar reserva (solo admin)
app.delete('/api/reservas/:id', verificarToken, async (req, res) => {
  try {
    await Reserva.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reserva eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar reserva' });
  }
});

// Admin login (usuario y contraseña fijos para ejemplo)
const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = '$2b$10$7Q9Q6q6q6q6q6q6q6q6q6u6q6q6q6q6q6q6q6q6q6q6q6q6q6q6q'; // bcrypt hash de la contraseña
const bcrypt = require('bcrypt');
bcrypt.hash('$2b$10$7Q9Q6q6q6q6q6q6q6q6q6u6q6q6q6q6q6q6q6q6q6q6q6q6q6q6q', 10).then(console.log);

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USER) return res.status(401).json({ message: 'Usuario incorrecto' });

  const match = await bcrypt.compare(password, ADMIN_PASS_HASH);
  if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});