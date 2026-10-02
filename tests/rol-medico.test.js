import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import rutaMedico from '../middleware/rutaMedico.js';
import Usuario from '../models/usuarios.js';

describe('Prueba 4: Control de acceso para rol Médico', () => {
  let req, res, next;

  beforeEach(() => {
    req = { session: {}, cookies: {} };
    res = {
      redirect: jest.fn().mockReturnThis(),
      render: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  test('Debe permitir el paso solo si el rol es medico', async () => {
    // 1. Generar token válido
    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign({ id: 3 }, secret);
    req.cookies._token = token;

    // 2. Mockear usuario medico y APROBADO en BD
    jest.spyOn(Usuario, 'findByPk').mockResolvedValue({
      id: 3,
      rol: 'medico',
      estado_aprobacion: 'aprobado'
    });

    await rutaMedico(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});