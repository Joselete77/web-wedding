const path = require('path');
const express = require('express');
const multer  = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Donde guardamos los ficheros subidos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Servimos el front estático
app.use('/', express.static(path.join(__dirname, 'public')));

// Servimos las imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API para subir imágenes
app.post('/api/upload', upload.single('imagen'), (req, res) => {
  // req.file contiene info del fichero
  res.json({
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`
  });
});

// API para listar todas las imágenes
app.get('/api/images', (req, res) => {
  const fs = require('fs');
  const files = fs.readdirSync(path.join(__dirname, 'uploads'));
  const list = files.map(name => ({
    name,
    url: `/uploads/${name}`
  }));
  res.json(list);
});

// Arrancamos servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server up on http://localhost:${PORT}`));
