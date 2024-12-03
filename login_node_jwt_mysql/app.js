const express =  require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const path = require('path');

const app = express()

app.use(express.static(path.join(__dirname, 'public')));

//seteamos el motor de platillas
app.set('view engine', 'ejs')

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