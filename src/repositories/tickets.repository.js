import {
    createTicketDao,
    findTicketByIdDao,
    findActiveTicketByUserAndEventDao,
    countActiveTicketsForEventDao,
    findTicketsByUserDao,
    findTicketsByEventDao,
    updateTicketDao
} from '../dao/tickets.dao.js'

export const createTicket = async (ticketData) => createTicketDao(ticketData)
export const getTicketById = async (id) => findTicketByIdDao(id)
export const getActiveTicketByUserAndEvent = async (userId, eventId) => findActiveTicketByUserAndEventDao(userId, eventId)
export const countActiveTicketsForEvent = async (eventId) => countActiveTicketsForEventDao(eventId)
export const getTicketsByUser = async (userId) => findTicketsByUserDao(userId)
export const getTicketsByEvent = async (eventId) => findTicketsByEventDao(eventId)
export const updateTicket = async (id, updateData) => updateTicketDao(id, updateData)