CREATE TABLE `Users` (
  `id` bigint(255) unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user` varchar(50) COLLATE 'utf8_unicode_ci' NOT NULL,
  `name` varchar(100) COLLATE 'utf8_unicode_ci' NOT NULL,
  `password` varchar(255) COLLATE 'utf8_unicode_ci' NOT NULL
) ENGINE='InnoDB' COLLATE 'utf8_unicode_ci';

ALTER TABLE `Users`
CHANGE `name` `correo` varchar(100) COLLATE 'utf8_unicode_ci' NOT NULL AFTER `user`;

ALTER TABLE `Users`
ADD UNIQUE `correo` (`correo`);