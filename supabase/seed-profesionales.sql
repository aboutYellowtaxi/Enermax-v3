-- ============================================
-- ENERMAX SEED DATA: Profesionales Realistas
-- Este script puebla el marketplace con datos
-- que parecen reales para dar vida a la plataforma
-- ============================================

-- Primero obtenemos los IDs de las zonas
DO $$
DECLARE
  zona_moreno UUID;
  zona_merlo UUID;
  zona_moron UUID;
  zona_ituzaingo UUID;
  zona_matanza UUID;
  zona_caba UUID;
  zona_sanmartin UUID;
  zona_vicentelopez UUID;

  -- IDs de profesionales para luego crear servicios
  prof_carlos UUID;
  prof_jorge UUID;
  prof_maria UUID;
  prof_roberto UUID;
  prof_diego UUID;
  prof_laura UUID;
  prof_martin UUID;
  prof_ana UUID;
  prof_ricardo UUID;
  prof_pablo UUID;
  prof_lucas UUID;
  prof_gabriel UUID;
BEGIN

  -- Obtener IDs de zonas
  SELECT id INTO zona_moreno FROM zonas WHERE nombre = 'Moreno' LIMIT 1;
  SELECT id INTO zona_merlo FROM zonas WHERE nombre = 'Merlo' LIMIT 1;
  SELECT id INTO zona_moron FROM zonas WHERE nombre = 'Morón' LIMIT 1;
  SELECT id INTO zona_ituzaingo FROM zonas WHERE nombre = 'Ituzaingó' LIMIT 1;
  SELECT id INTO zona_matanza FROM zonas WHERE nombre = 'La Matanza' LIMIT 1;
  SELECT id INTO zona_caba FROM zonas WHERE nombre = 'CABA' LIMIT 1;
  SELECT id INTO zona_sanmartin FROM zonas WHERE nombre = 'San Martín' LIMIT 1;
  SELECT id INTO zona_vicentelopez FROM zonas WHERE nombre = 'Vicente López' LIMIT 1;

  -- ============================================
  -- ELECTRICISTAS
  -- ============================================

  INSERT INTO profesionales (
    nombre, apellido, telefono, email, bio, experiencia_anos,
    calificacion, total_trabajos, total_reviews, verificado,
    disponible, activo, zona_base_id, categorias, foto_url
  ) VALUES (
    'Carlos', 'Rodríguez',
    '11-5555-1234',
    'carlos.electricista@gmail.com',
    'Electricista matriculado con más de 15 años de experiencia. Especialista en instalaciones domiciliarias, comerciales e industriales. Trabajo prolijo, puntual y con garantía. Realizo tableros, tendidos, reparaciones y urgencias 24hs.',
    15,
    4.9, 127, 98, true,
    true, true, zona_moreno,
    ARRAY['electricidad'],
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400'
  ) RETURNING id INTO prof_carlos;

  INSERT INTO profesionales (
    nombre, apellido, telefono, email, bio, experiencia_anos,
    calificacion, total_trabajos, total_reviews, verificado,
    disponible, activo, zona_base_id, categorias, foto_url
  ) VALUES (
    'Jorge', 'Martínez',
    '11-5555-2345',
    'jorge.elec@hotmail.com',
    'Técnico electricista especializado en domótica y automatización del hogar. Instalación de sistemas inteligentes, iluminación LED, y paneles solares. Presupuestos sin cargo.',
    8,
    4.7, 64, 45, true,
    true, true, zona_caba,
    ARRAY['electricidad'],
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400'
  ) RETURNING id INTO prof_jorge;

  -- ============================================
  -- PLOMEROS
  -- ============================================

  INSERT INTO profesionales (
    nombre, apellido, telefono, email, bio, experiencia_anos,
    calificacion, total_trabajos, total_reviews, verificado,
    disponible, activo, zona_base_id, categorias, foto_url
  ) VALUES (
    'María', 'González',
    '11-5555-3456',
    'maria.plomeria@gmail.com',
    'Plomera profesional. Destapes, instalaciones sanitarias, reparación de pérdidas, termotanques y calefones. Trabajo limpio y garantizado. Atención urgencias.',
    12,
    4.8, 89, 67, true,
    true, true, zona_merlo,
    ARRAY['plomeria'],
    'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400'
  ) RETURNING id INTO prof_maria;

  INSERT INTO profesionales (
    nombre, apellido, telefono, email, bio, experiencia_anos,
    calificacion, total_trabajos, total_reviews, verificado,
    disponible, activo, zona_base_id, categorias, foto_url
  ) VALUES (
    'Roberto', 'Sánchez',
    '11-5555-4567',
    'roberto.plomero@gmail.com',
    'Plomero con 20 años de experiencia. Especialista en destapes con máquina y cámara, reparación de cañerías, instalación de baños completos. Presupuesto sin cargo.',
    20,
    4.6, 203, 156, true,
    true, true, zona_ituzaingo,
    ARRAY['plomeria'],
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
  ) RETURNING id INTO prof_roberto;

  -- ============================================
  -- GASISTAS
  -- ============================================

  INSERT INTO profesionales (
    nombre, apellido, telefono, email, bio, experiencia_anos,
    calificacion, total_trabajos, total_reviews, verificado,
    disponible, activo, zona_base_id, categorias, foto_url
  ) VALUES (
    'Diego', 'Fernández',
    '11-5555-5678',
    'diego.gas@gmail.com',
    'Gasista matriculado (matrícula ENARGAS vigente). Instalaciones de gas natural y envasado, calefactores, termotanques, cocinas, estufas. Certificaciones y habilitaciones.',
    10,
    5.0, 78, 62, true,
    true, true, zona_moron,
    ARRAY['gas'],
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
  ) RETURNING id INTO prof_diego;

  INSERT INTO profesionales (
    nombre, apellido, telefono, email, bio, experiencia_anos,
    calificacion, total_trabajos, total_reviews, verificado,
    disponible, activo, zona_base_id, categorias, foto_url
  ) VALUES (
    'Laura', 'Pérez',
    '11-5555-6789',
    'laura.gasista@gmail.com',
    'Gasista matriculada. Especializada en instalaciones seguras y eficientes. Detección de pérdidas, reparaciones, instalación de artefactos a gas. Trabajo con responsabilidad.',
    7,
    4.9, 45, 38, true,
    true, true, zona_matanza,
    ARRAY['gas'],
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400'
  ) RETURNING id INTO prof_laura;

  -- ============================================
  -- PINTORES
  -- ============================================

  INSERT INTO profesionales (
    nombre, apellido, telefono, email, bio, experiencia_anos,
    calificacion, total_trabajos, total_reviews, verificado,
    disponible, activo, zona_base_id, categorias, foto_url
  ) VALUES (
    'Martín', 'López',
    '11-5555-7890',
    'martin.pintor@gmail.com',
    'Pintor profesional. Interiores y exteriores, empapelado, texturados, impermeabilización. Trabajo prolijo con materiales de primera calidad. Presupuestos a domicilio sin cargo.',
    18,
    4.7, 112, 89, true,
    true, true, zona_sanmartin,
    ARRAY['pintura'],
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
  ) RETURNING id INTO prof_martin;

  -- ============================================
  -- CARPINTEROS
  -- ============================================

  INSERT INTO profesionales (
    nombre, apellido, telefono, email, bio, experiencia_anos,
    calificacion, total_trabajos, total_reviews, verificado,
    disponible, activo, zona_base_id, categorias, foto_url
  ) VALUES (
    'Ana', 'Gutiérrez',
    '11-5555-8901',
    'ana.carpinteria@gmail.com',
    'Carpintera especializada en muebles a medida, placares, vestidores, cocinas. Diseño personalizado, instalación y reparaciones. Trabajos en melamina y madera maciza.',
    9,
    4.8, 56, 42, true,
    true, true, zona_vicentelopez,
    ARRAY['carpinteria'],
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'
  ) RETURNING id INTO prof_ana;

  -- ============================================
  -- CERRAJEROS
  -- ============================================

  INSERT INTO profesionales (
    nombre, apellido, telefono, email, bio, experiencia_anos,
    calificacion, total_trabajos, total_reviews, verificado,
    disponible, activo, zona_base_id, categorias, foto_url
  ) VALUES (
    'Ricardo', 'Díaz',
    '11-5555-9012',
    'ricardo.cerrajero@gmail.com',
    'Cerrajero 24 horas. Apertura de puertas, cambio de cerraduras, cerraduras de seguridad, cerraduras electrónicas. Servicio rápido y profesional. Sin daños.',
    14,
    4.5, 189, 134, true,
    true, true, zona_caba,
    ARRAY['cerrajeria'],
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'
  ) RETURNING id INTO prof_ricardo;

  -- ============================================
  -- AIRE ACONDICIONADO
  -- ============================================

  INSERT INTO profesionales (
    nombre, apellido, telefono, email, bio, experiencia_anos,
    calificacion, total_trabajos, total_reviews, verificado,
    disponible, activo, zona_base_id, categorias, foto_url
  ) VALUES (
    'Pablo', 'Romero',
    '11-5555-0123',
    'pablo.aire@gmail.com',
    'Técnico en refrigeración. Instalación, mantenimiento y reparación de aires acondicionados split, ventana y centrales. Carga de gas, limpieza de filtros. Todas las marcas.',
    11,
    4.9, 94, 76, true,
    true, true, zona_moreno,
    ARRAY['aire'],
    'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400'
  ) RETURNING id INTO prof_pablo;

  -- ============================================
  -- LIMPIEZA
  -- ============================================

  INSERT INTO profesionales (
    nombre, apellido, telefono, email, bio, experiencia_anos,
    calificacion, total_trabajos, total_reviews, verificado,
    disponible, activo, zona_base_id, categorias, foto_url
  ) VALUES (
    'Lucas', 'Torres',
    '11-5555-1234',
    'lucas.limpieza@gmail.com',
    'Servicio de limpieza profesional para hogares y oficinas. Limpieza profunda, post obra, mudanzas. Productos incluidos. Personal de confianza con referencias verificables.',
    5,
    4.6, 78, 54, true,
    true, true, zona_merlo,
    ARRAY['limpieza'],
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'
  ) RETURNING id INTO prof_lucas;

  -- ============================================
  -- PROFESIONAL MULTIRUBRO
  -- ============================================

  INSERT INTO profesionales (
    nombre, apellido, telefono, email, bio, experiencia_anos,
    calificacion, total_trabajos, total_reviews, verificado,
    disponible, activo, zona_base_id, categorias, foto_url, premium
  ) VALUES (
    'Gabriel', 'Vargas',
    '11-5555-2345',
    'gabriel.mantenimiento@gmail.com',
    'Profesional multirubro con amplia experiencia. Electricidad, plomería básica, pintura y pequeñas reparaciones del hogar. Ideal para mantenimiento general. Puntualidad garantizada.',
    22,
    4.8, 312, 245, true,
    true, true, zona_moron,
    ARRAY['electricidad', 'plomeria', 'pintura'],
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400',
    true
  ) RETURNING id INTO prof_gabriel;

  -- ============================================
  -- SERVICIOS PARA CADA PROFESIONAL
  -- ============================================

  -- Carlos (Electricista)
  INSERT INTO servicios (profesional_id, nombre, descripcion, precio, duracion_minutos, destacado) VALUES
    (prof_carlos, 'Instalación de tomacorriente', 'Instalación completa de tomacorriente nuevo con materiales incluidos', 8500, 60, true),
    (prof_carlos, 'Cambio de térmicas', 'Reemplazo de llave térmica en tablero', 12000, 45, false),
    (prof_carlos, 'Instalación de ventilador de techo', 'Colocación de ventilador de techo con luz', 15000, 90, true),
    (prof_carlos, 'Revisión de instalación eléctrica', 'Diagnóstico completo de la instalación del hogar', 6000, 60, false),
    (prof_carlos, 'Urgencia eléctrica (24hs)', 'Atención de emergencias eléctricas fuera de horario', 25000, 120, true);

  -- Jorge (Electricista/Domótica)
  INSERT INTO servicios (profesional_id, nombre, descripcion, precio, duracion_minutos, destacado) VALUES
    (prof_jorge, 'Instalación de luces LED', 'Instalación de iluminación LED decorativa o funcional', 10000, 90, true),
    (prof_jorge, 'Sistema de domótica básico', 'Configuración de luces y enchufes inteligentes', 35000, 180, true),
    (prof_jorge, 'Instalación de timbre inteligente', 'Colocación y configuración de timbre con cámara', 18000, 60, false);

  -- María (Plomera)
  INSERT INTO servicios (profesional_id, nombre, descripcion, precio, duracion_minutos, destacado) VALUES
    (prof_maria, 'Destape de cañería', 'Destape de cañería obstruida con máquina', 12000, 60, true),
    (prof_maria, 'Reparación de pérdida', 'Reparación de pérdida en canilla o conexión', 8000, 45, false),
    (prof_maria, 'Instalación de grifería', 'Colocación de grifería nueva en cocina o baño', 7500, 60, true),
    (prof_maria, 'Cambio de flotante de inodoro', 'Reemplazo de mecanismo de inodoro', 6500, 30, false);

  -- Roberto (Plomero)
  INSERT INTO servicios (profesional_id, nombre, descripcion, precio, duracion_minutos, destacado) VALUES
    (prof_roberto, 'Destape con máquina profesional', 'Destape de cañerías con máquina industrial y cámara', 18000, 90, true),
    (prof_roberto, 'Instalación de termotanque', 'Colocación y conexión de termotanque nuevo', 22000, 120, true),
    (prof_roberto, 'Reparación de baño completo', 'Diagnóstico y reparación integral del baño', 35000, 240, false);

  -- Diego (Gasista)
  INSERT INTO servicios (profesional_id, nombre, descripcion, precio, duracion_minutos, destacado) VALUES
    (prof_diego, 'Instalación de calefactor', 'Colocación de calefactor a gas con ventilación', 28000, 150, true),
    (prof_diego, 'Revisión de pérdida de gas', 'Detección y reparación de pérdidas de gas', 12000, 60, true),
    (prof_diego, 'Certificación de gas', 'Certificación de instalación de gas (ENARGAS)', 45000, 180, false),
    (prof_diego, 'Conexión de cocina/horno', 'Instalación segura de artefacto de cocina', 15000, 90, false);

  -- Laura (Gasista)
  INSERT INTO servicios (profesional_id, nombre, descripcion, precio, duracion_minutos, destacado) VALUES
    (prof_laura, 'Instalación de termotanque a gas', 'Colocación de termotanque con conexión de gas', 32000, 180, true),
    (prof_laura, 'Cambio de flexible de gas', 'Reemplazo de manguera de conexión de gas', 8000, 30, false),
    (prof_laura, 'Servicio técnico de calefón', 'Revisión y reparación de calefón', 18000, 90, true);

  -- Martín (Pintor)
  INSERT INTO servicios (profesional_id, nombre, descripcion, precio, duracion_minutos, destacado) VALUES
    (prof_martin, 'Pintura de habitación', 'Pintura completa de habitación estándar (hasta 20m²)', 45000, 480, true),
    (prof_martin, 'Pintura de departamento 2 amb', 'Pintura completa de depto de 2 ambientes', 120000, 1440, true),
    (prof_martin, 'Empapelado de pared', 'Colocación de papel mural por m²', 12000, 120, false),
    (prof_martin, 'Impermeabilización de terraza', 'Aplicación de membrana impermeabilizante', 35000, 300, false);

  -- Ana (Carpintera)
  INSERT INTO servicios (profesional_id, nombre, descripcion, precio, duracion_minutos, destacado) VALUES
    (prof_ana, 'Placard a medida', 'Diseño y fabricación de placard empotrado', 250000, 2880, true),
    (prof_ana, 'Mueble bajo mesada', 'Fabricación e instalación de bajo mesada', 180000, 1440, true),
    (prof_ana, 'Reparación de mueble', 'Arreglo de bisagras, cajones, puertas', 15000, 90, false),
    (prof_ana, 'Estantería flotante', 'Instalación de estantes flotantes', 22000, 120, false);

  -- Ricardo (Cerrajero)
  INSERT INTO servicios (profesional_id, nombre, descripcion, precio, duracion_minutos, destacado) VALUES
    (prof_ricardo, 'Apertura de puerta', 'Apertura de puerta trabada sin daños', 15000, 45, true),
    (prof_ricardo, 'Cambio de cerradura común', 'Reemplazo de cerradura estándar', 18000, 60, false),
    (prof_ricardo, 'Cerradura de seguridad', 'Instalación de cerradura multipunto', 45000, 120, true),
    (prof_ricardo, 'Copia de llave', 'Duplicado de llave estándar', 3500, 15, false),
    (prof_ricardo, 'Urgencia cerrajería 24hs', 'Atención de emergencias fuera de horario', 28000, 60, true);

  -- Pablo (Aire Acondicionado)
  INSERT INTO servicios (profesional_id, nombre, descripcion, precio, duracion_minutos, destacado) VALUES
    (prof_pablo, 'Instalación de split', 'Instalación completa de aire split hasta 3m de caño', 55000, 240, true),
    (prof_pablo, 'Carga de gas refrigerante', 'Recarga de gas R410 o R22', 25000, 90, true),
    (prof_pablo, 'Limpieza y mantenimiento', 'Service completo de aire acondicionado', 18000, 90, false),
    (prof_pablo, 'Desinstalación de equipo', 'Retiro y desinstalación de aire', 20000, 120, false);

  -- Lucas (Limpieza)
  INSERT INTO servicios (profesional_id, nombre, descripcion, precio, duracion_minutos, destacado) VALUES
    (prof_lucas, 'Limpieza de monoambiente', 'Limpieza profunda de monoambiente', 22000, 180, true),
    (prof_lucas, 'Limpieza de 2 ambientes', 'Limpieza profunda de departamento 2 amb', 32000, 240, true),
    (prof_lucas, 'Limpieza post obra', 'Limpieza especializada después de refacción', 55000, 360, false),
    (prof_lucas, 'Limpieza de vidrios y altura', 'Limpieza de ventanas y superficies altas', 18000, 120, false);

  -- Gabriel (Multirubro)
  INSERT INTO servicios (profesional_id, nombre, descripcion, precio, duracion_minutos, destacado) VALUES
    (prof_gabriel, 'Mantenimiento mensual hogar', 'Visita mensual para pequeñas reparaciones', 35000, 180, true),
    (prof_gabriel, 'Reparación general', 'Visita para múltiples reparaciones pequeñas', 25000, 150, true),
    (prof_gabriel, 'Colocación de accesorios', 'Instalación de estantes, cuadros, cortinas, etc', 12000, 90, false);

  -- ============================================
  -- REVIEWS PARA DAR CREDIBILIDAD
  -- ============================================

  -- Reviews para Carlos (Electricista)
  INSERT INTO reviews (profesional_id, cliente_nombre, calificacion, comentario, visible) VALUES
    (prof_carlos, 'Mariana L.', 5, 'Excelente trabajo, muy profesional. Vino puntual y resolvió el problema rápidamente. Lo recomiendo!', true),
    (prof_carlos, 'Fernando G.', 5, 'Muy buen electricista, hizo toda la instalación de mi local. Trabajo impecable.', true),
    (prof_carlos, 'Claudia S.', 4, 'Buen trabajo, solo que tardó un poco más de lo acordado. Pero el resultado final muy bueno.', true);

  -- Reviews para María (Plomera)
  INSERT INTO reviews (profesional_id, cliente_nombre, calificacion, comentario, visible) VALUES
    (prof_maria, 'Juan Pablo R.', 5, 'Primera vez que contrato una plomera mujer y la verdad excelente. Muy profesional y prolija.', true),
    (prof_maria, 'Valentina M.', 5, 'Me salvó de una inundación un domingo a la noche. Eterna gratitud!', true);

  -- Reviews para Diego (Gasista)
  INSERT INTO reviews (profesional_id, cliente_nombre, calificacion, comentario, visible) VALUES
    (prof_diego, 'Lucas T.', 5, 'Hizo la instalación completa de gas de mi casa. Todo certificado y en regla. Muy recomendable.', true),
    (prof_diego, 'Romina F.', 5, 'Encontró una pérdida que otros gasistas no habían detectado. Muy profesional.', true),
    (prof_diego, 'Hernán M.', 5, 'Instaló mi calefactor perfecto. Muy amable y explicó todo el proceso.', true);

  -- Reviews para Gabriel (Multirubro)
  INSERT INTO reviews (profesional_id, cliente_nombre, calificacion, comentario, visible) VALUES
    (prof_gabriel, 'Carolina P.', 5, 'Lo contrato todos los meses para el mantenimiento de mi depto. Siempre impecable.', true),
    (prof_gabriel, 'Diego S.', 5, 'Vino a hacer varias cosas y resolvió todo en una sola visita. Muy eficiente.', true),
    (prof_gabriel, 'Ana María L.', 4, 'Muy buen servicio, resolvió todo lo que necesitaba. Un poco caro pero vale la pena.', true),
    (prof_gabriel, 'Martín R.', 5, 'El mejor profesional que contraté. Hace de todo y muy bien. 100% recomendado.', true);

  -- Reviews para Pablo (Aire)
  INSERT INTO reviews (profesional_id, cliente_nombre, calificacion, comentario, visible) VALUES
    (prof_pablo, 'Gonzalo N.', 5, 'Instaló 3 splits en mi casa. Trabajo perfecto y muy ordenado. Recomendadísimo.', true),
    (prof_pablo, 'Mónica B.', 5, 'Vino a cargar gas y a hacer service. Ahora el aire enfría como nuevo.', true);

END $$;
