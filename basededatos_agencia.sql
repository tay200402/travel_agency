-- 1. Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS agencia_viajes_db;
USE agencia_viajes_db;

-- 2. Crear tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'cliente'
);

-- 3. Crear tabla de Paquetes Turísticos
CREATE TABLE IF NOT EXISTS paquetes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destino VARCHAR(100) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    detalles TEXT,
    precio DECIMAL(12, 2) NOT NULL,
    duracion_dias INT NOT NULL,
    imagen_url VARCHAR(255)
);

-- 4. Crear tabla de Cotizaciones (Historial)
CREATE TABLE IF NOT EXISTS cotizaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    paquete_id INT,
    personas INT NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    fecha_cotizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paquete_id) REFERENCES paquetes(id) ON DELETE CASCADE
);

INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Tayli Rincon', 'taylinrincon@gmail.com', '123456', 'cliente')
ON DUPLICATE KEY UPDATE id=id;

-- Asegúrate de que estás usando la base de datos correcta
USE agencia_viajes_db;

-- Insertar nuevos destinos turísticos de nivel Premium
INSERT INTO paquetes (destino, titulo, descripcion, precio, duracion_dias, detalles) VALUES
(
 'Cancún', 
 'Paraíso Todo Incluido en el Caribe', 
 'Disfruta de playas de arena blanca, aguas cristalinas y un hotel 5 estrellas con todo incluido en México.', 
 1850.00, 
 5, 
 'El paquete incluye: Tiquetes aéreos ida y vuelta, traslados aeropuerto-hotel, 4 noches en Resort 5 estrellas Todo Incluido, alimentación ilimitada, licores premium y tour guiado a las pirámides de Chichén Itzá.'
),
(
 'París', 
 'Luces, Arte e Historia Romántica', 
 'Explora los monumentos más icónicos de Francia: la Torre Eiffel, el Museo del Louvre y un crucero por el Sena.', 
 3200.00, 
 8, 
 'El paquete incluye: Vuelos internacionales, hospedaje en hotel boutique en el centro de París, desayunos diarios, pases de acceso rápido para la Torre Eiffel y el Museo del Louvre, y una tarjeta de transporte ilimitado por la ciudad.'
),
(
 'Punta Cana', 
 'Relax y Diversión bajo las Palmeras', 
 'Un escape inolvidable a las mejores playas de República Dominicana en un resort con entretenimiento 24/7.', 
 1450.00, 
 6, 
 'El paquete incluye: Tiquetes de avión, traslados privados, 5 noches en habitación Vista al Mar con sistema Todo Incluido, acceso a parques acuáticos del hotel, fiestas temáticas nocturnas y una excursión en catamarán a Isla Saona.'
),
(
 'Cusco', 
 'El Imperio de los Incas y Machu Picchu', 
 'Descubre la magia ancestral del Valle Sagrado, la cultura peruana y una de las maravillas del mundo.', 
 1250.00, 
 7, 
 'El paquete incluye: Vuelos de conexión, alojamiento en Cusco y Aguas Calientes, desayunos, tiquetes del tren escénico Vistadome, entradas oficiales a la ciudadela de Machu Picchu con guía privado certificado y asistencia médica.'
),
(
 'San Andrés', 
 'El Mar de los Siete Colores', 
 'Disfruta del encanto del Caribe colombiano, playas de coral y un ambiente isleño inigualable.', 
 850.00, 
 4, 
 'El paquete incluye: Vuelos directos nacionales, alojamiento en hotel de cadena frente a la playa con desayuno y cena, tour de vuelta a la isla visitando la Piscinita y el Hoyo Soplador, y traslado en lancha a Johnny Cay.'
),
(
 'Medellín', 
 'Cultura, Primavera y Ecoturismo', 
 'Conoce la ciudad de la eterna primavera en Colombia, el Peñol de Guatapé y su increíble transformación urbana.', 
 620.00, 
 5, 
 'El paquete incluye: Traslados terrestres o aéreos según elección, hotel en la zona de El Poblado con desayunos, tour de Graffiti en la Comuna 13, uso del Metrocable y excursión de día completo al imponente Peñón de Guatapé con almuerzo tradicional.'
);


USE agencia_viajes_db;

-- 1. Desactivamos temporalmente el modo seguro
SET SQL_SAFE_UPDATES = 0;

-- 2. Ejecutamos las actualizaciones de las imágenes
UPDATE paquetes SET imagen_url = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600' WHERE destino = 'Cancún';
UPDATE paquetes SET imagen_url = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600' WHERE destino = 'París';
UPDATE paquetes SET imagen_url = 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600' WHERE destino = 'Punta Cana';
UPDATE paquetes SET imagen_url = 'https://images.unsplash.com/photo-1587595421360-ac1a140d7551?w=600' WHERE destino = 'Cusco';
UPDATE paquetes SET imagen_url = 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600' WHERE destino = 'San Andrés';
UPDATE paquetes SET imagen_url = 'https://images.unsplash.com/photo-1605884241517-5e88412ff3fc?w=600' WHERE destino = 'Medellín';

-- 3. Volvemos a activar el modo seguro por protección
SET SQL_SAFE_UPDATES = 1;