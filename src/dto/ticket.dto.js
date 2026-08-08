import { userDTO } from './user.dto.js'
import { eventDTO } from './event.dto.js'

export const ticketDTO = (ticket) => {
    if (!ticket) return null
    return {
        id: ticket._id,
        status: ticket.status,
        quantity: ticket.quantity,
        reservationCode: ticket.reservationCode,
        createdAt: ticket.createdAt,
        cancelledAt: ticket.cancelledAt,
        user: ticket.user && ticket.user.first_name ? userDTO(ticket.user) : ticket.user,
        event: ticket.event && ticket.event.title ? eventDTO(ticket.event) : ticket.event
    }
}