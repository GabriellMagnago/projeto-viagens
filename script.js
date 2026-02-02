const STORAGE_KEY = 'projeto_viagens_data';

let currentFilter = 'todas';

let trips = [];


function loadTripsFromStorage() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
        trips = JSON.parse(storedData);
    } else {
        trips = [];
    }
    
    console.log('Viagens carregadas:', trips.length);
}

function saveTripsToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    console.log('Viagens salvas com sucesso');
}


function addTrip(destination, date, status, description = '') {
    const newTrip = {
        id: Date.now(),
        destination: destination.trim(),
        date: date,
        status: status,
        description: description.trim(),
        createdAt: new Date().toISOString()
    };
    
    trips.push(newTrip);
    saveTripsToStorage();
    console.log('Viagem adicionada:', newTrip.destination);
}

function removeTrip(id) {
    const initialLength = trips.length;
    trips = trips.filter(trip => trip.id !== id);
    
    if (trips.length < initialLength) {
        saveTripsToStorage();
        console.log('Viagem removida com sucesso');
    }
}

function updateTripStatus(id, newStatus) {
    const trip = trips.find(t => t.id === id);
    
    if (trip) {
        trip.status = newStatus;
        saveTripsToStorage();
        console.log('Status atualizado para:', newStatus);
    }
}

function getFilteredTrips(filter) {
    if (filter === 'todas') {
        return trips;
    }
    return trips.filter(trip => trip.status === filter);
}

function countTripsByStatus() {
    return {
        total: trips.length,
        planejada: trips.filter(t => t.status === 'planejada').length,
        concluida: trips.filter(t => t.status === 'concluida').length
    };
}


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function createTripCard(trip) {
    const card = document.createElement('div');
    card.className = `trip-card ${trip.status}`;
    card.dataset.id = trip.id;
    
    const statusLabel = trip.status === 'planejada' ? '📋 Planejada' : '✅ Concluída';
    
    const statusButtonText = trip.status === 'planejada' 
        ? '✅ Marcar como Concluída' 
        : '📋 Marcar como Planejada';
    
    card.innerHTML = `
        <div class="trip-destination">${trip.destination}</div>
        <div class="trip-date">📅 ${formatDate(trip.date)}</div>
        
        ${trip.description ? `<div class="trip-description">${trip.description}</div>` : ''}
        
        <span class="trip-status ${trip.status}">${statusLabel}</span>
        
        <div class="trip-actions">
            <button class="btn btn-small btn-success" onclick="handleStatusChange(${trip.id})">
                ${statusButtonText}
            </button>
            <button class="btn btn-small btn-danger" onclick="handleDelete(${trip.id})">
                🗑️ Remover
            </button>
        </div>
    `;
    
    return card;
}

function renderTrips() {
    const tripsList = document.getElementById('tripsList');
    tripsList.innerHTML = '';
    
    const filteredTrips = getFilteredTrips(currentFilter);
    
    if (filteredTrips.length === 0) {
        tripsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🗺️</div>
                <h3>Nenhuma viagem encontrada</h3>
                <p>Comece a planejar sua próxima aventura!</p>
            </div>
        `;
        return;
    }
    
    filteredTrips.forEach(trip => {
        const card = createTripCard(trip);
        tripsList.appendChild(card);
    });
}

function updateFilterCounters() {
    const counts = countTripsByStatus();
    
    const totalBtn = document.querySelector('[data-filter="todas"]');
    const planjBtn = document.querySelector('[data-filter="planejada"]');
    const concluBtn = document.querySelector('[data-filter="concluida"]');
    
    if (totalBtn) totalBtn.innerHTML = `<span class="filter-icon">📌</span> Todas (${counts.total})`;
    if (planjBtn) planjBtn.innerHTML = `<span class="filter-icon">📋</span> Planejadas (${counts.planejada})`;
    if (concluBtn) concluBtn.innerHTML = `<span class="filter-icon">✅</span> Concluídas (${counts.concluida})`;
}

function render() {
    renderTrips();
    updateFilterCounters();
}


function handleFormSubmit(event) {
    event.preventDefault();
    
    const destination = document.getElementById('destination').value;
    const date = document.getElementById('date').value;
    const status = document.getElementById('status').value;
    const description = document.getElementById('description').value;
    
    if (!destination.trim() || !date) {
        alert('⚠️ Por favor, preencha os campos obrigatórios (Destino e Data)');
        return;
    }
    
    addTrip(destination, date, status, description);
    
    document.getElementById('tripForm').reset();
    
    currentFilter = 'todas';
    setActiveFilter('todas');
    
    render();
    
    alert('✅ Viagem adicionada com sucesso!');
}

function handleStatusChange(id) {
    const trip = trips.find(t => t.id === id);
    
    if (trip) {
        const newStatus = trip.status === 'planejada' ? 'concluida' : 'planejada';
        updateTripStatus(id, newStatus);
        render();
    }
}

function handleDelete(id) {
    const trip = trips.find(t => t.id === id);
    
    if (trip) {
        const confirmDelete = confirm(
            `Tem certeza que deseja remover a viagem para ${trip.destination}?`
        );
        
        if (confirmDelete) {
            removeTrip(id);
            render();
            alert('✅ Viagem removida com sucesso!');
        }
    }
}

function setActiveFilter(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function handleFilterClick(event) {
    const filter = event.target.closest('.filter-btn')?.dataset.filter;
    
    if (filter) {
        currentFilter = filter;
        setActiveFilter(filter);
        renderTrips();
    }
}

function scrollToForm() {
    const form = document.getElementById('cadastro');
    form.scrollIntoView({ behavior: 'smooth' });
}


function init() {
    console.log('Inicializando aplicação...');
    
    loadTripsFromStorage();
    
    const form = document.getElementById('tripForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    render();
    
    console.log('Aplicação inicializada com sucesso');
}

document.addEventListener('DOMContentLoaded', init);
