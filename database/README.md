# Actualización de historias clínicas

1. Realiza un respaldo de PostgreSQL.
2. Ejecuta una sola vez `migrations/20261108_ampliar_historia_clinica.sql` desde pgAdmin si la migración aún no se ha aplicado. El script tolera que la columna heredada `cita_id` ya no exista.
3. Instala las dependencias con `npm install`.
4. Conserva tu archivo `.env` local y verifica sus variables de conexión.
5. Inicia con `npm run dev`.

## Importante: sincronización de Sequelize

El arranque de la aplicación solo autentica la conexión y levanta el servidor. No ejecuta `sequelize.sync({ alter: true })`. Esa opción puede modificar o eliminar columnas y restricciones mientras compara el modelo con la base de datos. Los cambios de estructura deben hacerse mediante migraciones SQL revisadas y respaldadas.

## Relación con las citas

Las citas usan UUID en `citas.id`; las historias nuevas se relacionan mediante `historias_clinicas.cita_uuid` (UUID). `cita_id` era un campo legado entero. Si todavía existe, el proyecto lo deja sin usar; si una ejecución previa de `sync({ alter: true })` ya lo eliminó, sus valores históricos solo se pueden recuperar restaurando un respaldo anterior. Los demás campos de las historias no se eliminan por esta corrección.

Los datos clínicos adicionales se guardan en `datos_clinicos` (JSONB). Las historias previas mantienen sus datos clínicos existentes; no se les asigna automáticamente un UUID de cita porque no es posible deducirlo de forma segura.
