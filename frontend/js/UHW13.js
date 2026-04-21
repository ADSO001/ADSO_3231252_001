const botonCerrarSesion = document.getElementById('logout');

    botonCerrarSesion.addEventListener('click', function() {

        //Limpiar el almacenamiento del navegador
        localStorage.removeItem('tokenUsuario');
        localStorage.clear(); 

        sessionStorage.clear(); //los datos se borran al cerrar la pestaña
        
        window.location.href = 'index.html'; //Redirigir al inicio de sesión
    });