const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Настройка multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Загрузка аудиофайлов
app.post('/upload', upload.array('tracks'), (req, res) => {
    const uploadedFiles = req.files.map(f => f.filename);
    res.json({ message: 'Файлы загружены!', files: uploadedFiles });
});

// Получение списка аудиофайлов
app.get('/tracks', (req, res) => {
    fs.readdir('uploads', (err, files) => {
        if (err) return res.status(500).send('Ошибка при чтении файлов.');
        const audioFiles = files.filter(f => /\.(mp3|wav|ogg|flac|m4a)$/i.test(f));
        res.json(audioFiles);
    });
});

// Запуск
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
