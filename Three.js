// =========================================================
// 1. Three.js 3D Particle Background
// =========================================================
function init3DBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) {
        console.warn('Canvas #bg-canvas not found.');
        return;
    }

    if (typeof THREE === 'undefined') {
        console.error('Three.js library is not loaded.');
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Geometry Creation
    const particleCount = 1400;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyan = new THREE.Color(0x00ffcc);
    const magenta = new THREE.Color(0xff0080);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 16;     // X position
        positions[i + 1] = (Math.random() - 0.5) * 16; // Y position
        positions[i + 2] = (Math.random() - 0.5) * 16; // Z position

        // Alternate Cyan & Magenta colors
        const color = Math.random() > 0.4 ? cyan : magenta;
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.038,
        vertexColors: true,
        transparent: true,
        opacity: 0.85
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    camera.position.z = 5;

    // Mouse & Touch Parallax Effect
    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length > 0) {
            mouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
            mouseY = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
        }
    }, { passive: true });

    // Animation Loop
    let animationFrameId;
    function animate() {
        animationFrameId = requestAnimationFrame(animate);

        // Constant slow rotation
        particleSystem.rotation.y += 0.0012;
        particleSystem.rotation.x += 0.0006;

        // Smooth lerp camera movement towards mouse
        camera.position.x += (mouseX * 0.7 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 0.7 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    // Responsive Resize Listener
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// =========================================================
// 2. Web Audio API Sound Synthesizer
// =========================================================
const AudioEngine = {
    ctx: null,
    enabled: true,

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        // Resume context if suspended by browser autoplay policy
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    // Play Sci-Fi Beep Sound
    playBeep(freq = 800, type = 'sine', duration = 0.08, volume = 0.12) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
            osc.frequency.setValueAtTime(freq, now);

            // Quick ramp-down for crisp click/beep
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {
            console.warn('Audio playback error:', e);
        }
    },

    // Play Holographic Cyber Activation Sound
    playCyberSound() {
        this.playBeep(440, 'square', 0.05, 0.08);
        setTimeout(() => this.playBeep(880, 'sine', 0.1, 0.12), 50);
    },

    // Play Subtle Cyber Click for Buttons & Navigation
    playClickSound() {
        this.playBeep(1200, 'triangle', 0.03, 0.07);
    },

    // Play Subtle Typing Click for Terminal
    playTerminalKey() {
        this.playBeep(520, 'sine', 0.02, 0.04);
    },

    // Play Success Fanfare for Commands & Form Submission
    playSuccessSound() {
        this.playBeep(587.33, 'sine', 0.07, 0.1);
        setTimeout(() => this.playBeep(880, 'sine', 0.12, 0.12), 70);
    },

    // Play Low Glitch Sound on Command Error
    playErrorSound() {
        this.playBeep(220, 'sawtooth', 0.1, 0.08);
        setTimeout(() => this.playBeep(160, 'sawtooth', 0.14, 0.08), 80);
    }
};

// Expose globally so index.html and UI elements can trigger sounds
window.AudioEngine = AudioEngine;

// =========================================================
// 3. 3D Card Tilt Effect (Interactive Perspective)
// =========================================================
function apply3DTiltEffect() {
    // Target all project cards and cyber cards
    const cards = document.querySelectorAll('.tilt-card, .cyber-card, .cyber-card-pink');

    cards.forEach(card => {
        card.style.transformStyle = 'preserve-3d';

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Mouse position inside card X
            const y = e.clientY - rect.top;  // Mouse position inside card Y

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate tilt angles (max 14 deg)
            const rotateX = -((y - centerY) / centerY) * 14;
            const rotateY = ((x - centerX) / centerX) * 14;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease-out';
            if (window.AudioEngine) {
                window.AudioEngine.playBeep(600, 'sine', 0.03, 0.05);
            }
        });
    });
}

// Expose globally
window.apply3DTiltEffect = apply3DTiltEffect;

// =========================================================
// 4. Interactive Cyber Terminal Controller
// =========================================================
const CyberTerminal = {
    commands: {
        help: `
<div class="space-y-1">
  <div class="text-cyber-cyan font-bold">AVAILABLE COMMANDS:</div>
  <div>  • <span class="text-white font-bold">about</span>     - Operative background & core focus</div>
  <div>  • <span class="text-white font-bold">skills</span>    - Technical stack & analytics arsenal</div>
  <div>  • <span class="text-white font-bold">projects</span>  - Highlighted system deployments</div>
  <div>  • <span class="text-white font-bold">contact</span>   - Direct communication frequencies</div>
  <div>  • <span class="text-white font-bold">status</span>    - Real-time hardware & telemetry</div>
  <div>  • <span class="text-emerald-400 font-bold">matrix</span>    - Enter Matrix simulation mode</div>
  <div>  • <span class="text-white font-bold">clear</span>     - Wipe terminal screen buffer</div>
</div>
`,
        about: `
<div class="space-y-1">
  <div class="text-cyber-cyan font-bold">[OPERATIVE PROFILE // ADITHYA MEDOJU]</div>
  <div class="text-slate-300">Name: <span class="text-white font-bold">Adithya Medoju</span></div>
  <div class="text-slate-300">Role: <span class="text-cyber-cyan">Data Analyst & Full-Stack Developer</span></div>
  <div class="text-slate-300">Location: Hyderabad, India (Available Worldwide)</div>
  <div class="text-slate-400 text-xs">Specialty: Automated reporting dashboards, SQL optimization, Python/Pandas, WebGL 3D graphical experiences, and robust full-stack software.</div>
</div>
`,
        skills: `
<div class="space-y-1">
  <div class="text-cyber-cyan font-bold">[TECHNICAL ARSENAL]</div>
  <div class="text-slate-300"><span class="text-cyber-cyan font-bold">• Data & BI:</span> SQL, Python (Pandas/NumPy), Automated Reporting, Analytics Dashboards</div>
  <div class="text-slate-300"><span class="text-cyber-cyan font-bold">• Frontend:</span> JavaScript (ESNext), React, Next.js, Three.js, Tailwind CSS, Semantic HTML5</div>
  <div class="text-slate-300"><span class="text-cyber-cyan font-bold">• 3D Graphics:</span> WebGL, Particle Simulation Engines, Physics Parallax, BufferGeometry</div>
  <div class="text-slate-300"><span class="text-cyber-cyan font-bold">• Backend & DevOps:</span> Node.js, Express, REST APIs, PostgreSQL, Docker, Git</div>
</div>
`,
        projects: `
<div class="space-y-1">
  <div class="text-cyber-cyan font-bold">[FEATURED ARCHIVES]</div>
  <div class="text-slate-200">1. <span class="text-white font-bold">NEO-NEXUS 3D:</span> Real-time WebGL particle universe & mouse parallax engine.</div>
  <div class="text-slate-200">2. <span class="text-white font-bold">SYNAPSE AI DASHBOARD:</span> Low-latency streaming AI token pipeline console.</div>
  <div class="text-slate-200">3. <span class="text-white font-bold">AETHER VAULT:</span> Zero-knowledge encrypted cloud asset manager.</div>
  <div class="text-slate-200">4. <span class="text-white font-bold">CYBERPULSE:</span> High-throughput telemetry & analytics monitor.</div>
</div>
`,
        contact: `
<div class="space-y-1">
  <div class="text-cyber-magenta font-bold">[COMMUNICATION FREQUENCY]</div>
  <div class="text-slate-300">Email: <span class="text-white font-bold select-all">adithyamedoju@gmail.com</span></div>
  <div class="text-slate-300">GitHub: <a href="https://github.com" target="_blank" class="text-cyber-cyan underline">github.com</a></div>
  <div class="text-slate-300">LinkedIn: <a href="https://linkedin.com" target="_blank" class="text-cyber-magenta underline">linkedin.com</a></div>
  <div class="text-emerald-400 text-xs">Status: Open for analytics contracts & full-stack opportunities.</div>
</div>
`,
        status: `
<div class="space-y-1 text-emerald-400">
  <div class="font-bold">[SYSTEM TELEMETRY]</div>
  <div>STATUS: <span class="text-white">ONLINE // ALL SYSTEMS NOMINAL</span></div>
  <div>MEMORY: <span class="text-white">64MB / ALLOCATED</span></div>
  <div>GRAPHICS ACCELERATION: <span class="text-cyber-cyan">THREE.JS WEBGL ACTIVE</span></div>
  <div>SYNTHESIZER: <span class="text-cyber-cyan">WEB AUDIO API READY</span></div>
  <div>PING: <span class="text-white">12ms // OPTIMAL</span></div>
</div>
`,
        matrix: `
<div class="text-emerald-400 font-mono space-y-1">
  <div class="font-bold">[MATRIX PROTOCOL INITIALIZED]</div>
  <div class="text-xs opacity-80">01000001 01000100 01001001 01010100 01001000 01011001 01000001</div>
  <div>Wake up, Neo... The Matrix has you. Follow the white rabbit 🐇</div>
</div>
`,
        whoami: `<div class="text-slate-300">&gt; Adithya Medoju | Data Analyst & Full-Stack Developer</div>`
    },

    init() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-screen') || document.getElementById('terminal-output');
        const form = document.getElementById('terminal-form');

        if (!input || !output) return;

        // Command form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const cmd = input.value.trim().toLowerCase();
                if (cmd) {
                    this.executeCommand(cmd, output);
                    input.value = '';
                }
            });
        }

        // Enter key submission on input directly
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = input.value.trim().toLowerCase();
                if (cmd) {
                    this.executeCommand(cmd, output);
                    input.value = '';
                }
            } else {
                if (window.AudioEngine) {
                    window.AudioEngine.playTerminalKey();
                }
            }
        });

        // Quick-jump with ~ or ` (tilde / backtick key)
        window.addEventListener('keydown', (e) => {
            if (e.key === '`' || e.key === '~') {
                const modal = document.getElementById('terminal-modal');
                if (modal) {
                    e.preventDefault();
                    modal.classList.toggle('hidden');
                    if (!modal.classList.contains('hidden')) {
                        input.focus();
                        if (window.AudioEngine) window.AudioEngine.playCyberSound();
                    }
                } else {
                    const terminalSection = document.getElementById('terminal');
                    if (terminalSection) {
                        terminalSection.scrollIntoView({ behavior: 'smooth' });
                        input.focus();
                        if (window.AudioEngine) window.AudioEngine.playCyberSound();
                    }
                }
            }
        });

        // Global bridge for quick action pill buttons
        window.runCommand = (cmdText) => {
            this.executeCommand(cmdText, output);
        };
    },

    executeCommand(cmd, outputElement) {
        const targetOutput = outputElement || document.getElementById('terminal-screen') || document.getElementById('terminal-output');
        if (!targetOutput) return;

        const cleanCmd = cmd.trim().toLowerCase();
        if (!cleanCmd) return;

        if (cleanCmd === 'clear') {
            if (window.AudioEngine) window.AudioEngine.playClickSound();
            targetOutput.innerHTML = `<div class="text-slate-500 font-mono text-xs">// Terminal buffer cleared. Type 'help' for available commands.</div>`;
            return;
        }

        // Create user prompt line
        const cmdLine = document.createElement('div');
        cmdLine.className = 'font-mono text-xs';
        cmdLine.innerHTML = `<span class="text-cyber-cyan">adithya@nexus:~$</span> <span class="text-white font-bold">${this.escapeHtml(cleanCmd)}</span>`;
        targetOutput.appendChild(cmdLine);

        // Create response line
        const resultLine = document.createElement('div');
        resultLine.className = 'font-mono text-xs mb-3 pl-2 border-l border-cyan-500/30';

        if (this.commands[cleanCmd]) {
            if (window.AudioEngine) window.AudioEngine.playSuccessSound();
            resultLine.innerHTML = this.commands[cleanCmd];
        } else {
            if (window.AudioEngine) window.AudioEngine.playErrorSound();
            resultLine.innerHTML = `<span class="text-rose-400">COMMAND NOT RECOGNIZED: '${this.escapeHtml(cleanCmd)}'. Type <span class="text-cyber-cyan font-bold">'help'</span> for available commands.</span>`;
        }

        targetOutput.appendChild(resultLine);
        targetOutput.scrollTop = targetOutput.scrollHeight;
    },

    escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
};

// Expose globally
window.CyberTerminal = CyberTerminal;

// =========================================================
// 5. Auto-Initialize Everything on DOM Ready
// =========================================================
function initAll() {
    init3DBackground();
    apply3DTiltEffect();
    CyberTerminal.init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}