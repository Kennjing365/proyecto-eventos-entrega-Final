import {
    createEventService,
    getEventByIdService,
    updateEventService,
    updateEventStatusService,
    listEventsService
} from '../services/events.service.js'
import { eventDTO } from '../dto/event.dto.js'
import { handleError } from '../utils/errorHandler.js'

export const createEventController = async (req, res) => {
    try {
        const result = await createEventService(req.body, req.user)
        if (result.error) return handleError(res, result.error)
        return res.status(201).json({ status: 'success', payload: eventDTO(result.payload) })
    } catch (error) {
        return handleError(res, 'error_interno')
    }
}

export const getAllEventsController = async (req, res) => {
    try {
        const result = await listEventsService(req.query)
        return res.status(200).json({
            status: 'success',
            data: result.payload.data.map(eventDTO),
            page: result.payload.page,
            limit: result.payload.limit,
            total: result.payload.total,
            totalPages: result.payload.totalPages
        })
    } catch (error) {
        console.log('ERROR EN GET EVENTS:', error)
        return handleError(res, 'error_interno')
    }
}

export const getEventByIdController = async (req, res) => {
    try {
        const result = await getEventByIdService(req.params.id)
        if (result.error) return handleError(res, result.error)
        return res.status(200).json({ status: 'success', payload: eventDTO(result.payload) })
    } catch (error) {
        return handleError(res, 'error_interno')
    }
}

export const updateEventController = async (req, res) => {
    try {
        const result = await updateEventService(req.params.id, req.body, req.user)
        if (result.error) return handleError(res, result.error)
        return res.status(200).json({ status: 'success', payload: eventDTO(result.payload) })
    } catch (error) {
        return handleError(res, 'error_interno')
    }
}

export const updateEventStatusController = async (req, res) => {
    try {
        const { status } = req.body
        const result = await updateEventStatusService(req.params.id, status, req.user)
        if (result.error) return handleError(res, result.error)
        return res.status(200).json({ status: 'success', payload: eventDTO(result.payload) })
    } catch (error) {
        return handleError(res, 'error_interno')
    }
}