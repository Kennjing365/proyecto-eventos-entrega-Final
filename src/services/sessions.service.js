import { registerUser, getUserByEmail } from '../repositories/user.repository.js'
import { hashPassword, comparePassword } from '../utils/hash.js'
import { generateToken } from '../utils/jwt.js'


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

//REGISTER USER SERVIVES
export const registerUserService = async ({ first_name, last_name, email, password }) => {
    if (!first_name || !last_name || !email || !password) {
        return { error: 'campos_faltantes', message: 'Faltan campos obligatorios' }
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!EMAIL_REGEX.test(normalizedEmail)) {
        return { error: 'email_invalido', message: 'El formato del email no es válido' }
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        return { error: 'password_invalido', message: 'La contraseña debe tener al menos 8 caracteres' }
    }

    const existingUser = await getUserByEmail(normalizedEmail)
    if (existingUser) {
        return { error: 'email_existente', message: 'El email ya está registrado' }
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await registerUser({
        first_name,
        last_name,
        email: normalizedEmail,
        password: hashedPassword
        // role no se recibe del body: se aplica el default "user" del modelo
    })

    return {
        payload: {
            id: newUser._id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            role: newUser.role
        }
    }
}

//LOGIN USER SERVICES

export const loginUserService = async ({email, password}) => {
    if (!email || !password) {
        return { error: 'credenciales_invalidas' }
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await getUserByEmail(normalizedEmail)

    if (!user) {
        return {error: 'credenciales_invalidas'}
    }

    const isvalid = await comparePassword(password, user.password)

    if(!isvalid) {
        return {error: 'credenciaales_invalidas'}
    }

    const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role
    })
    return { token }
}