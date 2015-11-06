-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 03-11-2015 a las 10:43:39
-- Versión del servidor: 5.5.43-0ubuntu0.14.04.1
-- Versión de PHP: 5.5.9-1ubuntu4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de datos: `samplecleaner`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `groups`
--

DROP TABLE IF EXISTS `groups`;
CREATE TABLE IF NOT EXISTS `groups` (
  `idGroup` int(11) NOT NULL AUTO_INCREMENT,
  `group` text,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`idGroup`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Volcado de datos para la tabla `groups`
--

INSERT INTO `groups` (`idGroup`, `group`, `createdAt`) VALUES
(1, 'basic', '2015-11-02 09:00:00'),
(2, 'admin', '2015-11-02 09:56:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mailing_list`
--

DROP TABLE IF EXISTS `mailing_list`;
CREATE TABLE IF NOT EXISTS `mailing_list` (
  `idList` int(11) NOT NULL AUTO_INCREMENT,
  `email` text,
  `createdAt` datetime DEFAULT NULL,
  `disabled` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idList`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `idUser` int(11) NOT NULL AUTO_INCREMENT,
  `email` text COMMENT 'User e-mail',
  `password` text COMMENT 'Encrypted password',
  `firstLogin` text COMMENT 'Date of first login',
  `lastLogin` text COMMENT 'Date of last login',
  `firstIP` text COMMENT 'First IP address',
  `lastIP` text COMMENT 'Last IP address',
  `timesLoggedIn` int(11) DEFAULT '0' COMMENT 'Times logged in',
  `createdAt` datetime DEFAULT NULL COMMENT 'Date of creation',
  `updatedAt` datetime DEFAULT NULL COMMENT 'Date of update',
  `disabled` int(11) NOT NULL DEFAULT '0' COMMENT 'Disabled = 1, Enabled = 0',
  PRIMARY KEY (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_groups`
--

DROP TABLE IF EXISTS `user_groups`;
CREATE TABLE IF NOT EXISTS `user_groups` (
  `idUserGroup` int(11) NOT NULL AUTO_INCREMENT,
  `idUser` int(11) DEFAULT NULL,
  `idGroup` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`idUserGroup`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
