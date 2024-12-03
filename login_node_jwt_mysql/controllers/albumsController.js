const { query } = require('./utils');
const multer = require('multer');
// const path = require('path'); // Importar 'path' para manejar las rutas de los archivos
// const fs = require('fs'); // Importar 'fs' para manejar el sistema de archivos
const { deleteFile } = require('./utils'); // Asegúrate de importar la función
const upload = multer({ dest: 'public/uploads/covers_albums/' }); // Directorio donde se guardarán las imágenes


// Mostarar y obteniendo los albums y pistas del artista autenticado en la vista album
exports.albums = async (req, res) => {
    try {
        const artistId = req.artist.id;

        // Obtener álbumes, pistas
        const [albums, tracks] = await Promise.all([
            query('SELECT * FROM albums WHERE artistId = ?', [artistId]),
            query('SELECT * FROM tracks WHERE artistId = ?', [artistId]),
        ]);

        res.render('albums', {
            correo: req.artist,
            albums: albums || [],
            tracks: tracks || [], // Pasar la lista de pistas
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
};

// Crear un nuevo álbum
exports.createAlbum = [
    upload.single('coverImage'), // Middleware para manejar la carga del archivo
    async (req, res) => {
        try {
            const { title, date_realese, gender } = req.body;
            const artistId = req.artist.id;

            // Obtener la ruta de la imagen de portada si se ha cargado
            const coverImagePath = req.file ? `/uploads/covers_albums/${req.file.filename}` : null;

            const result = await query('INSERT INTO albums SET ?', {
                artistId: artistId,
                title: title,
                date_realese: date_realese,
                gender: gender,
                coverImage: coverImagePath // Agregar la ruta de la imagen de portada
            });

            console.log('Resultado de la inserción:', result); // Muestra el resultado de la inserción
            res.redirect('/albums');
        } catch (err) {
            console.error('Error al crear el álbum:', err);
            res.status(500).send('Error al crear el álbum');
        }
    }
];

exports.updateAlbum = [
    upload.single('coverImage'), 
    async (req, res) => {
        try {
            const { id, title, date_realese, gender } = req.body;
            let coverImagePath = null;

            if (req.file) {
                coverImagePath = `/uploads/covers_albums/${req.file.filename}`;
            }

            const currentAlbum = await query('SELECT coverImage FROM albums WHERE id = ?', [id]);

            if (currentAlbum[0].coverImage) {
                // Siempre eliminar la imagen anterior
                deleteFile(currentAlbum[0].coverImage);
            }

            const updateData = { title, date_realese, gender };
            if (coverImagePath) {
                updateData.coverImage = coverImagePath;
            }

            await query('UPDATE albums SET ? WHERE id = ?', [updateData, id]);
            res.redirect('/albums');
        } catch (err) {
            console.error('Error al actualizar el álbum:', err);
            res.status(500).send('Error al actualizar el álbum');
        }
    }
];

// Eliminar un álbum
exports.deleteAlbum = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener las pistas asociadas al album
        const tracks = await query('SELECT id, filePath FROM tracks WHERE albumId = ?', [id]);

        // Obtener los filePaths de las pistas
        const filePaths = tracks.map(track => track.filePath);

        // Eliminar las pistas asociadas de la base de datos
        await query('DELETE FROM tracks WHERE albumId = ?', [id]);

        // Eliminar archivos locales
        filePaths.forEach(filePath => {
            console.log('Llamando a deleteFile para:', filePath); // Log para verificar
            deleteFile(filePath); // Llama a la función utilitaria
        });

        // Obtener la imagen de portada del album
        const album = await query('SELECT coverImage FROM albums WHERE id = ?', [id]);

        if (album.length === 0) {
            return res.status(404).send('Album no encontrado');
        }

        const coverImagePath = album[0].coverImage;

        // Eliminar la imagen de portada del servidor si existe
        if (coverImagePath) {
            deleteFile(coverImagePath); // Usa la misma función para la portada
        } 

        await query('DELETE FROM albums WHERE id = ?', [id]);

        res.redirect('/albums');
    } catch (err) {
        console.error('Error al eliminar el álbum:', err);
        res.status(500).send('Error al eliminar el álbum');
    }
};