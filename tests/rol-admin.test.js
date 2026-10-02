import { jest } from '@jest/globals';
import rutaAdmin from '../middleware/rutaAdmin.js';

describe('Prueba 3: Restricción de rol Administrador', () => {
  let req, res, next;

  beforeEach(() => {
    req = { session: {}, cookies: {} };
    res = {
      redirect: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  test('Debe rechazar a usuarios sin rol de administrador', () => {
    req.usuario = { id: 2, rol: 'paciente' };

    rutaAdmin(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith('/login'); // Corregido: redirige a /login
    expect(next).not.toHaveBeenCalled();
  });
});