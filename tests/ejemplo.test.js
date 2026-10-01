// tests/ejemplo.test.js

describe('Prueba inicial del proyecto', () => {
  test('debe verificar que las matemáticas básicas funcionen', () => {
    const suma = 5 + 5;
    expect(suma).toBe(10);
  });
});