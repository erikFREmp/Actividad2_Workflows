const pool = require('../config/db');
const crearWorkflow = async (req, res) => {
    try {
        const { nombre, descripcion, estructura, creado_por } = req.body;

        if (!nombre || !estructura) {
            return res.status(400).json({
                mensaje: 'El nombre y la estructura del workflow son obligatorios'
            });
        }

        const nuevoWorkflow = await pool.query(
            `INSERT INTO workflows (nombre, descripcion, estructura, creado_por)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [nombre, descripcion, estructura, creado_por || null]
        );

        res.status(201).json({
            mensaje: 'Workflow creado correctamente',
            workflow: nuevoWorkflow.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al crear workflow'
        });
    }
};

const listarWorkflows = async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT w.id, w.nombre, w.descripcion, w.estructura, w.fecha_creacion,
                    u.nombre AS creado_por_nombre
             FROM workflows w
             LEFT JOIN usuarios u ON w.creado_por = u.id
             ORDER BY w.fecha_creacion DESC`
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al listar workflows'
        });
    }
};

const obtenerWorkflowPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            'SELECT * FROM workflows WHERE id = $1',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Workflow no encontrado'
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al obtener workflow'
        });
    }
};

const eliminarWorkflow = async (req, res) => {
    try {
        const { id } = req.params;

        const workflowExiste = await pool.query(
            'SELECT * FROM workflows WHERE id = $1',
            [id]
        );

        if (workflowExiste.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'El workflow no existe'
            });
        }

        const instancias = await pool.query(
            'SELECT id FROM instancias WHERE workflow_id = $1',
            [id]
        );

        for (const instancia of instancias.rows) {
            await pool.query(
                'DELETE FROM tareas WHERE instancia_id = $1',
                [instancia.id]
            );
        }

        await pool.query(
            'DELETE FROM instancias WHERE workflow_id = $1',
            [id]
        );

        await pool.query(
            'DELETE FROM workflows WHERE id = $1',
            [id]
        );

        res.json({
            mensaje: 'Workflow eliminado correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al eliminar el workflow'
        });
    }
};

module.exports = {
    crearWorkflow,
    listarWorkflows,
    obtenerWorkflowPorId,
    eliminarWorkflow
};