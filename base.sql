-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 20-11-2015 a las 11:22:15
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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=31 ;

--
-- Volcado de datos para la tabla `info_profiles`
--

INSERT INTO `info_profiles` (`idInfo`, `year`, `profile`, `info`) VALUES
(1, '40', '1', 'Click + Dust + Hiss + Friction (GENERIC)'),
(2, '40', '2', 'Click + Dust + Hiss + Friction + EXTRA HISS'),
(3, '40', '3', 'Click + Dust + Hiss + Friction + EXTRA FRICTION'),
(4, '40', '4', 'Click + Dust + Hiss + Friction + EXTRA CLICK'),
(5, '50', '1', 'Click + Dust + Hiss + Friction (GENERIC)'),
(6, '50', '2', 'Click + Dust + Hiss + Friction + EXTRA HISS'),
(7, '50', '3', 'Click + Dust + Hiss + Friction + EXTRA FRICTION'),
(8, '50', '4', 'Click + Dust + Hiss + Friction + EXTRA CLICK'),
(9, '60', '1', 'Click + Dust + Hiss + Friction (GENERIC)'),
(10, '60', '2', 'Click + Dust + Hiss + Friction + EXTRA HISS'),
(11, '60', '3', 'Click + Dust + Hiss + Friction + EXTRA FRICTION'),
(12, '60', '4', 'Click + Dust + Hiss + Friction + EXTRA CLICK'),
(13, '70', '1', 'Click + Dust + Hiss + Friction (GENERIC)'),
(14, '70', '2', 'Click + Dust + Hiss + Friction + EXTRA HISS'),
(15, '70', '3', 'Click + Dust + Hiss + Friction + EXTRA FRICTION'),
(16, '70', '4', 'Click + Dust + Hiss + Friction + EXTRA CLICK'),
(17, '80', '1', 'Click + Dust + Hiss + Friction (GENERIC)'),
(18, '80', '2', 'Click + Dust + Hiss + Friction + EXTRA HISS'),
(19, '80', '3', 'Click + Dust + Hiss + Friction + EXTRA FRICTION'),
(20, '80', '4', 'Click + Dust + Hiss + Friction + EXTRA CLICK'),
(21, '90', '1', 'Click + Dust + Hiss + Friction (GENERIC)'),
(22, '90', '2', 'Click + Dust + Hiss + Friction + EXTRA HISS'),
(23, '90', '3', 'Click + Dust + Hiss + Friction + EXTRA FRICTION'),
(24, '90', '4', 'Click + Dust + Hiss + Friction + EXTRA CLICK');

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
(1, '40', 'Monophonic sound, narrow namdwidth and poor dynamic range'),
(2, '50', 'Monophonic sound, standarized equalization (RIAA, current standard)'),
(3, '60', 'First commercialized stereo recordings, improved dynamic range'),
(4, '70', 'Highly improved dynamic range with AGC, low storage capacity'),
(5, '80', 'Good dynamic range, few distortion and broad bandwidth'),
(6, '90', 'Borad bandwidth and great storage capacity (current technology)');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `log_uploads`
--

DROP TABLE IF EXISTS `log_uploads`;
CREATE TABLE IF NOT EXISTS `log_uploads` (
  `idLog` int(11) NOT NULL AUTO_INCREMENT,
  `idUser` int(11) DEFAULT NULL COMMENT 'User id',
  `ip` text COMMENT 'User IP address',
  `date` datetime DEFAULT NULL COMMENT 'Date',
  `time` int(11) DEFAULT '0' COMMENT 'Python script: Time (milliseconds)',
  `error` text COMMENT 'Python script: Errors',
  `messages` text COMMENT 'Python script: Messages',
  `name` text COMMENT 'Uploaded file name',
  `size` text COMMENT 'File size',
  `type` text COMMENT 'File MIME type',
  `params` text COMMENT 'Parameters for the cleaning process',
  PRIMARY KEY (`idLog`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `idUser` int(11) NOT NULL AUTO_INCREMENT,
  `email` text COMMENT 'User e-mail',
  `name` text COMMENT 'First name',
  `password` text COMMENT 'Encrypted password',
  `firstLogin` text COMMENT 'Date of first login',
  `lastLogin` text COMMENT 'Date of last login',
  `firstIP` text COMMENT 'First IP address',
  `lastIP` text COMMENT 'Last IP address',
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
