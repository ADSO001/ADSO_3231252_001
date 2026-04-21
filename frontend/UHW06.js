/* Ventana para reprogramar la cita */
function abrirVentanaReprogramar() {
    const capa = document.createElement('div');
    capa.className = 'capa-oscura';
    capa.id = 'emergente-reprogramar';
    
    capa.innerHTML = `
        <div class="cuadro-emergente">
            <h1 class="titulo-emergente">Reprogramar cita</h1>
            
            <div class="info-cita-actual">
                <p><strong>Médico:</strong> Dr. Maria Gonzalez</p>
                <p><strong>Cita actual:</strong> Sábado, 3 de marzo 2026 - 9:00</p>
            </div>
        </div>
    `;

    document.body.appendChild(capa);
    capa.style.display = 'flex';
}