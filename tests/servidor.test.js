import request from 'supertest';
import app from '../index.js';

describe('Pruebas reales de endpoints sin modificar código fuente', () => {

  test('GET / debe responder status 200 y el texto "Hello World!"', async () => {
    const response = await request(app).get('/');
    
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hello World!');
  });

  test('GET a una ruta que no existe debe retornar un error 404', async () => {
    const response = await request(app).get('/ruta-falsa-xyz');
    
    expect(response.statusCode).toBe(404);
  });

});