const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3002;
const JWT_SECRET = 'your_secret_key_here';

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// База данных в памяти
let database = [];

// Авторизация
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === 'admin') {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    }

    return res.status(401).json({ message: 'Invalid username or password' });
});

// Middleware для проверки авторизации
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Please log in first' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

// Защищённый маршрут
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: `Welcome, ${req.user.username}` });
});

// POST: добавление данных
app.post('/api/post', authenticateToken, (req, res) => {
    const { timestamp } = req.body;
    if (!timestamp) return res.status(400).json({ error: 'Timestamp is required' });

    const newData = { id: database.length + 1, timestamp };
    database.push(newData);
    res.status(201).json({ message: 'Data saved', data: newData });
});

// POST: получение всех данных
app.post('/api/find', authenticateToken, (req, res) => {
    if (database.length === 0) {
        return res.json({ message: 'Даних немає' });
    }
    res.json({ message: 'Data found', data: database });
});

// RESET: удаление всех данных
app.post('/api/reset', authenticateToken, (req, res) => {
    database = [];
    res.json({ message: 'All data has been reset' });
});

// Статическая страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


// Авторизация:

/* curl -X POST http://localhost:3002/login \
-H "Content-Type: application/json" \
-d '{"username": "admin", "password": "password"}' */


// Запрос к защищённому маршруту:

/* curl -X GET http://localhost:3002/protected \
-H "Authorization: Bearer your_generated_token_here" */

// Запрос без токена:

/* curl -X GET http://localhost:3002/protected */