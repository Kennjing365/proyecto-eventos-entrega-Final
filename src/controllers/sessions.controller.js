import { registerUserService, loginUserService } from "../services/sessions.service.js";

//REGISTER-------------------------------
export const register = async (req, res) => {
    try {
        
        const { email, password, first_name, last_name } = req.body

        const result = await registerUserService({ first_name, last_name, email, password })

        if (result.error === 'campos_faltantes' || result.error === 'email_invalido' || result.error === 'password_invalido') {
            return res.status(400).json({ status: 'error', message: result.message})
        }
        if (result.error === 'email_existente') {
            return res.status(409).json({ status: 'error', message: result.message })
        }

        return res.status(201).json({ status: 'success', payload: result.payload })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    } 
}

// LOGIN ---------------------------------
export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const result = await loginUserService({ email, password })

        if (result.error === 'credenciales_invalidas') {
            return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' })
        }

        res.cookie('currentUser', result.token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 3600000,
            secure: process.env.NODE_ENV === 'production'
        })

        return res.status(200).json({ status: 'success', message: 'Login correcto' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    }
}

export const current = async (req, res) => {
    try {
        const { id, email, role } = req.user
        return res.status(200).json({ status: 'success', payload: { id, email, role } })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
    }
}

export const logout = async (req, res) => {
    res.clearCookie('currentUser')
    return res.status(200).json({ status: 'success', message: 'Sesión cerrada' })
}