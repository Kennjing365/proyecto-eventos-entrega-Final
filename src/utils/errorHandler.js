const errorMap = {
    campos_faltantes: { status: 400, message: 'Faltan campos obligatorios' },
    email_invalido: { status: 400, message: 'El formato del email no es válido' },
    password_invalido: { status: 400, message: 'La contraseña debe tener al menos 8 caracteres' },
    fecha_pasada: { status: 400, message: 'La fecha del evento no puede ser en el pasado' },
    capacity_invalida: { status: 400, message: 'La capacidad debe ser mayor a 0' },
    price_invalido: { status: 400, message: 'El precio no puede ser negativo' },
    status_invalido: { status: 400, message: 'Estado no válido' },
    quantity_invalida: { status: 400, message: 'La cantidad debe ser un número mayor a 0' },
    evento_no_publicado: { status: 400, message: 'El evento no está disponible para inscripciones' },
    evento_no_disponible: { status: 400, message: 'El evento está cancelado o ya finalizó' },
    evento_cancelado: { status: 400, message: 'No se puede modificar un evento cancelado' },
    no_se_puede_publicar: { status: 400, message: 'No se puede publicar un evento finalizado o cancelado' },
    inscripcion_duplicada: { status: 409, message: 'Ya tenés una inscripción activa para este evento' },
    sin_cupo: { status: 409, message: 'No hay cupos suficientes disponibles' },
    ya_cancelado: { status: 400, message: 'Este ticket ya fue cancelado' },
    credenciales_invalidas: { status: 401, message: 'Credenciales inválidas' },
    no_autenticado: { status: 401, message: 'No autenticado' },
    sin_permiso: { status: 403, message: 'No tenés permisos para realizar esta acción' },
    no_encontrado: { status: 404, message: 'Recurso no encontrado' },
    evento_no_encontrado: { status: 404, message: 'Evento no encontrado' },
    ticket_no_encontrado: { status: 404, message: 'Ticket no encontrado' },
    email_existente: { status: 409, message: 'El email ya está registrado' },
    error_interno: { status: 500, message: 'Error interno del servidor' }
}

export const handleError = (res, errorKey) => {
    const known = errorMap[errorKey] || errorMap.error_interno
    return res.status(known.status).json({ status: 'error', message: known.message })
}