export function destinoSeguro(siguiente, porDefecto = '/talleres') {
  if (
    typeof siguiente === 'string' &&
    siguiente.startsWith('/') &&
    !siguiente.startsWith('//') &&
    !siguiente.includes('\\')
  ) {
    return siguiente;
  }
  return porDefecto;
}