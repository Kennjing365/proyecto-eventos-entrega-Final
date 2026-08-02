import {
    createEventService,
    getEventByIdService,
    updateEventService,
    updateEventStatusService,
    listEventsService
} from '../services/events.service.js'

const errorMap = {
    campos_faltantes: { status: 400, message: 'Faltan campos obligatorios' },
    fecha_pasada: { status: 400, message: 'La fecha del evento no puede ser en el pasado' },
    capacity_invalida: { status: 400, message: 'La capacidad debe ser mayor a 0' },
    price_invalido: { status: 400, message: 'El precio no puede ser negativo' },
    status_invalido: { status: 400, message: 'Estado no válido' },
    no_encontrado: { status: 404, message: 'Evento no encontrado' },
    sin_permiso: { status: 403, message: 'No tenés permisos sobre este evento' },
    evento_cancelado: { status: 400, message: 'No se puede modificar un evento cancelado' },
    no_se_puede_publicar: { status: 400, message: 'No se puede publicar un evento finalizado o cancelado' }
}

const handleError = (res, errorKey) => {
    const known = errorMap[errorKey] || { status: 500, message: 'Error interno del servidor' }
    return res.status(known.status).json({ status: 'error', message: known.message })
}

export const createEventController = async (req, res) => {
    try {
        const result = await createEventService(req.body, req.user)
        if (result.error) return handleError(res, result.error)
        return res.status(201).json({ status: 'success', payload: result.payload })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    }
}

export const getAllEventsController = async (req, res) => {
    try {
        const result = await listEventsService(req.query)
        return res.status(200).json({ status: 'success', ...result.payload })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    }
}

export const getEventByIdController = async (req, res) => {
    try {
        const result = await getEventByIdService(req.params.id)
        if (result.error) return handleError(res, result.error)
        return res.status(200).json({ status: 'success', payload: result.payload })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    }
}

export const updateEventController = async (req, res) => {
    try {
        const result = await updateEventService(req.params.id, req.body, req.user)
        if (result.error) return handleError(res, result.error)
        return res.status(200).json({ status: 'success', payload: result.payload })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    }
}

export const updateEventStatusController = async (req, res) => {
    try {
        const { status } = req.body
        const result = await updateEventStatusService(req.params.id, status, req.user)
        if (result.error) return handleError(res, result.error)
        return res.status(200).json({ status: 'success', payload: result.payload })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    }
}