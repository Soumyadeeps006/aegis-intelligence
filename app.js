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
    incursion: 'Incursion', signal: 'Signal', logistics: 'Logistics',
    aerial: 'Aerial', finance: 'Finance'
};

const ENTITY_KIND_LABELS = { person: 'Person', organization: 'Organization', place: 'Place' };

// --------------------------------------------------------------------------
// Application State
// --------------------------------------------------------------------------

const state = {
    view: 'geo',
    filters: {
        severity: new Set(['critical', 'warning', 'info']),
        types: new Set(), // empty == all types
        time: 'all'
    },
    dossierType: 'all',
    selectedEntity: null
};

let map;
let markers = {};
let graphInitialized = false;

// --------------------------------------------------------------------------
// Init
// --------------------------------------------------------------------------

function initApp() {
    initMap();
    initFilters();
    applyFilters();
    initNavigation();
    initDossiers();
    initSearch();
}

// --------------------------------------------------------------------------
// Map (Geospatial Intelligence)
// --------------------------------------------------------------------------

function initMap() {
    map = L.map('map-container', {
        zoomControl: false
    }).setView([45.0, 10.0], 3);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
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
        card.className = `incident-card ${incident.type}`;

        card.onclick = () => {
            map.flyTo(incident.location, 6, { duration: 1.5 });
            markers[incident.id].openPopup();
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
    // Populate dynamic incident-type chips from the data.
    const typeContainer = document.getElementById('filterType');
    const categories = [...new Set(MOCK_DATA.map(d => d.category))];
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'chip active';
        btn.dataset.value = cat;
        btn.textContent = TYPE_LABELS[cat] || cat;
        typeContainer.appendChild(btn);
    });
    // Start with all types selected.
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
    return MOCK_DATA.filter(inc =>
        severity.has(inc.type) &&
        types.has(inc.category) &&
        inc.hoursAgo <= maxHours
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
                // Alerts shortcut: restrict severity to critical + warning.
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
        // Leaflet needs a size recalculation after being unhidden.
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
// Entity-Relationship Graph (lightweight SVG force-directed layout)
// --------------------------------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';
let graphNodes = [];

function renderGraph() {
    const svg = document.getElementById('graphCanvas');
    const rect = svg.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;

    if (!graphInitialized) {
        // Seed node positions around the centre.
        graphNodes = ENTITIES.map((e, i) => {
            const angle = (i / ENTITIES.length) * Math.PI * 2;
            return {
                id: e.id, entity: e,
                x: width / 2 + Math.cos(angle) * 160,
                y: height / 2 + Math.sin(angle) * 160,
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
        // Repulsion between every pair of nodes.
        for (let i = 0; i < graphNodes.length; i++) {
            for (let j = i + 1; j < graphNodes.length; j++) {
                const a = graphNodes[i], b = graphNodes[j];
                let dx = a.x - b.x, dy = a.y - b.y;
                let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
                const force = 9000 / (dist * dist);
                const fx = (dx / dist) * force, fy = (dy / dist) * force;
                a.vx += fx; a.vy += fy;
                b.vx -= fx; b.vy -= fy;
            }
        }
        // Attraction along links (spring toward ideal length).
        LINKS.forEach(link => {
            const a = nodeById[link.source], b = nodeById[link.target];
            if (!a || !b) return;
            let dx = b.x - a.x, dy = b.y - a.y;
            let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
            const force = (dist - 150) * 0.02;
            const fx = (dx / dist) * force, fy = (dy / dist) * force;
            a.vx += fx; a.vy += fy;
            b.vx -= fx; b.vy -= fy;
        });
        // Gentle pull toward centre + integrate with damping.
        graphNodes.forEach(n => {
            if (n.fixed) { n.vx = 0; n.vy = 0; return; }
            n.vx += (width / 2 - n.x) * 0.002;
            n.vy += (height / 2 - n.y) * 0.002;
            n.vx *= 0.85; n.vy *= 0.85;
            n.x += n.vx; n.y += n.vy;
            n.x = Math.max(40, Math.min(width - 40, n.x));
            n.y = Math.max(40, Math.min(height - 40, n.y));
        });
    }
}

function drawGraph(svg, width, height) {
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHTML = '';
    const nodeById = {};
    graphNodes.forEach(n => { nodeById[n.id] = n; });

    // Edges + labels first so nodes render on top.
    LINKS.forEach(link => {
        const a = nodeById[link.source], b = nodeById[link.target];
        if (!a || !b) return;
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
        line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
        line.setAttribute('class', 'graph-edge');
        svg.appendChild(line);

        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', (a.x + b.x) / 2);
        label.setAttribute('y', (a.y + b.y) / 2 - 4);
        label.setAttribute('class', 'graph-edge-label');
        label.textContent = link.label;
        svg.appendChild(label);
    });

    // Nodes.
    graphNodes.forEach(node => {
        const g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('class', `graph-node ${node.entity.type} threat-${node.entity.threat}`);
        g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

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
        svg.appendChild(g);
    });
}

function attachNodeInteractions(g, node, svg) {
    let dragging = false;
    let moved = false;

    const toSvgPoint = (evt) => {
        const rect = svg.getBoundingClientRect();
        const vb = svg.viewBox.baseVal;
        const x = (evt.clientX - rect.left) / rect.width * vb.width;
        const y = (evt.clientY - rect.top) / rect.height * vb.height;
        return { x, y };
    };

    g.addEventListener('mousedown', (evt) => {
        dragging = true;
        moved = false;
        node.fixed = true;
        g.classList.add('dragging');
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
        if (moved) return; // ignore clicks that were drags
        openDossierFromGraph(node.id);
    });
}

function openDossierFromGraph(entityId) {
    const navItem = document.querySelector('.nav-item[data-view="dossier"]');
    setActiveNav(navItem);
    switchView('dossier');
    selectEntity(entityId);
}

// --------------------------------------------------------------------------
// Dossier System
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
            <div class="dossier-header-info">
                <div class="dossier-name-row">
                    <h1>${entity.name}</h1>
                    <span class="threat-pill threat-${entity.threat}">${entity.threat} threat</span>
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
            <h3 class="dossier-section-title">Profile</h3>
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
            <h3 class="dossier-section-title">Historical Activity</h3>
            <div class="timeline">${history}</div>
        </div>
    `;

    // Jump between dossiers via associates.
    detail.querySelectorAll('.associate').forEach(el => {
        el.addEventListener('click', () => selectEntity(el.dataset.id));
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
            alert('No entity found for: ' + query);
        }
    });
}
