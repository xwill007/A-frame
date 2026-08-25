-- Migración: Requerimiento 001 - Nivel 2 de Evaluación (Pronunciación)
-- Agrega la columna `nivel` a `evaluaciones_vr` para diferenciar los registros del
-- Nivel 1 (Vocabulario / quiz de traducción) del Nivel 2 (Pronunciación).
--
-- Ejecutar una sola vez sobre una base de datos `english_vr` ya existente que NO
-- tenga la columna `nivel` (instalaciones nuevas ya la incluyen vía english_vr.sql).

ALTER TABLE `evaluaciones_vr`
  ADD COLUMN `nivel` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1 AFTER `terminado`;

-- Las evaluaciones existentes quedan marcadas como Nivel 1 (DEFAULT 1),
-- ya que hasta este requerimiento solo existía el quiz de vocabulario.
