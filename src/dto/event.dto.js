import { userDTO } from './user.dto.js'

export const eventDTO = (event) => {
    if (!event) return null
    return {
        id: event._id,
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.date,
        location: event.location,
        capacity: event.capacity,
        price: event.price,
        status:event.status,

        organizer: event.organizer && event.organizer.first_name
        ? userDTO(event.organizer)
        : event.organizer
    }
}