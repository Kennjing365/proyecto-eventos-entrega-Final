import {
    createTicketService,
    cancelTicketService,
    getMyTicketsService,
    getEventTicketsService
} from '../services/tickets.service.js'

const errorMap = {
    evento_no_encontrado: { status: 404, message: 'Evento no encontrado' },
    evento_no_publicado: { status: 400, message: 'El evento no está disponible para inscripciones' },
    evento_no_disponible: { status: 400, message: 'El evento está cancelado o ya finalizó' },
    quantity_invalida: { status: 400, message: 'La cantidad debe ser un número mayor a 0' },
    inscripcion_duplicada: { status: 400, message: 'Ya tenés una inscripción activa para este evento' },
    sin_cupo: { status: 400, message: 'No hay cupos suficientes disponibles' },
    ticket_no_encontrado: { status: 404, message: 'Ticket no encontrado' },
    sin_permiso: { status: 403, message: 'No tenés permisos para realizar esta acción' },
    ya_cancelado: { status: 400, message: 'Este ticket ya fue cancelado' }
}

const handleError = (res, errorKey) => {
    const known = errorMap[errorKey] || { status: 500, message: 'Error interno del servidor' }
    return res.status(known.status).json({ status: 'error', message: known.message })
}

export const createTicketController = async (req, res) => {
    try {
        const { eid } = req.params
        const { quantity } = req.body

        const result = await createTicketService(eid, quantity, req.user)
        if (result.error) return handleError(res, result.error)

        return res.status(201).json({ status: 'success', payload: result.payload })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    }
}

export const cancelTicketController = async (req, res) => {
    try {
        const { tid } = req.params

        const result = await cancelTicketService(tid, req.user)
        if (result.error) return handleError(res, result.error)

        return res.status(200).json({ status: 'success', payload: result.payload })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    }
}

export const getMyTicketsController = async (req, res) => {
    try {
        const result = await getMyTicketsService(req.user)
        return res.status(200).json({ status: 'success', payload: result.payload })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    }
}

export const getEventTicketsController = async (req, res) => {
    try {
        const { eid } = req.params

        const result = await getEventTicketsService(eid, req.user)
        if (result.error) return handleError(res, result.error)

        return res.status(200).json({ status: 'success', payload: result.payload })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    }
}