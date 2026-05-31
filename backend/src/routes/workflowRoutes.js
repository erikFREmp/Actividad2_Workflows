const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');
const {
    crearWorkflow,
    listarWorkflows,
    obtenerWorkflowPorId,
    eliminarWorkflow
} = require('../controllers/workflowController');

router.post('/', crearWorkflow);
router.get('/', listarWorkflows);
router.get('/:id', obtenerWorkflowPorId);
router.delete('/:id', verificarToken, verificarRol('Admin'), eliminarWorkflow);
module.exports = router;