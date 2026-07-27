import { registerUserService } from "../services/sessions.service.js";

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