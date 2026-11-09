# Datos de prueba con Faker

El proyecto utiliza `@faker-js/faker` como dependencia de desarrollo para generar usuarios ficticios. El generador crea médicos y pacientes para probar listados, perfiles, búsquedas y flujos de citas.

## Instalar la dependencia

Desde la carpeta `ADSO_3231252_001`, ejecutar:

```bash
npm install
```

## Crear usuarios ficticios en Windows PowerShell

```powershell
$env:ALLOW_DEMO_SEED = "true"
npm.cmd run seed:demo -- --medicos=5 --pacientes=20
Remove-Item Env:ALLOW_DEMO_SEED
```

También se puede ajustar la cantidad, con un máximo de 100 por tipo:

```powershell
$env:ALLOW_DEMO_SEED = "true"
npm.cmd run seed:demo -- --medicos=5 --pacientes=20
Remove-Item Env:ALLOW_DEMO_SEED
```

El comando usa la base de datos configurada en `.env`, pero **no ejecuta `sync`, no crea tablas y no modifica el esquema**. Antes de ejecutarlo, comprueba que `.env` apunte a una base de datos local/de pruebas y no a una base con información real. El script se bloquea si `NODE_ENV=production` o si no se establece `ALLOW_DEMO_SEED=true`.

## Credenciales de prueba

- Contraseña común: `Demo1234!`
- Correos: terminan en `@example.test`, dominio reservado para ejemplos.
- Números de documento: llevan el prefijo `DEMO-`.
- Teléfonos: son valores ficticios que comienzan por ceros.

Los médicos se crean con estado aprobado para que aparezcan en el buscador del paciente. El script no genera historias clínicas, diagnósticos ni tratamientos falsos.

Los usuarios se agregan a la base de datos y no se borran automáticamente. Para evitar duplicados, cada ejecución genera un sello único para los correos y documentos.
