/* ============================================
   PROJETO VIAGENS - SCRIPT PRINCIPAL
   
   Aplicação web para gerenciar viagens
   - Cadastro, listagem e remoção de viagens
   - Filtros por status
   - Persistência com localStorage
   - Interface responsiva e interativa
   ============================================ */

// ============================================
// 1. VARIÁVEIS GLOBAIS E CONSTANTES
// ============================================

// Chave para armazenar dados no localStorage
const STORAGE_KEY = 'projeto_viagens_data';

// Estado atual do filtro
let currentFilter = 'todas';

// Array que armazena as viagens
let trips = [];


// ============================================
// 2. FUNÇÕES DE ARMAZENAMENTO (localStorage)
// ============================================

/**
 * Carrega as viagens do localStorage
 * Se não existirem dados, inicializa com array vazio
 */
function loadTripsFromStorage() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
        trips = JSON.parse(storedData);
    } else {
        trips = [];
    }
    
    console.log('Viagens carregadas:', trips.length);
}

/**
 * Salva as viagens no localStorage
 * Converte o array para JSON e armazena
 */
function saveTripsToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    console.log('Viagens salvas com sucesso');
}


// ============================================
// 3. FUNÇÕES DE MANIPULAÇÃO DE DADOS (CRUD)
// ============================================

/**
 * Adiciona uma nova viagem
 * @param {string} destination - Destino da viagem
 * @param {string} date - Data de partida (formato: YYYY-MM-DD)
 * @param {string} status - Status (planejada/concluida)
 * @param {string} description - Descrição (opcional)
 */
function addTrip(destination, date, status, description = '') {
    const newTrip = {
        id: Date.now(), // Cria ID único baseado no timestamp
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

/**
 * Remove uma viagem pelo ID
 * @param {number} id - ID da viagem a remover
 */
function removeTrip(id) {
    const initialLength = trips.length;
    trips = trips.filter(trip => trip.id !== id);
    
    if (trips.length < initialLength) {
        saveTripsToStorage();
        console.log('Viagem removida com sucesso');
    }
}

/**
 * Atualiza o status de uma viagem
 * @param {number} id - ID da viagem
 * @param {string} newStatus - Novo status
 */
function updateTripStatus(id, newStatus) {
    const trip = trips.find(t => t.id === id);
    
    if (trip) {
        trip.status = newStatus;
        saveTripsToStorage();
        console.log('Status atualizado para:', newStatus);
    }
}

/**
 * Retorna as viagens filtradas por status
 * @param {string} filter - Filtro a aplicar (todas/planejada/concluida)
 * @returns {array} Viagens filtradas
 */
function getFilteredTrips(filter) {
    if (filter === 'todas') {
        return trips;
    }
    return trips.filter(trip => trip.status === filter);
}

/**
 * Conta viagens por status
 * @returns {object} Objeto com contagem por status
 */
function countTripsByStatus() {
    return {
        total: trips.length,
        planejada: trips.filter(t => t.status === 'planejada').length,
        concluida: trips.filter(t => t.status === 'concluida').length
    };
}


// ============================================
// 4. FUNÇÕES DE RENDERIZAÇÃO
// ============================================

/**
 * Formata uma data para o padrão brasileiro
 * @param {string} dateString - Data em formato ISO
 * @returns {string} Data formatada (dd/mm/yyyy)
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Cria o elemento HTML de um card de viagem
 * @param {object} trip - Objeto da viagem
 * @returns {HTMLElement} Card da viagem
 */
function createTripCard(trip) {
    const card = document.createElement('div');
    card.className = `trip-card ${trip.status}`;
    card.dataset.id = trip.id;
    
    // Define o rótulo do status
    const statusLabel = trip.status === 'planejada' ? '📋 Planejada' : '✅ Concluída';
    
    // Define o texto do botão de status
    const statusButtonText = trip.status === 'planejada' 
        ? '✅ Marcar como Concluída' 
        : '📋 Marcar como Planejada';
    
    // Constrói o HTML do card
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

/**
 * Renderiza a lista de viagens na tela
 * Aplica filtro atual e atualiza o DOM
 */
function renderTrips() {
    const tripsList = document.getElementById('tripsList');
    tripsList.innerHTML = ''; // Limpa a lista
    
    const filteredTrips = getFilteredTrips(currentFilter);
    
    // Se não há viagens, mostra estado vazio
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
    
    // Cria um card para cada viagem
    filteredTrips.forEach(trip => {
        const card = createTripCard(trip);
        tripsList.appendChild(card);
    });
}

/**
 * Atualiza os contadores nos botões de filtro
 */
function updateFilterCounters() {
    const counts = countTripsByStatus();
    
    // Atualiza texto de cada botão de filtro
    const totalBtn = document.querySelector('[data-filter="todas"]');
    const planjBtn = document.querySelector('[data-filter="planejada"]');
    const concluBtn = document.querySelector('[data-filter="concluida"]');
    
    if (totalBtn) totalBtn.innerHTML = `<span class="filter-icon">📌</span> Todas (${counts.total})`;
    if (planjBtn) planjBtn.innerHTML = `<span class="filter-icon">📋</span> Planejadas (${counts.planejada})`;
    if (concluBtn) concluBtn.innerHTML = `<span class="filter-icon">✅</span> Concluídas (${counts.concluida})`;
}

/**
 * Renderiza toda a interface
 * Chamada quando há mudanças nos dados
 */
function render() {
    renderTrips();
    updateFilterCounters();
}


// ============================================
// 5. FUNÇÕES DE TRATAMENTO DE EVENTOS
// ============================================

/**
 * Trata o envio do formulário de cadastro
 * @param {Event} event - Evento do formulário
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Pega os valores do formulário
    const destination = document.getElementById('destination').value;
    const date = document.getElementById('date').value;
    const status = document.getElementById('status').value;
    const description = document.getElementById('description').value;
    
    // Validação básica
    if (!destination.trim() || !date) {
        alert('⚠️ Por favor, preencha os campos obrigatórios (Destino e Data)');
        return;
    }
    
    // Adiciona a viagem
    addTrip(destination, date, status, description);
    
    // Limpa o formulário
    document.getElementById('tripForm').reset();
    
    // Reseta filtro para "todas"
    currentFilter = 'todas';
    setActiveFilter('todas');
    
    // Atualiza interface
    render();
    
    // Feedback visual
    alert('✅ Viagem adicionada com sucesso!');
}

/**
 * Trata a mudança de status de uma viagem
 * @param {number} id - ID da viagem
 */
function handleStatusChange(id) {
    const trip = trips.find(t => t.id === id);
    
    if (trip) {
        const newStatus = trip.status === 'planejada' ? 'concluida' : 'planejada';
        updateTripStatus(id, newStatus);
        render();
    }
}

/**
 * Trata a remoção de uma viagem
 * @param {number} id - ID da viagem
 */
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

/**
 * Define qual botão de filtro está ativo
 * @param {string} filter - Filtro a ativar
 */
function setActiveFilter(filter) {
    // Remove classe "active" de todos os botões
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Adiciona classe "active" no botão selecionado
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

/**
 * Trata o clique nos botões de filtro
 * @param {Event} event - Evento do clique
 */
function handleFilterClick(event) {
    const filter = event.target.closest('.filter-btn')?.dataset.filter;
    
    if (filter) {
        currentFilter = filter;
        setActiveFilter(filter);
        renderTrips();
    }
}

/**
 * Scroll suave para o formulário
 */
function scrollToForm() {
    const form = document.getElementById('cadastro');
    form.scrollIntoView({ behavior: 'smooth' });
}


// ============================================
// 6. INICIALIZAÇÃO
// ============================================

/**
 * Função de inicialização chamada quando o DOM está pronto
 */
function init() {
    console.log('Inicializando aplicação...');
    
    // Carrega dados do localStorage
    loadTripsFromStorage();
    
    // Adiciona ouvinte de evento ao formulário
    const form = document.getElementById('tripForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Adiciona ouvintes aos botões de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    // Renderiza a interface inicial
    render();
    
    console.log('Aplicação inicializada com sucesso');
}

// Executa a inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
