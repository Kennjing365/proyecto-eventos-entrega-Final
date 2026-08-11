import { createUser, findUserByEmail, findAllUsersDao } from '../dao/user.dao.js'

export const registerUser = async (userData) => {
    return createUser(userData)
}

export const getUserByEmail = async (email) => {
    return findUserByEmail(email)
}

export const getAllUsers = async () => {
    return findAllUsersDao()
}