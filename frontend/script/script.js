function validarLogin(event) {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const notificacion = document.getElementById('notificacion');
    const mensaje = document.getElementById('mensaje_notificacion');

   
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Verificar campos vacíos
    if (email === "" || password === "") {
        mostrarNotificacion(event, "Por favor, complete todos los campos.");
        return false;
    }

    // 2. Verificar formato de correo
    if (!regexCorreo.test(email)) {
        mostrarNotificacion(event, "Por favor, ingrese un correo electrónico válido.");
        return false;
    }

    return true;
}

function mostrarNotificacion(event, texto) {
    const notificacion = document.getElementById('notificacion');
    const mensaje = document.getElementById('mensaje_notificacion');

    event.preventDefault(); 
    mensaje.innerText = texto;
    notificacion.classList.add('mostrar');

    setTimeout(() => {
        notificacion.classList.remove('mostrar');
    }, 2500);
}