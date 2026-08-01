import { eventModel } from '../models/event.model.js'

export const createEventDao = async (eventData) => {
    return eventModel.create(eventData)
}

export const findEventById = async (id) => {
    return eventModel.findById(id)
}

export const updateEventDao = async (id, updateData) => {
    return eventModel.findByIdAndUpdate(id, updateData, {new: true })
}

export const findAllEvents = async () => {
    return eventModel.find()
}
