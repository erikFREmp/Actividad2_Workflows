const pool = require('../config/db');

const crearInstancia = async (req, res) => {
    try {
        const { workflow_id } = req.body;

        if (!workflow_id) {
            return res.status(400).json({
                mensaje: 'El workflow_id es obligatorio'
            });
        }

        const workflowResultado = await pool.query(
            'SELECT * FROM workflows WHERE id = $1',
            [workflow_id]
        );

        if (workflowResultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Workflow no encontrado'
            });
        }

        const workflow = workflowResultado.rows[0];
        const estructura = workflow.estructura;

        const nodoInicio = estructura.nodos.find(nodo => nodo.tipo === 'inicio');

        if (!nodoInicio) {
            return res.status(400).json({
                mensaje: 'El workflow no tiene nodo de inicio'
            });
        }

        const enlaceInicial = estructura.enlaces.find(
            enlace => enlace.origen === nodoInicio.id
        );

        if (!enlaceInicial) {
            return res.status(400).json({
                mensaje: 'El nodo de inicio no tiene conexión saliente'
            });
        }

        const primerNodo = estructura.nodos.find(
            nodo => nodo.id === enlaceInicial.destino
        );

        if (!primerNodo) {
            return res.status(400).json({
                mensaje: 'No se encontró el primer nodo del workflow'
            });
        }

        const nuevaInstancia = await pool.query(
            `INSERT INTO instancias (workflow_id, estado, nodo_actual)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [workflow_id, 'In Progress', primerNodo.id]
        );

        let tareaCreada = null;

        if (primerNodo.tipo === 'tarea') {
            const nuevaTarea = await pool.query(
                `INSERT INTO tareas 
                 (instancia_id, nombre, descripcion, rol_asignado, estado, datos_formulario)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [
                    nuevaInstancia.rows[0].id,
                    primerNodo.nombre,
                    primerNodo.descripcion || '',
                    primerNodo.rolAsignado || 'Usuario',
                    'Pending',
                    primerNodo.formulario || null
                ]
            );

            tareaCreada = nuevaTarea.rows[0];
        }

        res.status(201).json({
            mensaje: 'Instancia creada correctamente',
            instancia: nuevaInstancia.rows[0],
            tarea: tareaCreada
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al crear instancia'
        });
    }
};

const listarInstancias = async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT i.id, i.workflow_id, w.nombre AS workflow_nombre,
                    i.estado, i.nodo_actual, i.fecha_inicio, i.fecha_fin
             FROM instancias i
             INNER JOIN workflows w ON i.workflow_id = w.id
             ORDER BY i.fecha_inicio DESC`
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al listar instancias'
        });
    }
};

const obtenerInstanciaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const instanciaResultado = await pool.query(
            `SELECT i.id, i.workflow_id, w.nombre AS workflow_nombre,
                    i.estado, i.nodo_actual, i.fecha_inicio, i.fecha_fin
             FROM instancias i
             INNER JOIN workflows w ON i.workflow_id = w.id
             WHERE i.id = $1`,
            [id]
        );

        if (instanciaResultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Instancia no encontrada'
            });
        }

        const tareasResultado = await pool.query(
            'SELECT * FROM tareas WHERE instancia_id = $1 ORDER BY fecha_creacion ASC',
            [id]
        );

        res.json({
            instancia: instanciaResultado.rows[0],
            tareas: tareasResultado.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al obtener instancia'
        });
    }
};
const eliminarInstancia = async (req, res) => {
    try {
        const { id } = req.params;

        const instanciaExiste = await pool.query(
            'SELECT * FROM instancias WHERE id = $1',
            [id]
        );

        if (instanciaExiste.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'La instancia no existe'
            });
        }

        await pool.query('DELETE FROM tareas WHERE instancia_id = $1', [id]);
        await pool.query('DELETE FROM instancias WHERE id = $1', [id]);

        res.json({
            mensaje: 'Instancia eliminada correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al eliminar la instancia'
        });
    }
};
module.exports = {
    crearInstancia,
    listarInstancias,
    obtenerInstanciaPorId,
    eliminarInstancia
};