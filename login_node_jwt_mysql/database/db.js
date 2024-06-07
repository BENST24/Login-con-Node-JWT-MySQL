const mysql = require('mysql2');   
const dotenv = require('dotenv');   

dotenv.config(); // Carga las variables de entorno definidas en el archivo .env.

const connection = mysql.createConnection({ 
    host: process.env.DB_HOST,             
    user: process.env.DB_USER,             
    password: process.env.DB_PASS,         
    database: process.env.DB_DATABASE,     
    port: process.env.DB_PORT             
});

connection.connect((err) => { // Establece la conexión a la base de datos.
    if (err) {  
        console.error('Error conectando a la base de datos:', err);
        return; // Termina la ejecución si hay un error.
    }
    console.log('Conectado a la base de datos MariaDB'); 
});

module.exports = connection; 
