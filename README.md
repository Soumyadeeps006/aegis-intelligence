# Aegis: Strategic Operations Command (Gotham Clone)

![Aegis Logo/Screenshot Placeholder](aegis-intelligence\Aegis Intelligence.png)
Aegis is a high-performance, premium intelligence and data integration platform inspired by Palantir Gotham. Designed for complex data analysis, geospatial tracking, and entity relationship visualization, Aegis provides a unified dashboard for strategic decision-making in high-stakes environments.

---

## Features
- **Advanced Geospatial Mapping**: Real-time tracking with map base-layer switching (Tactical Dark, ESRI Satellite, Vector Grid), chronological timeline playback slider with expanding ripple alerts, and custom drawing overlays (operational paths and exclusion zones).
- **Network Graph & Link Intelligence**: Draggable force-directed graph with hardware-accelerated pan/zoom, dynamic affiliation clustering halos, and a BFS-based shortest-path finder highlighting connections between targets.
- **Dossier System**: Detailed interactive profiles containing attributes, known associates, related incidents, and timeline logs. Navigate between targets instantly or export formatted physical reports via PDF.
- **Command & Control (C2) Immersion**: Interactive DEFCON threat levels shifting dashboard themes to red maximum alert, built-in Web Audio synthesizer (alarms/clicks), text-to-speech voice notifications, and scrolling SIGINT terminal telemetry logs.
- **Operations Triage Simulator**: Dynamic coordinate incident reporting modal (Log Point) and an active operations threat simulator with an incident acknowledgment triage queue.
- **Premium Aesthetics**: Cyberpunk glassmorphism layout, responsive grid panels, and glowing neon visual cues designed for minimal eye strain in strategic environments.
- **Zero-Dependency Core**: Built purely with native HTML5, CSS3, and ES6+ JavaScript—no compilers, frameworks, or build dependencies required.

---

## Tech Stack
- **Structure**: HTML5
- **Styling**: Vanilla CSS3 (Custom properties, CSS Grid, Flexbox, Glassmorphism)
- **Logic**: Vanilla ES6+ JavaScript
- **Mapping Engine**: [Leaflet.js](https://leafletjs.com/)
- **Map Tiles**: CartoDB Dark Matter

---

## Getting Started
Because Aegis is built with native web technologies, getting started is instantaneous. There are no `npm install` or build steps required for the current version.

---

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- (Optional) Python, for running a local server to avoid CORS issues if you expand the project to load local JSON files.

### Running the Application
**Method 1: Direct Execution (Fastest)**
Simply navigate to the project directory and open `index.html` in your preferred web browser.
**Method 2: Local HTTP Server (Recommended)**
If you have Python installed, you can spin up a local development server. Open your terminal, navigate to the project root, and run:
```bash
# Python 3
python -m http.server 8000
```
Then, open `http://localhost:8000` in your web browser.

---

## Project Structure
```text
gotham-clone/
├── index.html   # Main dashboard layout and structure
├── index.css    # Premium design system and UI components
├── app.js       # Core application logic, map initialization, and data binding
├── .gitignore   # Ignored files for version control
├── LICENSE      # Open source license details
└── README.md    # Project documentation (you are here)
```

---

## Upcoming Features (Roadmap)
- [x] **Geospatial Timeline Playback & Layout Switcher**: Play historical alerts over time; toggle vector and satellite basemaps.
- [x] **Tactical Draw Overlay**: Place paths and boundary boxes directly on the map.
- [x] **SVG Graph Pan, Zoom & Clusters**: Pan/zoom canvas, locate shortest links via BFS, and circle affiliate groups.
- [x] **Interactive DEFCON Alerts & Audio Synth**: Dynamic crimson alert states, synthesized beeps, and spoken threat alerts.
- [x] **SIGINT Console Drawer**: Scrolling mock telemetry logs and decrypt handshakes.
- [x] **Log Point Modal & Simulator**: Interactive coordinate incident reports and dynamic threat generator.
- [x] **Print-Media Dossier Export**: Generate printable PDF dossier reports cleanly.

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.