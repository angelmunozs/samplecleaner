-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 18-11-2015 a las 09:00:01
-- Versión del servidor: 5.5.46-0ubuntu0.14.04.2
-- Versión de PHP: 5.5.9-1ubuntu4.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de datos: `samplecleaner`
--
CREATE DATABASE IF NOT EXISTS `samplecleaner` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `samplecleaner`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contact`
--

DROP TABLE IF EXISTS `contact`;
CREATE TABLE IF NOT EXISTS `contact` (
  `idContact` int(11) NOT NULL AUTO_INCREMENT,
  `email` text,
  `message` text,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`idContact`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- Volcado de datos para la tabla `groups`
--

INSERT INTO `groups` (`idGroup`, `group`, `createdAt`) VALUES
(1, 'basic', '2015-11-02 09:00:00'),
(2, 'admin', '2015-11-02 09:56:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `info_profiles`
--

DROP TABLE IF EXISTS `info_profiles`;
CREATE TABLE IF NOT EXISTS `info_profiles` (
  `idInfo` int(11) NOT NULL AUTO_INCREMENT,
  `year` text,
  `profile` text,
  `info` text,
  PRIMARY KEY (`idInfo`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=49 ;

--
-- Volcado de datos para la tabla `info_profiles`
--

INSERT INTO `info_profiles` (`idInfo`, `year`, `profile`, `info`) VALUES
(1, '40', '1', 'Profile 1'),
(2, '40', '2', 'Profile 2'),
(3, '40', '3', 'Profile 3'),
(4, '40', '4', 'Profile 4'),
(5, '40', '5', 'Profile 5'),
(6, '40', '6', 'Profile 6'),
(7, '40', '7', 'Profile 7'),
(8, '40', '8', 'Profile 8'),
(9, '50', '1', 'Profile 1'),
(10, '50', '2', 'Profile 2'),
(11, '50', '3', 'Profile 3'),
(12, '50', '4', 'Profile 4'),
(13, '50', '5', 'Profile 5'),
(14, '50', '6', 'Profile 6'),
(15, '50', '7', 'Profile 7'),
(16, '50', '8', 'Profile 8'),
(17, '60', '1', 'Profile 1'),
(18, '60', '2', 'Profile 2'),
(19, '60', '3', 'Profile 3'),
(20, '60', '4', 'Profile 4'),
(21, '60', '5', 'Profile 5'),
(22, '60', '6', 'Profile 6'),
(23, '60', '7', 'Profile 7'),
(24, '60', '8', 'Profile 8'),
(25, '70', '1', 'Profile 1'),
(26, '70', '2', 'Profile 2'),
(27, '70', '3', 'Profile 3'),
(28, '70', '4', 'Profile 4'),
(29, '70', '5', 'Profile 5'),
(30, '70', '6', 'Profile 6'),
(31, '70', '7', 'Profile 7'),
(32, '70', '8', 'Profile 8'),
(33, '80', '1', 'Profile 1'),
(34, '80', '2', 'Profile 2'),
(35, '80', '3', 'Profile 3'),
(36, '80', '4', 'Profile 4'),
(37, '80', '5', 'Profile 5'),
(38, '80', '6', 'Profile 6'),
(39, '80', '7', 'Profile 7'),
(40, '80', '8', 'Profile 8'),
(41, '90', '1', 'Profile 1'),
(42, '90', '2', 'Profile 2'),
(43, '90', '3', 'Profile 3'),
(44, '90', '4', 'Profile 4'),
(45, '90', '5', 'Profile 5'),
(46, '90', '6', 'Profile 6'),
(47, '90', '7', 'Profile 7'),
(48, '90', '8', 'Profile 8');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `info_years`
--

DROP TABLE IF EXISTS `info_years`;
CREATE TABLE IF NOT EXISTS `info_years` (
  `idInfo` int(11) NOT NULL AUTO_INCREMENT,
  `year` text,
  `info` text,
  PRIMARY KEY (`idInfo`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=7 ;

--
-- Volcado de datos para la tabla `info_years`
--

INSERT INTO `info_years` (`idInfo`, `year`, `info`) VALUES
(1, '40', '40s vinyl discs info'),
(2, '50', '50s vinyl discs info'),
(3, '60', '60s vinyl discs info'),
(4, '70', '70s vinyl discs info'),
(5, '80', '80s vinyl discs info'),
(6, '90', '90s vinyl discs info');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `log_uploads`
--

DROP TABLE IF EXISTS `log_uploads`;
CREATE TABLE IF NOT EXISTS `log_uploads` (
  `idLog` int(11) NOT NULL AUTO_INCREMENT,
  `idUser` int(11) DEFAULT NULL,
  `ip` text,
  `date` datetime DEFAULT NULL,
  `name` text,
  `size` text,
  `type` text,
  PRIMARY KEY (`idLog`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mailing_list`
--

DROP TABLE IF EXISTS `mailing_list`;
CREATE TABLE IF NOT EXISTS `mailing_list` (
  `idList` int(11) NOT NULL AUTO_INCREMENT,
  `email` text,
  `createdAt` datetime DEFAULT NULL,
  `token` text,
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
