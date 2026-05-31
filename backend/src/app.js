const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const instanciaRoutes = require('./routes/instanciaRoutes');
const tareaRoutes = require('./routes/tareaRoutes');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/instancias', instanciaRoutes);
app.use('/api/tareas', tareaRoutes);
app.get('/api/test', (req, res) => {
    res.json({
        mensaje: 'Backend funcionando correctamente'
    });
});

app.get('/api/test-db', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT NOW()');
        res.json({
            mensaje: 'Conexión con PostgreSQL correcta',
            fecha: resultado.rows[0].now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error conectando con PostgreSQL'
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});