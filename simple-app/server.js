const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

// Инициализация приложения
const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Обработчик маршрута по умолчанию
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// "База данных" в памяти (для простоты)
let database = [];

// POST: добавление данных
app.post('/api/post', (req, res) => {
    const { timestamp } = req.body;
    if (!timestamp) {
        return res.status(400).json({ error: 'Timestamp is required' });
    }

    const newData = { id: database.length + 1, timestamp };
    database.push(newData);
    res.status(201).json({ message: 'Data saved', data: newData });
});

// FIND: получение всех данных
app.post('/api/find', (req, res) => {
    res.json({ message: 'Data found', data: database });
});

// RESET: удаление всех данных
app.post('/api/reset', (req, res) => {
    database = [];
    res.json({ message: 'All data has been reset' });
});

app.get('/', (req, res) => {
    res.send('Сервер работает! Добро пожаловать!');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
