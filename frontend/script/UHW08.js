function enviar(evento) {
    evento.preventDefault();
    
    var boton_enviar = document.querySelector('.boton_enviar');
    var entrada_email = document.getElementById('email');
    var correo_ingresado = entrada_email.value.trim();

    if (correo_ingresado === "") {
        mostrar_notificacion("Por favor, ingrese su correo electrónico", "alerta_error");
    } else if (!validar_formato_correo(correo_ingresado)) {
        mostrar_notificacion("El formato del correo no es válido", "alerta_error");
    } else {
        boton_enviar.disabled = true;
        boton_enviar.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Procesando...';

        setTimeout(function() {
            mostrar_notificacion("Correo enviado con éxito. Revise su bandeja.", "alerta_exito");
            boton_enviar.disabled = false;
            boton_enviar.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar';
            entrada_email.value = "";
        }, 1500);
    }
}

function validar_formato_correo(correo) {
    var patron_correo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return patron_correo.test(correo);
}
function mostrar_notificacion(mensaje, tipo_alerta) {
    var contenedor_notificaciones = document.querySelector('.contenedor_notificaciones');

    if (!contenedor_notificaciones) {
        contenedor_notificaciones = document.createElement('div');
        contenedor_notificaciones.className = 'contenedor_notificaciones';
        document.body.appendChild(contenedor_notificaciones);
    }
     var burbuja_aviso = document.createElement('div');
    burbuja_aviso.className = "burbuja_aviso " + tipo_alerta;

    var icono_tipo;
    if (tipo_alerta === 'alerta_exito') {
        icono_tipo = '<i class="fa-solid fa-circle-check"></i>';
    } else {
        icono_tipo = '<i class="fa-solid fa-circle-exclamation"></i>';
    }

    burbuja_aviso.innerHTML = icono_tipo + "<span>" + mensaje + "</span>";
    contenedor_notificaciones.appendChild(burbuja_aviso);

    setTimeout(function() {
        burbuja_aviso.classList.add('desvanecer_notificacion');
        setTimeout(function() {
            burbuja_aviso.remove();
        }, 500);
    }, 4000);
}
