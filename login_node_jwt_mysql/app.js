const express =  require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

const app = express()

//seteamos el motor de platillas
app.set('view engine', 'ejs')

// seteamos la carpeta public para archivos estaticos
app.use(express.static('public'))

// configurar node para que procese datos enviados desde froms
app.use(express.urlencoded({extended:true}))
app.use(express.json())

// seteamos las variables de entorno
dotenv.config({path: './env/.env'})

// para poder trabajar con la kookies
app.use(cookieParser())

// llamar al router
app.use('/', require('./routes/router'))

app.listen(5000, ()=>
{
    console.log('SERVER UP runnung in http://localhost:5000')
})