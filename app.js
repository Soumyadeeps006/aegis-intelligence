// ==========================================================================
// Aegis :: Strategic Operations Command
// Core application logic, map, entity graph, dossiers, and filtering.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// --------------------------------------------------------------------------
// Mock Intelligence Data
// --------------------------------------------------------------------------

// Incidents plotted on the geospatial map and shown in the live feed.
// `time` is an ISO-like timestamp; `hoursAgo` drives the time-window filter.
const MOCK_DATA = [
    { id: 'INC-7482', type: 'critical', category: 'incursion', title: 'Unauthorized Border Incursion', location: [48.8566, 2.3522], desc: 'Multiple unidentified vehicles detected crossing vector alpha.', time: '02:14:00Z', hoursAgo: 0.5, entities: ['ORG-001', 'PER-002'] },
    { id: 'INC-7483', type: 'warning', category: 'signal', title: 'Signal Intercept - Encrypted', location: [51.5074, -0.1278], desc: 'High frequency burst transmission detected near safehouse.', time: '02:22:15Z', hoursAgo: 2, entities: ['PLC-001', 'PER-001'] },
    { id: 'INC-7484', type: 'info', category: 'logistics', title: 'Asset Relocation', location: [40.7128, -74.0060], desc: 'VIP transport convoy reached waypoint delta safely.', time: '02:45:30Z', hoursAgo: 4, entities: ['PER-003'] },
    { id: 'INC-7485', type: 'critical', category: 'aerial', title: 'Drone Sighting', location: [35.6762, 139.6503], desc: 'Unregistered UAV spotted loitering above secure facility.', time: '03:10:05Z', hoursAgo: 8, entities: ['ORG-002', 'PLC-002'] },
    { id: 'INC-7486', type: 'warning', category: 'finance', title: 'Anomalous Financial Transfer', location: [47.3769, 8.5417], desc: 'Large offshore transfer detected matching known syndicate patterns.', time: '03:30:00Z', hoursAgo: 11, entities: ['ORG-001', 'PER-001'] },
    { id: 'INC-7487', type: 'info', category: 'signal', title: 'Routine Telemetry Sync', location: [52.5200, 13.4050], desc: 'Field sensor array reported nominal status during scheduled handshake.', time: '04:05:00Z', hoursAgo: 20, entities: ['PLC-002'] },
    { id: 'INC-7488', type: 'critical', category: 'finance', title: 'Sanctioned Wallet Activity', location: [25.2048, 55.2708], desc: 'Cryptocurrency wallet on watchlist initiated rapid layering sequence.', time: '04:40:00Z', hoursAgo: 30, entities: ['ORG-001', 'PER-002'] }
];

// Tracked entities for the relationship graph and dossier system.
const ENTITIES = [
    {
        id: 'PER-001', type: 'person', name: 'Viktor Petrov', alias: 'The Accountant',
        threat: 'critical', status: 'Active', nationality: 'Russian Federation',
        role: 'Financial Operator', lastSeen: 'Geneva, CH',
        summary: 'Primary money-laundering conduit for the Helix Syndicate. Specializes in offshore layering and shell-company orchestration across three continents.',
        attributes: { 'Age': '54', 'Height': '1.78m', 'Affiliation': 'Helix Syndicate', 'Clearance Risk': 'High' },
        history: [
            { date: '2024-11-02', event: 'Linked to anomalous financial transfer (INC-7486).' },
            { date: '2024-08-17', event: 'Observed meeting at Geneva safehouse.' },
            { date: '2024-03-09', event: 'First flagged via SIGINT intercept in Zurich.' }
        ]
    },
    {
        id: 'PER-002', type: 'person', name: 'Mara Sokolova', alias: 'Nightingale',
        threat: 'critical', status: 'Active', nationality: 'Unknown',
        role: 'Field Operative', lastSeen: 'Paris, FR',
        summary: 'High-mobility field operative associated with border incursions and asset interdiction. Believed to coordinate ground teams for the Helix Syndicate.',
        attributes: { 'Age': '~38', 'Height': '1.70m', 'Affiliation': 'Helix Syndicate', 'Clearance Risk': 'Severe' },
        history: [
            { date: '2024-11-04', event: 'Implicated in unauthorized border incursion (INC-7482).' },
            { date: '2024-10-21', event: 'Sanctioned wallet activity traced to her handler (INC-7488).' }
        ]
    },
    {
        id: 'PER-003', type: 'person', name: 'Daniel Cross', alias: 'Courier',
        threat: 'warning', status: 'Monitored', nationality: 'United Kingdom',
        role: 'Logistics Coordinator', lastSeen: 'New York, US',
        summary: 'Logistics coordinator managing VIP transport and asset relocation. Cooperative under surveillance; no direct hostile action recorded.',
        attributes: { 'Age': '41', 'Height': '1.82m', 'Affiliation': 'Independent', 'Clearance Risk': 'Moderate' },
        history: [
            { date: '2024-11-01', event: 'Oversaw VIP convoy relocation (INC-7484).' }
        ]
    },
    {
        id: 'ORG-001', type: 'organization', name: 'Helix Syndicate', alias: 'HX',
        threat: 'critical', status: 'Active', nationality: 'Transnational',
        role: 'Criminal Network', lastSeen: 'Multiple theatres',
        summary: 'Transnational criminal network engaged in finance, smuggling, and influence operations. Decentralized cell structure with deep state-actor ties.',
        attributes: { 'Founded': 'c. 2016', 'Members': '~240 est.', 'Reach': 'Global', 'Clearance Risk': 'Severe' },
        history: [
            { date: '2024-11-02', event: 'Pattern match on anomalous transfer (INC-7486).' },
            { date: '2024-10-21', event: 'Sanctioned wallet sequence detected (INC-7488).' },
            { date: '2024-09-15', event: 'Cell structure mapped across 6 nodes.' }
        ]
    },
    {
        id: 'ORG-002', type: 'organization', name: 'Kestrel Aerospace', alias: 'KA',
        threat: 'warning', status: 'Under Review', nationality: 'Japan',
        role: 'Front Company', lastSeen: 'Tokyo, JP',
        summary: 'Aerospace contractor suspected of fronting UAV procurement for hostile actors. Connection to drone sighting under active investigation.',
        attributes: { 'Founded': '2011', 'Employees': '~80', 'Sector': 'Aerospace', 'Clearance Risk': 'Moderate' },
        history: [
            { date: '2024-10-28', event: 'Hardware match to unregistered UAV (INC-7485).' }
        ]
    },
    {
        id: 'PLC-001', type: 'place', name: 'Geneva Safehouse', alias: 'Site Echo',
        threat: 'warning', status: 'Surveilled', nationality: 'Switzerland',
        role: 'Operational Site', lastSeen: 'Geneva, CH', location: [46.2044, 6.1432],
        summary: 'Suspected coordination hub for syndicate financial operations. Repeated encrypted transmissions originate from this location.',
        attributes: { 'Coordinates': '46.20 N, 6.14 E', 'Type': 'Residential', 'Coverage': 'Continuous', 'Clearance Risk': 'Moderate' },
        history: [
            { date: '2024-11-03', event: 'Encrypted burst transmission intercepted (INC-7483).' },
            { date: '2024-08-17', event: 'Petrov observed entering premises.' }
        ]
    },
    {
        id: 'PLC-002', type: 'place', name: 'Tokyo Secure Facility', alias: 'Site Fuji',
        threat: 'critical', status: 'Hardened', nationality: 'Japan',
        role: 'Protected Asset', lastSeen: 'Tokyo, JP', location: [35.6762, 139.6503],
        summary: 'High-value protected facility subject to aerial reconnaissance. Perimeter integrity maintained; airspace incursions logged.',
        attributes: { 'Coordinates': '35.67 N, 139.65 E', 'Type': 'Government', 'Coverage': 'Hardened', 'Clearance Risk': 'High' },
        history: [
            { date: '2024-10-28', event: 'UAV loitering detected overhead (INC-7485).' },
            { date: '2024-10-15', event: 'Routine telemetry sync logged (INC-7487).' }
        ]
    }
];

// Relationships between entities (undirected for layout, labelled for display).
const LINKS = [
    { source: 'PER-001', target: 'ORG-001', label: 'Member of' },
    { source: 'PER-002', target: 'ORG-001', label: 'Operative for' },
    { source: 'PER-001', target: 'PLC-001', label: 'Frequents' },
    { source: 'PER-002', target: 'PER-001', label: 'Reports to' },
    { source: 'ORG-001', target: 'ORG-002', label: 'Procures via' },
    { source: 'ORG-002', target: 'PLC-002', label: 'Targets' },
    { source: 'PER-003', target: 'PLC-002', label: 'Services' },
    { source: 'PER-003', target: 'PER-001', label: 'Known contact' }
];

const TYPE_LABELS = {
const ENTITY_KIND_LABELS = { person: 'Person', organization: 'Organization', place: 'Place' };

// // --------------------------------------------------------------------------
// Application State & Audio Systems
// --------------------------------------------------------------------------

// Native Web Audio Synthesizer
let audioCtx;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playTone(frequency, type, duration, volume = 0.1) {
    if (!state.audioEnabled) return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = type;
        osc.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        console.warn('Audio play failed:', e);
    }
}

const audio = {
    chirp: () => playTone(850, 'sine', 0.07, 0.12),
    tick: () => playTone(1200, 'triangle', 0.015, 0.04),
    alert: () => {
        if (!state.audioEnabled) return;
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(480, ctx.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
        } catch (e) {}
    },
    siren: () => {
        if (!state.audioEnabled) return;
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(640, ctx.currentTime + 0.4);
            osc.frequency.linearRampToValueAtTime(320, ctx.currentTime + 0.8);
            gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.85);
        } catch(e) {}
    },
    speak: (text) => {
        if (!state.audioEnabled) return;
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.05;
            utterance.pitch = 0.95;
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                const enVoice = voices.find(v => v.lang.startsWith('en'));
                if (enVoice) utterance.voice = enVoice;
            }
            window.speechSynthesis.speak(utterance);
        } catch (e) {}
    }
};

const state = {
    view: 'geo',
    filters: {
        severity: new Set(['critical', 'warning', 'info']),
        types: new Set(), // empty == all types
        time: 'all'
    },
    dossierType: 'all',
    selectedEntity: null,
    
    // Tactical command states
    defcon: 4,
    audioEnabled: false,
    playback: {
        playing: false,
        value: 48,
        intervalId: null
    },
    simEnabled: false,
    simIntervalId: null,
    unresolvedIncidents: new Set(),
    drawMode: null, // 'path', 'zone', 'logPoint', or null
    drawnItems: [], // keeps drawn polyline/polygon objects on map
    activePathfinder: false,
    pathfinderSource: null,
    pathfinderTarget: null,
    mapLayer: 'dark'
};

let map;
let markers = {};
let graphInitialized = false;

// --------------------------------------------------------------------------
// Init App
// --------------------------------------------------------------------------

function initApp() {
    initMap();
    initFilters();
    applyFilters();
    initNavigation();
    initDossiers();
    initSearch();
    
    // Initialize Upgraded Systems
    initAudioToggle();
    initDefcon();
    initPlayback();
    initMapControls();
    initConsole();
    initIncidentModal();
    initGraphControls();
}

// --------------------------------------------------------------------------
// Map (Geospatial Intelligence)
// --------------------------------------------------------------------------

function initMap() {
    map = L.map('map-container', {
        zoomControl: false,
        doubleClickZoom: false // disable to allow double click drawings
    }).setView([45.0, 10.0], 3);

    // Initialize layered tile maps
    state.mapLayers = {
        dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CartoDB Dark Matter',
            subdomains: 'abcd',
            maxZoom: 20
        }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; ESRI World Imagery',
            maxZoom: 18
        }),
        grid: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CartoDB Dark Grid',
            subdomains: 'abcd',
            maxZoom: 20
        })
    };

    // Load default Dark Tactical map
    state.mapLayers.dark.addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Bind map events for coordinates draw and point reporting
    map.on('click', handleMapClick);
    map.on('dblclick', (e) => {
        if (!state.drawMode || state.drawMode === 'logPoint') return;
        L.DomEvent.preventDefault(e);
        finishDrawing();
    });
}

function plotMarkers(incidents) {
    Object.values(markers).forEach(m => map.removeLayer(m));
    markers = {};

    incidents.forEach(incident => {
        const customIcon = L.divIcon({
            className: `custom-marker ${incident.type}`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const marker = L.marker(incident.location, { icon: customIcon }).addTo(map);
        const accent = incident.type === 'critical' ? '#ff3366' : (incident.type === 'warning' ? '#ffb800' : '#00f0ff');

        marker.bindPopup(`
            <div style="background: #080c11; color: #e2e8f0; padding: 10px; border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 4px;">
                <h4 style="color: ${accent}; margin: 0 0 5px 0;">${incident.id}</h4>
                <p style="margin: 0; font-size: 13px;">${incident.title}</p>
            </div>
        `);

        markers[incident.id] = marker;
    });
}

function populateIncidents(incidents) {
    const feed = document.getElementById('incidentFeed');
    feed.innerHTML = '';

    if (incidents.length === 0) {
        feed.innerHTML = '<div class="feed-empty">No incidents match the current filters.</div>';
        return;
    }

    incidents.forEach(incident => {
        const card = document.createElement('div');
        const isUnresolved = state.unresolvedIncidents.has(incident.id);
        
        card.className = `incident-card ${incident.type} ${isUnresolved ? 'unresolved' : ''}`;

        card.onclick = () => {
            map.flyTo(incident.location, 6, { duration: 1.5 });
            markers[incident.id].openPopup();
            
            // Resolve simulator incident on click
            if (state.unresolvedIncidents.has(incident.id)) {
                state.unresolvedIncidents.delete(incident.id);
                card.classList.remove('unresolved');
                logConsole('TRIAGE', 'SYS', `TACTICAL THREAT REPORT ${incident.id} ACKNOWLEDGED`);
                audio.chirp();
            }
        };

        card.innerHTML = `
            <div class="incident-header">
                <span>${incident.id}</span>
                <span>${incident.time}</span>
            </div>
            <div class="incident-title">${incident.title}</div>
            <div class="incident-meta">
                <span class="tag tag-${incident.type}">${incident.type}</span>
                <span class="tag tag-cat">${TYPE_LABELS[incident.category] || incident.category}</span>
                ${isUnresolved ? '<span class="tag" style="background:rgba(255,51,102,0.2); color:#ff3366; animation:pulse 1s infinite;">Unresolved</span>' : ''}
            </div>
            <div class="incident-desc">${incident.desc}</div>
        `;

        feed.appendChild(card);
    });
}

// --------------------------------------------------------------------------
// Advanced Filtering
// --------------------------------------------------------------------------

function initFilters() {
    const typeContainer = document.getElementById('filterType');
    const categories = [...new Set(MOCK_DATA.map(d => d.category))];
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'chip active';
        btn.dataset.value = cat;
        btn.textContent = TYPE_LABELS[cat] || cat;
        typeContainer.appendChild(btn);
    });
    categories.forEach(cat => state.filters.types.add(cat));

    document.getElementById('filterSeverity').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        toggleSetChip(chip, state.filters.severity, chip.dataset.value);
        applyFilters();
    });

    typeContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        toggleSetChip(chip, state.filters.types, chip.dataset.value);
        applyFilters();
    });

    document.getElementById('filterTime').addEventListener('change', (e) => {
        state.filters.time = e.target.value;
        applyFilters();
    });

    document.getElementById('filterReset').addEventListener('click', resetFilters);
}

function toggleSetChip(chip, set, value) {
    if (set.has(value)) {
        set.delete(value);
        chip.classList.remove('active');
    } else {
        set.add(value);
        chip.classList.add('active');
    }
}

function getFilteredIncidents() {
    const { severity, types, time } = state.filters;
    const maxHours = time === 'all' ? Infinity : parseFloat(time);
    
    // Playback slider time boundary: Visible if age is within current playback bounds
    const playVal = state.playback.value;
    const minHoursAgo = 48 - playVal;

    return MOCK_DATA.filter(inc =>
        severity.has(inc.type) &&
        types.has(inc.category) &&
        inc.hoursAgo <= maxHours &&
        inc.hoursAgo >= minHoursAgo
    );
}

function applyFilters() {
    const filtered = getFilteredIncidents();
    plotMarkers(filtered);
    populateIncidents(filtered);
    const count = document.getElementById('filterCount');
    count.textContent = `${filtered.length} incident${filtered.length === 1 ? '' : 's'} shown`;
}

function resetFilters() {
    state.filters.severity = new Set(['critical', 'warning', 'info']);
    state.filters.types = new Set(MOCK_DATA.map(d => d.category));
    state.filters.time = 'all';
    state.playback.value = 48;
    
    document.getElementById('playbackSlider').value = 48;
    updatePlaybackLabel();

    document.querySelectorAll('#filterSeverity .chip, #filterType .chip')
        .forEach(c => c.classList.add('active'));
    document.getElementById('filterTime').value = 'all';

    applyFilters();
}

// --------------------------------------------------------------------------
// View Navigation
// --------------------------------------------------------------------------

function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            setActiveNav(item);
            switchView(view);

            if (item.dataset.focus === 'alerts') {
                focusAlerts();
            }
        });
    });
}

function setActiveNav(activeItem) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    activeItem.classList.add('active');
}

function switchView(view) {
    state.view = view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + view).classList.add('active');

    if (view === 'geo' && map) {
        setTimeout(() => map.invalidateSize(), 60);
    }
    if (view === 'graph') {
        renderGraph();
    }
    if (view === 'dossier' && !state.selectedEntity) {
        selectEntity(ENTITIES[0].id);
    }
}

function focusAlerts() {
    state.filters.severity = new Set(['critical', 'warning']);
    document.querySelectorAll('#filterSeverity .chip').forEach(c => {
        c.classList.toggle('active', c.dataset.value !== 'info');
    });
    applyFilters();
}

// --------------------------------------------------------------------------
// Entity-Relationship Graph & Panning camera
// --------------------------------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';
let graphNodes = [];

// Pan & Zoom values
let zoomScale = 1.0;
let panX = 0;
let panY = 0;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;

function renderGraph() {
    const svg = document.getElementById('graphCanvas');
    const rect = svg.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;

    if (!graphInitialized) {
        graphNodes = ENTITIES.map((e, i) => {
            const angle = (i / ENTITIES.length) * Math.PI * 2;
            return {
                id: e.id, entity: e,
                x: width / 2 + Math.cos(angle) * 170,
                y: height / 2 + Math.sin(angle) * 170,
                vx: 0, vy: 0, fixed: false
            };
        });
        graphInitialized = true;
    }

    runForceSimulation(width, height);
    drawGraph(svg, width, height);
}

function runForceSimulation(width, height) {
    const nodeById = {};
    graphNodes.forEach(n => { nodeById[n.id] = n; });

    for (let iter = 0; iter < 240; iter++) {
        for (let i = 0; i < graphNodes.length; i++) {
            for (let j = i + 1; j < graphNodes.length; j++) {
                const a = graphNodes[i], b = graphNodes[j];
                let dx = a.x - b.x, dy = a.y - b.y;
                let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
                const force = 9500 / (dist * dist);
                const fx = (dx / dist) * force, fy = (dy / dist) * force;
                a.vx += fx; a.vy += fy;
                b.vx -= fx; b.vy -= fy;
            }
        }
        LINKS.forEach(link => {
            const a = nodeById[link.source], b = nodeById[link.target];
            if (!a || !b) return;
            let dx = b.x - a.x, dy = b.y - a.y;
            let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
            const force = (dist - 140) * 0.022;
            const fx = (dx / dist) * force, fy = (dy / dist) * force;
            a.vx += fx; a.vy += fy;
            b.vx -= fx; b.vy -= fy;
        });
        graphNodes.forEach(n => {
            if (n.fixed) { n.vx = 0; n.vy = 0; return; }
            n.vx += (width / 2 - n.x) * 0.0025;
            n.vy += (height / 2 - n.y) * 0.0025;
            n.vx *= 0.82; n.vy *= 0.82;
            n.x += n.vx; n.y += n.vy;
            n.x = Math.max(40, Math.min(width - 40, n.x));
            n.y = Math.max(40, Math.min(height - 40, n.y));
        });
    }
}

function drawClusters(viewport) {
    const groups = {};
    ENTITIES.forEach(entity => {
        const aff = entity.attributes && entity.attributes.Affiliation;
        if (aff && aff !== 'Independent' && aff !== 'Unknown') {
            if (!groups[aff]) groups[aff] = [];
            groups[aff].push(entity.id);
        }
    });
    
    const nodeById = {};
    graphNodes.forEach(n => { nodeById[n.id] = n; });
    
    Object.entries(groups).forEach(([affName, entityIds]) => {
        const coords = entityIds.map(id => nodeById[id]).filter(Boolean);
        if (coords.length < 2) return;
        
        const avgX = coords.reduce((sum, n) => sum + n.x, 0) / coords.length;
        const avgY = coords.reduce((sum, n) => sum + n.y, 0) / coords.length;
        
        let maxDist = 0;
        coords.forEach(n => {
            const dx = n.x - avgX;
            const dy = n.y - avgY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > maxDist) maxDist = dist;
        });
        
        const radius = maxDist + 35;
        
        const halo = document.createElementNS(SVG_NS, 'circle');
        halo.setAttribute('cx', avgX);
        halo.setAttribute('cy', avgY);
        halo.setAttribute('r', radius);
        halo.setAttribute('class', 'graph-cluster-boundary');
        viewport.appendChild(halo);
        
        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', avgX);
        label.setAttribute('y', avgY - radius - 8);
        label.setAttribute('class', 'graph-cluster-label');
        label.textContent = `${affName.toUpperCase()} CELL AREA`;
        viewport.appendChild(label);
    });
}

function drawGraph(svg, width, height) {
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const viewport = document.getElementById('graphViewport');
    viewport.innerHTML = '';
    
    const nodeById = {};
    graphNodes.forEach(n => { nodeById[n.id] = n; });

    // 1. Draw background affiliation clusters
    drawClusters(viewport);

    // 2. Draw edges
    LINKS.forEach(link => {
        const a = nodeById[link.source], b = nodeById[link.target];
        if (!a || !b) return;
        
        const gEdge = document.createElementNS(SVG_NS, 'g');
        gEdge.setAttribute('class', 'graph-edge-group');
        gEdge.dataset.source = link.source;
        gEdge.dataset.target = link.target;
        
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
        line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
        line.setAttribute('class', 'graph-edge');
        gEdge.appendChild(line);

        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', (a.x + b.x) / 2);
        label.setAttribute('y', (a.y + b.y) / 2 - 4);
        label.setAttribute('class', 'graph-edge-label');
        label.textContent = link.label;
        gEdge.appendChild(label);
        
        viewport.appendChild(gEdge);
    });

    // 3. Draw nodes
    graphNodes.forEach(node => {
        const g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('class', `graph-node ${node.entity.type} threat-${node.entity.threat}`);
        g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        g.dataset.id = node.id;

        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('r', node.entity.type === 'organization' ? 22 : 16);
        circle.setAttribute('class', 'graph-node-circle');
        g.appendChild(circle);

        const text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('class', 'graph-node-label');
        text.setAttribute('y', (node.entity.type === 'organization' ? 22 : 16) + 16);
        text.textContent = node.entity.name;
        g.appendChild(text);

        attachNodeInteractions(g, node, svg);
        viewport.appendChild(g);
    });

    updateGraphTransform();
}

function attachNodeInteractions(g, node, svg) {
    let dragging = false;
    let moved = false;

    const toSvgPoint = (evt) => {
        const rect = svg.getBoundingClientRect();
        // Adjust for viewport scale & pans
        const x = (evt.clientX - rect.left - panX) / zoomScale;
        const y = (evt.clientY - rect.top - panY) / zoomScale;
        return { x, y };
    };

    g.addEventListener('mousedown', (evt) => {
        dragging = true;
        moved = false;
        node.fixed = true;
        g.classList.add('dragging');
        evt.stopPropagation(); // prevent panning canvas
        evt.preventDefault();
    });

    window.addEventListener('mousemove', (evt) => {
        if (!dragging) return;
        moved = true;
        const p = toSvgPoint(evt);
        node.x = p.x; node.y = p.y;
        node.vx = 0; node.vy = 0;
        drawGraph(svg, svg.viewBox.baseVal.width, svg.viewBox.baseVal.height);
    });

    window.addEventListener('mouseup', () => {
        if (dragging) {
            dragging = false;
            node.fixed = false;
            g.classList.remove('dragging');
        }
    });

    g.addEventListener('click', () => {
        if (moved) return;
        if (state.activePathfinder) {
            handlePathfinderSelection(node.id);
        } else {
            openDossierFromGraph(node.id);
        }
    });
}

function openDossierFromGraph(entityId) {
    const navItem = document.querySelector('.nav-item[data-view="dossier"]');
    setActiveNav(navItem);
    switchView('dossier');
    selectEntity(entityId);
}

// --------------------------------------------------------------------------
// Dossier System & PDF Printing
// --------------------------------------------------------------------------

function initDossiers() {
    renderDossierList();

    document.getElementById('dossierTypeFilter').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('#dossierTypeFilter .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.dossierType = chip.dataset.value;
        renderDossierList();
    });
}

function getDossierEntities() {
    if (state.dossierType === 'all') return ENTITIES;
    return ENTITIES.filter(e => e.type === state.dossierType);
}

function renderDossierList() {
    const list = document.getElementById('dossierList');
    list.innerHTML = '';

    getDossierEntities().forEach(entity => {
        const item = document.createElement('div');
        item.className = `dossier-item threat-${entity.threat}`;
        if (entity.id === state.selectedEntity) item.classList.add('selected');
        item.dataset.id = entity.id;
        item.innerHTML = `
            <div class="dossier-item-avatar ${entity.type}">${initials(entity.name)}</div>
            <div class="dossier-item-info">
                <div class="dossier-item-name">${entity.name}</div>
                <div class="dossier-item-role">${ENTITY_KIND_LABELS[entity.type]} &middot; ${entity.role}</div>
            </div>
            <span class="threat-pill threat-${entity.threat}">${entity.threat}</span>
        `;
        item.addEventListener('click', () => selectEntity(entity.id));
        list.appendChild(item);
    });
}

function selectEntity(entityId) {
    state.selectedEntity = entityId;
    document.querySelectorAll('.dossier-item').forEach(i => {
        i.classList.toggle('selected', i.dataset.id === entityId);
    });
    renderDossierDetail(entityId);
}

function renderDossierDetail(entityId) {
    const entity = ENTITIES.find(e => e.id === entityId);
    const detail = document.getElementById('dossierDetail');
    if (!entity) {
        detail.innerHTML = '<div class="dossier-empty">Select an entity to view its dossier.</div>';
        return;
    }

    const attributes = Object.entries(entity.attributes).map(([k, v]) => `
        <div class="attr">
            <div class="attr-key">${k}</div>
            <div class="attr-val">${v}</div>
        </div>
    `).join('');

    const associates = getAssociates(entityId).map(a => `
        <div class="associate" data-id="${a.entity.id}">
            <div class="dossier-item-avatar ${a.entity.type}">${initials(a.entity.name)}</div>
            <div class="associate-info">
                <div class="associate-name">${a.entity.name}</div>
                <div class="associate-rel">${a.label}</div>
            </div>
        </div>
    `).join('') || '<div class="dossier-empty-sm">No known associates.</div>';

    const incidents = getRelatedIncidents(entityId).map(inc => `
        <div class="related-incident ${inc.type}">
            <span class="related-id">${inc.id}</span>
            <span class="related-title">${inc.title}</span>
        </div>
    `).join('') || '<div class="dossier-empty-sm">No linked incidents.</div>';

    const history = entity.history.map(h => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-date">${h.date}</div>
                <div class="timeline-event">${h.event}</div>
            </div>
        </div>
    `).join('');

    detail.innerHTML = `
        <div class="dossier-header">
            <div class="dossier-avatar-lg ${entity.type}">${initials(entity.name)}</div>
            <div class="dossier-header-info" style="flex:1;">
                <div class="dossier-name-row" style="display:flex; justify-content:space-between; align-items:center;">
                    <h1>${entity.name}</h1>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <span class="threat-pill threat-${entity.threat}">${entity.threat} threat</span>
                        <button class="btn-reset" id="exportDossierBtn" style="padding: 6px 12px; display:flex; align-items:center; gap:6px; cursor:pointer;" title="Generate intelligence report to print or save">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Export report
                        </button>
                    </div>
                </div>
                <div class="dossier-alias">"${entity.alias}" &middot; ${entity.id}</div>
                <div class="dossier-tags">
                    <span class="tag tag-cat">${ENTITY_KIND_LABELS[entity.type]}</span>
                    <span class="tag tag-cat">${entity.status}</span>
                    <span class="tag tag-cat">${entity.nationality}</span>
                </div>
            </div>
        </div>

        <div class="dossier-summary">${entity.summary}</div>

        <div class="dossier-section">
            <h3 class="dossier-section-title">Profile Attributes</h3>
            <div class="attr-grid">${attributes}</div>
        </div>

        <div class="dossier-columns">
            <div class="dossier-section">
                <h3 class="dossier-section-title">Known Associates</h3>
                <div class="associate-list">${associates}</div>
            </div>
            <div class="dossier-section">
                <h3 class="dossier-section-title">Linked Incidents</h3>
                <div class="related-incident-list">${incidents}</div>
            </div>
        </div>

        <div class="dossier-section">
            <h3 class="dossier-section-title">Historical Operational Log</h3>
            <div class="timeline">${history}</div>
        </div>
    `;

    // Jump between dossiers via associates link
    detail.querySelectorAll('.associate').forEach(el => {
        el.addEventListener('click', () => selectEntity(el.dataset.id));
    });
    
    // Print report button click handler
    document.getElementById('exportDossierBtn').addEventListener('click', () => {
        logConsole('PRINTER', 'SYS', `INTEL PROFILE EXPORT INITIATED FOR ${entity.name}`);
        audio.chirp();
        window.print();
    });
}

function getAssociates(entityId) {
    const result = [];
    LINKS.forEach(link => {
        if (link.source === entityId || link.target === entityId) {
            const otherId = link.source === entityId ? link.target : link.source;
            const entity = ENTITIES.find(e => e.id === otherId);
            if (entity) result.push({ entity, label: link.label });
        }
    });
    return result;
}

function getRelatedIncidents(entityId) {
    return MOCK_DATA.filter(inc => inc.entities && inc.entities.includes(entityId));
}

function initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// --------------------------------------------------------------------------
// Global Search
// --------------------------------------------------------------------------

function initSearch() {
    document.getElementById('globalSearch').addEventListener('keypress', function (e) {
        if (e.key !== 'Enter') return;
        const query = this.value.trim().toLowerCase();
        this.value = '';
        if (!query) return;

        const match = ENTITIES.find(en =>
            en.name.toLowerCase().includes(query) ||
            en.alias.toLowerCase().includes(query) ||
            en.id.toLowerCase().includes(query)
        );

        if (match) {
            openDossierFromGraph(match.id);
        } else {
            logConsole('SEARCH', 'ALERT', `QUERY '${query}' - NULL MATCH FOUND`);
            audio.alert();
            alert('No entity matched query: ' + query);
        }
    });
}

// --------------------------------------------------------------------------
// Upgrade Implementations: Audio, DEFCON, Playback, Drawing, Modal, Console, Simulator, Pathfinder
// --------------------------------------------------------------------------

function initAudioToggle() {
    const btn = document.getElementById('audioToggleBtn');
    btn.addEventListener('click', () => {
        state.audioEnabled = !state.audioEnabled;
        const icon = document.getElementById('audioIcon');
        
        if (state.audioEnabled) {
            btn.style.color = "var(--accent-cyan)";
            icon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>`;
            // Trigger audio context startup
            getAudioContext();
            logConsole('SYSTEM', 'SYS', 'TACTICAL VOCAL COMM AND AUDIO COMPONENT ENGAGED');
            audio.chirp();
            audio.speak("Vocal alert module activated.");
        } else {
            btn.style.color = "";
            icon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>`;
            logConsole('SYSTEM', 'SYS', 'AUDIO COMM OUTPUT DAMPENED');
        }
    });
}

function initDefcon() {
    const trigger = document.getElementById('defconTrigger');
    const dropdown = document.getElementById('defconDropdown');
    
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        trigger.classList.toggle('open');
    });
    
    document.addEventListener('click', () => {
        trigger.classList.remove('open');
    });
    
    dropdown.addEventListener('click', (e) => {
        const opt = e.target.closest('.defcon-option');
        if (!opt) return;
        setDefconLevel(parseInt(opt.dataset.level));
    });
}

function setDefconLevel(level) {
    state.defcon = level;
    document.getElementById('defconText').textContent = `DEFCON ${level}`;
    document.body.setAttribute('data-defcon', level);
    
    if (level === 1) {
        logConsole('COMMAND', 'ALERT', 'DEFCON 1 ALARM SEQUENCE ACTIVATED - COMBAT READY');
        audio.siren();
        audio.speak("System upgrade: DEFCON 1 alert sequence active. Maximum threat containment mode.");
        focusAlerts();
    } else if (level === 2) {
        logConsole('COMMAND', 'ALERT', 'DEFCON 2 CODES DISTRIBUTED');
        audio.alert();
        audio.speak("Alert. DEFCON 2 state active.");
    } else {
        logConsole('COMMAND', 'SYS', `ALERT STATUS STABILIZED AT DEFCON ${level}`);
        audio.chirp();
    }
}

function initPlayback() {
    const slider = document.getElementById('playbackSlider');
    const playBtn = document.getElementById('playBtn');
    
    slider.addEventListener('input', (e) => {
        state.playback.value = parseInt(e.target.value);
        updatePlaybackLabel();
        applyFilters();
    });
    
    playBtn.addEventListener('click', () => {
        if (state.playback.playing) {
            pausePlayback();
        } else {
            startPlayback();
        }
    });
}

function updatePlaybackLabel() {
    const val = state.playback.value;
    const timeLabel = document.getElementById('playbackTime');
    if (val === 48) {
        timeLabel.textContent = "All Time";
    } else {
        const hoursAgo = 48 - val;
        timeLabel.textContent = `-${hoursAgo} hrs`;
    }
}

function startPlayback() {
    const playBtn = document.getElementById('playBtn');
    const slider = document.getElementById('playbackSlider');
    
    state.playback.playing = true;
    playBtn.innerHTML = `<svg id="pauseIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
    logConsole('SYSTEM', 'SYS', 'CHRONOLOGICAL LOG-TIMELINE SWEEP STARTED');
    audio.chirp();
    
    if (state.playback.value >= 48) {
        state.playback.value = 0;
        slider.value = 0;
    }
    
    state.playback.intervalId = setInterval(() => {
        state.playback.value += 1;
        slider.value = state.playback.value;
        updatePlaybackLabel();
        
        // Find simulated incidents triggered at this hour tick
        const ageTick = 48 - state.playback.value;
        MOCK_DATA.forEach(inc => {
            if (inc.hoursAgo >= ageTick && inc.hoursAgo < ageTick + 1) {
                spawnRipple(inc.location, inc.type);
                if (inc.type === 'critical') {
                    audio.alert();
                } else {
                    audio.chirp();
                }
            }
        });
        
        applyFilters();
        
        if (state.playback.value >= 48) {
            pausePlayback();
            logConsole('SYSTEM', 'SYS', 'PLAYBACK SIMULATION SWEEP COMPLETED');
        }
    }, 280);
}

function pausePlayback() {
    const playBtn = document.getElementById('playBtn');
    state.playback.playing = false;
    playBtn.innerHTML = `<svg id="playIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    
    if (state.playback.intervalId) {
        clearInterval(state.playback.intervalId);
        state.playback.intervalId = null;
    }
    audio.chirp();
    logConsole('SYSTEM', 'SYS', 'PLAYBACK SWEEP PAUSED');
}

function spawnRipple(latlng, severity) {
    if (!map) return;
    const color = severity === 'critical' ? '#ff3366' : (severity === 'warning' ? '#ffb800' : '#00f0ff');
    const circle = L.circle(latlng, {
        radius: 8000,
        color: color,
        fillColor: color,
        fillOpacity: 0.6,
        weight: 1.5
    }).addTo(map);
    
    let rad = 8000;
    let opacity = 0.6;
    const interval = setInterval(() => {
        rad += 38000;
        opacity -= 0.05;
        if (opacity <= 0) {
            clearInterval(interval);
            map.removeLayer(circle);
        } else {
            circle.setRadius(rad);
            circle.setStyle({ fillOpacity: opacity, opacity: opacity });
        }
    }, 45);
    
    state.drawnItems.push(circle);
}

function initMapControls() {
    // Map style switching
    document.querySelectorAll('.layer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lKey = e.target.dataset.layer;
            Object.values(state.mapLayers).forEach(layer => map.removeLayer(layer));
            state.mapLayers[lKey].addTo(map);
            
            document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.mapLayer = lKey;
            audio.chirp();
            logConsole('SYSTEM', 'SYS', `TILES CHANGED: ACTIVE GRID '${lKey.toUpperCase()}'`);
        });
    });

    // Draw buttons
    document.getElementById('drawPolylineBtn').addEventListener('click', () => setDrawMode('path'));
    document.getElementById('drawPolygonBtn').addEventListener('click', () => setDrawMode('zone'));
    document.getElementById('logIncidentModeBtn').addEventListener('click', () => setDrawMode('logPoint'));
    
    document.getElementById('clearTacticalBtn').addEventListener('click', () => {
        state.drawnItems.forEach(item => map.removeLayer(item));
        state.drawnItems = [];
        audio.chirp();
        logConsole('SYSTEM', 'SYS', 'ALL TACTICAL MAP PLOTS PURGED');
    });

    // Live operations simulator
    const simBtn = document.getElementById('simToggleBtn');
    simBtn.addEventListener('click', () => {
        state.simEnabled = !state.simEnabled;
        simBtn.classList.toggle('active', state.simEnabled);
        
        if (state.simEnabled) {
            simBtn.textContent = "Sim: ACTIVE";
            logConsole('SYSTEM', 'SEC', 'LIVE OPS INTELLIGENCE SIMULATOR ONLINE');
            audio.chirp();
            startSimulator();
        } else {
            simBtn.textContent = "Sim: OFF";
            logConsole('SYSTEM', 'SYS', 'LIVE SIMULATION DISCONNECTED');
            audio.chirp();
            stopSimulator();
        }
    });
}

let tempVertices = [];
let tempDrawLine = null;

function handleMapClick(e) {
    if (!state.drawMode) return;
    
    if (state.drawMode === 'logPoint') {
        openIncidentModal(e.latlng.lat, e.latlng.lng);
        setDrawMode(null);
        return;
    }
    
    const latlng = e.latlng;
    tempVertices.push(latlng);
    audio.chirp();

    const nodeMarker = L.circleMarker(latlng, {
        radius: 4,
        color: state.drawMode === 'path' ? '#00f0ff' : '#ffb800',
        fillOpacity: 1,
        zIndexOffset: 1200
    }).addTo(map);
    
    state.drawnItems.push(nodeMarker);

    if (tempVertices.length > 1) {
        if (tempDrawLine) map.removeLayer(tempDrawLine);
        
        if (state.drawMode === 'path') {
            tempDrawLine = L.polyline(tempVertices, { color: '#00f0ff', weight: 2.5, dashArray: '5,5' }).addTo(map);
        } else {
            tempDrawLine = L.polygon(tempVertices, { color: '#ffb800', weight: 2, fillColor: 'rgba(255,184,0,0.1)', fillOpacity: 0.4 }).addTo(map);
        }
    }
}

function finishDrawing() {
    if (tempVertices.length < 2) {
        cancelDrawing();
        return;
    }
    
    if (tempDrawLine) map.removeLayer(tempDrawLine);
    
    let shape;
    if (state.drawMode === 'path') {
        shape = L.polyline(tempVertices, { color: '#00f0ff', weight: 3 }).addTo(map);
        logConsole('PLANNER', 'SIG', 'TACTICAL FLIGHT COORDINATES DEPLOYED');
        audio.chirp();
    } else {
        shape = L.polygon(tempVertices, { color: '#ffb800', weight: 2, fillColor: 'rgba(255,184,0,0.06)', fillOpacity: 0.25 }).addTo(map);
        logConsole('PLANNER', 'SEC', 'EXCLUSION ZONE PATROL BOX DEFINED');
        audio.chirp();
    }
    
    if (shape) state.drawnItems.push(shape);
    
    tempVertices = [];
    tempDrawLine = null;
    setDrawMode(null);
}

function cancelDrawing() {
    tempVertices = [];
    if (tempDrawLine) {
        map.removeLayer(tempDrawLine);
        tempDrawLine = null;
    }
}

function setDrawMode(mode) {
    cancelDrawing();
    state.drawMode = (state.drawMode === mode) ? null : mode;
    
    document.querySelectorAll('.draw-btn').forEach(btn => btn.classList.remove('active'));
    
    if (state.drawMode) {
        const id = state.drawMode === 'path' ? 'drawPolylineBtn' : 
                   (state.drawMode === 'zone' ? 'drawPolygonBtn' : 'logIncidentModeBtn');
        document.getElementById(id).classList.add('active');
        document.getElementById('map-container').style.cursor = 'crosshair';
        logConsole('SYSTEM', 'SYS', `TACTICAL TOOL: ${state.drawMode.toUpperCase()} STANDBY`);
    } else {
        document.getElementById('map-container').style.cursor = '';
    }
}

function initConsole() {
    const panel = document.getElementById('consolePanel');
    const header = document.querySelector('.console-header');
    
    header.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
        audio.chirp();
    });
    
    logConsole('SYSTEM', 'SYS', 'COMMAND TELEMETRY SECURED');
    logConsole('DECRYPT', 'SEC', 'DECRYPTION CORE SYNCHRONIZED');
    logConsole('SATLINK', 'SIG', 'BURST CHANNEL STREAM ONLINE');
    
    setInterval(generateMockTelemetryLog, 4800);
}

function logConsole(sender, type, message) {
    const logs = document.getElementById('consoleLogs');
    if (!logs) return;
    
    const entry = document.createElement('div');
    entry.className = 'console-log-entry';
    
    const now = new Date();
    const timeStr = now.toISOString().split('T')[1].slice(0, 8);
    
    entry.innerHTML = `
        <span class="console-time">[${timeStr}]</span>
        <span class="console-type ${type.toLowerCase()}">${sender.toUpperCase()} [${type}]</span>
        <span class="console-text">${message.toUpperCase()}</span>
    `;
    
    logs.appendChild(entry);
    logs.scrollTop = logs.scrollHeight;
    audio.tick();
}

const CONSOLE_MESSAGES = [
    { sender: 'SATLINK', type: 'SYS', text: 'Telemetry synchronization sweep complete: delta offset 0.05ms' },
    { sender: 'DECRYPT', type: 'SEC', text: 'Offshore ledger decryption thread: 42% resolved' },
    { sender: 'RECEIVER', type: 'SIG', text: 'Spectrum frequency check: vector 148.2Mhz nominal status' },
    { sender: 'DATABASE', type: 'SYS', text: 'Re-compiled database link tables for Helix Syndicate' },
    { sender: 'NODE-ECHO', type: 'SEC', text: 'Crypto transaction hash identified: vector location Dubai Node' },
    { sender: 'COMM-9', type: 'SIG', text: 'SIGINT burst intercepted near Tokyo Secure Facility coords' },
    { sender: 'ROUTING', type: 'SYS', text: 'Tracking sync coordinate check: Viktor Petrov node alignment verified' }
];

function generateMockTelemetryLog() {
    if (state.playback.playing) return;
    const msg = CONSOLE_MESSAGES[Math.floor(Math.random() * CONSOLE_MESSAGES.length)];
    logConsole(msg.sender, msg.type, msg.text);
}

function openIncidentModal(lat, lng) {
    audio.chirp();
    document.getElementById('incLat').value = lat.toFixed(5);
    document.getElementById('incLng').value = lng.toFixed(5);
    document.getElementById('incTitle').value = '';
    document.getElementById('incDesc').value = '';
    
    document.getElementById('incidentModal').classList.add('active');
}

function initIncidentModal() {
    const modal = document.getElementById('incidentModal');
    const form = document.getElementById('incidentForm');
    
    document.getElementById('cancelIncidentBtn').addEventListener('click', () => {
        modal.classList.remove('active');
        audio.chirp();
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const lat = parseFloat(document.getElementById('incLat').value);
        const lng = parseFloat(document.getElementById('incLng').value);
        const title = document.getElementById('incTitle').value.trim();
        const type = document.getElementById('incType').value;
        const category = document.getElementById('incCategory').value;
        const desc = document.getElementById('incDesc').value.trim();
        
        const incId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
        const newInc = {
            id: incId,
            type: type,
            category: category,
            title: title,
            location: [lat, lng],
            desc: desc,
            time: new Date().toISOString().split('T')[1].slice(0, 8) + 'Z',
            hoursAgo: 0.1,
            entities: []
        };
        
        MOCK_DATA.unshift(newInc);
        applyFilters();
        
        modal.classList.remove('active');
        logConsole('REPORTER', 'SYS', `NEW DISCOVERY REPORT ${incId} REGISTERED`);
        audio.alert();
        audio.speak(`Tactical alert. Incident ${incId} registered at coordinates.`);
    });
}

function startSimulator() {
    state.simIntervalId = setInterval(triggerSimulatedIncident, 18000);
}

function stopSimulator() {
    if (state.simIntervalId) {
        clearInterval(state.simIntervalId);
        state.simIntervalId = null;
    }
}

const MAP_HUBS = [
    { name: 'London Node', lat: 51.5074, lng: -0.1278 },
    { name: 'Geneva Node', lat: 46.2044, lng: 6.1432 },
    { name: 'Tokyo Node', lat: 35.6762, lng: 139.6503 },
    { name: 'Zurich Node', lat: 47.3769, lng: 8.5417 },
    { name: 'Dubai Node', lat: 25.2048, lng: 55.2708 },
    { name: 'Paris Node', lat: 48.8566, lng: 2.3522 },
    { name: 'New York Node', lat: 40.7128, lng: -74.0060 }
];

const HUB_MESSAGES = [
    { category: 'signal', title: 'SIGINT Decrypted Node Activity', desc: 'Encrypted message burst intercepted. Match discovered in local keys database.' },
    { category: 'aerial', title: 'UAV Incursion Alert', desc: 'Intrusive UAV proximity radar lock detected near coordinate vector.' },
    { category: 'finance', title: 'Flagged Offshore Transfer', desc: 'Automated bank tracing systems registered anonymous offshore pool inflow.' },
    { category: 'logistics', title: 'Courier Route Deviation', desc: 'Secure transport courier diverted from designated highway path vector.' },
    { category: 'incursion', title: 'Sensors Boundary Breach', desc: 'Coordinate breach logged by laser barrier monitoring nodes.' }
];

function triggerSimulatedIncident() {
    const hub = MAP_HUBS[Math.floor(Math.random() * MAP_HUBS.length)];
    const ev = HUB_MESSAGES[Math.floor(Math.random() * HUB_MESSAGES.length)];
    
    // Position jitter around hub center
    const lat = hub.lat + (Math.random() - 0.5) * 0.12;
    const lng = hub.lng + (Math.random() - 0.5) * 0.12;
    
    const newId = `SIM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInc = {
        id: newId,
        type: Math.random() > 0.45 ? 'warning' : 'critical',
        category: ev.category,
        title: `${ev.title} (${hub.name})`,
        location: [lat, lng],
        desc: ev.desc,
        time: new Date().toISOString().split('T')[1].slice(0, 8) + 'Z',
        hoursAgo: 0.1,
        entities: []
    };
    
    MOCK_DATA.unshift(newInc);
    state.unresolvedIncidents.add(newId);
    
    applyFilters();
    
    // Zoom/trigger visual indicators
    spawnRipple(newInc.location, newInc.type);
    logConsole('ALARM', 'SIG', `TACTICAL THREAT: SIMULATION ${newId} SPOTTED`);
    audio.siren();
    audio.speak(`Threat detected. ${ev.title}`);
}

function initGraphControls() {
    const canvas = document.getElementById('graphCanvas');
    const resetBtn = document.getElementById('graphResetBtn');
    const pathfinderBtn = document.getElementById('pathfinderToggleBtn');
    
    resetBtn.addEventListener('click', () => {
        zoomScale = 1.0;
        panX = 0;
        panY = 0;
        updateGraphTransform();
        audio.chirp();
        logConsole('SYSTEM', 'SYS', 'CAMERA TRANSLATION VECTOR CLEAR');
    });
    
    pathfinderBtn.addEventListener('click', () => {
        state.activePathfinder = !state.activePathfinder;
        state.pathfinderSource = null;
        state.pathfinderTarget = null;
        pathfinderBtn.classList.toggle('active', state.activePathfinder);
        
        const hint = document.getElementById('graphHint');
        if (state.activePathfinder) {
            hint.textContent = "PATHFINDER ENGAGED: Select Source Node on graph...";
            hint.style.color = "#10b981";
            logConsole('DECRYPT', 'SEC', 'BFS DIRECT CONNECTIVITY PATHFINDER READY');
            audio.chirp();
        } else {
            hint.textContent = "Drag canvas to pan · Scroll to zoom · Click to open dossier";
            hint.style.color = "";
            document.querySelectorAll('.graph-node, .graph-edge-group, .graph-edge').forEach(el => {
                el.classList.remove('highlighted', 'dimmed');
            });
            audio.chirp();
        }
    });

    // Panning canvas drag listeners
    canvas.addEventListener('mousedown', (e) => {
        if (e.target === canvas || e.target.id === 'graphViewport' || e.target.classList.contains('graph-cluster-boundary')) {
            isPanning = true;
            canvas.style.cursor = 'grabbing';
            startPanX = e.clientX - panX;
            startPanY = e.clientY - panY;
            e.preventDefault();
        }
    });
    
    window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        panX = e.clientX - startPanX;
        panY = e.clientY - startPanY;
        updateGraphTransform();
    });
    
    window.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            canvas.style.cursor = 'grab';
        }
    });
    
    // Zooming canvas wheel listener
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const intensity = 0.07;
        const rect = canvas.getBoundingClientRect();
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const wheel = e.deltaY < 0 ? 1 : -1;
        const zoom = Math.exp(wheel * intensity);
        const nextScale = Math.min(Math.max(zoomScale * zoom, 0.22), 4.0);
        
        // Translate pan offset toward mouse focus
        panX = mouseX - (mouseX - panX) * (nextScale / zoomScale);
        panY = mouseY - (mouseY - panY) * (nextScale / zoomScale);
        zoomScale = nextScale;
        
        updateGraphTransform();
    });
}

function updateGraphTransform() {
    const viewport = document.getElementById('graphViewport');
    if (viewport) {
        viewport.setAttribute('transform', `translate(${panX}, ${panY}) scale(${zoomScale})`);
    }
}

function handlePathfinderSelection(entityId) {
    const hint = document.getElementById('graphHint');
    audio.chirp();
    
    if (!state.pathfinderSource) {
        state.pathfinderSource = entityId;
        hint.textContent = `SOURCE ACQUIRED: ${entityId}. Select Target Node...`;
        hint.style.color = "#ffb800";
        
        document.querySelectorAll('.graph-node').forEach(el => {
            if (el.dataset.id === entityId) {
                el.classList.add('highlighted');
            } else {
                el.classList.add('dimmed');
            }
        });
    } else if (!state.pathfinderTarget) {
        if (entityId === state.pathfinderSource) {
            state.pathfinderSource = null;
            hint.textContent = "PATHFINDER ENGAGED: Select Source Node on graph...";
            hint.style.color = "#10b981";
            document.querySelectorAll('.graph-node').forEach(el => el.classList.remove('highlighted', 'dimmed'));
            return;
        }
        
        state.pathfinderTarget = entityId;
        const path = findShortestPathBFS(state.pathfinderSource, state.pathfinderTarget);
        
        if (path) {
            hint.textContent = `PATH LOCKED: ${path.join(' ➔ ')}. Toggle Pathfinder OFF to clear.`;
            hint.style.color = "#10b981";
            logConsole('SYSTEM', 'SEC', `LINK ROUTE FOUND: ${state.pathfinderSource} TO ${state.pathfinderTarget}`);
            audio.siren();
            
            const pathSet = new Set(path);
            
            document.querySelectorAll('.graph-node').forEach(el => {
                const id = el.dataset.id;
                if (pathSet.has(id)) {
                    el.classList.remove('dimmed');
                    el.classList.add('highlighted');
                } else {
                    el.classList.remove('highlighted');
                    el.classList.add('dimmed');
                }
            });
            
            document.querySelectorAll('.graph-edge-group').forEach(el => {
                const s = el.dataset.source;
                const t = el.dataset.target;
                
                let inPath = false;
                for (let i = 0; i < path.length - 1; i++) {
                    if ((path[i] === s && path[i+1] === t) || (path[i] === t && path[i+1] === s)) {
                        inPath = true;
                        break;
                    }
                }
                
                if (inPath) {
                    el.querySelector('.graph-edge').classList.add('highlighted');
                    el.classList.remove('dimmed');
                } else {
                    el.querySelector('.graph-edge').classList.remove('highlighted');
                    el.classList.add('dimmed');
                }
            });
        } else {
            hint.textContent = `NO DIRECT SIGNAL LINKS BETWEEN ${state.pathfinderSource} AND ${state.pathfinderTarget}. Select new source...`;
            hint.style.color = "#ff3366";
            logConsole('SYSTEM', 'ALERT', 'PATHWAY INTEGRITY BROKEN: NO CONNECTING LINKS');
            audio.alert();
            
            state.pathfinderSource = null;
            state.pathfinderTarget = null;
            document.querySelectorAll('.graph-node').forEach(el => el.classList.remove('highlighted', 'dimmed'));
        }
    } else {
        state.pathfinderSource = entityId;
        state.pathfinderTarget = null;
        hint.textContent = `SOURCE ACQUIRED: ${entityId}. Select Target Node...`;
        hint.style.color = "#ffb800";
        document.querySelectorAll('.graph-node').forEach(el => {
            if (el.dataset.id === entityId) {
                el.classList.remove('dimmed');
                el.classList.add('highlighted');
            } else {
                el.classList.add('highlighted');
                el.classList.add('dimmed');
            }
        });
        document.querySelectorAll('.graph-edge-group .graph-edge').forEach(el => el.classList.remove('highlighted'));
        document.querySelectorAll('.graph-edge-group').forEach(el => el.classList.remove('dimmed'));
    }
}

function findShortestPathBFS(startId, endId) {
    if (startId === endId) return [startId];
    
    const adjacency = {};
    ENTITIES.forEach(e => { adjacency[e.id] = []; });
    
    LINKS.forEach(link => {
        if (!adjacency[link.source]) adjacency[link.source] = [];
        if (!adjacency[link.target]) adjacency[link.target] = [];
        adjacency[link.source].push(link.target);
        adjacency[link.target].push(link.source);
    });
    
    const queue = [[startId]];
    const visited = new Set([startId]);
    
    while (queue.length > 0) {
        const path = queue.shift();
        const curr = path[path.length - 1];
        
        if (curr === endId) return path;
        
        const neighbors = adjacency[curr] || [];
        for (const n of neighbors) {
            if (!visited.has(n)) {
                visited.add(n);
                queue.push([...path, n]);
            }
        }
    }
    return null;
}
