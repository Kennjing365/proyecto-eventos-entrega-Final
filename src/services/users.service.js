import { getAllUsers } from '../repositories/user.repository.js'

export const getAllUsersService = async () => {
    const users = await getAllUsers()
    return { payload: users }
}