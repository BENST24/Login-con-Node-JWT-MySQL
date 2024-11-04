CREATE TABLE `artists` (
  `id` bigint(255) unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `artist` varchar(50) COLLATE 'utf8_unicode_ci' NOT NULL,
  `name` varchar(100) COLLATE 'utf8_unicode_ci' NOT NULL,
  `password` varchar(255) COLLATE 'utf8_unicode_ci' NOT NULL
  `description` varchar(255) COLLATE 'utf8_unicode_ci' NULL
) ENGINE='InnoDB' COLLATE 'utf8_unicode_ci';

ALTER TABLE `artists`
CHANGE `name` `correo` varchar(100) COLLATE 'utf8_unicode_ci' NOT NULL AFTER `artist`;

ALTER TABLE `artists`
ADD UNIQUE `correo` (`correo`);

CREATE TABLE albums (
    id           INT(11) AUTO_INCREMENT PRIMARY KEY,
    artistId     BIGINT(20) UNSIGNED NOT NULL,
    title        VARCHAR(50) NOT NULL,
    createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_realese DATE,
    gender       VARCHAR(50)
);

ALTER TABLE albums ADD COLUMN coverImage VARCHAR(255);

CREATE TABLE singles (
    id           INT(11) AUTO_INCREMENT PRIMARY KEY,
    artistId     BIGINT(20) UNSIGNED NOT NULL,
    title        VARCHAR(50) NOT NULL,
    createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_realese DATE,
    gender       VARCHAR(50)
    coverImage   VARCHAR(255);
);

CREATE TABLE tracks (
    id           INT(11) AUTO_INCREMENT PRIMARY KEY,
    artistId     BIGINT(20) UNSIGNED NOT NULL,
    albumId      INT(11) unsigned NULL,  -- Clave foránea a 'albums', pero puede ser NULL
    singleId	 int(11) unsigned NULL,  -- Clave foránea a 'singles', pero puede ser NULL
    title        VARCHAR(50) NOT NULL,
    createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_realese DATE,
    duration     TIME,  -- Duración de la canción
    filePath     VARCHAR(255),  -- Ruta del archivo o URL
    gender       VARCHAR(50)
);

ALTER TABLE `tracks`
ADD `coverImage` varchar(255) COLLATE 'utf8mb4_unicode_ci' NOT NULL FIRST,
DROP `id`,
CHANGE `filePath` `filePath` varchar(255) COLLATE 'utf8mb4_unicode_ci' NULL AFTER `duration`,
CHANGE `gender` `gender` varchar(50) COLLATE 'utf8mb4_unicode_ci' NULL AFTER `filePath`,
COLLATE 'utf8mb4_unicode_ci';
