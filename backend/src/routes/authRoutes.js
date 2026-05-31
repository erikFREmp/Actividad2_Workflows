const express = require('express');
const router = express.Router();

const { registrarUsuario, loginUsuario } = require('../controllers/authController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);

router.get('/perfil', verificarToken, (req, res) => {
    res.json({
        mensaje: 'Perfil obtenido correctamente',
        usuario: req.usuario
    });
});

router.get('/admin', verificarToken, verificarRol('Admin'), (req, res) => {
    res.json({
        mensaje: 'Acceso permitido solo para administradores',
        usuario: req.usuario
    });
});

module.exports = router;