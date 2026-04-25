const botonCerrarSesion = document.getElementById('logout');

    botonCerrarSesion.addEventListener('click', function() {

        //Limpiar el almacenamiento del navegador
        localStorage.removeItem('tokenUsuario');
        localStorage.clear(); 

        sessionStorage.clear(); //los datos se borran al cerrar la pestaña
        
        window.location.href = 'index.html'; //Redirigir al inicio de sesión
    });

  //Abrir el modal de "Ver Historia"
const botonesVer = document.querySelectorAll('.btn-ver-historia');
const modalHistoria = document.getElementById('modalHistoria');
const botonesCerrar = document.querySelectorAll('.btn-cerrar');
botonesVer.forEach(boton => {
    boton.addEventListener('click', (e) => {
        e.preventDefault(); 
        modalHistoria.showModal(); 
    });
});  

//Abrir el modal de "Crear Historia"
const botonesCrear = document.querySelectorAll('.btn-crear-historia');
const modalCrear = document.getElementById('modalCrear');
botonesCrear.forEach(boton => {
    boton.addEventListener('click', (e) => {
        e.preventDefault(); 
        modalCrear.showModal(); 
    });
});
