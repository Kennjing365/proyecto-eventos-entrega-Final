import { createEventDao, findEventById, updateEventDao, findAllEvents } from '../dao/event.dao.js'

export const createEvent = async (eventData) => {
    return createEventDao(eventData)
}

export const getEventById = async (id) => {
    return findEventById(id)
}

export const updateEvent = async (id, updateData) => {
    return updateEventDao(id, updateData)
}

export const getAllEvents = async () => {
    return findAllEvents()
}
