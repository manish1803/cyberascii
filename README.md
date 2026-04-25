# 🖥️ CyberASCII Vision Pro

> **Tactical Biometric ASCII Overlay & P2P Hacker Duel Engine**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Internal-red?style=flat-square)](LICENSE)

**CyberASCII Vision Pro** is a high-performance, real-time video processing engine that transforms standard camera feeds into dynamic ASCII art matrices. Featuring AI-powered face tracking, tactical HUD overlays, and a WebRTC-based multiplayer "Hacker Duel" mode, it bridges the gap between retro terminal aesthetics and modern neural processing.

---

## 🚀 Core Features

### 🟢 Real-Time ASCII Engine
- **Multiple Rendering Modes**: Toggle between `Matrix` (green-on-black), `BW` (classic monochrome), `Retro` (amber terminal), and `Full-Color` (RGB-mapped) modes.
- **Dynamic Charsets**: Select from multiple density sets, including `Classic`, `Matrix (01)`, `HighDetail`, `Blocks`, and `Minimal`.
- **High Performance**: Optimized canvas-to-text processing ensuring a fluid 60FPS experience even on mobile devices.

### 🤖 Neural Mapping & Biometrics
- **AI Face Mesh**: Integrated MediaPipe/TensorFlow.js face detection for real-time biometric tracking with high-precision confidence scores.
- **Tactical Overlays**: Dynamic corner brackets and bounding boxes that track targets with millisecond latency.
- **Neural Telemetry**: Real-time probability readouts, target acquisition status, and signal strength monitoring.

### 🌐 Multi-Channel Communication (Hacker Duel)
- **WebRTC P2P Streaming**: Direct peer-to-peer video streaming encoded in ASCII for a seamless "Duel" experience.
- **P2P Voice Chat**: Real-time audio communication with dedicated microphone and speaker controls.
- **Encrypted Text Messaging**: Integrated chat panel for terminal-style communication during active sessions.
- **Room Management**: Instant room creation with copyable invitation links (`?room=ID`) for rapid deployment.

### 📸 Tactical Tools
- **Optic Captures**: High-resolution screenshot system that renders the current ASCII matrix directly to a PNG file.
- **Optic Filters**: Adjustable gain and contrast controls to optimize signal clarity in low-light environments.
- **Fullscreen Mode**: Complete immersion with F11/double-click fullscreen support.

---

## 🛠️ Tech Stack

### Frontend Architecture
- **Framework**: [React 19](https://react.dev/) (Functional Components, Hooks)
- **Engine Logic**: Vanilla TypeScript Modules (`ASCIIEngine`, `AIEngine`, `MultiplayerModule`)
- **AI/ML Core**: [MediaPipe Face Mesh](https://google.github.io/mediapipe/) & [TensorFlow.js](https://www.tensorflow.org/js)
- **Styling**: Cyberpunk Design System (Custom CSS Variables, Glassmorphism, Micro-animations)
- **Build System**: [Vite 8](https://vitejs.dev/)

### Networking & Signaling
- **Signaling Server**: Node.js + Express
- **Real-Time Link**: [Socket.io 4](https://socket.io/)
- **P2P Protocol**: WebRTC (RTCPeerConnection)

---

## ⚙️ Installation & Deployment

### 1. Repository Setup
```bash
git clone https://github.com/Manish1803/cyberascii.git
cd cyberascii
```

### 2. Dependency Management
```bash
# Install root (client) dependencies
npm install

# Install signaling server dependencies
cd server
npm install
cd ..
```

### 3. System Execution
You will need two active terminal sessions:

**Session A: Signaling Server**
```bash
npm run server
```

**Session B: Development Client**
```bash
npm run dev
```

---

## 🎮 Operational Guide: Hacker Duel
1. **Initialize**: Launch the application and grant camera/microphone permissions.
2. **Establish Link**: Click **CREATE** in the multiplayer dock to generate a unique Room ID.
3. **Deploy Invitation**: Copy the generated link and share it with your peer.
4. **Link Status**: Once the peer joins, the interface will automatically switch to **DUAL VIEW** mode.
5. **Communicate**: Use the **CHAT** panel and **MIC/SPEAKER** toggles to coordinate with your peer.

---

## 🔮 Roadmap
- [ ] **Global Lobby**: Persistent matchmaking area for random signal interceptions.
- [ ] **Neural Recording**: Direct-to-GIF recording for ASCII sequences.
- [ ] **Audio Visualizer**: Map ASCII density to real-time audio frequencies for "Sonic Vision".
- [ ] **Vision Pro Support**: Gesture-based optic controls for Apple Vision Pro.

---

## 📜 License
Internal Project - Copyright © 2026 CyberASCII Vision Pro Team.

---

> [!TIP]
> For maximum immersion, use a high-refresh-rate monitor and run the application in a dark environment to minimize glare and enhance the neon optics.
