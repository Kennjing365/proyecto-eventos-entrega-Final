export const generateReservationCode = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const timestamp = Date.now().toString(36).toUpperCase()
    return `RES-${timestamp}-${random}`
}