import request from 'supertest';
import app from '../index.js';

describe('Pruebas de la ruta de Usuarios', () => {

  test('GET /login debe responder con estado 200', async () => {
    const response = await request(app).get('/login');
    
    expect([200, 302]).toContain(response.statusCode);
  });

});