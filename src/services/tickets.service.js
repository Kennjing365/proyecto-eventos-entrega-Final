import {
    createTicket,
    getTicketById,
    getActiveTicketByUserAndEvent,
    countActiveTicketsForEvent,
    getTicketsByUser,
    getTicketsByEvent,
    updateTicket
} from '../repositories/tickets.repository.js'
import { getEventById } from '../repositories/event.repository.js'
import { generateReservationCode } from '../utils/reservationCode.js'
import { sendConfirmationEmail } from '../utils/mailer.js'

export const createTicketService = async (eventId, quantity, user) => {
    const event = await getEventById(eventId)

    if (!event) {
        return { error: 'evento_no_encontrado'}
    }
    if (event.status !== 'published') {
        return { error: 'evento_no_publicado'}
    }
    if (event.status === 'cancelled' || event.status === 'finished') {
        return { error: 'evento_no_disponible' }
    }
    if (!quantity || quantity <= 0) {
        return { error: 'quantity_invalida' }
    }

    const existingTicket = await getActiveTicketByUserAndEvent(user.id, eventId)
    if (existingTicket) {
        return { error: 'inscripcion_duplicada' }
    }

    const occupiedSeats = await countActiveTicketsForEvent(event._id)
    const availableSeats = event.capacity - occupiedSeats

    if (availableSeats < quantity) {
        return { error: 'sin_cupo', availableSeats }
    }

    const reservationCode = generateReservationCode()

    const newTicket = await createTicket({
        user: user.id,
        event: event._id,
        quantity,
        status: 'confirmed',
        reservationCode
    })

    //envia email (no bloqueante si falla)
    await sendConfirmationEmail({
        to: user.email,
        eventTitle: event.title,
        reservationCode,
        quantity
    }) 

    return { payloada: newTicket }

}

export const cancelTicketService = async (ticketId, user) => {
    const ticket = await getTicketById(ticketId)

    if (!ticket) {
        return { error: 'ticket_no_encontrado' }
    }

    const isOwner = ticket.user.toString() === user.id
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
        return { error: 'sin_permiso' }
    }

    if (ticket.status === 'cancelled') {
        return { error: 'ya_cancelado' }
    }

    const updated = await updateTicket(ticketId, {
        status: 'cancelled',
        cancelledAt: new Date()
    })

    return { payload: updated }
}

export const getMyTicketsService = async (user) => {
    const tickets = await getTicketsByUser(user.id)
    return { payload: tickets }
}

export const getEventTicketsService = async (eventId, user) => {
    const event = await getEventById(eventId)

    if (!event) {
        return { error: 'evento_no_encontrado' }
    }

    const isOwner = event.organizer.toString() === user.id
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
        return { error: 'sin_permiso' }
    }

    const tickets = await getTicketsByEvent(eventId)
    return { payload: tickets }
}