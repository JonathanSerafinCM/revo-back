async function cargarCarrusel() {
    try {
        const response = await fetch('https://revolucionarios-backend.vercel.app/imagenCarrusel');
        if (!response.ok) {
            throw new Error('Error al obtener las imágenes del carrusel');
        }
        const data = await response.json();
        const grid = document.querySelector('.cs-admon__grid');
        grid.innerHTML = '';
        data.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'admon-item';
            const img = document.createElement('img');
            img.src = item.url; // Aquí es donde accedemos a la propiedad url
            img.className = 'background-image';
            div.appendChild(img);
            // Crear un botón para eliminar la imagen
            const button = document.createElement('button');
            // Crear un icono de basura
            const trashIcon = document.createElement('img');
            trashIcon.src = '/img/icons8-basura-100.png';
            trashIcon.alt = 'Delete';
            button.appendChild(trashIcon);
            button.addEventListener('click', function() {
    // Confirmar si el usuario quiere eliminar la imagen
    if (window.confirm('¿Estás seguro de que quieres eliminar la imagen?')) {
        deleteImage(item.id); // Llamar a la función deleteImage
    }
});
// Agregar el botón al div
div.appendChild(button);
            grid.appendChild(div);
            img.addEventListener('click', function() {
                window.id = item.id;
                console.log(item.id);
                document.getElementById('fileInput').click();
            });
        });
    } catch (error) {
        console.error('Error al cargar el carrusel:', error);
    }
}
// Función para eliminar una imagen
async function deleteImage(id) {
    console.log(id);
    const response = await fetch('https://revolucionarios-backend.vercel.app/deleteImage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
    });

    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }

    const result = await response.json();
    console.log(result);
    cargarCarrusel();
}
//Mostrar formulario de actualización de imagen
document.getElementById('fileInput').addEventListener('change', function() {
    var file = this.files[0];
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    formData.append('image', file);
    formData.append('id', window.id);
    xhr.open('POST', '/upload', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            alert('Imagen actualizada con exito!');
            cargarCarrusel();
        } else {
            alert('Image upload failed!');
        }
    };
    xhr.send(formData);
});
//Cambio de fondo segun temporada
document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedOption = document.querySelector('input[name="temporada"]:checked').value;
    fetch('/updateImage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ temporada: selectedOption }),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((error) => {
        console.error('Error:', error);
    });
});
//Cerrar sesión
document.getElementById('logout').addEventListener('click', function() {
    fetch('/logout', { method: 'POST' })
    .then(response => {
        if (response.ok) {
            window.location.href = '/login';
        } else {
            console.error('Failed to logout');
        }
    });
});
//Subir imagen
document.getElementById('uploadButton').addEventListener('click', function() {
    document.getElementById('imageInput').click();
});
//Subir imagen al servidor
document.getElementById('imageInput').addEventListener('change', function() {
    var file = this.files[0];
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    formData.append('image', file);
    xhr.open('POST', '/uploadImageToDB', true);
    xhr.onload = function() {
        if (xhr.status === 500) {
            alert('La subida de la imagen falló!');
        } else {
            alert('Imagen subida y guardada con éxito!');
            cargarCarrusel();
        }
    };
    xhr.send(formData);
});
window.onload = cargarCarrusel;