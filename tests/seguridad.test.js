import request from 'supertest';
import app from '../index.js';

describe('Pruebas de seguridad y middleware de autenticación', () => {
  test('GET /adminPanel o rutas privadas deben rechazar/redirigir accesos anónimos', async () => {
    const response = await request(app).get('/admin');
    
    // Al no enviar cookies de sesión, debe prevenir el acceso directo
    expect([302, 401, 403, 404]).toContain(response.statusCode);
  });
});