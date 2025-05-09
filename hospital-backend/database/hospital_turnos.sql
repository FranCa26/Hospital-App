-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         11.5.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para hospital_turnos
CREATE DATABASE IF NOT EXISTS `hospital_turnos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `hospital_turnos`;

-- Volcando estructura para tabla hospital_turnos.archivos_historial
CREATE TABLE IF NOT EXISTS `archivos_historial` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `historial_id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `ruta` varchar(255) NOT NULL,
  `tipo` varchar(255) NOT NULL COMMENT 'Tipo MIME del archivo',
  `tamaño` int(11) DEFAULT NULL COMMENT 'Tamaño en bytes',
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `historial_id` (`historial_id`),
  CONSTRAINT `archivos_historial_ibfk_1` FOREIGN KEY (`historial_id`) REFERENCES `historiales_medicos` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla hospital_turnos.categorias
CREATE TABLE IF NOT EXISTS `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `nombre_2` (`nombre`),
  UNIQUE KEY `nombre_3` (`nombre`),
  UNIQUE KEY `nombre_4` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla hospital_turnos.disponibilidad_medicos
CREATE TABLE IF NOT EXISTS `disponibilidad_medicos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `medico_id` int(11) NOT NULL,
  `dia_semana` int(11) NOT NULL,
  `hora_inicio` varchar(255) NOT NULL,
  `hora_fin` varchar(255) NOT NULL,
  `intervalo` int(11) NOT NULL DEFAULT 30,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `medico_id` (`medico_id`),
  CONSTRAINT `disponibilidad_medicos_ibfk_1` FOREIGN KEY (`medico_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla hospital_turnos.excepciones_disponibilidad
CREATE TABLE IF NOT EXISTS `excepciones_disponibilidad` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `medico_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `es_disponible` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'true: día disponible excepcionalmente, false: día no disponible excepcionalmente',
  `hora_inicio` varchar(255) DEFAULT NULL,
  `hora_fin` varchar(255) DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `medico_id` (`medico_id`),
  CONSTRAINT `excepciones_disponibilidad_ibfk_1` FOREIGN KEY (`medico_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla hospital_turnos.historiales_medicos
CREATE TABLE IF NOT EXISTS `historiales_medicos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paciente_id` int(11) NOT NULL,
  `medico_id` int(11) NOT NULL,
  `turno_id` int(11) DEFAULT NULL COMMENT 'Opcional, si el registro está asociado a un turno',
  `fecha` date NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `sintomas` text DEFAULT NULL,
  `diagnostico` text NOT NULL,
  `tratamiento` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `es_privado` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Si es privado, solo el médico que lo creó y administradores pueden verlo',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `medico_id` (`medico_id`),
  KEY `turno_id` (`turno_id`),
  CONSTRAINT `historiales_medicos_ibfk_10` FOREIGN KEY (`paciente_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `historiales_medicos_ibfk_11` FOREIGN KEY (`medico_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `historiales_medicos_ibfk_12` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla hospital_turnos.notificaciones
CREATE TABLE IF NOT EXISTS `notificaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` enum('turno','sistema','recordatorio') DEFAULT 'sistema',
  `referencia` varchar(255) DEFAULT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla hospital_turnos.servicios
CREATE TABLE IF NOT EXISTS `servicios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `duracion` int(11) DEFAULT NULL COMMENT 'Duración en minutos',
  `precio` decimal(10,2) DEFAULT NULL,
  `categoria_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `servicios_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla hospital_turnos.turnos
CREATE TABLE IF NOT EXISTS `turnos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paciente_id` int(11) NOT NULL,
  `medico_id` int(11) NOT NULL,
  `servicio_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora` varchar(255) NOT NULL,
  `estado` enum('pendiente','confirmado','completado','cancelado') NOT NULL DEFAULT 'pendiente',
  `notas` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `medico_id` (`medico_id`),
  KEY `servicio_id` (`servicio_id`),
  CONSTRAINT `turnos_ibfk_10` FOREIGN KEY (`paciente_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `turnos_ibfk_11` FOREIGN KEY (`medico_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `turnos_ibfk_12` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla hospital_turnos.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','medico','paciente') NOT NULL DEFAULT 'paciente',
  `telefono` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `especialidad` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
