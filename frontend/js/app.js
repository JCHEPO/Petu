// frontend/js/app.js
// Configuración
const API_URL = 'http://localhost:3000/api';

// Estado de la aplicación
const state = {
    isHostMode: false,
    currentUser: null,
    events: []
};

// Elementos DOM
const elements = {
    eventsGrid: document.getElementById('events-grid'),
    backendStatus: document.getElementById('backend-status'),
    loginModal: document.getElementById('login-modal'),
    createEventModal: document.getElementById('create-event-modal'),
    hostModeBtn: document.getElementById('host-mode-btn'),
    modeIndicator: document.getElementById('mode-indicator'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    eventTitle: document.getElementById('event-title'),
    eventDescription: document.getElementById('event-description'),
    eventCategory: document.getElementById('event-category'),
    eventDate: document.getElementById('event-date'),
    eventLocation: document.getElementById('event-location'),
    eventMaxPlayers: document.getElementById('event-max-players'),
    eventMinQuorum: document.getElementById('event-min-quorum'),
    eventRequiresApproval: document.getElementById('event-requires-approval')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    checkBackendStatus();
    loadEvents();
    setupEventListeners();
    updateUI();
}

// ===== FUNCIONES DE BACKEND =====

async function checkBackendStatus() {
    try {
        const response = await fetch('http://localhost:3000/');
        const data = await response.json();
        
        elements.backendStatus.innerHTML = `
            <p class="status-online">
                <i class="fas fa-check-circle"></i> Backend funcionando correctamente
            </p>
            <p class="mt-1"><small>${data.message} - ${new Date(data.timestamp).toLocaleTimeString()}</small></p>
        `;
    } catch (error) {
        elements.backendStatus.innerHTML = `
            <p class="status-offline">
                <i class="fas fa-times-circle"></i> No se pudo conectar al backend
            </p>
            <p class="mt-1"><small>Error: ${error.message}</small></p>
            <p class="mt-1"><small>Asegúrate de que el servidor esté corriendo en otra terminal</small></p>
        `;
    }
}

async function testAPI() {
    try {
        const response = await fetch(API_URL + '/test');
        const data = await response.json();
        showNotification(`✅ ${data.message}`, 'success');
    } catch (error) {
        showNotification(`❌ Error: ${error.message}`, 'error');
    }
}

// ===== FUNCIONES DE EVENTOS =====

async function loadEvents() {
    try {
        showLoadingEvents();
        const response = await fetch(API_URL + '/events');
        state.events = await response.json();
        renderEvents();
    } catch (error) {
        showNotification(`❌ Error cargando eventos: ${error.message}`, 'error');
        // Datos de ejemplo si falla
        state.events = getExampleEvents();
        renderEvents();
    }
}

function showLoadingEvents() {
    elements.eventsGrid.innerHTML = `
        <div class="event-card loading-card">
            <div class="event-body text-center">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando eventos...</p>
            </div>
        </div>
    `;
}

function getExampleEvents() {
    return [
        {
            id: 1,
            title: "Fútbol 5 - Ejemplo",
            description: "Partido amistoso (datos de ejemplo)",
            category: "sports",
            date: "Hoy, 20:00",
            location: "Cancha Central",
            currentPlayers: 8,
            maxPlayers: 10,
            minQuorum: 6,
            status: "confirmed",
            requiresApproval: false
        }
    ];
}

function renderEvents() {
    elements.eventsGrid.innerHTML = '';
    
    if (state.events.length === 0) {
        elements.eventsGrid.innerHTML = `
            <div class="event-card">
                <div class="event-body text-center">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No hay eventos disponibles</h3>
                    <p>Crea el primer evento o intenta recargar.</p>
                </div>
            </div>
        `;
        return;
    }
    
    state.events.forEach(event => {
        const eventCard = createEventCard(event);
        elements.eventsGrid.appendChild(eventCard);
    });
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    const quorumPercentage = calculateQuorumPercentage(
        event.currentPlayers || 0,
        event.maxPlayers,
        event.minQuorum || 2
    );
    
    card.innerHTML = `
        <div class="event-header">
            <span class="event-category ${event.category}">
                ${getCategoryLabel(event.category)}
            </span>
            <span class="event-status ${event.status}">
                ${event.status === 'confirmed' ? '✅ Confirmado' : '⏳ Pendiente'}
            </span>
        </div>
        <div class="event-body">
            <h3 class="event-title">${event.title}</h3>
            <p class="event-description">${event.description}</p>
            <div class="event-details">
                <div class="detail">
                    <i class="far fa-calendar"></i>
                    <span>${formatDate(event.date)}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${event.location}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-users"></i>
                    <span>${event.currentPlayers || 0}/${event.maxPlayers} jugadores</span>
                </div>
                ${event.minQuorum ? `
                <div class="detail">
                    <i class="fas fa-chart-line"></i>
                    <span>Quórum mínimo: ${event.minQuorum}</span>
                </div>` : ''}
            </div>
        </div>
        <div class="event-footer">
            <button class="btn btn-block" onclick="joinEvent(${event.id})">
                <i class="fas fa-sign-in-alt"></i> 
                ${event.requiresApproval ? 'Solicitar Unirse' : 'Unirse al Evento'}
            </button>
        </div>
    `;
    
    return card;
}

// ===== FUNCIONES DE AUTENTICACIÓN =====

async function login() {
    const email = elements.loginEmail.value;
    const password = elements.loginPassword.value;
    
    if (!email || !password) {
        showNotification('Por favor ingresa email y contraseña', 'warning');
        return;
    }
    
    try {
        const response = await fetch(API_URL + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            state.currentUser = data.user;
            showNotification(`✅ Bienvenido ${data.user.full_name}!`, 'success');
            hideLoginModal();
            updateUI();
        } else {
            showNotification(`❌ ${data.error}`, 'error');
        }
    } catch (error) {
        showNotification('✅ Login simulado exitoso', 'success');
        hideLoginModal();
    }
}

// ===== FUNCIONES DE MODO HOST =====

function toggleHostMode() {
    state.isHostMode = !state.isHostMode;
    updateHostModeUI();
    showNotification(
        state.isHostMode 
            ? '🎭 Modo Host activado' 
            : '👤 Modo Usuario activado',
        'info'
    );
}

function updateHostModeUI() {
    const btn = elements.hostModeBtn;
    const indicator = elements.modeIndicator;
    
    if (state.isHostMode) {
        btn.innerHTML = '<i class="fas fa-crown"></i> Modo Host';
        btn.classList.add('btn-mode');
        indicator.style.display = 'block';
    } else {
        btn.innerHTML = '<i class="fas fa-user"></i> Modo Usuario';
        btn.classList.remove('btn-mode');
        indicator.style.display = 'none';
    }
}

// ===== FUNCIONES DE CREACIÓN DE EVENTOS =====

function showCreateEventModal() {
    if (!state.isHostMode) {
        showNotification('Cambia a Modo Host para crear eventos', 'warning');
        return;
    }
    
    // Resetear formulario
    elements.eventTitle.value = '';
    elements.eventDescription.value = '';
    elements.eventCategory.value = 'sports';
    elements.eventDate.value = '';
    elements.eventLocation.value = '';
    elements.eventMaxPlayers.value = '10';
    elements.eventMinQuorum.value = '4';
    elements.eventRequiresApproval.checked = false;
    
    // Establecer fecha mínima
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    elements.eventDate.min = now.toISOString().slice(0, 16);
    
    elements.createEventModal.style.display = 'flex';
}

function hideCreateEventModal() {
    elements.createEventModal.style.display = 'none';
}

async function createEvent() {
    if (!state.isHostMode) return;
    
    const event = {
        title: elements.eventTitle.value,
        description: elements.eventDescription.value,
        category: elements.eventCategory.value,
        date: elements.eventDate.value,
        location: elements.eventLocation.value,
        maxPlayers: parseInt(elements.eventMaxPlayers.value),
        minQuorum: parseInt(elements.eventMinQuorum.value),
        requiresApproval: elements.eventRequiresApproval.checked
    };
    
    // Validación básica
    if (!event.title || !event.date || !event.location) {
        showNotification('Completa los campos requeridos', 'warning');
        return;
    }
    
    if (event.maxPlayers < event.minQuorum) {
        showNotification('El quórum no puede ser mayor al máximo de jugadores', 'warning');
        return;
    }
    
    try {
        const response = await fetch(API_URL + '/events/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('✅ Evento creado exitosamente', 'success');
            hideCreateEventModal();
            loadEvents();
        } else {
            showNotification(`❌ ${data.error}`, 'error');
        }
    } catch (error) {
        showNotification('✅ Evento creado (simulación)', 'success');
        hideCreateEventModal();
        loadEvents();
    }
}

// ===== FUNCIONES AUXILIARES =====

function setupEventListeners() {
    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Agregar botón crear evento al hero
    const heroActions = document.querySelector('.hero-actions');
    if (heroActions && !document.getElementById('create-event-btn')) {
        const createBtn = document.createElement('button');
        createBtn.id = 'create-event-btn';
        createBtn.className = 'btn btn-outline';
        createBtn.innerHTML = '<i class="fas fa-plus"></i> Crear Evento';
        createBtn.onclick = showCreateEventModal;
        heroActions.appendChild(createBtn);
    }
}

function updateUI() {
    updateHostModeUI();
}

function showNotification(message, type = 'info') {
    // Eliminar notificación anterior si existe
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Fecha no especificada';
    
    try {
        // Intentar parsear como ISO string
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('es-ES', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    } catch (e) {
        // Si falla, devolver el string original
    }
    
    return dateString;
}

function getCategoryLabel(category) {
    const labels = {
        'sports': 'Deportes',
        'games': 'Juegos',
        'food': 'Comida',
        'other': 'Otro'
    };
    return labels[category] || category;
}

function calculateQuorumPercentage(current, max, min) {
    if (current <= min) return 0;
    if (current >= max) return 100;
    return Math.round(((current - min) / (max - min)) * 100);
}

// ===== FUNCIONES PÚBLICAS =====
window.loadEvents = loadEvents;
window.testAPI = testAPI;
window.showLoginModal = () => elements.loginModal.style.display = 'flex';
window.hideLoginModal = () => elements.loginModal.style.display = 'none';
window.login = login;
window.toggleHostMode = toggleHostMode;
window.showCreateEventModal = showCreateEventModal;
window.hideCreateEventModal = hideCreateEventModal;
window.createEvent = createEvent;

// Unirse a evento (simulado)
window.joinEvent = async (eventId) => {
    try {
        const response = await fetch(API_URL + '/events/' + eventId + '/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (data.requiresApproval) {
                showNotification('✅ Solicitud enviada. Espera aprobación.', 'info');
            } else {
                showNotification('✅ ¡Te has unido al evento!', 'success');
                loadEvents(); // Recargar para actualizar contadores
            }
        } else {
            showNotification(`❌ ${data.error}`, 'error');
        }
    } catch (error) {
        showNotification('✅ Simulación: Te has unido al evento', 'success');
    }
};