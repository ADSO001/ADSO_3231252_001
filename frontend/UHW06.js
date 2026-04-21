/* Ventana para reprogramar la cita */
function abrirVentanaReprogramar() {
    const capaOscura = document.createElement('div');
    capaOscura.className = 'capaOscura';
    capaOscura.id = 'emergenteReprogramar';
    
    capaOscura.innerHTML = `
        <div class="cuadroEmergente">
            <h1 class="tituloEmergente">Reprogramar cita</h1>
            
            <div class="infoCitaActual">
                <p><strong>Médico:</strong> Dr. Maria Gonzalez</p>
                <p><strong>Cita actual:</strong> Sábado, 3 de marzo 2026 - 9:00</p>
            </div>

            <div class="formularioReprogramar">
                <label class="etiquetaInput">Nueva fecha</label>
                <div class="contenedorInput">
                    <input type="date" id="nuevaFecha" value="2026-03-06">
                </div>

                <label class="etiquetaInput">Nueva hora</label>
                <div class="contenedorInput">
                    <input type="time" id="nuevaHora" value="10:30">
                </div>

                <div class="botonesArea">
                    <button type="button" id="btnCancelar" class="btnNegro">Cancelar</button>
                    <button type="button" id="btnConfirmar" class="btnClaro">Confirmar cambio</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(capaOscura);
    capaOscura.style.display = 'flex';

    document.getElementById('btnCancelar').onclick = function() {
        cerrarVentana();
    };

    document.getElementById('btnConfirmar').onclick = function() {
        cerrarVentana();
    };
}

function cerrarVentana() {
    const ventana = document.querySelector('.capaOscura');
    if (ventana) {
        ventana.remove();
    }
}