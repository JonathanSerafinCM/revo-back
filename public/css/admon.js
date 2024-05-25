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
            // Create a new button for each image
            const button = document.createElement('button');
            // Create an img element for the trash icon
            const trashIcon = document.createElement('img');
            trashIcon.src = '/img/icons8-basura-100.png'; // Replace with the path to your trash icon
            trashIcon.alt = 'Delete';
            button.appendChild(trashIcon);
            button.addEventListener('click', function() {
    // Confirm before deleting the image
    if (window.confirm('¿Estás seguro de que quieres eliminar la imagen?')) {
        deleteImage(item.id); // Call a function to delete the image
    }
});
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
async function deleteImage(id) {
    const response = await fetch('http://localhost:3000/deleteImage', {
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
document.getElementById('uploadButton').addEventListener('click', function() {
    document.getElementById('imageInput').click();
});

document.getElementById('imageInput').addEventListener('change', function() {
    var file = this.files[0];
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    formData.append('image', file);
    formData.append('id_imagen', null); // replace with actual id
    formData.append('ruta', 'public/img/' + file.name);
    formData.append('descripcion', 'default'); // replace with actual description
    formData.append('tipo', 'Carrusel'); // replace with actual type
    formData.append('id_usuario', 1);
    xhr.open('POST', '/uploadImageToDB', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            alert('Imagen subida y guardada con éxito!');
            cargarCarrusel();
        } else {
            alert('La subida de la imagen falló!');
        }
    };
    xhr.send(formData);
});
window.onload = cargarCarrusel;