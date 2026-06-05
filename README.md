<div align="center">
  <h1>🛡️ SentinelPath: Intelligent Night Navigation</h1>
  <p><i>Navigating the world not just by distance, but by peace of mind.</i></p>
  
  [![MVP Status](https://img.shields.io/badge/Status-Live_Prototype-success?style=for-the-badge)](https://ashutoshsingh2357-coder.github.io/Unsafe-Night-Navigation-MVP/)
  [![Built with HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)]()
  [![Built with React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
  [![Mapping](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)]()
</div>

<br />

## 🚨 The Problem: Blind Navigation
Traditional navigation apps (like Google Maps) optimize strictly for efficiency—the shortest distance or the fastest time. But at 2 AM, the fastest route might take you through an unlit, isolated alleyway with a history of crime. Existing apps are blind to human safety, forcing vulnerable individuals to choose between taking a terrifying 10-minute shortcut or guessing which main road is safer.

## 💡 The Solution: A Digital Bodyguard
**SentinelPath** is a safety-first navigation engine. Instead of just finding the fastest route, our proprietary scoring algorithm evaluates paths based on street lighting, historical crime data, and road isolation. If a route is deemed "High Risk", SentinelPath automatically reroutes the user to a **Sentinel Safe Path**—prioritizing well-lit main roads, CCTV coverage, and safe havens.

---

## ✨ Core Features That Set Us Apart

### 🗺️ 1. Dynamic Risk Visualization
We don't just show you a blue line. If a route is risky, SentinelPath physically drops **Hazard Markers** (🌑 Dark Zones, ⚠️ Crime Hotspots, 🚧 Construction) directly onto the live map. The user can see *exactly* why a route is dangerous before they step foot on it.

### 🛡️ 2. The 'Sentinel Safe Path' Engine
Our algorithm dynamically compares routes. If the fastest route scores below our safety threshold, it highlights the route in Red. It then offers a secondary "Sentinel Safe Path" glowing in Neon Green, proving that taking 5 extra minutes is worth your safety.

### 🏃‍♂️ 3. Hardware-Triggered Auto SOS (No Manual Interaction Needed)
In a real emergency, victims don't have the luxury of unlocking their phones and pressing an SOS button.
* **Fall Detection:** Utilizing the device's accelerometer, if the user runs and drops their phone, a 10-second countdown begins. If not cancelled, it automatically dispatches their live location.
* **Voice Trigger:** Users can trigger the SOS state completely hands-free just by shouting "HELP!".

### 🔦 4. Emergency Strobe & AR Mode
When an SOS is triggered, the screen turns into an aggressive high-frequency strobe light to blind attackers and attract attention. During normal navigation, users can toggle **AR Mode** to overlay map directions onto their live camera feed for increased spatial awareness.

---

## 🛠️ Technical Architecture

SentinelPath is built as a highly responsive, lightweight Single Page Application (SPA) to ensure it loads instantly even in low-network areas.

* **Frontend:** React.js (Hooks, Context), Vanilla CSS (Glassmorphism UI)
* **Map Engine:** Leaflet.js, CartoDB Dark Matter BaseMaps
* **Routing:** Leaflet-Routing-Machine (Custom OSRM backend logic)
* **Hardware APIs:** Web Speech API (Voice Recognition), `devicemotion` API (Accelerometer/Fall Detection), WebRTC MediaDevices (Camera/AR)

---

## 🚀 Live Demo & Submission Links

* 🌐 **Live MVP Link:** [Play with the Working Prototype](https://ashutoshsingh2357-coder.github.io/Unsafe-Night-Navigation-MVP/)
* 🎥 **Demo Video:** [Insert YouTube/Drive Link Here]
* 🎨 **UI/UX Prototype:** [Insert Figma Link Here - Optional]

---

## 💻 How to Run Locally

Want to test the code on your own machine? It requires zero build steps!

1. Clone the repository:
   ```bash
   git clone https://github.com/ashutoshsingh2357-coder/Unsafe-Night-Navigation-MVP.git
   ```
2. Open the directory and simply run the `index.html` file in any modern browser (Chrome/Edge/Safari).
   ```bash
   # Or using a local server for better API handling
   npx serve .
   ```
3. *Note: For hardware features (Camera, Microphone, Motion Sensors) to work, the site must be served over HTTPS or `localhost`.*

---

<div align="center">
  <p>Built with ❤️ to make the world a safer place.</p>
</div>
