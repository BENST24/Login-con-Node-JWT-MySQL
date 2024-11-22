const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const albumsController = require('../controllers/albumsController');
const singlesController = require('../controllers/singlesController');
const tracksController = require('../controllers/tracksController');

// Ruta para el index
router.get('/', authController.isAuthenticated, authController.infoArtist);

router.get('/index', (req, res) => {
    const correo = req.session?.user?.correo; // Asegúrate de obtener la información de `correo` de la sesión si está disponible
    res.render('index', { correo });
});

// Rutas para login y registro
router.get('/login', (req, res) => {
    res.render('login', { alert: false });
});
router.get('/register', (req, res) => {
    res.render('register', { alert: false });
});

// router para los métodos del controller
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Rutas para Albums
router.get('/albums', authController.isAuthenticated, albumsController.albums);
router.post('/albums/create', authController.isAuthenticated, albumsController.createAlbum);
router.post('/albums/update', authController.isAuthenticated, albumsController.updateAlbum);
router.get('/albums/delete/:id', authController.isAuthenticated, albumsController.deleteAlbum);

// Ruta para obtener las secillos
router.get('/singles', authController.isAuthenticated, singlesController.singles)
router.post('/singles/create', authController.isAuthenticated, singlesController.createSingle)
router.post('/singles/update', authController.isAuthenticated, singlesController.updateSingle)
router.get('/singles/delete/:id', authController.isAuthenticated, singlesController.deleteSingle)

// Ruta para obtener las pistas
router.get('/tracks', authController.isAuthenticated, tracksController.tracks);
router.post('/tracks/create', authController.isAuthenticated, tracksController.createTrack);
router.post('/tracks/update', authController.isAuthenticated, tracksController.updateTrack);
router.get('/tracks/delete/:id', authController.isAuthenticated, tracksController.deleteTrack);

module.exports = router;