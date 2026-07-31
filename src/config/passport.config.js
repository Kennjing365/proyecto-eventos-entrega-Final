import passport, { Passport } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt"

import { registerUser, getUserByEmail } from "../repositories/user.repository.js"
import { hashPassword, comparePassword} from "../utils/hash.js";
import { env } from "./env.js"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

//extraciera el JWT desde la cookie "currentUser"
const cookieExtractor = (req) => {
    if (req && req.cookies) {
        return req.cookies.currentUser
    }
    return null
}

export const initPassport = () => {

    //ESTRATEGIA DE REGISTRO
    passport.use('register', new LocalStrategy(
        { usernameField: 'email', passReqToCallback: true },
        async (req, email, password, done) => {
            try {
                const { first_name, last_name } = req.body

                if (!first_name || !last_name || !email || !password) {
                    return done(null, false, { message: 'campos_faltantes' })
                }
                
                const normalizedEmail = email.trim().toLowerCase()

                if (!EMAIL_REGEX.test(normalizedEmail)) {
                    return done(null, false, { message: 'email_invalido' })
                }

                const existingUser = await getUserByEmail(normalizedEmail)
                if (existingUser) {
                    return done(null, false, { message: 'email_existente' })
                }

                const hashedPassword = await hashPassword(password)
                const newUser = await registerUser({
                    first_name,
                    last_name,
                    email: normalizedEmail,
                    password: hashedPassword
                })

                return done(null, newUser)
            } catch (error) {
                return done(error)
            }
        }
    ))

    // ESTRATEGIA DE LOGIN 
    passport.use('login', new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                if (!email || !password) {
                    return done(null, false, { message: 'credenciales_invalidas' })
                }

                const normalizedEmail = email.trim().toLowerCase()
                const user = await getUserByEmail(normalizedEmail)

                if (!user) {
                    return done(null, false, {message: 'credenciales_invalidas' })
                }

                const isValid = await comparePassword(password, user.password)

                if (!isValid) {
                    return done(null, false, {message: 'credenciales_invalidas' })
                }

                return done(null, user)
            } catch (error) {
                return done(error)
            }
        }
    ))

    //ESTRATEGIA CURRENT ( LEE EL JWT DE LA COOKIE
    passport.use('current', new JwtStrategy(
        {
            jwtFromRequest: cookieExtractor,
            secretOrKey: env.JWT_SECRET
        },
        async (payload, done) => {

            try {
                return done(null, payload)
            } catch (error) {
                return done(error)
            }
        }
    ))
}

export default passport 