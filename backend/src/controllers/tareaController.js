const pool = require('../config/db');

const listarTareas = async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT t.id, t.instancia_id, t.nombre, t.descripcion,
                    t.rol_asignado, t.usuario_asignado, t.estado,
                    t.datos_formulario, t.respuesta,
                    t.fecha_creacion, t.fecha_finalizacion,
                    w.nombre AS workflow_nombre
             FROM tareas t
             INNER JOIN instancias i ON t.instancia_id = i.id
             INNER JOIN workflows w ON i.workflow_id = w.id
             ORDER BY t.fecha_creacion DESC`
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al listar tareas'
        });
    }
};

const listarTareasPorRol = async (req, res) => {
    try {
        const { rol } = req.params;

        const resultado = await pool.query(
        `SELECT t.id, t.instancia_id, t.nombre, t.descripcion,
                t.rol_asignado, t.usuario_asignado, t.estado,
                t.datos_formulario, t.respuesta,
                t.fecha_creacion, t.fecha_finalizacion,
                w.nombre AS workflow_nombre,
                (
                    SELECT json_agg(
                        json_build_object(
                            'tarea', t2.nombre,
                            'rol', t2.rol_asignado,
                            'respuesta', t2.respuesta,
                            'fecha_finalizacion', t2.fecha_finalizacion
                        )
                    )
                    FROM tareas t2
                    WHERE t2.instancia_id = t.instancia_id
                    AND t2.id <> t.id
                    AND t2.respuesta IS NOT NULL
                ) AS respuestas_previas
        FROM tareas t
        INNER JOIN instancias i ON t.instancia_id = i.id
        INNER JOIN workflows w ON i.workflow_id = w.id
        WHERE t.rol_asignado = $1
        ORDER BY t.fecha_creacion DESC`,
        [rol]
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al listar tareas por rol'
        });
    }
};

const completarTarea = async (req, res) => {
    try {
        const { id } = req.params;
        const { respuesta } = req.body;

        const tareaResultado = await pool.query(
            'SELECT * FROM tareas WHERE id = $1',
            [id]
        );

        if (tareaResultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Tarea no encontrada'
            });
        }

        const tarea = tareaResultado.rows[0];

        if (tarea.estado === 'Completed') {
            return res.status(400).json({
                mensaje: 'La tarea ya está completada'
            });
        }

        if (tarea.datos_formulario && tarea.datos_formulario.campos) {
            for (const campo of tarea.datos_formulario.campos) {
                if (campo.requerido) {
                    const valor = respuesta ? respuesta[campo.nombre] : null;

                    if (valor === undefined || valor === null || valor === '') {
                        return res.status(400).json({
                            mensaje: `El campo "${campo.etiqueta}" es obligatorio`
                        });
                    }
                }
            }
        }

        const tareaActualizada = await pool.query(
            `UPDATE tareas
             SET estado = $1,
                 respuesta = $2,
                 fecha_finalizacion = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            ['Completed', respuesta || null, id]
        );

        const instanciaResultado = await pool.query(
            'SELECT * FROM instancias WHERE id = $1',
            [tarea.instancia_id]
        );

        const instancia = instanciaResultado.rows[0];

        const workflowResultado = await pool.query(
            'SELECT * FROM workflows WHERE id = $1',
            [instancia.workflow_id]
        );

        const workflow = workflowResultado.rows[0];
        const estructura = workflow.estructura;

        const enlaceSiguiente = estructura.enlaces.find(
            enlace => enlace.origen === instancia.nodo_actual
        );

        if (!enlaceSiguiente) {
            await pool.query(
                `UPDATE instancias
                 SET estado = $1,
                     fecha_fin = CURRENT_TIMESTAMP
                 WHERE id = $2`,
                ['Completed', instancia.id]
            );

            return res.json({
                mensaje: 'Tarea completada. La instancia ha finalizado.',
                tarea: tareaActualizada.rows[0]
            });
        }

        const nodoSiguiente = estructura.nodos.find(
            nodo => nodo.id === enlaceSiguiente.destino
        );

        if (!nodoSiguiente || nodoSiguiente.tipo === 'fin') {
            await pool.query(
                `UPDATE instancias
                 SET estado = $1,
                     nodo_actual = $2,
                     fecha_fin = CURRENT_TIMESTAMP
                 WHERE id = $3`,
                ['Completed', nodoSiguiente ? nodoSiguiente.id : instancia.nodo_actual, instancia.id]
            );

            return res.json({
                mensaje: 'Tarea completada. El workflow ha llegado al nodo fin.',
                tarea: tareaActualizada.rows[0]
            });
        }

        await pool.query(
            `UPDATE instancias
             SET nodo_actual = $1
             WHERE id = $2`,
            [nodoSiguiente.id, instancia.id]
        );

        let nuevaTarea = null;

        if (nodoSiguiente.tipo === 'tarea') {
            const nuevaTareaResultado = await pool.query(
                `INSERT INTO tareas
                 (instancia_id, nombre, descripcion, rol_asignado, estado, datos_formulario)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [
                    instancia.id,
                    nodoSiguiente.nombre,
                    nodoSiguiente.descripcion || '',
                    nodoSiguiente.rolAsignado || 'Usuario',
                    'Pending',
                    nodoSiguiente.formulario || null
                ]
            );

            nuevaTarea = nuevaTareaResultado.rows[0];
        }

        res.json({
            mensaje: 'Tarea completada correctamente',
            tarea: tareaActualizada.rows[0],
            nueva_tarea: nuevaTarea
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al completar tarea'
        });
    }
};

module.exports = {
    listarTareas,
    listarTareasPorRol,
    completarTarea
};