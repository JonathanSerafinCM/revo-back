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
const supabaseKey = process.env.SUPABASE_KEY || '' // Add a default value of an empty string if SUPABASE_KEY is undefined
const port = process.env.PORT || 3002;
const supabase = createClient(supabaseUrl, supabaseKey)

const app = express();
app.use(express.json());
app.use(express.static(path.resolve('public')));
app.use(express.static(path.resolve('css')));
app.use(cors());
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage })

app.post('/upload', upload.single('image'), async function (req, res, next) {
    const { id } = req.body;
    const newImagePath = path.join('public/img/', req.file.originalname);
    console.log("Ruta de la imagen subida:", newImagePath);
    const sql = "UPDATE imagen SET ruta = ? WHERE id_imagen = ?";
    try {
        await db.query(sql, [newImagePath, id]);
        res.send('Archivo subido y ruta de imagen actualizada con éxito');
        console.log("Ruta de la imagen actualizada con éxito");
    } catch (err) {
        console.log("Error al actualizar la ruta de la imagen:", err);
        return res.status(500).json({ error: err.message });
    }
});
app.post('/deleteImage', async function (req, res, next) {
    const { id } = req.body;
    const sql = "DELETE FROM imagen WHERE id_imagen = ?";
    try {
        await db.query(sql, [id]);
        // Send a JSON response instead of a string
        res.json({ message: 'Imagen eliminada con éxito' });
        console.log("Imagen eliminada con éxito");
    } catch (err) {
        console.log("Error al eliminar la imagen:", err);
        return res.status(500).json({ error: err.message });
    }
});

app.post('/uploadImageToDB', upload.single('image'), async function (req, res, next) {
    const { id_imagen, ruta, descripcion, tipo, id_usuario } = req.body;
    const newImagePath = path.join('public/img/', req.file.originalname);
    console.log("Ruta de la imagen subida:", newImagePath);
    const sql = "INSERT INTO imagen (id_imagen, ruta, descripcion, tipo, id_usuario) VALUES (?, ?, ?, ?, ?)";
    try {
        await db.query(sql, [id_imagen, newImagePath, descripcion, tipo, id_usuario]);
        res.send('Archivo subido y ruta de imagen actualizada con éxito');
        console.log("Ruta de la imagen actualizada con éxito");
    } catch (err) {
        console.log("Error al actualizar la ruta de la imagen:", err);
        return res.status(500).json({ error: err.message });
    }
});
// Inicia el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.get('/', (req, res) => {
    return res.json("Backend");
})
const db = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'revolucionarios'
});
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


testDbConnection().catch(console.error);
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
app.get('/imagenCarrusel', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('imagen')
            .select('ruta')
            .eq('tipo', 'Carrusel');

        if (error) {
            console.log("Error en la consulta a la base de datos:", error);
            return res.status(500).json({ error: error.message });
        }

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
app.get('/login', (req, res) => {
    // Aquí puedes renderizar tu página de login o enviar un archivo HTML
    console.log("Ruta '/login' llamada");
    res.sendFile(path.resolve('public', 'login.html'));
});

function checkAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/admin', checkAuth, (req, res) => {
    res.sendFile(path.resolve('public', 'admon.html'));
});
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static('public'));
//const serveStatic = import('serve-static');
//app.use(serveStatic('Login'));
//app.use(serveStatic('Admon.Rev'));
//app.use('/css', express.static(path.join(__dirname, '../css')));
app.use(express.urlencoded({ extended: true }));
//npm install express-session

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // Consulta a la base de datos para obtener la contraseña del usuario
    const sql = "SELECT contraseña_hash FROM usuario WHERE nombre = ?";
    try {
        const result = await db.query(sql, [username]);
        if (result.length > 0) {
            // Si el nombre de usuario y la contraseña son correctos, redirige al usuario a la página de administración
            if (password === result[0].contraseña_hash) {
                req.session.user = username;
                res.redirect('/admin');
            } else {
                // Si la contraseña es incorrecta, envía un error
                res.status(401).json({ error: 'Contraseña incorrecta' });
            }
        } else {
            // Si el nombre de usuario no existe, envía un error
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (err) {
        console.log("Error en la consulta a la base de datos:", err);
        return res.status(500).json({ error: err.message });
    }
});
app.post('/updateImage', express.json(), async (req, res) => {
    const { temporada } = req.body;
    const newImagePath = path.join('public/img/', `${temporada}.png`);
    const sql = "UPDATE imagen SET ruta = ? WHERE id_imagen = 6";

    try {
        await db.query(sql, [newImagePath]);
        res.json({ message: 'Imagen actualizada con éxito' });
    } catch (err) {
        console.log("Error al actualizar la ruta de la imagen:", err);
        return res.status(500).json({ error: err.message });
    }
});
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