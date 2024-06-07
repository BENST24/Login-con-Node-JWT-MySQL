const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const connection = require('../database/db')
const {promisify} = require('util')
const { error } = require('console')

exports.register = async (req, res)=>{    
    try {
        const correo = req.body.correo
        const user = req.body.user
        const pass = req.body.pass
        let passHash = await bcryptjs.hash(pass, 8)
        connection.query('SELECT * FROM Users WHERE correo = ?', [correo], async(error, results)=>{
            if (error) {
                console.log(error);
            }else if(results.length == 0){
                connection.query('INSERT INTO Users SET ?', {user:user, correo:correo, password:passHash}, (error, results)=>{
                if (error){console.log(error)}
                res.redirect('/')
                })
            }else{
                res.render('register', {
                    alert:true,
                    alertTitle: "Advertencia",
                    alertMessage: "El correo ingresado no esta disponible",
                    alertIcon:'Info',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'register'
                })
            }
        }) 
    }catch (error) {
        console.log(error)
    }
}

exports.login = async (req, res)=>{
    try {
        const correo = req.body.correo
        const pass = req.body.pass

        if (!correo || !pass) {
            res.render('login', {
                alert:true,
                alertTitle: "Advertencia",
                alertMessage: "Ingrese un correo y/o contraseña",
                alertIcon:'Info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            })
        }else{
            connection.query('SELECT * FROM Users WHERE correo = ?', [correo], async(error, results)=>{
                if( results.length == 0 || ! (await bcryptjs.compare(pass, results[0].password)) ){
                res.render('login', {
                alert:true,
                alertTitle: "Error",
                alertMessage: "Correo y/o Contraseña incorectos",
                alertIcon:'error',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
                })
                }else{
                    // inicio de sesion OK
                    const id = results[0].id
                    const token = jwt.sign({id:id}, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    })
                    console.log("TOKEN: "+token+" para el correo: "+correo)

                    const cookiesOptions = {
                        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
                        httpOnly: true
                   }
                   res.cookie('jwt', token, cookiesOptions)
                   res.render('login', {
                        alert: true,
                        alertTitle: "Conexión exitosa",
                        alertMessage: "¡LOGIN CORRECTO!",
                        alertIcon:'success',
                        showConfirmButton: false,
                        timer: 800,
                        ruta: ''
                   })
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

exports.isAuthenticated = async (req, res, next)=>{
    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            connection.query('SELECT * FROM Users WHERE id = ?', [decodificada.id], (error, results)=>{
                if(!results){return next()}
                req.user = results[0]
                return next()
            })
        } catch (error) {
            console.log(error)
            return next()
        }
    }else{
        res.redirect('/login')
    }
}

exports.logout = (req, res)=>{
    res.clearCookie('jwt')
    return res.redirect('/')
}