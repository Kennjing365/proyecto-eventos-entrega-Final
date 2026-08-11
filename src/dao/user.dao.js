import { userModel } from '../models/user.model.js'

export const createUser = async (userData) => {
    return userModel.create(userData)
}

export const findUserByEmail = async (email) => {
    return userModel.findOne({ email })
}

export const findAllUsersDao = async () => {
    return userModel.find()
}