const express = require('express');
const router = express.Router();

const {
    listarTareas,
    listarTareasPorRol,
    completarTarea
} = require('../controllers/tareaController');

router.get('/', listarTareas);
router.get('/rol/:rol', listarTareasPorRol);
router.put('/:id/completar', completarTarea);

module.exports = router;