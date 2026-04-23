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

                    <div id="contenedorResumen"></div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(capaOscura);
    capaOscura.style.display = 'flex';
}

function cerrarVentanaAgendar() {
    const ventana = document.getElementById('emergenteAgendar');
    if (ventana) ventana.remove();
}