// Aguarda o carregamento do DOM antes de executar qualquer código
// Isso garante que os elementos da página estejam prontos para manipulação
document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS ---
    // Lista de hortas com suas informações (nome, localização, status, etc.)
    const hortas = [
        { id: 1, nome: "Horta Comunitária Jardim Alvorada", endereco: "Jardim Alvorada - Zona Norte", bairro: "Jardim Alvorada", zona: "Norte", descricao: "Horta comunitária voltada para produção de hortaliças e plantas medicinais, atendendo famílias da região norte de Maringá", status: "ativa", participantes: 25, area: 800, cultivos: ["Alface", "Couve", "Cebolinha", "Plantas medicinais"], coordenadas: { lat: -23.3945, lng: -51.9388 } },
        { id: 2, nome: "Horta Comunitária Conjunto Habitacional Inocente Vila Nova", endereco: "Conjunto Habitacional Inocente Vila Nova - Zona Sul", bairro: "Inocente Vila Nova", zona: "Sul", descricao: "Projeto de agricultura urbana que beneficia moradores do conjunto habitacional com produção de alimentos orgânicos", status: "ativa", participantes: 18, area: 600, cultivos: ["Tomate", "Pimentão", "Rúcula", "Manjericão"], coordenadas: { lat: -23.4345, lng: -51.9188 } },
        { id: 3, nome: "Horta Comunitária Jardim Universitário", endereco: "Jardim Universitário - Zona Sul", bairro: "Jardim Universitário", zona: "Sul", descricao: "Horta desenvolvida em parceria com a comunidade universitária, focada em educação ambiental e sustentabilidade", status: "ativa", participantes: 30, area: 1000, cultivos: ["Brócolis", "Couve-flor", "Espinafre", "Ervas aromáticas"], coordenadas: { lat: -23.4195, lng: -51.9338 } },
        { id: 4, nome: "Horta Comunitária Vila Esperança", endereco: "Vila Esperança - Zona Leste", bairro: "Vila Esperança", zona: "Leste", descricao: "Iniciativa comunitária que promove segurança alimentar e integração social no bairro Vila Esperança", status: "ativa", participantes: 22, area: 700, cultivos: ["Acelga", "Beterraba", "Cenoura", "Salsa"], coordenadas: { lat: -23.4095, lng: -51.9088 } },
        { id: 5, nome: "Horta Comunitária Jardim Mandacaru", endereco: "Jardim Mandacaru - Zona Oeste", bairro: "Jardim Mandacaru", zona: "Oeste", descricao: "Projeto que integra produção de alimentos com ações de educação ambiental para crianças e adultos", status: "ativa", participantes: 15, area: 500, cultivos: ["Alface", "Chicória", "Almeirão", "Hortelã"], coordenadas: { lat: -23.4145, lng: -51.9588 } },
        { id: 6, nome: "Horta Comunitária Conjunto Residencial Parigot de Souza", endereco: "Conjunto Residencial Parigot de Souza - Zona Norte", bairro: "Parigot de Souza", zona: "Norte", descricao: "Horta voltada para moradores do conjunto residencial, promovendo alimentação saudável e economia familiar", status: "ativa", participantes: 20, area: 650, cultivos: ["Repolho", "Couve", "Rabanete", "Cebola"], coordenadas: { lat: -23.3845, lng: -51.9288 } },
        { id: 7, nome: "Horta Comunitária Jardim São Silvestre", endereco: "Jardim São Silvestre - Zona Sul", bairro: "Jardim São Silvestre", zona: "Sul", descricao: "Projeto comunitário que combina produção agrícola com atividades de convivência e fortalecimento social", status: "planejamento", participantes: 0, area: 750, cultivos: ["A definir"], coordenadas: { lat: -23.4395, lng: -51.9238 } },
        { id: 8, nome: "Horta Comunitária Vila Operária", endereco: "Vila Operária - Zona Central", bairro: "Vila Operária", zona: "Central", descricao: "Horta urbana localizada em área central, servindo como modelo de agricultura sustentável na cidade", status: "ativa", participantes: 28, area: 900, cultivos: ["Abobrinha", "Pepino", "Quiabo", "Jiló"], coordenadas: { lat: -23.4245, lng: -51.9388 } },
    ];

    // --- ELEMENTOS DO DOM ---
    // Referências aos elementos HTML usados para busca, filtros, estatísticas e lista de hortas
    const searchInput = document.getElementById('searchInput');
    const zoneFilter = document.getElementById('zoneFilter');
    const statusFilter = document.getElementById('statusFilter');
    const sortSelect = document.getElementById('sortSelect');
    const hortasList = document.getElementById('hortasList');
    const hortasCount = document.getElementById('hortasCount');
    const totalHortasEl = document.getElementById('totalHortas');
    const hortasAtivasEl = document.getElementById('hortasAtivas');
    const familiasBeneficiadasEl = document.getElementById('familiasBeneficiadas');
    const areaTotalEl = document.getElementById('areaTotal');
    const loadingModal = document.getElementById('loadingModal');

    // --- ESTADO DA APLICAÇÃO ---
    // Variáveis que controlam o mapa, marcadores e localização do usuário
    let map;
    let markers = [];
    let userLocation = null;

    // --- FUNÇÕES AUXILIARES ---

    // Função debounce: usada para evitar chamadas repetidas de renderização durante digitação
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Calcula a distância entre dois pontos geográficos (coordenadas) usando a fórmula de Haversine
    const haversineDistance = (coords1, coords2) => {
        const toRad = x => (x * Math.PI) / 180;
        const R = 6371; // Raio da Terra em km

        const dLat = toRad(coords2.lat - coords1.lat);
        const dLon = toRad(coords2.lng - coords1.lng);
        const lat1 = toRad(coords1.lat);
        const lat2 = toRad(coords2.lat);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distância em km
    };

    // --- FUNÇÕES PRINCIPAIS ---
    // Mostra ou esconde o modal de carregamento
    const showLoadingModal = (show) => {
        loadingModal.style.display = show ? 'flex' : 'none';
    };

     // Inicializa o mapa centrado em Maringá usando Leaflet.js
    const initializeMap = () => {
        map = L.map('map').setView([-23.41, -51.93], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
    };

     // Obtém a localização atual do usuário se ele permitir
    const getUserLocation = () => {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        resolve();
                    },
                    () => { // Erro ou permissão negada
                        sortSelect.querySelector('option[value="distancia"]').disabled = true;
                        resolve();
                    }
                );
            } else {
                sortSelect.querySelector('option[value="distancia"]').disabled = true;
                resolve();
            }
        });
    };

    // Atualiza os números das estatísticas (totais, participantes, área)
    const updateStatistics = (hortasFiltradas) => {
        totalHortasEl.textContent = hortas.length;

        const hortasAtivas = hortas.filter(h => h.status === 'ativa');
        hortasAtivasEl.textContent = hortasAtivas.length;

        const familiasBeneficiadas = hortas.reduce((acc, h) => acc + (typeof h.participantes === 'number' ? h.participantes : 0), 0);
        familiasBeneficiadasEl.textContent = familiasBeneficiadas;
        
        const areaTotal = hortas.reduce((acc, h) => acc + (typeof h.area === 'number' ? h.area : 0), 0);
        areaTotalEl.textContent = areaTotal;
    };

    // Renderiza a lista de hortas e os marcadores no mapa com base nos filtros e ordenação
    const render = () => {
        // Limpa marcadores antigos do mapa
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        hortasList.innerHTML = '';

        // Captura os valores dos filtros
        const searchTerm = searchInput.value.toLowerCase();
        const zona = zoneFilter.value;
        const status = statusFilter.value;
        const sortBy = sortSelect.value;

        // Aplica ordenação baseada no filtro selecionado
        let hortasFiltradas = hortas.filter(h => {
            const searchMatch = h.nome.toLowerCase().includes(searchTerm) ||
                                h.bairro.toLowerCase().includes(searchTerm) ||
                                h.endereco.toLowerCase().includes(searchTerm);
            const zonaMatch = (zona === 'todas' || h.zona.toLowerCase() === zona);
            const statusMatch = (status === 'todos' || h.status === status);
            return searchMatch && zonaMatch && statusMatch;
        });

        // Atualiza o número de hortas encontradas
        hortasFiltradas.sort((a, b) => {
            switch (sortBy) {
                case 'nome':
                    return a.nome.localeCompare(b.nome);
                case 'zona':
                    return a.zona.localeCompare(b.zona);
                case 'participantes':
                    return b.participantes - a.participantes;
                case 'distancia':
                    if (!userLocation) return 0;
                    const distA = haversineDistance(userLocation, a.coordenadas);
                    const distB = haversineDistance(userLocation, b.coordenadas);
                    return distA - distB;
                default:
                    return 0;
            }
        });
        
        hortasCount.textContent = hortasFiltradas.length;
        
        const fragment = document.createDocumentFragment();

        // Popular lista e mapa
        hortasFiltradas.forEach(horta => {
            // Adicionar marcador ao mapa
            const marker = L.marker([horta.coordenadas.lat, horta.coordenadas.lng])
                .addTo(map)
                .bindPopup(`
                    <strong>${horta.nome}</strong><br>
                    <em>${horta.bairro}</em><br><br>
                    ${horta.descricao}<br><br>
                    <b>Status:</b> ${horta.status}<br>
                    <b>Participantes:</b> ${horta.participantes > 0 ? horta.participantes + ' famílias' : 'Em formação'}<br>
                    <b>Área:</b> ${horta.area}m²
                `);
            
            marker.hortaId = horta.id;
            markers.push(marker);

            // Criar item da lista
            const item = document.createElement('div');
            item.className = 'horta-card';
            item.dataset.id = horta.id;
            
            let distanciaTexto = '';
            if (userLocation && sortBy === 'distancia') {
                const distancia = haversineDistance(userLocation, horta.coordenadas);
                distanciaTexto = ` | <strong>Distância:</strong> ${distancia.toFixed(2)} km`;
            }
            
            item.innerHTML = `
              <h3>${horta.nome}</h3>
              <p><strong>Bairro:</strong> ${horta.bairro} | <strong>Zona:</strong> ${horta.zona}</p>
              <p><strong>Status:</strong> ${horta.status} ${distanciaTexto}</p>
            `;

            fragment.appendChild(item);
        });
        
        hortasList.appendChild(fragment);
    };

    const setupEventListeners = () => {
        const debouncedRender = debounce(render, 300);
        searchInput.addEventListener('input', debouncedRender);
        zoneFilter.addEventListener('change', render);
        statusFilter.addEventListener('change', render);
        sortSelect.addEventListener('change', render);
        
        hortasList.addEventListener('click', (e) => {
            const card = e.target.closest('.horta-card');
            if (!card) return;

            const hortaId = parseInt(card.dataset.id);
            const marker = markers.find(m => m.hortaId === hortaId);
            
            if (marker) {
                map.flyTo(marker.getLatLng(), 15);
                marker.openPopup();
            }
        });
        
        map.on('popupopen', (e) => {
            const hortaId = e.popup._source.hortaId;
            document.querySelectorAll('.horta-card').forEach(c => {
                c.classList.toggle('selected', parseInt(c.dataset.id) === hortaId);
            });
            const selectedEl = document.querySelector(`.horta-card[data-id="${hortaId}"]`);
            if (selectedEl) {
                selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        map.on('popupclose', () => {
             document.querySelectorAll('.horta-card.selected').forEach(c => c.classList.remove('selected'));
        });
    };

    // --- INICIALIZAÇÃO ---
    // Função principal que executa todas as etapas iniciais do sistema
    const init = async () => {
        showLoadingModal(true); // Exibe o modal de carregamento
        initializeMap();        // Inicializa o mapa
        await getUserLocation(); // Obtém localização do usuário
        updateStatistics();     // Atualiza estatísticas com base nos dados
        render();               // Renderiza lista e mapa
        setupEventListeners();  // Ativa eventos de interação
        showLoadingModal(false); // Esconde o modal
    };

    // Inicia o sistema 
    init();
});