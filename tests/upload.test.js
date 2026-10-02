import request from 'supertest';
import app from '../index.js';
import path from 'path';

describe('Pruebas de subida de archivos', () => {
  test('POST /medicalRegistration con adjunto debe procesarse sin romper el servidor', async () => {
    const response = await request(app)
      .post('/medicalRegistration')
      .field('nombre', 'Carlos Pérez')
      .field('email', 'carlos@test.com')
      .attach('documento', Buffer.from('contenido falso de archivo'), 'test.pdf');

    // Debe retornar un código válido de renderizado o procesamiento
    expect([200, 302, 400]).toContain(response.statusCode);
  });
});
