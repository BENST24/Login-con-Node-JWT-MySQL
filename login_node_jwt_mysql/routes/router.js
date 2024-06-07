const express = require('express')
const router = express.Router()

const connection = require('../database/db')
const authController = require('../controllers/authController')

// router para las vistas
router.get('/', authController.isAuthenticated, (req, res)=>{
    res.render("index", {correo:req.user})
})
router.get('/login', (req, res)=>{
    res.render("login", {alert:false})
})

router.get('/register', (req, res)=>{
    res.render("register", {alert:false})
})

// router para los metodos del controller
router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

module.exports = router