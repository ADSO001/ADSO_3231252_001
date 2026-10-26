import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import db from '../config/db.js';
import protegerRuta from '../middleware/protegerRuta.js'; // Importación estática limpia

describe('Pruebas de la aplicación', () => {

  beforeAll(async () => {
    await db.sync();
  });

  afterAll(async () => {
    await db.close();
  });

  test('Debe responder 200 en GET /', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });

});

describe('Prueba 1: Bloqueo de usuario no autenticado', () => {
  let req, res, next;

  beforeEach(() => {
  req = { 
    session: {},
    cookies: {} // <-- AGREGA ESTA LÍNEA
  };
  res = {
    redirect: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  next = jest.fn();
});

  test('Debe denegar acceso si el usuario no ha iniciado sesión', () => {
  req.cookies = {}; // O req.cookies._token = null;

  protegerRuta(req, res, next);

  expect(res.redirect).toHaveBeenCalledWith('/login');
  expect(next).not.toHaveBeenCalled();
});
});