import { createEvent, getEventById, updateEvent, getAllEvents } from '../repositories/event.repository.js'

export const createEventService = async (eventData, user) => {
    const newEvent = await createEvent({
        ...eventData,
        organizer: user.id
    })
    return { payload: newEvent }   
}

export const updateEventService = async (getEventById, updateData, user) => {
    const event = await getEventById(eventId)
    
    if(!event) {
        return { error: 'no_encontrado' }
    }

    const isOwner = event.organizer?.toString() === user.id
    const isAdmin = user.role === 'admin'

    if (isOwner && !isAdmin) {
        return { error: 'sin_permiso' }
    }

    const updated = await updateEvent(eventId, updateData)
    return { payload: update }
}

export const listEventsService = async () => {
    const event = await getAllEvents()
    return { payload: event }
}

