# 🖥️ CyberASCII Vision Pro

> **Tactical Biometric ASCII Overlay & P2P Hacker Duel Engine**

CyberASCII Vision Pro is a high-performance, real-time video processing engine that transforms standard camera feeds into dynamic ASCII art matrices. Featuring AI-powered face tracking, tactical HUD overlays, and a WebRTC-based multiplayer "Hacker Duel" mode, it bridges the gap between retro terminal aesthetics and modern neural processing.

---

## 🚀 Core Features

### 🟢 Real-Time ASCII Engine
- **Multiple Rendering Modes**: Choose from Classic, Matrix, Retro, and Full-Color modes.
- **Dynamic Charsets**: From minimal density to high-detail blocks and terminal symbols.
- **High Performance**: Optimized canvas-to-text processing for 60FPS fluid motion.

### 🤖 Neural Mapping & Biometrics
- **AI Face Mesh**: Integrated MediaPipe face detection for real-time biometric tracking.
- **Tactical Overlays**: High-precision bounding boxes and corner brackets that follow targets.
- **Neural Telemetry**: Real-time probability readouts and signal status monitoring.

### 🌐 P2P Multiplayer (Hacker Duel)
- **WebRTC Streaming**: Direct peer-to-peer video streaming encoded in ASCII.
- **Side-by-Side HUD**: View your feed and your peer's feed simultaneously in a split-screen terminal.
- **Room Sharing**: Generate unique Room IDs or share direct links (`?room=XYZ`) for instant joining.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **AI/ML**: [MediaPipe / TensorFlow.js](https://google.github.io/mediapipe/)
- **Networking**: [WebRTC](https://webrtc.org/) & [Socket.io-client](https://socket.io/)

### Backend (Signaling)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Server**: [Express](https://expressjs.com/)
- **Signaling**: [Socket.io](https://socket.io/)

### Design System
- **Styling**: Vanilla CSS (Cyberpunk Design System)
- **Typography**: Google Fonts (Orbitron, Rajdhani, Share Tech Mono)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Manish1803/cyberascii.git
cd cyberascii
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install signaling server dependencies
cd server
npm install
cd ..
```

### 3. Run the Application
You will need two terminal windows:

**Terminal 1: Signaling Server**
```bash
npm run server
```

**Terminal 2: Frontend Client**
```bash
npm run dev
```

---

## 🎮 How to Use Multiplayer
1. Open the app in two separate browser tabs or on two different machines.
2. In **Tab 1**, click **CREATE** in the multiplayer dock to generate a Room ID.
3. Click **COPY LINK** to share the direct URL with a peer.
4. In **Tab 2**, either use the link or paste the Room ID and click **JOIN**.
5. Both users will now see each other in a real-time ASCII "Duel" interface.

---

## 🔮 Future Improvements
- [ ] **Global Lobby**: A public matchmaking area for random hacker encounters.
- [ ] **Audio Visualization**: Map ASCII density to real-time audio frequencies.
- [ ] **Clip Recording**: Export and save ASCII-encoded video clips as GIFs or MP4s.
- [ ] **Vision Pro Integration**: Full support for Apple Vision Pro gesture-based optic controls.

---

## 📜 License
Internal Project - All Rights Reserved.

---

> [!TIP]
> For the best aesthetic experience, use the app in Fullscreen mode (F11) on a high-refresh-rate monitor.
