
const boton_enviar = document.querySelector('.boton_crear_cuenta');

boton_enviar.onclick = function (evento) {
    // Evitamos que la página se mueva al index todavía
    evento.preventDefault();

    // traemos todos los cuadros de texto y los selectores
    let todos_los_campos = document.querySelectorAll('input');
    let todos_los_selects = document.querySelectorAll('select');
    let hay_campos_vacios = false;

    // validar que ningún input esté vacío
    for (let i = 0; i < todos_los_campos.length; i++) {
        if (todos_los_campos[i].value.trim() === "") {
            hay_campos_vacios = true;
        }
    }

    // validar que los selectores no digan "Seleccionar"
    for (let i = 0; i < todos_los_selects.length; i++) {
        if (todos_los_selects[i].value === "Seleccionar") {
            hay_campos_vacios = true;
        }
    }

    // si falta algo, muestra error y paramos
    if (hay_campos_vacios) {
        mostrar_mensaje("Debes completar todos los campos", "rojo_error");
        return;
    }

    // validar el correo
    let correo_texto = todos_los_campos[2].value;
    if (!correo_texto.includes("@") || !correo_texto.includes(".")) {
        mostrar_mensaje("Ingresa un correo electrónico válido", "rojo_error");
        return;
    }

    // mensaje de éxito y redirigir
    mostrar_mensaje("Cuenta creada con éxito", "verde_exito");

    setTimeout(function () {
        window.location.href = "index.html";
    }, 2000);
};

// mostrar la notificación en pantalla
function mostrar_mensaje(texto_alerta, color_clase) {
    let caja_aviso = document.createElement('div');
    caja_aviso.className = "notificacion_sigcmi " + color_clase;
    caja_aviso.innerHTML = texto_alerta;

    document.body.appendChild(caja_aviso);

    // borrar el avisos
    setTimeout(function () {
        caja_aviso.remove();
    }, 3000);
}