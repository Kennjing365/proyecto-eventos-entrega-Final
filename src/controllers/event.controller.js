import { createEventService, updateEventService, listEventsService } from '../services/events.service.js'

export async function getAll(req, res) {
    const result = await listEventsService()
    res.json({ status: 'success', payload: result.payload })
}

export async function createEventController(req, res) {
    try {
        const { title, name, date, place, price } = req.body

        const result = await createEventService(
            { name: name || title, date, place, price },
            req.user
        )

        return res.status(201).json({ status: 'success', payload: result.payload })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    }
}

export async function updateEventController(req, res) {
    try {
        const { id } = req.params

        const result = await updateEventService(id, req.body, req.user)

        if (result.error === 'no_encontrado') {
            return res.status(404).json({ status: 'error', message: 'Evento no encontrado' })
        }

        if (result.error === 'sin_permiso') {
            return res.status(403).json({ status: 'error', message: 'No podés modificar un evento que no te pertenece' })
        }

        return res.status(200).json({ status: 'success', payload: result.payload })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    }
}