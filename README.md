# Aegis: Strategic Operations Command (Gotham Clone)

![Aegis Logo/Screenshot Placeholder](https://via.placeholder.com/800x400/080c11/00f0ff?text=Aegis+Intelligence+Platform)
Aegis is a high-performance, premium intelligence and data integration platform inspired by Palantir Gotham. Designed for complex data analysis, geospatial tracking, and entity relationship visualization, Aegis provides a unified dashboard for strategic decision-making in high-stakes environments.

---

## Features
- **Geospatial Intelligence Map**: Real-time tracking of assets, incidents, and anomalies on a dark-themed interactive map (powered by Leaflet).
- **Live Intelligence Feed**: A live updating feed of critical and warning incidents.
- **Premium Aesthetics**: A specialized dark mode UI featuring glassmorphism, responsive grid layouts, and neon accents designed for minimal eye strain in command centers.
- **Zero-Dependency Core**: Built purely with Vanilla HTML, CSS, and JavaScript for maximum performance and portability—no build tools required to run the core dashboard.

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
- [ ] **Entity-Relationship Graph View**: Interactive node-based graph for visualizing connections between people, places, and organizations.
- [ ] **Dossier System**: Detailed profiles and historical data for tracked entities.
- [ ] **Advanced Filtering**: Filter the global map and feed by time, severity, and type.

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.