const connection = require('../database/db');
const fs = require('fs');
const path = require('path');

/**
 * Elimina un archivo del servidor.
 * @param {string} filePath - La ruta del archivo a eliminar.
 */
const deleteFile = (filePath) => {
    const fullFilePath = path.join(__dirname, '../public/', filePath);
    console.log('Intentando eliminar el archivo:', fullFilePath); // Log de la ruta del archivo
    fs.unlink(fullFilePath, (err) => {
        if (err) {
            console.error('Error al eliminar el archivo:', err);
        } else {
            console.log('Archivo eliminado correctamente:', fullFilePath);
        }
    });
};

/**
 * Ejecuta una consulta en la base de datos.
 * @param {string} sql - La consulta SQL a ejecutar.
 * @param {Array} params - Los parámetros de la consulta.
 * @returns {Promise} - Una promesa que se resuelve con los resultados de la consulta.
 */
function query(sql, params) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

module.exports = { 
    query,
    deleteFile
};