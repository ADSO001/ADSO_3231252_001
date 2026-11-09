/* Notificaciones propias de SIGCMI: avisos y confirmaciones sin alert() ni confirm() del navegador. */
(() => {
  'use strict';

  const iconos = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  const titulos = {
    success: 'Proceso completado',
    error: 'Ocurrió un problema',
    warning: 'Revisa la información',
    info: 'Información'
  };

  let contenedorNotificaciones;

  function obtenerContenedor() {
    if (contenedorNotificaciones?.isConnected) return contenedorNotificaciones;

    contenedorNotificaciones = document.createElement('section');
    contenedorNotificaciones.id = 'sigcmi-notificaciones';
    contenedorNotificaciones.className = 'sigcmi-notificaciones';
    contenedorNotificaciones.setAttribute('aria-live', 'polite');
    contenedorNotificaciones.setAttribute('aria-label', 'Notificaciones del sistema');
    document.body.appendChild(contenedorNotificaciones);
    return contenedorNotificaciones;
  }

  function cerrarNotificacion(elemento) {
    if (!elemento || elemento.dataset.cerrando === 'true') return;
    elemento.dataset.cerrando = 'true';
    elemento.classList.remove('sigcmi-notificacion--visible');
    window.setTimeout(() => elemento.remove(), 220);
  }

  window.mostrarNotificacion = function mostrarNotificacion(opciones = {}) {
    const {
      tipo = 'info',
      titulo,
      mensaje = '',
      duracion = 4800
    } = typeof opciones === 'string' ? { mensaje: opciones } : opciones;

    const tipoSeguro = Object.hasOwn(iconos, tipo) ? tipo : 'info';
    const contenedor = obtenerContenedor();
    const tarjeta = document.createElement('article');
    tarjeta.className = `sigcmi-notificacion sigcmi-notificacion--${tipoSeguro}`;
    tarjeta.setAttribute('role', tipoSeguro === 'error' ? 'alert' : 'status');

    const icono = document.createElement('span');
    icono.className = 'sigcmi-notificacion__icono';
    const iconoFuente = document.createElement('i');
    iconoFuente.className = `fa-solid ${iconos[tipoSeguro]}`;
    iconoFuente.setAttribute('aria-hidden', 'true');
    icono.appendChild(iconoFuente);

    const contenido = document.createElement('div');
    contenido.className = 'sigcmi-notificacion__contenido';

    const encabezado = document.createElement('strong');
    encabezado.className = 'sigcmi-notificacion__titulo';
    encabezado.textContent = titulo || titulos[tipoSeguro];
    contenido.appendChild(encabezado);

    if (mensaje) {
      const texto = document.createElement('p');
      texto.className = 'sigcmi-notificacion__mensaje';
      texto.textContent = String(mensaje);
      contenido.appendChild(texto);
    }

    const cerrar = document.createElement('button');
    cerrar.type = 'button';
    cerrar.className = 'sigcmi-notificacion__cerrar';
    cerrar.setAttribute('aria-label', 'Cerrar notificación');
    cerrar.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    cerrar.addEventListener('click', () => cerrarNotificacion(tarjeta));

    tarjeta.append(icono, contenido, cerrar);
    contenedor.appendChild(tarjeta);
    requestAnimationFrame(() => tarjeta.classList.add('sigcmi-notificacion--visible'));

    const tiempo = Number.isFinite(Number(duracion)) ? Math.max(1200, Number(duracion)) : 4800;
    const temporizador = window.setTimeout(() => cerrarNotificacion(tarjeta), tiempo);
    cerrar.addEventListener('click', () => window.clearTimeout(temporizador), { once: true });

    // Mantiene la interfaz limpia cuando se producen varias respuestas seguidas.
    while (contenedor.children.length > 4) {
      cerrarNotificacion(contenedor.firstElementChild);
    }
  };

  window.confirmarEnAplicacion = function confirmarEnAplicacion(opciones = {}) {
    const {
      titulo = 'Confirmar acción',
      mensaje = '¿Deseas continuar?',
      textoConfirmar = 'Confirmar',
      textoCancelar = 'Cancelar',
      peligro = false
    } = opciones;

    return new Promise((resolve) => {
      const fondo = document.createElement('div');
      fondo.className = 'sigcmi-confirmacion';
      fondo.setAttribute('role', 'presentation');

      const dialogo = document.createElement('section');
      dialogo.className = 'sigcmi-confirmacion__dialogo';
      dialogo.setAttribute('role', 'alertdialog');
      dialogo.setAttribute('aria-modal', 'true');
      dialogo.setAttribute('aria-labelledby', 'sigcmi-confirmacion-titulo');
      dialogo.setAttribute('aria-describedby', 'sigcmi-confirmacion-mensaje');

      const icono = document.createElement('div');
      icono.className = `sigcmi-confirmacion__icono${peligro ? ' sigcmi-confirmacion__icono--peligro' : ''}`;
      icono.innerHTML = peligro
        ? '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-circle-question" aria-hidden="true"></i>';

      const encabezado = document.createElement('h2');
      encabezado.id = 'sigcmi-confirmacion-titulo';
      encabezado.className = 'sigcmi-confirmacion__titulo';
      encabezado.textContent = titulo;

      const descripcion = document.createElement('p');
      descripcion.id = 'sigcmi-confirmacion-mensaje';
      descripcion.className = 'sigcmi-confirmacion__mensaje';
      descripcion.textContent = mensaje;

      const acciones = document.createElement('div');
      acciones.className = 'sigcmi-confirmacion__acciones';

      const cancelar = document.createElement('button');
      cancelar.type = 'button';
      cancelar.className = 'sigcmi-confirmacion__boton sigcmi-confirmacion__boton--secundario';
      cancelar.textContent = textoCancelar;

      const confirmar = document.createElement('button');
      confirmar.type = 'button';
      confirmar.className = `sigcmi-confirmacion__boton ${peligro ? 'sigcmi-confirmacion__boton--peligro' : 'sigcmi-confirmacion__boton--principal'}`;
      confirmar.textContent = textoConfirmar;

      let resuelta = false;
      const finalizar = (resultado) => {
        if (resuelta) return;
        resuelta = true;
        document.removeEventListener('keydown', manejarTecla);
        fondo.classList.remove('sigcmi-confirmacion--visible');
        window.setTimeout(() => fondo.remove(), 180);
        resolve(resultado);
      };

      const manejarTecla = (evento) => {
        if (evento.key === 'Escape') finalizar(false);
      };

      cancelar.addEventListener('click', () => finalizar(false));
      confirmar.addEventListener('click', () => finalizar(true));
      fondo.addEventListener('click', (evento) => {
        if (evento.target === fondo) finalizar(false);
      });
      document.addEventListener('keydown', manejarTecla);

      acciones.append(cancelar, confirmar);
      dialogo.append(icono, encabezado, descripcion, acciones);
      fondo.appendChild(dialogo);
      document.body.appendChild(fondo);
      requestAnimationFrame(() => fondo.classList.add('sigcmi-confirmacion--visible'));
      window.setTimeout(() => cancelar.focus(), 40);
    });
  };
})();
