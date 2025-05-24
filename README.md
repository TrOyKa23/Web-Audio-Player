# Web-Audio-Player
Creating an audio player. API project.

ANTINODE WEB MUSIC PLAYER — README

==========================
Description
==========================
ANTINODE is a modern web music player with a beautiful Welcome page, track upload support, endless playlist, and a parametric equalizer. The project consists of two parts: the Welcome Page (landing page) and the player itself (runs on Node.js + Express).

==========================
How to Run the Project
==========================

1. Download or clone the repository to your PC.

2. Install Node.js  
   Download from: https://nodejs.org/

3. Install dependencies for the player  
   Open a terminal and navigate to the player folder:
   cd "Player v1.2"
   npm install

4. Start the player server  
   npm start  
   After launch, the server will be available at:  
   http://localhost:3000

5. Open the Welcome Page  
   Open the file  
   Player v1.2/Wellcome page/index.html  
   in your browser (double-click or "Open with...").

   Or use any static server (for example, Live Server extension for VS Code).

6. Go to the player  
   On the Welcome Page, there is a "Demo" button that opens the player in a new tab.

==========================
Project Structure
==========================

Player v1.2/
│
├── public/                # Player frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│
├── uploads/               # Uploaded tracks
│   └── *.mp3, *.wav ...
│
├── Wellcome page/         # Welcome page (standalone)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── src/               # Video for Welcome Page
│       ├── BG.mov
│       ├── EQ1.mov
│       ├── EQ2.mov
│       └── EQ3.mov
│
├── server.js              # Express server (Node.js)
└── package.json           # Dependencies and scripts




==========================
Technologies Used
==========================

- Welcome Page:  
  HTML, CSS, JS (no frameworks), video background, custom cursor, animations.

- Player:  
  Node.js, Express, Multer (file upload), vanilla JS, HTML5 Audio API, Canvas (equalizer), responsive design.

==========================
Project Features
==========================

Welcome Page:
- Beautiful looping video background
- Minimalistic design
- Custom animated cursor
- Animated scroll-down arrow
- Button to go to the player

Player:
- Track upload (drag & drop or button)
- Endless playlist
- Playback controls (play/pause, next, prev, repeat, shuffle)
- Volume and mute
- Parametric equalizer (6 bands, Canvas visualization)
- Uploaded tracks saved on the server
- Responsive interface

==========================
How the Project Works
==========================

- Welcome Page — a standalone landing page, opens as a regular HTML file or via a static server.
- Player — a separate Node.js app, runs via npm start and is available at http://localhost:3000.
- Transition from Welcome Page to player is via the "Demo" button.

==========================
Author 
==========================

ANTINODE_prod, 2025


