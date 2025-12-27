require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// ========== RUTAS ==========

// 1. RUTA RAIZ
app.get('/', (req, res) => {
    res.json({
        app: 'petu',
        status: 'online 🟢',
        db: 'Supabase Cloud'
    });
});

// 2. OBTENER EVENTOS (Desde Supabase)
app.get('/api/events', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('eventos')
            .select('*')
            .order('fecha', { ascending: true });

        if (error) throw error;

        // Mapeamos para que el frontend reciba los nombres que espera
        const eventos = data.map(row => ({
            id: row.id,
            title: row.titulo,
            description: row.descripcion,
            category: row.categoria,
            date: row.fecha,
            location: row.ubicacion,
            maxPlayers: row.max_participantes,
            minQuorum: row.min_quorum,
            status: row.estado,
            hostName: row.anfitrion
        }));

        res.json(eventos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. CREAR EVENTO (En Supabase)
app.post('/api/events/create', async (req, res) => {
    const evento = req.body;
    try {
        const { data, error } = await supabase
            .from('eventos')
            .insert([{
                titulo: evento.title,
                descripcion: evento.description,
                categoria: evento.category,
                fecha: evento.date,
                ubicacion: evento.location,
                max_participantes: evento.maxPlayers,
                min_quorum: evento.minQuorum,
                anfitrion: evento.hostName || 'Usuario Petu'
            }])
            .select();

        if (error) throw error;
        res.json({ success: true, event: data[0] });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 4. LOGIN (Usando Auth de Supabase)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        res.json({
            success: true,
            user: data.user,
            token: data.session.access_token
        });
    } catch (err) {
        res.status(401).json({ success: false, error: "Credenciales inválidas" });
    }
});

// 5. REGISTRO
app.post('/api/register', async (req, res) => {
    const { email, password, full_name } = req.body;
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name } }
        });

        if (error) throw error;
        res.json({ success: true, user: data.user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Petu en puerto ${PORT} conectado a Supabase`);
});