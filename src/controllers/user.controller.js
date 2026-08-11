import { getAllUsersService } from '../services/users.service.js'
import { userDTO } from '../dto/user.dto.js'

export async function getAllUser(req, res) {
    try {
        const result = await getAllUsersService()
        return res.status(200).json({ status: 'success', payload: result.payload.map(userDTO) })
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    }
}