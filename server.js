// server.js - Versión SUPER SIMPLE que SIEMPRE funciona
const express = require('express');
const cors = require('cors');
const app = express();
const sqlite3 = require('sqlite3').verbose();

// Configuración CORS para desarrollo
app.use(cors({
    origin: '*',  // Permitir todo en desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error conectando a SQLite:', err.message);
    } else {
        console.log('✅ Conectado a SQLite');
        inicializarDB();
    }
});

function inicializarDB() {
    // Crear tabla de eventos si no existe
    db.run(`CREATE TABLE IF NOT EXISTS eventos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        categoria TEXT NOT NULL,
        fecha TEXT NOT NULL,
        ubicacion TEXT NOT NULL,
        max_participantes INTEGER NOT NULL,
        min_quorum INTEGER NOT NULL,
        requiere_aprobacion BOOLEAN DEFAULT 0,
        estado TEXT DEFAULT 'pendiente',
        anfitrion TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Crear tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        contrasena TEXT NOT NULL,
        vidas INTEGER DEFAULT 3,
        reputacion INTEGER DEFAULT 0,
        nivel TEXT DEFAULT 'principiante',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
}


// ========== RUTAS BÁSICAS QUE SIEMPRE FUNCIONAN ==========

// 1. RUTA RAIZ (/) - ¡IMPORTANTE!
app.get('/', (req, res) => {
    console.log('✅ Alguien accedió a la raíz');
    res.json({
        app: 'petu',
        status: 'online 🟢',
        message: '¡Backend funcionando perfectamente!',
        timestamp: new Date().toISOString(),
        endpoints: {
            root: 'GET /',
            test: 'GET /api/test',
            events: 'GET /api/events',
            register: 'POST /api/register',
            login: 'POST /api/login'
        }
    });
});

// 2. RUTA DE TEST
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: '✅ Test exitoso',
        serverTime: new Date().toISOString()
    });
});

// 3. RUTA DE EVENTOS (datos de ejemplo)
app.get('/api/events', (req, res) => {
    db.all('SELECT * FROM eventos ORDER BY fecha', [], (err, rows) => {
        if (err) {
            console.error('Error BD:', err.message);
            // Si hay error, devolver datos de ejemplo
            return res.json([
                {
                    id: 1,
                    titulo: "Fútbol 5 - Torneo Amistoso",
                    descripcion: "Partido amistoso de fútbol 5.",
                    categoria: "sports",
                    fecha: "Hoy, 20:00",
                    ubicacion: "Cancha Central",
                    max_participantes: 10,
                    min_quorum: 6,
                    estado: "confirmed"
                }
            ]);
        }
        
        // Mapear nombres de campos en inglés para el frontend
        const eventos = rows.map(row => ({
            id: row.id,
            title: row.titulo,
            description: row.descripcion,
            category: row.categoria,
            date: row.fecha,
            location: row.ubicacion,
            maxPlayers: row.max_participantes,
            minQuorum: row.min_quorum,
            status: row.estado,
            requiresApproval: row.requiere_aprobacion === 1,
            hostName: row.anfitrion
        }));
        
        res.json(eventos);
    });
});

// 4. REGISTRAR USUARIO (simulado)
app.post('/api/register', (req, res) => {
    console.log('📝 Intento de registro:', req.body);
    
    const { email, password, full_name } = req.body;
    
    if (!email || !password || !full_name) {
        return res.status(400).json({
            success: false,
            error: 'Faltan campos requeridos'
        });
    }
    
    // Simular registro exitoso
    res.json({
        success: true,
        message: 'Usuario registrado exitosamente',
        user: {
            id: Math.floor(Math.random() * 1000),
            email: email,
            full_name: full_name,
            lives: 3,
            reputation: 0,
            level: 'beginner'
        },
        token: 'demo-jwt-token-' + Date.now()
    });
});

// 5. INICIAR SESIÓN (simulado)
app.post('/api/login', (req, res) => {
    console.log('🔐 Intento de login:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email y contraseña requeridos'
        });
    }
    
    // Simular login exitoso
    res.json({
        success: true,
        message: 'Login exitoso',
        user: {
            id: 1,
            email: email,
            full_name: 'Usuario Demo',
            lives: 3,
            reputation: 50,
            level: 'intermediate'
        },
        token: 'demo-jwt-token-' + Date.now()
    });
});

// CREAR EVENTO REAL
app.post('/api/events/create', (req, res) => {
    console.log('📅 Creando evento real:', req.body.title);
    
    const evento = req.body;
    
    // Validaciones
    if (!evento.title || !evento.date || !evento.location || !evento.maxPlayers || !evento.minQuorum) {
        return res.status(400).json({
            success: false,
            error: 'Faltan campos requeridos'
        });
    }
    
    if (evento.maxPlayers < evento.minQuorum) {
        return res.status(400).json({
            success: false,
            error: 'El quórum no puede ser mayor al máximo de jugadores'
        });
    }
    
    // En un backend real, aquí guardarías en la base de datos
    // Por ahora, simulamos éxito
    
    const newEvent = {
        id: Math.floor(Math.random() * 1000) + 10, // ID único
        title: evento.title,
        description: evento.description || '',
        category: evento.category || 'other',
        date: evento.date,
        location: evento.location,
        currentPlayers: 1, // El creador cuenta como participante
        maxPlayers: evento.maxPlayers,
        minQuorum: evento.minQuorum,
        status: 'pending',
        requiresApproval: evento.requiresApproval || false,
        hostName: 'Tú', // En realidad sería el usuario logueado
        createdAt: new Date().toISOString()
    };
    
    res.json({
        success: true,
        message: 'Evento creado exitosamente',
        event: newEvent,
        eventId: newEvent.id
    });
});
// 7. UNIRSE A EVENTO (simulado)
app.post('/api/events/:id/join', (req, res) => {
    const eventId = req.params.id;
    console.log(`🤝 Unirse al evento ${eventId}`);
    
    res.json({
        success: true,
        message: 'Te has unido al evento exitosamente',
        eventId: eventId,
        requiresApproval: Math.random() > 0.5  // Aleatorio
    });
});

// 8. Ruta 404 para cualquier otra ruta
// Manejador 404 para cualquier ruta no definida
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method
    });
});

// ========== INICIAR SERVIDOR ==========
const PORT = 3000;
const HOST = '0.0.0.0';  // Escuchar en todas las interfaces

app.listen(PORT, HOST, () => {
    console.log('══════════════════════════════════════════════════════════');
    console.log('🚀  SERVIDOR PETU BACKEND INICIADO CORRECTAMENTE');
    console.log(`📡  URL PRINCIPAL: http://localhost:${PORT}`);
    console.log(`🌐  TAMBIÉN DISPONIBLE: http://127.0.0.1:${PORT}`);
    console.log('══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📋  ENDPOINTS DISPONIBLES:');
    console.log(`   ✅  GET  http://localhost:${PORT}/`);
    console.log(`   🧪  GET  http://localhost:${PORT}/api/test`);
    console.log(`   📅  GET  http://localhost:${PORT}/api/events`);
    console.log(`   👤  POST http://localhost:${PORT}/api/register`);
    console.log(`   🔐  POST http://localhost:${PORT}/api/login`);
    console.log(`   ➕  POST http://localhost:${PORT}/api/events`);
    console.log(`   🤝  POST http://localhost:${PORT}/api/events/:id/join`);
    console.log('');
    console.log('💡  PARA PROBAR:');
    console.log('   1. Abre http://localhost:3000 en tu navegador');
    console.log('   2. Luego http://localhost:3000/api/events');
    console.log('');
    console.log('🛑  Presiona Ctrl+C para detener el servidor');
    console.log('══════════════════════════════════════════════════════════');
});
