import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import protegerRuta from '../middleware/protegerRuta.js';
import Usuario from '../models/usuarios.js';

describe('Prueba 2: Permitir acceso con sesión válida', () => {
  let req, res, next;

  beforeEach(() => {
    req = { 
      session: {},
      cookies: {} 
    };
    res = {
      redirect: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  test('Debe llamar a next() si el usuario está autenticado', async () => {
    // 1. Generar token JWT válido
    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign({ id: 1 }, secret);
    req.cookies._token = token;

    // 2. Mockear la búsqueda en BD
    jest.spyOn(Usuario, 'findByPk').mockResolvedValue({
      id: 1,
      email: 'usuario@prueba.com',
      rol: 'paciente'
    });

    await protegerRuta(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});