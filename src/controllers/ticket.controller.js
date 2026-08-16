import {
    createTicketService,
    cancelTicketService,
    getMyTicketsService,
    getEventTicketsService
} from '../services/tickets.service.js'
import { ticketDTO } from '../dto/ticket.dto.js'
import { handleError } from '../utils/errorHandler.js'

export const createTicketController = async (req, res) => {
    try {
        const { eid } = req.params
        const { quantity } = req.body
        const result = await createTicketService(eid, quantity, req.user)
        if (result.error) return handleError(res, result.error)
        return res.status(201).json({ status: 'success', payload: ticketDTO(result.payload) })
    } catch (error) {
        return handleError(res, 'error_interno')
    }
}

export const cancelTicketController = async (req, res) => {
    try {
        const { tid } = req.params
        const result = await cancelTicketService(tid, req.user)
        if (result.error) return handleError(res, result.error)
        return res.status(200).json({ status: 'success', payload: ticketDTO(result.payload) })
    } catch (error) {
        return handleError(res, 'error_interno')
    }
}

export const getMyTicketsController = async (req, res) => {
    try {
        const result = await getMyTicketsService(req.user)
        return res.status(200).json({ status: 'success', payload: result.payload.map(ticketDTO) })
    } catch (error) {
        return handleError(res, 'error_interno')
    }
}

export const getEventTicketsController = async (req, res) => {
    try {
        const { eid } = req.params
        const result = await getEventTicketsService(eid, req.user)
        if (result.error) return handleError(res, result.error)
        return res.status(200).json({ status: 'success', payload: result.payload.map(ticketDTO) })
    } catch (error) {
        return handleError(res, 'error_interno')
    }
}