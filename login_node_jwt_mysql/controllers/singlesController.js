const { query } = require('./utils');
const multer = require('multer');
const path = require('path'); // Importar 'path' para manejar las rutas de los archivos
const fs = require('fs'); // Importar 'fs' para manejar el sistema de archivos
const { deleteFile } = require('./utils'); // Asegúrate de importar la función


const upload = multer({ dest: 'public/uploads/covers_singles/' }); // Directorio donde se guardarán las imágenes

// Mostrar sencillos y pistas
exports.singles = async (req, res) => {
    try {
        const artistId = req.artist.id;
        const [singles, tracks] = await Promise.all([
            query('SELECT * FROM singles WHERE artistId = ?', [artistId]),
            query('SELECT * FROM tracks WHERE artistId = ?', [artistId]),
        ]);

        res.render('singles', {
            correo: req.artist,
            singles: singles || [],
            tracks: tracks || [],
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
};

// Crear un nuevo sencillo
exports.createSingle = [
    upload.single('coverImage'),
    async (req, res) => {
        try {
            const { title, date_realese, gender } = req.body;
            const artistId = req.artist.id;
            const coverImagePath = req.file ? `/uploads/covers_singles/${req.file.filename}` : null;

            const result = await query('INSERT INTO singles SET ?', {
                artistId: artistId,
                title: title,
                date_realese: date_realese,
                gender: gender,
                coverImage: coverImagePath
            });

            res.redirect('/singles');
        } catch (err) {
            console.error('Error al crear el sencillo:', err);
            res.status(500).send('Error al crear el sencillo');
        }
    }
];

exports.updateSingle = [
    upload.single('coverImage'), 
    async (req, res) => {
        try {
            const { id, title, date_realese, gender } = req.body;
            let coverImagePath = null;

            if (req.file) {
                coverImagePath = `/uploads/covers_singles/${req.file.filename}`;
            }

            const currentSingle = await query('SELECT coverImage FROM singles WHERE id = ?', [id]);

            if (currentSingle[0].coverImage) {
                // Siempre eliminar la imagen anterior
                deleteFile(currentSingle[0].coverImage);
            }

            const updateData = { title, date_realese, gender };
            if (coverImagePath) {
                updateData.coverImage = coverImagePath;
            }

            await query('UPDATE singles SET ? WHERE id = ?', [updateData, id]);
            res.redirect('/singles');
        } catch (err) {
            console.error('Error al actualizar el sencillo:', err);
            res.status(500).send('Error al actualizar el sencillo');
        }
    }
];

exports.deleteSingle = async (req, res) => {
    const { id } = req.params; // Obtener el id del sencillo

    try {
        // Obtener las pistas asociadas al sencillo
        const tracks = await query('SELECT id, filePath FROM tracks WHERE singleId = ?', [id]);

        // Obtener los filePaths de las pistas
        const filePaths = tracks.map(track => track.filePath);

        // Eliminar las pistas asociadas de la base de datos
        await query('DELETE FROM tracks WHERE singleId = ?', [id]);

        // Eliminar archivos locales
        filePaths.forEach(filePath => {
            deleteFile(filePath); // Llama a la función utilitaria
        });

        // Obtener la imagen de portada del sencillo
        const single = await query('SELECT coverImage FROM singles WHERE id = ?', [id]);

        if (single.length === 0) {
            return res.status(404).send('Sencillo no encontrado');
        }

        const coverImagePath = single[0].coverImage;

        // Eliminar la imagen de portada del servidor si existe
        if (coverImagePath) {
            deleteFile(coverImagePath); // Usa la misma función para la portada
        }

        // Eliminar el sencillo de la base de datos
        await query('DELETE FROM singles WHERE id = ?', [id]);

        res.redirect('/singles'); // Redirigir después de eliminar

    } catch (err) {
        console.error('Error al eliminar el sencillo:', err);
        res.status(500).send('Error al eliminar el sencillo');
    }
};