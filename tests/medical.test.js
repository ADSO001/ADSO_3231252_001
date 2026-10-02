import request from 'supertest';
import app from '../index.js';

describe('Pruebas del Módulo Médico', () => {

  test('GET /medicalRegistration debe responder con 200 o 403 (protección CSRF)', async () => {
    const response = await request(app).get('/medicalRegistration');
    expect([200, 403]).toContain(response.statusCode);
  });

  test('GET /formularioMedico debe responder con 200 o 403', async () => {
    const response = await request(app).get('/formularioMedico');
    
    expect([200, 403]).toContain(response.statusCode);
  });

  test('GET /medicalPanel debe redirigir (302) o denegar acceso (401/403) por ruta protegida', async () => {
    const response = await request(app).get('/medicalPanel');
    expect([302, 401, 403]).toContain(response.statusCode);
  });

});