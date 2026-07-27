import { createUser, findUserByEmail } from '../dao/user.dao.js'

export const registerUser = async (userData) => {
    return createUser(userData)
}

export const getUserByEmail = async (email) => {
    return findUserByEmail(email)
}