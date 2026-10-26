import request from 'supertest';
import app from '../index.js';

describe('Pruebas de rutas de error y páginas no encontradas', () => {
  test('Debe retornar status 404 al intentar acceder a una ruta inexistente', async () => {
    const response = await request(app).get('/ruta-falsa-404');
    expect(response.statusCode).toBe(404);
  });
});