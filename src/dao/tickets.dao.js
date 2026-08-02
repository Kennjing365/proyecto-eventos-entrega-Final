import { ticketModel } from '../models/ticket.model.js'

export const createTicketDao = async (ticketData) => {
    return ticketModel.create(ticketData)
}

export const findTicketByIdDao = async (id) => {
    return ticketModel.findById(id)
}

export const findActiveTicketByUserAndEventDao = async (userId, eventId) => {
    return ticketModel.findOne({ user: userId, event: eventId, status: { $ne: 'cancelled'} })
}

export const countActiveTicketsForEventDao = async (eventId) => {
    const result = await ticketModel.aggregate([
        { $match: { event: eventId, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
    ])
    return result[0]?.total || 0
}

export const findTicketsByUserDao = async (userId) => {
    return ticketModel.find({ user: userId }).populate('event', 'title date location')
}

export const findTicketsByEventDao = async (eventId) => {
    return ticketModel.find({ event: eventId }).populate('user', 'first_name last_name email')
}

export const updateTicketDao = async (id, updateData) => {
    return ticketModel.findByIdAndUpdate(id, updateData, { new: true })
}
