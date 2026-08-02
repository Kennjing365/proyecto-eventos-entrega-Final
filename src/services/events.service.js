import { createEvent, getEventById, updateEvent, listEvents } from '../repositories/event.repository.js'

const VALID_STATUSES = ['draft', 'published', 'cancelled', 'finished']

export const createEventService = async (eventData, user) => {
    const { title, description, category, date, location, capacity, price } = eventData

    if (!title || !description || !category || !location) {
        return { error: 'campos_faltantes' }
    }

    if (!date || new Date(date) < new Date()) {
        return { error: 'fecha_pasada' }
    }

    if (capacity === undefined || capacity <= 0) {
        return { error: 'capacity_invalida' }
    }

    if (price === undefined || price < 0) {
        return { error: 'price_invalido' }
    }

    const newEvent = await createEvent({
        title,
        description,
        category,
        date,
        location,
        capacity,
        price,
        organizer: user.id
    })

    return { payload: newEvent }
}

export const getEventByIdService = async (id) => {
    const event = await getEventById(id)
    if (!event) {
        return { error: 'no_encontrado' }
    }
    return { payload: event }
}

export const updateEventService = async (id, updateData, user) => {
    const event = await getEventById(id)

    if (!event) {
        return { error: 'no_encontrado' }
    }

    const isOwner = event.organizer.toString() === user.id
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
        return { error: 'sin_permiso' }
    }

    if (event.status === 'cancelled') {
        return { error: 'evento_cancelado' }
    }

    if (updateData.capacity !== undefined && updateData.capacity <= 0) {
        return { error: 'capacity_invalida' }
    }

    if (updateData.price !== undefined && updateData.price < 0) {
        return { error: 'price_invalido' }
    }

    if (updateData.date && new Date(updateData.date) < new Date()) {
        return { error: 'fecha_pasada' }
    }

    // El organizer nunca se puede pisar desde el body
    delete updateData.organizer

    const updated = await updateEvent(id, updateData)
    return { payload: updated }
}

export const updateEventStatusService = async (id, newStatus, user) => {
    if (!VALID_STATUSES.includes(newStatus)) {
        return { error: 'status_invalido' }
    }

    const event = await getEventById(id)

    if (!event) {
        return { error: 'no_encontrado' }
    }

    const isOwner = event.organizer.toString() === user.id
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
        return { error: 'sin_permiso' }
    }

    if (event.status === 'cancelled') {
        return { error: 'evento_cancelado' }
    }

    if (newStatus === 'published' && ['finished', 'cancelled'].includes(event.status)) {
        return { error: 'no_se_puede_publicar' }
    }

    const updated = await updateEvent(id, { status: newStatus })
    return { payload: updated }
}

export const listEventsService = async (query) => {
    const { status, category, location, dateFrom, dateTo, page = 1, limit = 10, sort } = query

    const filter = {}
    if (status) filter.status = status
    if (category) filter.category = category
    if (location) filter.location = location
    if (dateFrom || dateTo) {
        filter.date = {}
        if (dateFrom) filter.date.$gte = new Date(dateFrom)
        if (dateTo) filter.date.$lte = new Date(dateTo)
    }

    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)

    const sortOption = sort ? sort : { date: 1 }

    const { events, total } = await listEvents(filter, {
        page: pageNumber,
        limit: limitNumber,
        sort: sortOption
    })

    return {
        payload: {
            data: events,
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages: Math.ceil(total / limitNumber)
        }
    }
}