import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt"

import { getUserByEmail } from "../repositories/user.repository.js"
import { comparePassword } from "../utils/hash.js";
import { registerUserService } from "../services/sessions.service.js"
import { loginUserService } from '../services/sessions.service.js'
import { env } from "./env.js"

//extrae el JWT desde la cookie "currentUser"
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
                const result = await registerUserService(req.body)

                if (result.error) {
                    return done(null, false, { message: result.error })
                }

                return done(null, result.payload)
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
                const result = await loginUserService({ email, password })

                if (result.error) {
                    return done(null, false, { message: result.error })
                }

                return done(null, result.payload)
            } catch (error) {
                return done(error)
            }
        }
    ))

    //ESTRATEGIA CURRENT (LEE EL JWT DE LA COOKIE)
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