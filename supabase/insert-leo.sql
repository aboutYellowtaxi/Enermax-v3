-- Insertar Leo (Leonel Vivas - Electricista en Moreno)

-- Primero aseguramos que exista la zona Moreno
INSERT INTO zonas (nombre, activa)
VALUES ('Moreno', true)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar a Leo
INSERT INTO profesionales (
  nombre,
  apellido,
  telefono,
  email,
  categorias,
  zona_base_id,
  experiencia_anos,
  bio,
  activo,
  disponible,
  calificacion,
  total_trabajos
)
SELECT
  'Leonel',
  'Vivas',
  '1131449673',
  'leo.vivas@enermax.com',
  ARRAY['electricidad'],
  z.id,
  5,
  'Técnico electricista matriculado con 5 años de experiencia. Instalaciones, reparaciones y mantenimiento eléctrico en zona Oeste.',
  true,
  true,
  5.0,
  0
FROM zonas z
WHERE z.nombre = 'Moreno';
