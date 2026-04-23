function abrirVentanaAgendar() {
    if (document.getElementById('emergenteAgendar')) return;

    const capaOscura = document.createElement('div');
    capaOscura.className = 'capaOscura';
    capaOscura.id = 'emergenteAgendar';
    
    capaOscura.innerHTML = `
        <div class="cuadroEmergente modalAgendar">
            <div class="cabeceraModal">
                <div>
                    <h2 class="tituloModal">Agendar cita</h2>
                    <p class="subtituloModal">Selecciona la fecha y hora de tu cita</p>
                </div>
                <span class="cerrarModal" onclick="cerrarVentanaAgendar()">&times;</span>
            </div>

            <div class="cuerpoModal">
                <div class="columnaInfo">
                    <div class="perfilDocModal">
                        <div class="avatarDoc">M</div>
                        <div class="textoDoc">
                            <p class="nombreDocModal">Dr. María González</p>
                            <p class="especialidadDocModal">Medicina General</p>
                        </div>
                    </div>
                    <hr class="divisorModal">
                    <div class="infoExtra">
                        <h3 class="tituloInfo">Información de la consulta</h3>
                        <p class="itemInfo">Duración aproximada: 30 minutos</p>
                        <p class="itemInfo">Traer identificación oficial y estudios previos</p>
                    </div>
                </div>
                
                <div class="columnaSeleccion">
                    <div class="grupoInput">
                        <label class="pasoTexto">1. Selecciona la fecha</label>
                        <input type="date" id="fechaCita" class="inputForm">
                    </div>

                    <div class="grupoInput">
                        <label class="pasoTexto">2. Selecciona la hora</label>
                        <input type="time" id="horaCita" class="inputForm">
                    </div>

                    <div class="resumenCita">
                        <p class="resumenTitulo">Resumen de la cita</p>
                        <p id="resumenFecha">Fecha: No seleccionada</p>
                        <p id="resumenHora">Hora: No seleccionada</p>
                        <p>Médico: Dr. María González - Medicina General</p>
                    </div>

                    <div class="botonesFinales">
                        <button class="btnCancelarModal" onclick="cerrarVentanaAgendar()">Cancelar</button>
                        <button class="btnConfirmarModal" onclick="confirmarAgendamiento()">Confirmar cita</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(capaOscura);
    capaOscura.style.display = 'flex';

    const inputFecha = document.getElementById('fechaCita');
    const inputHora = document.getElementById('horaCita');
    const txtFecha = document.getElementById('resumenFecha');
    const txtHora = document.getElementById('resumenHora');

    inputFecha.addEventListener('change', () => {
        txtFecha.innerText = "Fecha: " + inputFecha.value;
    });

    inputHora.addEventListener('change', () => {
        txtHora.innerText = "Hora: " + inputHora.value;
    });
}

function cerrarVentanaAgendar() {
    const ventana = document.getElementById('emergenteAgendar');
    if (ventana) ventana.remove();
}

function confirmarAgendamiento() {
    const fecha = document.getElementById('fechaCita').value;
    const hora = document.getElementById('horaCita').value;

    if(fecha && hora) {
        // Lógica para subir al sistema aquí
        cerrarVentanaAgendar();
    }
}