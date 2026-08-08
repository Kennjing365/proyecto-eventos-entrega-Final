import { userDTO } from '../dto/user.dto.js'
import { generateToken } from "../utils/jwt.js";

export const register = async (req, res) => {
    const user = req.user
    return res.status(201).json({ status: 'success', payload: userDTO(user) })
}

export const login = async (req, res) => {

    const user = req.user

    const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role
    })

    res.cookie('currentUser', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 3600000,
        sucere: process.env.NODE_ENV === 'production'
    })

    return res.status(200).json({ status: 'success', message: 'login correcto' })
}

export const current = async (req, res) => {

    const { id, email, role } = req.user
    return res.status(200).json({ status: 'success', payload: { id, email, role } })
}

export const logout = async (req, res) => {
    res.clearCookie('currentUser')
    return res.status(200).json({ status: 'seccess', message: 'Sesion cerrada' })
}
