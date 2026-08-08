import { eventModel } from '../models/event.model.js'

export const createEventDao = async (eventData) => {
    return eventModel.create(eventData)
}

export const findEventById = async (id) => {
    return eventModel.findById(id)
}

export const updateEventDao = async (id, updateData) => {
    return eventModel.findByIdAndUpdate(id, updateData, { new: true })
}

export const findAllEventsDao = async (filter, options) => {
    const { page, limit, sort } = options

    const events = await eventModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)

    const total = await eventModel.countDocuments(filter)

    return { events, total }
}