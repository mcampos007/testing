const form = document.getElementById('registerForm');
let xyz={}
form.addEventListener('submit', e => {
    e.preventDefault();

    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => obj[key] = value);
    const email = obj['email']

    // Usamos Fetch para registrar al usuario
    fetch('/api/extend/users/register', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(result => {
        if (result.status === 201) {
            // Usuario registrado con éxito
            return result.json();

        } else if (result.status === 401 || result.status === 400) {
            // Manejar errores de registro
            return result.json().then(data => {
                console.log("Datos recibidos del servidor:", data);

                const title = data.error;
                const mensajes = data.message;

                Swal.fire({
                    icon: 'error',
                    title: title,
                    text: mensajes
                });

                throw new Error('Error al registrar el usuario');
            });
        }
    }).then(usuarioRegistrado => {
        // Una vez que el usuario se ha registrado con éxito,
        // realizar la segunda solicitud para enviar el correo de registro
        return fetch(`/api/email/registro?email=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }).then(resultEmail => {
        if (resultEmail.status === 200) {
            // Lógica de éxito al enviar el correo de registro
            return resultEmail.json();
        } else {
            // Manejar errores al enviar el correo de registro
            throw new Error('Error al enviar el correo de registro');
        }
    }).then(resultadoEmail => {
        // Procesar la respuesta del correo de registro si es necesario
        console.log(resultadoEmail);
        Swal.fire({
            icon: 'success',
            title: 'Usuario Registrado',
            text: 'Correo de registro enviado',
            showConfirmButton: true,
            timer: 2000,
            willClose: () => {
                window.location.replace('/');
            }
        });
    }).catch(error => {
        // Manejar cualquier error durante el proceso
        console.error(error);
    });
});




/*
FormData es un objeto en JavaScript que se utiliza para construir fácilmente conjuntos de datos clave-valor que representan los campos y valores de un formulario HTML. Esto es útil cuando deseas enviar datos de formulario a través de una solicitud HTTP, como una petición AJAX o una solicitud de formulario.

Cuando creas una instancia de FormData y le pasas un formulario como argumento, la instancia de FormData automáticamente recopila todos los campos y sus valores del formulario y los organiza en un objeto que puedes manipular y enviar fácilmente.
*/