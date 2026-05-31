const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');
const {
    crearInstancia,
    listarInstancias,
    obtenerInstanciaPorId,
    eliminarInstancia
} = require('../controllers/instanciaController');

router.post('/', crearInstancia);
router.get('/', listarInstancias);
router.get('/:id', obtenerInstanciaPorId);
router.delete('/:id', verificarToken, verificarRol('Admin'), eliminarInstancia);

module.exports = router;