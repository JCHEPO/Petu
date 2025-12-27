// frontend/js/app.js
// Configuración
const API_URL = 'http://localhost:3000/api';

// Estado de la aplicación
const state = {
    user: null,
    filters: {
        city: 'concepcion', // <-- Ciudad por defecto
        types: [],
        status: 'upcoming',
        social: []
    },
    events: [],
    viewMode: 'grid',
    currentCity: 'concepcion' // <-- Ciudad actual
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Mostrar fondo de Concepción por defecto
    document.body.classList.add('city-concepcion');
    setupEventListeners();
    loadEvents();
    updateUI();
}

// ===== FUNCIONES DE EVENTOS =====


async function loadEvents() {
    try {
        showLoading();
        const response = await fetch(API_URL + '/events');
        state.events = await response.json();
        renderEvents();
        updateEventsCount();
    } catch (error) {
        console.error('Error cargando eventos:', error);
        // Datos de ejemplo para desarrollo
        state.events = getExampleEvents();
        renderEvents();
        updateEventsCount();
    } finally {
        hideLoading();
    }
}

function getExampleEvents() {
    return [
        {
            id: 1,
            title: "Fútbol 5 en Parque Bustamante",
            description: "Partido amistoso, todos los niveles bienvenidos. Traer ropa deportiva.",
            type: "sports",
            date: "Hoy, 20:00",
            location: "Parque Bustamante, Santiago",
            currentPlayers: 8,
            maxPlayers: 10,
            minQuorum: 6,
            status: "quorum-high",
            socialLevel: "open",
            requiresApproval: false
        },
        {
            id: 2,
            title: "Trekking Cerro San Cristóbal",
            description: "Caminata guiada por el cerro. Llevar agua y zapatos cómodos.",
            type: "outdoor",
            date: "Mañana, 08:00",
            location: "Cerro San Cristóbal, Santiago",
            currentPlayers: 12,
            maxPlayers: 15,
            minQuorum: 8,
            status: "confirmed",
            socialLevel: "group",
            requiresApproval: true
        },
        {
            id: 3,
            title: "Juegos de Mesa - Cervecería",
            description: "Noche de juegos de estrategia. Trae tus juegos o usa los nuestros.",
            type: "games",
            date: "Viernes, 19:00",
            location: "Cervecería Nacional, Providencia",
            currentPlayers: 4,
            maxPlayers: 8,
            minQuorum: 4,
            status: "quorum-medium",
            socialLevel: "open",
            requiresApproval: false
        }
    ];
}

function renderEvents() {
    const eventsGrid = document.getElementById('events-grid');
    if (!eventsGrid) return; // Verifica que el elemento existe
    
    eventsGrid.innerHTML = '';
    
    if (state.events.length === 0) {
        showNoEventsMessage();
        return;
    }
    
    state.events.forEach(event => {
        const eventCard = createEventCard(event);
        eventsGrid.appendChild(eventCard);
    });
    
    // También renderiza grupos y sugerencias si quieres
    renderGroups();
    renderSuggestions();
}
function renderGroups() {
    const groupsGrid = document.getElementById('groups-grid');
    if (!groupsGrid) return;
    
    // Datos de ejemplo para grupos
    const groups = [
        { id: 1, name: "Futboleros", members: 42, icon: "⚽" },
        { id: 2, name: "Trekking Chile", members: 28, icon: "🥾" },
        { id: 3, name: "Juegos de Mesa", members: 35, icon: "🎲" },
        { id: 4, name: "Cultural Concepción", members: 19, icon: "🎭" }
    ];
    
    groupsGrid.innerHTML = '';
    
    groups.forEach(group => {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.onclick = () => showGroupDetail(group.id);
        
        groupCard.innerHTML = `
            <div class="group-icon">${group.icon}</div>
            <div class="group-name">${group.name}</div>
            <div class="group-members">
                <i class="fas fa-users"></i>
                <span>${group.members} miembros</span>
            </div>
        `;
        
        groupsGrid.appendChild(groupCard);
    });
}
function renderSuggestions() {
    const suggestionsContent = document.getElementById('suggestions-content');
    if (!suggestionsContent) return;
    
    const suggestions = [
        { id: 1, text: "Partido de fútbol", icon: "⚽" },
        { id: 2, text: "Picnic en el parque", icon: "🧺" },
        { id: 3, text: "Juegos de mesa", icon: "🎲" },
        { id: 4, text: "Paseo en bicicleta", icon: "🚴" },
        { id: 5, text: "Minga comunitaria", icon: "👥" },
        { id: 6, text: "Clase de algo", icon: "🎓" }
    ];
    
    suggestionsContent.innerHTML = `
        <div class="suggestions-grid">
            ${suggestions.map(suggestion => `
                <div class="suggestion-card" onclick="createSuggestion('${suggestion.text}')">
                    <div class="suggestion-icon">${suggestion.icon}</div>
                    <div class="suggestion-text">${suggestion.text}</div>
                </div>
            `).join('')}
        </div>
    `;
}
function showNoEventsMessage() {
    // Busca o crea un elemento para mostrar mensaje cuando no hay eventos
    const eventsGrid = document.getElementById('events-grid');
    if (eventsGrid) {
        eventsGrid.innerHTML = `
            <div class="empty-state" style="min-width: 280px;">
                <i class="fas fa-calendar-times"></i>
                <h3>No hay eventos aquí</h3>
                <p>Cambia los filtros o crea el primer evento</p>
                <button class="btn btn-primary" onclick="handleCreateEvent()">
                    Crear primer evento
                </button>
            </div>
        `;
    }
}

function createSuggestion(text) {
    if (!state.user) {
        showLoginModal();
        return;
    }
    
    // Redirigir a creación de evento con sugerencia pre-seleccionada
    // Puedes implementar esto según tu sistema
    console.log('Crear evento con sugerencia:', text);
    // Por ejemplo:
    // openCreateEventWizard({ suggestion: text });
}

function showGroupDetail(groupId) {
    if (!state.user) {
        showLoginModal();
        return;
    }
    
    // Implementa la lógica para mostrar detalles del grupo
    console.log('Mostrar grupo:', groupId);
}
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.onclick = () => showEventDetail(event.id);
    
    const quorumPercentage = calculateQuorumPercentage(
        event.currentPlayers || 0,
        event.maxPlayers,
        event.minQuorum || 2
    );
    
    const quorumStatus = getQuorumStatus(quorumPercentage);
    
    // Para el layout horizontal, puedes usar un diseño más compacto
    card.innerHTML = `
        <div class="event-card-image">
            <div class="event-card-image-placeholder">
                ${getTypeIcon(event.type)}
            </div>
            <div class="event-card-image-badge">
                ${event.currentPlayers || 0}/${event.maxPlayers}
            </div>
        </div>

        <div class="event-card-header">
            <div class="event-type ${event.type}">
                <span class="event-type-icon">${getTypeIcon(event.type)}</span>
                <span>${getTypeLabel(event.type)}</span>
            </div>
        </div>
        
        <div class="event-card-body">
            <h3 class="event-title">${event.title}</h3>
            
            <div class="event-meta">
                <div class="event-meta-item">
                    <i class="far fa-calendar"></i>
                    <span>${formatDate(event.date)}</span>
                </div>
                <div class="event-meta-item">
                    <i class="fas fa-users"></i>
                    <span>${event.currentPlayers || 0}/${event.maxPlayers}</span>
                </div>
            </div>
            
            <div class="event-status ${event.status}">
                ${getStatusLabel(event.status)}
            </div>
        </div>
    `;
    
    return card;
}

// ===== FUNCIONES DE FILTROS =====
function applyFilters() {
    // Obtener valores de los filtros
    const city = document.getElementById('city-select').value;
    const typeCheckboxes = document.querySelectorAll('input[name="event-type"]:checked');
    const statusRadio = document.querySelector('input[name="event-status"]:checked');
    const socialCheckboxes = document.querySelectorAll('input[name="social-level"]:checked');
    
    // Actualizar estado
    state.filters.city = city;
    state.filters.types = Array.from(typeCheckboxes).map(cb => cb.value);
    state.filters.status = statusRadio ? statusRadio.value : 'upcoming';
    state.filters.social = Array.from(socialCheckboxes).map(cb => cb.value);
    
    // Aplicar filtros y recargar eventos
    loadEvents();
}

function resetFilters() {
    // Resetear checkboxes y radios
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[type="radio"]').forEach(rb => {
        if (rb.value === 'upcoming') rb.checked = true;
    });
    
    // Resetear estado
    state.filters = {
        city: '',
        types: [],
        status: 'upcoming',
        social: []
    };
    
    // Recargar eventos
    loadEvents();
}

// ===== FUNCIONES DE UI =====
function showLoading() {
    document.getElementById('loading-state').style.display = 'flex';
    document.getElementById('empty-state').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading-state').style.display = 'none';
}

function updateEventsCount() {
    const count = state.events.length;
    const countElement = document.getElementById('events-count');
    countElement.textContent = `(${count})`;
}

function updateUI() {
    // Actualizar ciudad mostrada
    const citySelect = document.getElementById('city-select');
    const cityDisplay = document.getElementById('city-display');
    
    if (citySelect.value) {
        const selectedOption = citySelect.options[citySelect.selectedIndex];
        cityDisplay.textContent = `Eventos en ${selectedOption.text}`;
    } else {
        cityDisplay.textContent = 'Eventos cerca de ti';
    }
}
function updateCityBackground(city) {
    const body = document.body;
    
    // Remover todas las clases de ciudad
    body.classList.remove('city-santiago', 'city-valparaiso', 'city-concepcion', 'city-concepcion2', 'city-temuco', 'city-default');
    
    // Solo para Concepción: alternar entre dos fondos
    if (city === 'concepcion') {
        // Si ya tiene city-concepcion, cambia a city-concepcion2, y viceversa
        if (body.classList.contains('city-concepcion')) {
            body.classList.add('city-concepcion2');
        } else {
            body.classList.add('city-concepcion');
        }
    } else if (city) {
        // Para otras ciudades
        body.classList.add(`city-${city}`);
    } else {
        body.classList.add('city-default');
    }
}

function toggleViewMode() {
    const toggleBtn = document.getElementById('view-toggle');
    const eventsGrid = document.getElementById('events-grid');
    
    if (state.viewMode === 'grid') {
        state.viewMode = 'list';
        eventsGrid.style.gridTemplateColumns = '1fr';
        toggleBtn.innerHTML = '<i class="fas fa-list"></i><span>Lista</span>';
    } else {
        state.viewMode = 'grid';
        eventsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
        toggleBtn.innerHTML = '<i class="fas fa-th"></i><span>Cards </span>';
    }
}

// ===== FUNCIONES DE USUARIO =====
function handleCreateEvent() {
    if (!state.user) {
        showLoginModal();
        return;
    }
    // TODO: Implementar creación de eventos paso a paso
    alert('Próximamente: Creación de eventos paso a paso');
}

function showLoginModal(context) {
    const modal = document.getElementById('login-modal');
    modal.style.display = 'flex';
    
    // Guardar contexto si es necesario (ej: para redirigir después de login)
    if (context) {
        modal.dataset.context = JSON.stringify(context);
    }
}

function hideLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.style.display = 'none';
}

function loginWithGoogle() {
    // TODO: Implementar login con Google
    state.user = {
        id: 1,
        name: 'Usuario Demo',
        email: 'demo@petu.cl',
        reputation: 100
    };
    hideLoginModal();
    updateHeaderForUser();
    showNotification('¡Bienvenido a petu!', 'success');
}

function loginWithEmail() {
    const form = document.getElementById('login-form');
    form.style.display = 'block';
    
    form.onsubmit = function(e) {
        e.preventDefault();
        // TODO: Implementar login con email
        state.user = {
            id: 1,
            name: 'Usuario Demo',
            email: 'demo@petu.cl',
            reputation: 100
        };
        hideLoginModal();
        updateHeaderForUser();
        showNotification('¡Bienvenido a petu!', 'success');
    };
}

function updateHeaderForUser() {
    const loginBtn = document.getElementById('login-btn');
    const createEventBtn = document.getElementById('create-event-btn');
    
    if (state.user) {
        loginBtn.innerHTML = `
            <i class="fas fa-user-circle"></i>
            <span>${state.user.name}</span>
        `;
        loginBtn.onclick = () => {
            // TODO: Mostrar menú de usuario
            alert('Menú de usuario (próximamente)');
        };
        
        createEventBtn.innerHTML = `
            <i class="fas fa-plus"></i>
            <span>Crear Minga</span>
        `;
    }
}

// ===== FUNCIONES DE EVENTOS (Detalles) =====
function showEventDetail(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;
    
    const modal = document.getElementById('event-detail-modal');
    const title = document.getElementById('event-detail-title');
    const body = modal.querySelector('.modal-body');
    
    title.textContent = event.title;
    
    body.innerHTML = `
        <div class="event-detail">
            <div class="event-detail-header">
                <div class="event-detail-type">
                    <span class="badge badge-primary">${getTypeLabel(event.type)}</span>
                    <span class="badge ${event.status === 'confirmed' ? 'badge-success' : 'badge-warning'}">
                        ${getStatusLabel(event.status)}
                    </span>
                </div>
                <div class="event-detail-meta">
                    <div class="meta-item">
                        <i class="far fa-calendar"></i>
                        <span>${formatDate(event.date)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-users"></i>
                        <span>${event.currentPlayers || 0}/${event.maxPlayers} personas</span>
                    </div>
                    ${event.minQuorum ? `
                    <div class="meta-item">
                        <i class="fas fa-chart-line"></i>
                        <span>Quórum mínimo: ${event.minQuorum}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="event-detail-description">
                <h4>Descripción</h4>
                <p>${event.description}</p>
            </div>
            
            <div class="event-detail-actions">
                ${state.user ? `
                    <button class="btn btn-primary btn-block" onclick="joinEvent(${event.id})">
                        <i class="fas fa-sign-in-alt"></i>
                        Apañar este evento
                    </button>
                ` : `
                    <button class="btn btn-primary btn-block" onclick="showLoginModal()">
                        <i class="fas fa-sign-in-alt"></i>
                        Ingresa para apañar
                    </button>
                `}
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function hideEventDetailModal() {
    document.getElementById('event-detail-modal').style.display = 'none';
}

// ===== FUNCIONES AUXILIARES =====
function setupEventListeners() {
    // Selector de ciudad
    document.getElementById('city-select').addEventListener('change', function() {
        const selectedCity = this.value;
        state.filters.city = selectedCity;
        updateUI();
        
        // Actualizar fondo de la ciudad
        if (selectedCity === 'concepcion') {
            // Forzar el cambio de fondo para Concepción
            updateCityBackground(selectedCity);
        } else {
            updateCityBackground(selectedCity);
        }
        
        loadEvents();
    });
    
    // Filtros
    document.querySelectorAll('input[name="event-type"]').forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });
    
    document.querySelectorAll('input[name="event-status"]').forEach(rb => {
        rb.addEventListener('change', applyFilters);
    });
    
    document.querySelectorAll('input[name="social-level"]').forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });
    
    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}

function getTypeIcon(type) {
    const icons = {
        'sports': '⚽',
        'outdoor': '🌳',
        'cultural': '🎭',
        'games': '🎲',
        'minga': '👥'
    };
    return icons[type] || '📅';
}

function getTypeLabel(type) {
    const labels = {
        'sports': 'Deporte',
        'outdoor': 'Aire libre',
        'cultural': 'Cultural',
        'games': 'Juegos',
        'minga': 'Minga'
    };
    return labels[type] || 'Evento';
}

function getStatusLabel(status) {
    const labels = {
        'quorum-low': 'Buscando gente',
        'quorum-medium': 'Casi listo',
        'quorum-high': 'Minga activa',
        'confirmed': 'Confirmado'
    };
    return labels[status] || 'Pendiente';
}

function getQuorumStatus(percentage) {
    if (percentage < 50) return 'low';
    if (percentage < 80) return 'medium';
    if (percentage < 100) return 'high';
    return 'full';
}

function calculateQuorumPercentage(current, max, min) {
    if (current <= min) return 0;
    if (current >= max) return 100;
    return Math.round(((current - min) / (max - min)) * 100);
}

function formatDate(dateString) {
    if (!dateString) return 'Fecha no especificada';
    return dateString;
}

function showNotification(message, type = 'info') {
    // Implementar notificaciones bonitas
    alert(message);
}
function getTypeImage(type) {
    const images = {
        'sports': '⚽',
        'outdoor': '🌳', 
        'cultural': '🎭',
        'games': '🎲',
        'minga': '👥'
    };
    return images[type] || '📅';
}

// ===== FUNCIONES PÚBLICAS (para onclick) =====
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.toggleViewMode = toggleViewMode;
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;
window.loginWithGoogle = loginWithGoogle;
window.loginWithEmail = loginWithEmail;
window.handleCreateEvent = handleCreateEvent;
window.showEventDetail = showEventDetail;
window.hideEventDetailModal = hideEventDetailModal;
window.joinEvent = async (eventId) => {
    if (!state.user) {
        showLoginModal();
        return;
    }
    
    try {
        const response = await fetch(API_URL + `/events/${eventId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('¡Te has unido al evento!', 'success');
            hideEventDetailModal();
            loadEvents(); // Recargar para actualizar contadores
        } else {
            showNotification(data.error || 'No se pudo unir al evento', 'error');
        }
    } catch (error) {
        showNotification('¡Te has unido al evento! (simulación)', 'success');
        hideEventDetailModal();
        loadEvents();
    }
};

window.goToExplore = () => {
    // Resetear a vista de exploración
    resetFilters();
    document.getElementById('city-select').value = '';
    updateUI();
};

function toggleDarkMode() {
    document.body.classList.toggle('dark');
}
