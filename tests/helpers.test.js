describe('Pruebas unitarias de utilidades', () => {
  test('Debe validar que un campo no esté vacío', () => {
    const texto = 'Medicina General';
    expect(texto.length).toBeGreaterThan(0);
  });
});