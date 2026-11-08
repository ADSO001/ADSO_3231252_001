-- SIGCMI: ampliación no destructiva del modelo de historia clínica.
-- Ejecutar una sola vez desde pgAdmin (Query Tool) después de realizar un respaldo.

-- cita_id es una columna heredada y puede no existir en bases ya actualizadas.
-- Si todavía existe, se permite que quede vacía; no se cambia su tipo ni sus valores.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'historias_clinicas'
      AND column_name = 'cita_id'
  ) THEN
    ALTER TABLE public.historias_clinicas ALTER COLUMN cita_id DROP NOT NULL;
  END IF;
END $$;

UPDATE historias_clinicas
SET fecha_elaboracion = COALESCE(fecha_elaboracion, "createdAt", NOW())
WHERE fecha_elaboracion IS NULL;

ALTER TABLE IF EXISTS historias_clinicas
  ADD COLUMN IF NOT EXISTS cita_uuid UUID NULL,
  ADD COLUMN IF NOT EXISTS diagnostico_principal TEXT NULL,
  ADD COLUMN IF NOT EXISTS codigo_cie10 VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS datos_clinicos JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS fecha_elaboracion TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE historias_clinicas SET fecha_elaboracion = NOW() WHERE fecha_elaboracion IS NULL;
ALTER TABLE historias_clinicas ALTER COLUMN fecha_elaboracion SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_historias_clinicas_cita_uuid
  ON historias_clinicas (cita_uuid);
CREATE INDEX IF NOT EXISTS idx_historias_clinicas_paciente_fecha
  ON historias_clinicas (paciente_id, fecha_elaboracion DESC);
CREATE INDEX IF NOT EXISTS idx_historias_clinicas_medico_fecha
  ON historias_clinicas (medico_id, fecha_elaboracion DESC);

-- Relación explícita cita_uuid -> citas.id. La migración es repetible.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.historias_clinicas'::regclass
      AND conname = 'historias_clinicas_cita_uuid_fkey'
  ) THEN
    ALTER TABLE public.historias_clinicas
      ADD CONSTRAINT historias_clinicas_cita_uuid_fkey
      FOREIGN KEY (cita_uuid) REFERENCES public.citas(id)
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Datos demográficos que ya solicita el formulario de registro de paciente.
ALTER TABLE IF EXISTS usuarios
  ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE NULL,
  ADD COLUMN IF NOT EXISTS telefono_emergencia VARCHAR(255) NULL;
