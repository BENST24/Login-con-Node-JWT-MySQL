// const { error } = require('console'); 
const { query } = require('./utils');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { deleteFile } = require('./utils'); // Importamos deleteFile 


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'trackFile') { 
            cb(null, './public/uploads/tracks/'); // Guardar las pistas en la carpeta de tracks
        } else if (file.fieldname === 'coverImage') { 
            cb(null, './public/uploads/covers_tracks/'); // Guardar las portadas en la carpeta de covers
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único con marca de tiempo
    }
});

const upload = multer({ storage: storage });

exports.tracks = async (req, res) => {
    try {
        const artistId = req.artist.id;
        const tracks = await query(`
            SELECT t.*, a.title AS albumTitle, s.title AS singleTitle 
            FROM tracks t
            LEFT JOIN albums a ON t.albumId = a.id
            LEFT JOIN singles s ON t.singleId = s.id
            WHERE t.artistId = ?
        `, [artistId]);

        res.render('tracks', {
            correo: req.artist,
            tracks: tracks || []
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
};


exports.createTrack = [
    upload.fields([{ name: 'trackFile', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), // Maneja múltiples archivos
    async (req, res) => {
        const { title, albumId, singleId, date_realese, gender } = req.body;
        const artistId = req.artist.id;

        // Asegurarse de que los archivos existan antes de acceder a ellos
        const trackFilePath = req.files.trackFile ? `/uploads/tracks/${req.files.trackFile[0].filename}` : null;
        const coverImagePath = req.files.coverImage ? `/uploads/covers_tracks/${req.files.coverImage[0].filename}` : null;

        try {
            await query('INSERT INTO tracks SET ?', {
                artistId: artistId,
                albumId: albumId || null,
                singleId: singleId || null,
                title: title,
                date_realese: date_realese,
                gender: gender,
                filePath: trackFilePath, // Ruta del archivo de la pista
                coverImage: coverImagePath // Ruta de la imagen de portada
            });

            if (albumId) {
                res.redirect('/albums');
            } else if (singleId) {
                res.redirect('/singles');
            } else {
                res.redirect('/tracks');
            }
        } catch (err) {
            console.error('Error al crear la canción:', err);
            res.status(500).send('Error al crear la canción');
        }
    }
];

exports.updateTrack = [
    upload.single('coverImage'), // Cargar una nueva portada si se proporciona
    async (req, res) => {
        const { id, title, date_realese, gender, albumId, singleId } = req.body;
        const coverImagePath = req.file ? `/uploads/covers_tracks/${req.file.filename}` : null;

        try {
            // Obtener la portada actual antes de actualizarla
            const currentTrack = await query('SELECT coverImage FROM tracks WHERE id = ?', [id]);

            if (coverImagePath) {
                await query('UPDATE tracks SET title = ?, date_realese = ?, gender = ?, coverImage = ? WHERE id = ?', [
                    title, date_realese, gender, coverImagePath, id
                ]);

                // Eliminar la imagen anterior si existe
                if (currentTrack[0].coverImage) {
                    deleteFile(currentTrack[0].coverImage);
                }
            } else {
                await query('UPDATE tracks SET title = ?, date_realese = ?, gender = ? WHERE id = ?', [
                    title, date_realese, gender, id
                ]);
            }

            if (albumId) {
                res.redirect('/albums');
            } else if (singleId) {
                res.redirect('/singles');
            } else {
                res.redirect('/tracks');
            }
        } catch (err) {
            console.error('Error al actualizar la pista:', err);
            res.status(500).send('Error al actualizar la pista');
        }
    }
];

exports.deleteTrack = async (req, res) => {
    try {
        const { id } = req.params;
        const albumId = req.query.albumId;
        const singleId = req.query.singleId;

        const track = await query('SELECT filePath, coverImage FROM tracks WHERE id = ?', [id]);

        if (track.length === 0) {
            return res.status(404).send('Pista no encontrada');
        }

        const trackFilePath = track[0].filePath;
        const coverImagePath = track[0].coverImage;

        await query('DELETE FROM tracks WHERE id = ?', [id]);

        // Eliminar archivo de pista
        if (trackFilePath) {
            const fullTrackFilePath = path.join(__dirname, '../public/', trackFilePath);
            fs.unlink(fullTrackFilePath, (err) => {
                if (err) {
                    console.error('Error al eliminar el archivo de pista:', err);
                } else {
                    console.log('Archivo de pista eliminado correctamente:', fullTrackFilePath);
                }
            });
        }

        // Eliminar portada
        if (coverImagePath) {
            const fullCoverImagePath = path.join(__dirname, '../public/', coverImagePath);
            fs.unlink(fullCoverImagePath, (err) => {
                if (err) {
                    console.error('Error al eliminar la portada:', err);
                } else {
                    console.log('Portada eliminada correctamente:', fullCoverImagePath);
                }
            });
        }

        if (albumId) {
            res.redirect('/albums');
        } else if (singleId) {
            res.redirect('/singles');
        } else {
            res.redirect('/tracks');
        }

    } catch (err) {
        console.error('Error al eliminar la pista:', err);
        res.status(500).send('Error al eliminar la pista');
    }
};