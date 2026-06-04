// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Mock Intelligence Data
const MOCK_DATA = [
    { id: 'INC-7482', type: 'critical', title: 'Unauthorized Border Incursion', location: [48.8566, 2.3522], desc: 'Multiple unidentified vehicles detected crossing vector alpha.', time: '02:14:00Z' },
    { id: 'INC-7483', type: 'warning', title: 'Signal Intercept - Encrypted', location: [51.5074, -0.1278], desc: 'High frequency burst transmission detected near safehouse.', time: '02:22:15Z' },
    { id: 'INC-7484', type: 'info', title: 'Asset Relocation', location: [40.7128, -74.0060], desc: 'VIP transport convoy reached waypoint delta safely.', time: '02:45:30Z' },
    { id: 'INC-7485', type: 'critical', title: 'Drone Sighting', location: [35.6762, 139.6503], desc: 'Unregistered UAV spotted loitering above secure facility.', time: '03:10:05Z' },
    { id: 'INC-7486', type: 'warning', title: 'Anomalous Financial Transfer', location: [47.3769, 8.5417], desc: 'Large offshore transfer detected matching known syndicate patterns.', time: '03:30:00Z' }
];

let map;
let markers = {};

function initApp() {
    // Initialize the Map
    // Centered on Europe/Global view
    map = L.map('map-container', {
        zoomControl: false // We will customize this later or rely on scroll
    }).setView([45.0, 10.0], 3);

    // Use CartoDB Dark Matter tiles for that premium dark look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Add zoom control to top right
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    // Populate Data
    populateIncidents();
    plotMarkers();
}

function plotMarkers() {
    MOCK_DATA.forEach(incident => {
        // Create a custom icon using our CSS classes
        const customIcon = L.divIcon({
            className: `custom-marker ${incident.type}`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        // Add marker to map
        const marker = L.marker(incident.location, { icon: customIcon }).addTo(map);
        
        // Add a premium dark popup
        marker.bindPopup(`
            <div style="background: #080c11; color: #e2e8f0; padding: 10px; border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 4px;">
                <h4 style="color: ${incident.type === 'critical' ? '#ff3366' : (incident.type === 'warning' ? '#ffb800' : '#00f0ff')}; margin: 0 0 5px 0;">${incident.id}</h4>
                <p style="margin: 0; font-size: 13px;">${incident.title}</p>
            </div>
        `);
        
        markers[incident.id] = marker;
    });
}

function populateIncidents() {
    const feed = document.getElementById('incidentFeed');
    feed.innerHTML = ''; // Clear existing

    MOCK_DATA.forEach(incident => {
        const card = document.createElement('div');
        card.className = `incident-card ${incident.type}`;
        
        // When clicked, pan map to incident
        card.onclick = () => {
            map.flyTo(incident.location, 6, {
                duration: 1.5
            });
            markers[incident.id].openPopup();
        };

        card.innerHTML = `
            <div class="incident-header">
                <span>${incident.id}</span>
                <span>${incident.time}</span>
            </div>
            <div class="incident-title">${incident.title}</div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 6px;">
                ${incident.desc}
            </div>
        `;
        
        feed.appendChild(card);
    });
}

// Global Search Interaction (Mock)
document.getElementById('globalSearch').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        alert('Global Entity Search Initiated for: ' + this.value + '\\n(This will query the entity graph backend)');
        this.value = '';
    }
});
