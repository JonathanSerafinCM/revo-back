import express from 'express';
import mariadb from 'mariadb';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js'
import path from 'path';
const dotenv = await import('dotenv');
dotenv.config();
import session from 'express-session';
const supabaseUrl = 'https://qxtumkmhykeajygikdhy.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || '' // Agrega la clave del proyecto de Supabase
const port = process.env.PORT || 3002;
const supabase = createClient(supabaseUrl, supabaseKey)
// Inicializa la aplicación de Express
const app = express();
app.use(express.json());
//Servir archivos estáticos
app.use(express.static(path.resolve('public')));
app.use(express.static(path.resolve('css')));
app.use(cors());
// Configura Multer para subir archivos
var upload = multer({ storage: multer.memoryStorage() })

// Ruta para subir una imagen
app.post('/upload', upload.single('image'), async function (req, res, next) {
    // Elimina la imagen existente
    const file = req.file;

    // Subir la imagen al bucket en Supabase
    const { data: uploadedFile, error: uploadError } = await supabase
        .storage
        .from('img')
        .upload(file.originalname, file.buffer);

    if (uploadError) {
        console.log("Error al subir la imagen:", uploadError);
        return res.status(500).json({ error: uploadError.message });
    } else if (!file.buffer || file.buffer.length === 0) {
        console.log("El búfer del archivo está vacío");
        return res.status(500).json({ error: "El búfer del archivo está vacío" });
    } else {
        console.log("Imagen subida con éxito", uploadedFile);
        if (uploadedFile.size === 0) {
            console.log("La imagen se subió con un tamaño de 0 bytes");
            return res.status(500).json({ error: "La imagen se subió con un tamaño de 0 bytes" });
        }
    }

    // Obtener la URL pública de la imagen
    const { data: urlData, error: urlError } = await supabase
        .storage
        .from('img')
        .getPublicUrl(file.originalname);
    console.log("URL de la imagen:", urlData);

    const newImagePath = urlData.publicUrl;
    console.log("Ruta a subir:", newImagePath);
// Editar la ruta de la imagen en la base de datos
const { data: updatedData, error: updateError } = await supabase
    .from('imagen')
    .update({ ruta: newImagePath })
    .eq('id_imagen', req.body.id);

console.log("Imagen subida con éxito");
    
});
// Ruta para eliminar una imagen
app.post('/deleteImage', async function (req, res, next) {
    const { id } = req.body;
    console.log("ID de la imagen a eliminar:", id);
    try {
        // Obtén la ruta de la imagen de la base de datos
        const { data: imageData, error: imageError } = await supabase
            .from('imagen')
            .select('ruta')
            .eq('id_imagen', id)
            .single();

        if (imageError) throw imageError;

        // Extrae el nombre del archivo de la ruta
        const filename = path.basename(imageData.ruta);

        // Elimina la imagen del almacenamiento de Supabase
        const { error: deleteError } = await supabase
            .storage
            .from('img')
            .remove([filename]);

        if (deleteError) throw deleteError;

        // Elimina la ruta de la imagen de la base de datos
        const { error: dbError } = await supabase
            .from('imagen')
            .delete()
            .eq('id_imagen', id);

        if (dbError) throw dbError;

        res.json({ message: 'Imagen eliminada con éxito' });
        console.log("Imagen eliminada con éxito");
    } catch (err) {
        console.log("Error al eliminar la imagen:", err);
        return res.status(500).json({ error: err.message });
    }
});
// Ruta para subir una imagen al carrusel
app.post('/uploadImageToDB', upload.single('image'), async function (req, res, next) {
    const file = req.file;

    // Subir la imagen al bucket en Supabase
    const { data: uploadedFile, error: uploadError } = await supabase
        .storage
        .from('img')
        .upload(file.originalname, file.buffer);

        if (uploadError) {
            console.log("Error al subir la imagen:", uploadError);
            return res.status(500).json({ error: uploadError.message });
        } else if (!file.buffer || file.buffer.length === 0) {
            console.log("El búfer del archivo está vacío");
            return res.status(500).json({ error: "El búfer del archivo está vacío" });
        } else {
            console.log("Imagen subida con éxito", uploadedFile);
            if (uploadedFile.size === 0) {
                console.log("La imagen se subió con un tamaño de 0 bytes");
                return res.status(500).json({ error: "La imagen se subió con un tamaño de 0 bytes" });
            }
        }

    // Obtener la URL pública de la imagen
    const { data: urlData, error: urlError } = await supabase
        .storage
        .from('img')
        .getPublicUrl(file.originalname);
    console.log("URL de la imagen:", urlData);

    const newImagePath = urlData.publicUrl;
    console.log("Ruta a subir:", newImagePath);
    // Insertar la ruta de la imagen en la base de datos
    const { data: insertedData, error: insertError } = await supabase
        .from('imagen')
        .insert([
            { ruta: newImagePath, descripcion: 'Carrusel', tipo: 'Carrusel', id_usuario: 1 }
        ]);

    if (insertError) {
        console.log("Error al insertar la ruta de la imagen en la base de datos:", insertError);
        return res.status(500).json({ error: insertError.message });
    }
});
// Inicia el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
// Inicializa la sesión
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));
// Ruta para verificar la sesión
app.get('/', (req, res) => {
    return res.json("Backend");
})
// Ruta para verificar la sesión
async function testDbConnection() {
    try {
        const { data, error } = await supabase.from('platillos').select('*');
        if (error) throw error;
        console.log("Conexión a la base de datos verificada correctamente");
        return true;
    } catch (err) {
        console.log("Error en la conexión a la base de datos:", err);
        return false;
    }
}
// Verificar la conexión a la base de datos
testDbConnection().catch(console.error);
// Ruta para obtener todos los platillos
app.get('/platillos' , async (req, res) => {
    console.log("Ruta '/platillos' llamada");
    try {
        const { data, error } = await supabase.from('platillos').select('*');
        if (error) throw error;
        console.log("Consulta a la base de datos ejecutada correctamente");
        return res.json(data);
    } catch (err) {
        console.log("Error en la consulta a la base de datos:", err);
        return res.status(500).json({error: err.message});
    }
});
// Ruta para obtener una imagen por su id
app.get('/imagen/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('imagen')
            .select('ruta')
            .eq('id_imagen', id);
        if (error) throw error;
        if (data && data.length > 0) {
            return res.json({ url: data[0].ruta });
        } else {
            return res.status(404).json({ error: "Imagen no encontrada" });
        }
    } catch (err) {
        console.log("Error en la consulta a la base de datos:", err);
        return res.status(500).json({ error: err.message });
    }
});
// Ruta para generar un carrusel de imágenes
app.get('/carrusel', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('imagen')
            .select('ruta')
            .eq('tipo', 'Carrusel');
        if (error) throw error;
        if (data && data.length > 0) {
            // Devuelve el arreglo de rutas de las imágenes
            return res.json(data.map(item => item.ruta));
        } else {
            return res.status(404).json({ error: "Imagen no encontrada" });
        }
    } catch (err) {
        console.log("Error en la consulta a la base de datos:", err);
        return res.status(500).json({ error: err.message });
    }
});
//Ruta para obtener la ruta de las imagenes del carrusel
app.get('/imagenCarrusel', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('imagen')
            .select('ruta, id_imagen')
            .eq('tipo', 'Carrusel');

        if (error) {
            console.log("Error en la consulta a la base de datos:", error);
            return res.status(500).json({ error: error.message });
        }

        if (data && data.length > 0) {
            // Devuelve el arreglo de rutas de las imágenes y sus respectivos ids
            return res.json(data.map(item => ({ url: item.ruta, id: item.id_imagen })));
        } else {
            return res.status(404).json({ error: "Imagen no encontrada" });
        }
    } catch (err) {
        console.log("Error en la consulta a la base de datos:", err);
        return res.status(500).json({ error: err.message });
    }
});
// Ruta para obtener la ruta de la imagen de fondo
app.get('/fondo', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('imagen')
            .select('ruta')
            .eq('tipo', 'fondo')
            .single();

        if (error) throw error;

        if (data) {
            return res.json({ url: data.ruta });
        } else {
            return res.status(404).json({ error: "Imagen no encontrada" });
        }
    } catch (err) {
        console.log("Error en la consulta a la base de datos:", err);
        return res.status(500).json({ error: err.message });
    }
});
// Ruta para obtener la descripción de un platillo por su nombre
app.get('/descripcion/:nombre', async (req, res) => {
    const { nombre } = req.params;
    try {
        const { data, error } = await supabase
            .from('platillos')
            .select('descripcion')
            .eq('nombre', nombre);
        if (error) throw error;
        if (data && data.length > 0) {
            return res.json(data[0]);
        } else {
            return res.status(404).json({ error: "Descripción no encontrada" });
        }
    } catch (err) {
        console.log("Error en la consulta a la base de datos:", err);
        return res.status(500).json({ error: err.message });
    }
});
//Ruta para hacer login
app.get('/login', (req, res) => {
    console.log("Ruta '/login' llamada");
    res.sendFile(path.resolve('public', 'login.html'));
});
//Funcion para verificar la autenticación
function checkAuth(req, res, next) {
    console.log("Verificando autenticación", req.session.user);
  if (req.session.user) {
    next();
  } else {
    res.redirect('revolucionarios-backend.vercel.app/login');
  }
}
app.use(express.urlencoded({ extended: true }));
//Ruta para el administrador, con checkAuth para verificar la autenticación
app.get('/admin',checkAuth,(req, res) => {
    res.sendFile(path.resolve('public', 'admon.html'));
});


//npm install express-session
//post para login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const { user, error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password
        });

        if (error) throw error;
        console.log("Usuario:", user);
        if (error===null) {
            req.session.user = username;
            console.log("Sesión iniciada:", req.session.user);
            res.redirect('revolucionarios-backend.vercel.app/admin');
        }
    } catch (err) {
        console.log("Error during sign in:", err);
        return res.status(500).json({ error: err.message });
    }
});
//Ruta para cambiar la imagen de fondo segun la temporada
app.post('/updateImage', async function (req, res, next) {
    const { temporada } = req.body;

    // Generar la nueva ruta de la imagen
    const newImagePath = `https://qxtumkmhykeajygikdhy.supabase.co/storage/v1/object/public/img/${temporada}.png`;

    // Actualizar la ruta de la imagen en la base de datos
    const { data: updatedData, error: updateError } = await supabase
        .from('imagen')
        .update({ ruta: newImagePath })
        .eq('tipo', 'fondo');

    if (updateError) {
        console.log("Error al actualizar la imagen:", updateError);
        return res.status(500).json({ error: updateError.message });
    }

    console.log("Imagen actualizada con éxito");
    res.json({ message: 'Imagen actualizada con éxito' });
});
//Ruta para cerrar sesión
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).end();
    });
});
app.use('/src/img', express.static('src/img'));
app.listen(port, () => {
    console.log("Server is running on port", port);
})