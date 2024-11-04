const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const connection = require('../database/db');
const { promisify } = require('util');
// const { error } = require('console'); 
const { query } = require('./utils');

exports.infoArtist = async (req, res) => {
    if (!req.artist || !req.artist.id) {
        return res.status(400).send('El usuario no está autenticado correctamente');
    }

    try {
        const artistId = req.artist.id;

        // Obtener solo la información necesaria del artista
        const artistInfo = await query('SELECT user, description FROM artists WHERE id = ?', [artistId]);

        // Renderizar la vista index con datos
        res.render('index', {
            correo: artistInfo[0] || {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
};

exports.register = async (req, res) => {
    res.header('Cache-Control', 'no-store');
    try {
        const correo = req.body.correo;
        const user = req.body.user;
        const pass = req.body.pass;
        let passHash = await bcryptjs.hash(pass, 8);

        connection.query('SELECT * FROM artists WHERE correo = ?', [correo], async (error, results) => {
            if (error) {
                console.log(error);
            } else if (results.length == 0) {
                connection.query('INSERT INTO artists SET ?', { user: user, correo: correo, password: passHash }, (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        res.redirect('/login');
                    }
                });
            } else {
                res.render('register', {
                    alert: true,
                    alertTitle: 'Advertencia',
                    alertMessage: 'El correo ingresado no está disponible',
                    alertIcon: 'info',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'register'
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
};

exports.login = async (req, res) => {
    res.header('Cache-Control', 'no-store');
    try {
        const correo = req.body.correo;
        const pass = req.body.pass;

        if (!correo || !pass) {
            res.render('login', {
                alert: true,
                alertTitle: 'Advertencia',
                alertMessage: 'Ingrese un correo y/o contraseña',
                alertIcon: 'Info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            });
        } else {
            connection.query('SELECT * FROM artists WHERE correo = ?', [correo], async (error, results) => {
                if (error) {
                    console.log(error);
                } else if (results.length === 0 || !(await bcryptjs.compare(pass, results[0].password))) {
                    res.render('login', {
                        alert: true,
                        alertTitle: 'Error',
                        alertMessage: 'Correo y/o Contraseña incorrectos',
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    });
                } else {
                    const id = results[0].id;
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    });

                    const cookiesOptions = {
                        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    };

                    res.cookie('jwt', token, cookiesOptions);
                    res.render('login', {
                        alert: true,
                        alertTitle: 'Conexión exitosa',
                        alertMessage: '¡LOGIN CORRECTO!',
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 800,
                        ruta: ''
                    });
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
};

exports.isAuthenticated = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // Decodificar el token JWT
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);

            console.log('Token decodificado:', decodificada);

            // Verificar que la decodificación tenga el ID del usuario
            if (!decodificada.id) {
                return res.status(400).send('Token inválido: No contiene ID de usuario.');
            }

            // Consultar el artista por el ID
            connection.query('SELECT * FROM artists WHERE id = ?', [decodificada.id], (error, results) => {
                if (error) {
                    console.error('Error en la consulta SQL:', error);
                    return res.status(500).send('Error en el servidor al consultar la base de datos');
                }

                console.log('Resultados de la consulta:', results);

                // Verificar si se encontraron resultados
                if (!results || results.length === 0) {
                    return res.status(401).send('Usuario no encontrado');
                }

                // Asignar el usuario a req.artist
                req.artist = results[0];
                return next();
            });
        } catch (error) {
            console.log('Error al verificar JWT:', error);
            return res.status(401).send('Token inválido o expirado');
        }
    } else {
        res.redirect('/login');
    }
};

exports.logout = (req, res) => {
    res.clearCookie('jwt');
    res.header('Cache-Control', 'no-store');
    return res.redirect('/');
};