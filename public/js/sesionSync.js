(function () {
    const CANAL_SESION = 'sigcmi_sesion_channel';
    const CLAVE_LOGOUT = 'sigcmi_logout_timestamp';
    const esPaginaLogin = window.location.pathname === '/login';
    const scriptActual = document.currentScript;
    const esVistaProtegida = scriptActual && scriptActual.dataset.autenticado === 'true';

    const canal = 'BroadcastChannel' in window ? new BroadcastChannel(CANAL_SESION) : null;

    function notificarCierreEnOtrasPestanas() {
        try {
            localStorage.setItem(CLAVE_LOGOUT, String(Date.now()));
        } catch (_) {}

        if (canal) {
            canal.postMessage({ tipo: 'LOGOUT' });
        }
    }

    function redirigirALogin() {
        if (!esPaginaLogin) {
            window.location.replace('/login');
        }
    }

    // Al llegar al login, notificar a cualquier otra pestaña abierta que la sesión terminó
    if (esPaginaLogin) {
        notificarCierreEnOtrasPestanas();
        return;
    }

    // En vistas públicas (registro, recuperar contraseña, etc.) no hacer nada
    if (!esVistaProtegida) {
        return;
    }

    // 1. Escuchar cierre de sesión desde otras pestañas
    window.addEventListener('storage', (event) => {
        if (event.key === CLAVE_LOGOUT && event.newValue) {
            redirigirALogin();
        }
    });

    if (canal) {
        canal.addEventListener('message', (event) => {
            if (event.data && event.data.tipo === 'LOGOUT') {
                redirigirALogin();
            }
        });
    }

    // 2. Emitir señal inmediata al pulsar Cerrar sesión
    document.addEventListener('click', (event) => {
        const enlace = event.target.closest('a[href="/cerrar-sesion"]');
        if (enlace) {
            notificarCierreEnOtrasPestanas();
        }
    });

    document.addEventListener('submit', (event) => {
        const form = event.target;
        if (form && form.action && form.action.includes('/cerrar-sesion')) {
            notificarCierreEnOtrasPestanas();
        }
    });

    // 3. Verificar cookie contra el servidor al volver a la pestaña o usar botón Atrás
    async function validarSesionActiva() {
        try {
            const respuesta = await fetch('/verificar-sesion', {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                cache: 'no-store'
            });

            if (!respuesta.ok) {
                redirigirALogin();
            }
        } catch (_) {}
    }

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            validarSesionActiva();
        }
    });

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            document.body.style.visibility = 'hidden';
            validarSesionActiva().then(() => {
                document.body.style.visibility = 'visible';
            });
        }
    });
})();