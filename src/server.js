import app from './app.js'
import { connectDB } from './config/dataBase.js'
import { env } from './config/env.js'

app.listen(env.PORT, () => {
    connectDB().then(() => {
        console.log('ok db')
    })
    console.log(`servidor escuchando en el puerto ${env.PORT}`)
})