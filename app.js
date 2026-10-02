/**
 * NeuroSynth Lab — Main Application Controller
 * Wires together the SynthEngine, AISoundEngine, and AudioVisualizer.
 * Handles all UI interactions, state management, and neural background animation.
 */

(function () {
    'use strict';

    // ========== Core Instances ==========
    const synth = new SynthEngine();
    const ai = new AISoundEngine();
    let visualizer = null;
    let isAppActive = false;

    // ========== DOM References ==========
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ========== Neural Background Animation ==========
    function initNeuralBackground() {
        const canvas = $('#neural-bg');
        const ctx = canvas.getContext('2d');
        let particles = [];
        let connections = [];
        let w, h;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // Create particles
        const count = Math.min(60, Math.floor((w * h) / 25000));
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2 + 1,
                hue: Math.random() * 60 + 170, // cyan-purple range
            });
        }

        function animate() {
            ctx.clearRect(0, 0, w, h);

            // Update & draw particles
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, 0.5)`;
                ctx.fill();
            }

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        const alpha = (1 - dist / 150) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }
        animate();
    }

    // ========== Envelope Canvas Drawing ==========
    function drawEnvelopeCanvas() {
        const canvas = $('#envelope-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const padding = 20;

        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, w, h);

        const env = synth.envelope;
        const totalTime = env.attack + env.decay + 1 + env.release; // 1s sustain display
        const pxPerSec = (w - padding * 2) / totalTime;

        const points = [
            { x: padding, y: h - padding }, // Start (0,0)
            { x: padding + env.attack * pxPerSec, y: padding }, // Peak (attack)
            { x: padding + (env.attack + env.decay) * pxPerSec, y: padding + (1 - env.sustain) * (h - padding * 2) }, // Sustain level
            { x: padding + (env.attack + env.decay + 1) * pxPerSec, y: padding + (1 - env.sustain) * (h - padding * 2) }, // Sustain hold
            { x: w - padding, y: h - padding }, // Release to 0
        ];

        // Glow pass
        ctx.beginPath();
        ctx.lineWidth = 8;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();

        // Main line
        ctx.beginPath();
        ctx.lineWidth = 2;
        const gradient = ctx.createLinearGradient(padding, 0, w - padding, 0);
        gradient.addColorStop(0, '#00f0ff');
        gradient.addColorStop(0.5, '#b000ff');
        gradient.addColorStop(1, '#ff00aa');
        ctx.strokeStyle = gradient;
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();

        // Fill under curve
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(w - padding, h - padding);
        ctx.closePath();
        const fillGrad = ctx.createLinearGradient(0, padding, 0, h - padding);
        fillGrad.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
        fillGrad.addColorStop(1, 'rgba(176, 0, 255, 0.02)');
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // Draw points
        for (const p of points) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#00f0ff';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Labels
        ctx.fillStyle = 'rgba(136, 146, 168, 0.6)';
        ctx.font = '9px "JetBrains Mono"';
        ctx.fillText('A', points[1].x - 3, h - 5);
        ctx.fillText('D', points[2].x - 3, h - 5);
        ctx.fillText('S', points[3].x - 3, h - 5);
        ctx.fillText('R', points[4].x - 3, h - 5);
    }

    // ========== Oscillator Layer UI ==========
    let layerCounter = 0;

    function createOscillatorLayerUI(layerData) {
        layerCounter++;
        const container = $('#oscillator-layers');
        const div = document.createElement('div');
        div.className = 'osc-layer';
        div.dataset.layerId = layerData.id;

        div.innerHTML = `
            <span class="osc-num">#${layerCounter}</span>
            <div class="osc-control">
                <label>Waveform</label>
                <select class="select-dark osc-waveform">
                    <option value="sine" ${layerData.waveform === 'sine' ? 'selected' : ''}>Sine</option>
                    <option value="square" ${layerData.waveform === 'square' ? 'selected' : ''}>Square</option>
                    <option value="sawtooth" ${layerData.waveform === 'sawtooth' ? 'selected' : ''}>Sawtooth</option>
                    <option value="triangle" ${layerData.waveform === 'triangle' ? 'selected' : ''}>Triangle</option>
                </select>
            </div>
            <div class="osc-control">
                <label>Freq: <span class="freq-val">${layerData.frequency.toFixed(1)}</span>Hz</label>
                <input type="range" class="slider osc-freq" min="1" max="20000" value="${layerData.frequency}" step="0.1">
            </div>
            <div class="osc-control">
                <label>Detune: <span class="detune-val">${(layerData.detune || 0).toFixed(0)}</span>¢</label>
                <input type="range" class="slider osc-detune" min="-100" max="100" value="${layerData.detune || 0}">
            </div>
            <div class="osc-control">
                <label>Gain: <span class="gain-val">${(layerData.gain * 100).toFixed(0)}</span>%</label>
                <input type="range" class="slider osc-gain" min="0" max="100" value="${layerData.gain * 100}">
            </div>
            <button class="btn-remove" title="Remove layer">✕</button>
        `;

        // Event listeners
        const waveformSel = div.querySelector('.osc-waveform');
        const freqSlider = div.querySelector('.osc-freq');
        const detuneSlider = div.querySelector('.osc-detune');
        const gainSlider = div.querySelector('.osc-gain');
        const removeBtn = div.querySelector('.btn-remove');

        waveformSel.addEventListener('change', () => {
            synth.updateLayer(layerData.id, { waveform: waveformSel.value });
        });

        freqSlider.addEventListener('input', () => {
            const val = parseFloat(freqSlider.value);
            div.querySelector('.freq-val').textContent = val.toFixed(1);
            synth.updateLayer(layerData.id, { frequency: val });
        });

        detuneSlider.addEventListener('input', () => {
            const val = parseInt(detuneSlider.value);
            div.querySelector('.detune-val').textContent = val;
            synth.updateLayer(layerData.id, { detune: val });
        });

        gainSlider.addEventListener('input', () => {
            const val = parseInt(gainSlider.value);
            div.querySelector('.gain-val').textContent = val;
            synth.updateLayer(layerData.id, { gain: val / 100 });
        });

        removeBtn.addEventListener('click', () => {
            synth.removeLayer(layerData.id);
            div.remove();
            renumberLayers();
        });

        container.appendChild(div);
    }

    function renumberLayers() {
        const layers = $$('.osc-layer .osc-num');
        layers.forEach((el, i) => { el.textContent = `#${i + 1}`; });
        layerCounter = layers.length;
    }

    function clearOscillatorUI() {
        const container = $('#oscillator-layers');
        container.innerHTML = '';
        layerCounter = 0;
    }

    // ========== AI Analysis Display ==========
    function showAnalysis(analysisData) {
        const panel = $('#ai-analysis');
        const content = $('#analysis-content');
        panel.classList.remove('hidden');

        let html = '';
        for (const section of analysisData) {
            html += `<div class="analysis-section">`;
            html += `<div class="analysis-title">${section.title}</div>`;
            for (const param of section.params) {
                html += `<div class="param-line"><span class="param-key">${param.key}:</span><span class="param-val">${param.value}</span></div>`;
            }
            html += `</div>`;
        }
        content.innerHTML = html;
    }

    // ========== Loading Animation ==========
    function showLoading(text = 'Neural Engine Processing...') {
        const overlay = $('#loading-overlay');
        const loadingText = $('#loading-text');
        const progress = $('#loading-progress');
        overlay.classList.remove('hidden');
        loadingText.textContent = text;
        progress.style.width = '0%';

        // Animate progress
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 15 + 5;
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
            }
            progress.style.width = p + '%';
        }, 100);

        return () => {
            clearInterval(interval);
            progress.style.width = '100%';
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        };
    }

    // ========== Status Indicator ==========
    function setStatus(status, text) {
        const indicator = $('#status-indicator');
        indicator.className = `status-${status}`;
        indicator.querySelector('.status-text').textContent = text;
    }

    // ========== Slider Value Display Updates ==========
    function setupSliderDisplays() {
        const sliders = $$('input[type="range"].slider');
        sliders.forEach(slider => {
            const updateDisplay = () => {
                const valueSpans = $$(`[data-for="${slider.id}"]`);
                valueSpans.forEach(span => {
                    let val = parseFloat(slider.value);
                    let display = '';

                    switch (slider.id) {
                        case 'reverb-mix': display = val + '%'; break;
                        case 'reverb-decay': display = val.toFixed(1) + 's'; break;
                        case 'delay-time': display = val + 'ms'; break;
                        case 'delay-feedback': display = val + '%'; break;
                        case 'filter-freq': display = val + 'Hz'; break;
                        case 'filter-q': display = val.toFixed(1); break;
                        case 'distortion-amount': display = val + '%'; break;
                        case 'chorus-rate': display = val.toFixed(1) + 'Hz'; break;
                        case 'chorus-depth': display = val + '%'; break;
                        case 'comp-threshold': display = val + 'dB'; break;
                        case 'comp-ratio': display = val + ':1'; break;
                        case 'master-volume': display = val + '%'; break;
                        case 'binaural-carrier': display = val + 'Hz'; break;
                        case 'binaural-beat': display = val + 'Hz'; break;
                        case 'binaural-volume': display = val + '%'; break;
                        case 'env-attack': display = val.toFixed(2) + 's'; break;
                        case 'env-decay': display = val.toFixed(2) + 's'; break;
                        case 'env-sustain': display = val.toFixed(2); break;
                        case 'env-release': display = val.toFixed(2) + 's'; break;
                        default: display = val;
                    }
                    span.textContent = display;
                });
            };

            slider.addEventListener('input', updateDisplay);
        });
    }

    // ========== Wire Up Effects Controls ==========
    function setupEffectsControls() {
        // Reverb
        $('#reverb-mix').addEventListener('input', (e) => {
            synth.setReverbMix(e.target.value / 100);
        });
        $('#reverb-decay').addEventListener('input', (e) => {
            synth.setReverbDecay(parseFloat(e.target.value));
        });

        // Delay
        $('#delay-time').addEventListener('input', (e) => {
            synth.setDelayTime(e.target.value / 1000);
        });
        $('#delay-feedback').addEventListener('input', (e) => {
            synth.setDelayFeedback(e.target.value / 100);
        });

        // Filter
        $('#filter-type').addEventListener('change', (e) => {
            synth.setFilterType(e.target.value);
        });
        $('#filter-freq').addEventListener('input', (e) => {
            synth.setFilterFreq(parseFloat(e.target.value));
        });
        $('#filter-q').addEventListener('input', (e) => {
            synth.setFilterQ(parseFloat(e.target.value));
        });

        // Distortion
        $('#distortion-amount').addEventListener('input', (e) => {
            synth.setDistortion(parseFloat(e.target.value));
        });

        // Chorus
        $('#chorus-rate').addEventListener('input', (e) => {
            synth.setChorusRate(parseFloat(e.target.value));
        });
        $('#chorus-depth').addEventListener('input', (e) => {
            synth.setChorusDepth(e.target.value / 100);
        });

        // Compressor
        $('#comp-threshold').addEventListener('input', (e) => {
            synth.setCompressor(parseFloat(e.target.value), parseFloat($('#comp-ratio').value));
        });
        $('#comp-ratio').addEventListener('input', (e) => {
            synth.setCompressor(parseFloat($('#comp-threshold').value), parseFloat(e.target.value));
        });

        // Master Volume
        $('#master-volume').addEventListener('input', (e) => {
            synth.setMasterVolume(e.target.value / 100);
        });

        // Envelope ADSR
        const envInputs = ['env-attack', 'env-decay', 'env-sustain', 'env-release'];
        envInputs.forEach(id => {
            $(`#${id}`).addEventListener('input', () => {
                synth.setEnvelope({
                    attack: parseFloat($('#env-attack').value),
                    decay: parseFloat($('#env-decay').value),
                    sustain: parseFloat($('#env-sustain').value),
                    release: parseFloat($('#env-release').value),
                });
                drawEnvelopeCanvas();
            });
        });
    }

    // ========== Apply AI Result to Synth & UI ==========
    function applyAIResult(result) {
        // Clear existing layers
        for (const layer of [...synth.getLayers()]) {
            synth.removeLayer(layer.id);
        }
        clearOscillatorUI();

        // Add new layers
        for (const layerConfig of result.layers) {
            const layer = synth.addLayer(layerConfig);
            createOscillatorLayerUI(layer);
        }

        // Apply effects
        const fx = result.effects;
        if (fx.reverb !== undefined) {
            $('#reverb-mix').value = fx.reverb * 100;
            $('#reverb-mix').dispatchEvent(new Event('input'));
        }
        if (fx.reverbDecay !== undefined) {
            $('#reverb-decay').value = fx.reverbDecay;
            $('#reverb-decay').dispatchEvent(new Event('input'));
        }
        if (fx.delayTime !== undefined) {
            $('#delay-time').value = fx.delayTime;
            $('#delay-time').dispatchEvent(new Event('input'));
        }
        if (fx.delayFeedback !== undefined) {
            $('#delay-feedback').value = fx.delayFeedback;
            $('#delay-feedback').dispatchEvent(new Event('input'));
        }
        if (fx.filterType) {
            $('#filter-type').value = fx.filterType;
            $('#filter-type').dispatchEvent(new Event('change'));
        }
        if (fx.filterFreq !== undefined) {
            $('#filter-freq').value = fx.filterFreq;
            $('#filter-freq').dispatchEvent(new Event('input'));
        }
        if (fx.filterQ !== undefined) {
            $('#filter-q').value = fx.filterQ;
            $('#filter-q').dispatchEvent(new Event('input'));
        }
        if (fx.distortion !== undefined) {
            $('#distortion-amount').value = fx.distortion;
            $('#distortion-amount').dispatchEvent(new Event('input'));
        }
        if (fx.chorusRate !== undefined) {
            $('#chorus-rate').value = fx.chorusRate;
            $('#chorus-rate').dispatchEvent(new Event('input'));
        }
        if (fx.chorusDepth !== undefined) {
            $('#chorus-depth').value = fx.chorusDepth;
            $('#chorus-depth').dispatchEvent(new Event('input'));
        }

        // Apply envelope
        if (result.envelope) {
            const env = result.envelope;
            if (env.attack !== undefined) $('#env-attack').value = env.attack;
            if (env.decay !== undefined) $('#env-decay').value = env.decay;
            if (env.sustain !== undefined) $('#env-sustain').value = env.sustain;
            if (env.release !== undefined) $('#env-release').value = env.release;
            // Trigger updates
            ['env-attack', 'env-decay', 'env-sustain', 'env-release'].forEach(id => {
                $(`#${id}`).dispatchEvent(new Event('input'));
            });
        }

        // Show analysis
        if (result.analysis && result.analysis.length > 0) {
            showAnalysis(result.analysis);
        }

        // Handle binaural
        if (result.binaural) {
            $('#binaural-carrier').value = result.binaural.carrier;
            $('#binaural-beat').value = result.binaural.beat;
            $('#binaural-volume').value = result.binaural.volume * 100;
            ['binaural-carrier', 'binaural-beat', 'binaural-volume'].forEach(id => {
                $(`#${id}`).dispatchEvent(new Event('input'));
            });
        }
    }

    // ========== Main Event Handlers ==========
    function setupEventHandlers() {
        // --- AI Generate Button ---
        $('#btn-generate').addEventListener('click', async () => {
            const text = $('#ai-prompt').value.trim();
            if (!text) return;

            setStatus('processing', 'ANALYZING');
            const hideLoading = showLoading('Neural Engine analyzing sound description...');

            // Simulate AI processing time for dramatic effect
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));

            const result = ai.analyze(text);
            applyAIResult(result);

            hideLoading();
            setStatus('idle', 'READY');

            // Auto-play after generation
            setTimeout(() => {
                triggerPlay();
            }, 300);
        });

        // --- Preset Tags ---
        $$('.tag[data-preset]').forEach(tag => {
            tag.addEventListener('click', () => {
                const preset = tag.dataset.preset;
                const text = ai.getPresetText(preset);
                $('#ai-prompt').value = text;
                // Trigger generate
                $('#btn-generate').click();
            });
        });

        // --- Close Analysis ---
        $('#btn-close-analysis').addEventListener('click', () => {
            $('#ai-analysis').classList.add('hidden');
        });

        // --- Add Oscillator Layer ---
        $('#btn-add-osc').addEventListener('click', () => {
            synth.init();
            const layer = synth.addLayer({
                waveform: 'sine',
                frequency: 440,
                detune: 0,
                gain: 0.5
            });
            createOscillatorLayerUI(layer);
        });

        // --- Play / Stop ---
        $('#btn-play').addEventListener('click', () => {
            triggerPlay();
        });

        $('#btn-stop').addEventListener('click', () => {
            triggerStop();
        });

        // --- Master Power Toggle ---
        $('#btn-master-toggle').addEventListener('click', () => {
            if (synth.isPlaying || synth.isBinauralPlaying) {
                triggerStop();
                if (synth.isBinauralPlaying) synth.stopBinaural();
            } else {
                triggerPlay();
            }
        });

        // --- Export WAV ---
        $('#btn-export').addEventListener('click', async () => {
            if (synth.getLayers().length === 0) {
                alert('No oscillator layers to export. Generate or add layers first.');
                return;
            }

            setStatus('processing', 'RENDERING');
            const hideLoading = showLoading('Rendering audio to WAV...');

            synth.init();
            const duration = parseFloat($('#sound-duration').value) || 10;

            try {
                const blob = await synth.exportWAV(duration);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `neurosynth_${Date.now()}.wav`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setStatus('idle', 'EXPORTED');
            } catch (err) {
                console.error('Export error:', err);
                setStatus('error', 'EXPORT ERROR');
            }

            hideLoading();
            setTimeout(() => setStatus('idle', 'READY'), 2000);
        });

        // --- Visualization Tabs ---
        $$('.viz-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                $$('.viz-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (visualizer) {
                    visualizer.setMode(tab.dataset.viz);
                }
            });
        });

        // --- Binaural Controls ---
        $('#btn-binaural-toggle').addEventListener('click', () => {
            synth.init();
            if (synth.isBinauralPlaying) {
                synth.stopBinaural();
                $('#btn-binaural-toggle').textContent = '▶ Start Binaural';
                $('#btn-binaural-toggle').classList.remove('active');
                if (!synth.isPlaying) setStatus('idle', 'IDLE');
            } else {
                const carrier = parseFloat($('#binaural-carrier').value);
                const beat = parseFloat($('#binaural-beat').value);
                const vol = parseFloat($('#binaural-volume').value) / 100;
                synth.startBinaural(carrier, beat, vol);
                $('#btn-binaural-toggle').textContent = '⏹ Stop Binaural';
                $('#btn-binaural-toggle').classList.add('active');
                setStatus('playing', 'BINAURAL');

                // Update visualizer with analyser
                if (visualizer) {
                    visualizer.setAnalyser(synth.getAnalyser());
                }
            }
        });

        // Live binaural updates
        ['binaural-carrier', 'binaural-beat', 'binaural-volume'].forEach(id => {
            $(`#${id}`).addEventListener('input', () => {
                if (synth.isBinauralPlaying) {
                    synth.updateBinaural(
                        parseFloat($('#binaural-carrier').value),
                        parseFloat($('#binaural-beat').value),
                        parseFloat($('#binaural-volume').value) / 100
                    );
                }
            });
        });

        // Brainwave preset buttons
        $$('.brainwave-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.brainwave-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const wave = btn.dataset.wave;
                const freqMap = { delta: 2, theta: 6, alpha: 10, beta: 20, gamma: 40 };
                const freq = freqMap[wave] || 10;

                $('#binaural-beat').value = freq;
                $('#binaural-beat').dispatchEvent(new Event('input'));
            });
        });

        // --- Keyboard shortcuts ---
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

            if (e.code === 'Space') {
                e.preventDefault();
                if (synth.isPlaying) triggerStop();
                else triggerPlay();
            }
            if (e.code === 'Escape') {
                triggerStop();
                if (synth.isBinauralPlaying) {
                    synth.stopBinaural();
                    $('#btn-binaural-toggle').textContent = '▶ Start Binaural';
                    $('#btn-binaural-toggle').classList.remove('active');
                }
            }
        });
    }

    // ========== Play / Stop Helpers ==========
    function triggerPlay() {
        if (synth.getLayers().length === 0) {
            // Add a default layer if none exist
            const layer = synth.addLayer({ waveform: 'sine', frequency: 440, gain: 0.5 });
            createOscillatorLayerUI(layer);
        }

        synth.init();
        const duration = parseFloat($('#sound-duration').value) || 10;
        synth.play(duration);

        // Update visualizer
        if (visualizer) {
            visualizer.setAnalyser(synth.getAnalyser());
        }

        $('#btn-play').classList.add('playing');
        setStatus('playing', 'PLAYING');

        // Auto-reset after duration
        setTimeout(() => {
            if (!synth.isPlaying) {
                $('#btn-play').classList.remove('playing');
                if (!synth.isBinauralPlaying) setStatus('idle', 'IDLE');
            }
        }, duration * 1000 + 200);
    }

    function triggerStop() {
        synth.stop();
        $('#btn-play').classList.remove('playing');
        if (!synth.isBinauralPlaying) setStatus('idle', 'IDLE');
    }

    // ========== Visualization Info Update Loop ==========
    function startVizInfoLoop() {
        setInterval(() => {
            if (visualizer && (synth.isPlaying || synth.isBinauralPlaying)) {
                const info = visualizer.getInfo();
                $('#viz-info').textContent = info;
            } else {
                $('#viz-info').textContent = '';
            }
        }, 200);
    }

    // ==========================================================
    // NEURO RESEARCH LAB — Protocol Engine Integration
    // ==========================================================
    let protocolEngine = null;

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function classifyBrainwave(freq) {
        if (freq < 4) return 'δ Delta';
        if (freq < 8) return 'θ Theta';
        if (freq < 14) return 'α Alpha';
        if (freq < 30) return 'β Beta';
        return 'γ Gamma';
    }

    function renderProtocolCards() {
        const container = $('#protocol-cards');
        if (!container) return;
        const protocols = protocolEngine.getProtocols();
        container.innerHTML = '';

        const colors = [
            'linear-gradient(135deg, #b000ff, #00f0ff)',
            'linear-gradient(135deg, #00ff88, #4466ff)',
            'linear-gradient(135deg, #ff00aa, #ff8800)',
            'linear-gradient(135deg, #4466ff, #b000ff)',
            'linear-gradient(135deg, #00f0ff, #00ff88)',
        ];

        let colorIdx = 0;
        for (const [key, protocol] of Object.entries(protocols)) {
            const card = document.createElement('div');
            card.className = 'protocol-card';
            card.dataset.protocolKey = key;

            const durationMin = Math.ceil(protocol.totalDuration / 60);

            card.innerHTML = `
                <div class="protocol-card-icon">${protocol.icon}</div>
                <div class="protocol-card-name">${protocol.name}</div>
                <div class="protocol-targets">
                    ${protocol.targetRegions.map(r => `<span class="protocol-target-tag">${r}</span>`).join('')}
                </div>
                <div class="protocol-card-desc">${protocol.description}</div>
                <div class="protocol-card-meta">
                    <span class="protocol-duration">⏱ ${durationMin} min</span>
                    <span class="protocol-phases-count">${protocol.phases.length} phases</span>
                    <button class="protocol-card-start" data-key="${key}">▶ START</button>
                </div>
            `;

            // Start button event
            card.querySelector('.protocol-card-start').addEventListener('click', (e) => {
                e.stopPropagation();
                startProtocolSession(key);
            });

            container.appendChild(card);
            colorIdx++;
        }
    }

    function startProtocolSession(protocolKey) {
        synth.init();
        const protocol = protocolEngine.getProtocols()[protocolKey];
        if (!protocol) return;

        // Show dashboard, hide cards
        $('#session-dashboard').classList.remove('hidden');
        $('#protocol-cards').style.display = 'none';

        // Populate dashboard header
        $('#session-icon').textContent = protocol.icon;
        $('#session-protocol-name').textContent = protocol.name;
        $('#session-protocol-desc').textContent = protocol.description;

        // Target regions
        const targetTags = $('#target-region-tags');
        targetTags.innerHTML = protocol.targetRegions
            .map(r => `<span class="target-tag">${r}</span>`)
            .join('');

        // References
        const refList = $('#session-references-list');
        refList.innerHTML = protocol.references
            .map(r => `<li>${r}</li>`)
            .join('');

        // Build phase timeline
        buildPhaseTimeline(protocol);

        // Set total phases
        $('#total-phases').textContent = protocol.phases.length;

        // Clear notes
        $('#session-notes').value = '';

        // Set callbacks
        protocolEngine.onPhaseChange = (phaseIndex, phase, proto) => {
            updatePhaseDisplay(phaseIndex, phase, proto);
        };

        protocolEngine.onTick = (elapsed, phaseElapsed, phaseRemaining) => {
            $('#phase-timer').textContent = formatTime(phaseElapsed);
            $('#total-timer').textContent = formatTime(elapsed);
            $('#remaining-timer').textContent = formatTime(
                protocol.totalDuration - elapsed
            );
            const progress = (elapsed / protocol.totalDuration) * 100;
            $('#session-progress-fill').style.width = `${Math.min(100, progress)}%`;

            // Update timeline segment states
            updateTimelineSegments(phaseIndex);
        };

        let phaseIndex = -1;
        protocolEngine.onPhaseChange = (idx, phase, proto) => {
            phaseIndex = idx;
            updatePhaseDisplay(idx, phase, proto);
            updateTimelineSegments(idx);

            // Update visualizer
            if (visualizer) {
                visualizer.setAnalyser(synth.getAnalyser());
            }
        };

        protocolEngine.onProtocolEnd = (sessionLog) => {
            setStatus('idle', 'SESSION COMPLETE');
            $('#btn-play').classList.remove('playing');
            // Auto-append completion note
            const notes = $('#session-notes');
            notes.value += `\n\n[SESSION COMPLETED at ${new Date().toLocaleTimeString()}]`;
        };

        // Start!
        protocolEngine.startProtocol(protocolKey);
        setStatus('playing', 'PROTOCOL');
        $('#btn-play').classList.add('playing');
    }

    function buildPhaseTimeline(protocol) {
        const bar = $('#phase-timeline-bar');
        const labels = $('#phase-timeline-labels');
        bar.innerHTML = '';
        labels.innerHTML = '';

        const colors = [
            '#00f0ff', '#b000ff', '#ff00aa', '#00ff88',
            '#4466ff', '#ff8800', '#00f0ff', '#b000ff'
        ];

        protocol.phases.forEach((phase, i) => {
            const widthPercent = (phase.duration / protocol.totalDuration) * 100;

            // Segment
            const seg = document.createElement('div');
            seg.className = 'timeline-segment pending';
            seg.style.width = `${widthPercent}%`;
            seg.style.background = colors[i % colors.length];
            seg.dataset.index = i;
            bar.appendChild(seg);

            // Label
            const lbl = document.createElement('div');
            lbl.className = 'timeline-label';
            lbl.style.width = `${widthPercent}%`;
            lbl.textContent = phase.name.replace(/^[^\w]*/, '').substring(0, 15);
            lbl.dataset.index = i;
            labels.appendChild(lbl);
        });
    }

    function updateTimelineSegments(activeIndex) {
        $$('.timeline-segment').forEach((seg, i) => {
            seg.classList.remove('active', 'completed', 'pending');
            if (i < activeIndex) seg.classList.add('completed');
            else if (i === activeIndex) seg.classList.add('active');
            else seg.classList.add('pending');
        });
        $$('.timeline-label').forEach((lbl, i) => {
            lbl.classList.toggle('active', i === activeIndex);
        });
    }

    function updatePhaseDisplay(phaseIndex, phase, protocol) {
        $('#current-phase-num').textContent = phaseIndex + 1;
        $('#current-phase-name').textContent = phase.name;
        $('#current-phase-desc').textContent = phase.description;

        // Frequency readouts
        if (phase.binaural) {
            $('#readout-binaural').textContent = `${phase.binaural.beat}Hz`;
            $('#readout-carrier').textContent = `${phase.binaural.carrier}Hz`;
            $('#readout-brainwave').textContent = classifyBrainwave(phase.binaural.beat);
        } else {
            $('#readout-binaural').textContent = '—';
            $('#readout-carrier').textContent = '—';
            $('#readout-brainwave').textContent = '—';
        }
        $('#readout-layers').textContent = `${phase.layers.length} osc`;

        // Update oscillator UI to show current phase layers
        clearOscillatorUI();
        for (const layer of synth.getLayers()) {
            createOscillatorLayerUI(layer);
        }
    }

    function stopProtocolSession() {
        protocolEngine.stopProtocol();
        setStatus('idle', 'ABORTED');
        $('#btn-play').classList.remove('playing');
    }

    function setupNeuroLabHandlers() {
        // Abort button
        $('#btn-stop-protocol').addEventListener('click', () => {
            stopProtocolSession();
        });

        // Export session report as JSON
        $('#btn-export-session').addEventListener('click', () => {
            // Include notes in the log
            const notes = $('#session-notes').value;
            if (notes.trim()) {
                protocolEngine._log('USER_NOTES', { notes, timestamp: new Date().toISOString() });
            }

            const blob = protocolEngine.exportSessionLog();
            if (!blob) {
                alert('No session data to export. Start a protocol first.');
                return;
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `neurosynth_session_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setStatus('idle', 'REPORT EXPORTED');
            setTimeout(() => {
                if (!protocolEngine.isRunning) setStatus('idle', 'READY');
            }, 2000);
        });

        // Export current phase WAV
        $('#btn-export-session-wav').addEventListener('click', async () => {
            if (synth.getLayers().length === 0) {
                alert('No audio playing to export.');
                return;
            }

            setStatus('processing', 'RENDERING');
            const hideLoading = showLoading('Rendering current phase audio...');

            try {
                const currentPhase = protocolEngine.getCurrentPhase();
                const duration = currentPhase ? currentPhase.duration : 30;
                const blob = await synth.exportWAV(Math.min(duration, 60)); // Cap at 60s for memory
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `neurosynth_phase_${Date.now()}.wav`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setStatus('idle', 'WAV EXPORTED');
            } catch (err) {
                console.error('Export error:', err);
                setStatus('error', 'EXPORT ERROR');
            }

            hideLoading();
            setTimeout(() => {
                if (protocolEngine.isRunning) setStatus('playing', 'PROTOCOL');
                else setStatus('idle', 'READY');
            }, 2000);
        });

        // Escape also stops protocol
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && protocolEngine && protocolEngine.isRunning) {
                stopProtocolSession();
            }
        });
    }

    // ========== Init ==========
    function init() {
        // Start neural background
        initNeuralBackground();

        // Initialize visualizer
        const vizCanvas = $('#viz-canvas');
        visualizer = new AudioVisualizer(vizCanvas, null);
        visualizer.start();

        // Initialize protocol engine
        protocolEngine = new NeuroProtocolEngine(synth);

        // Setup all controls
        setupSliderDisplays();
        setupEffectsControls();
        setupEventHandlers();
        drawEnvelopeCanvas();
        startVizInfoLoop();

        // Render neuro lab protocol cards
        renderProtocolCards();
        setupNeuroLabHandlers();

        // Set initial status
        setStatus('idle', 'READY');

        console.log('%c⚡ NeuroSynth Lab v3.0 — Neural Engine + Research Lab Initialized', 'color: #00f0ff; font-size: 14px; font-weight: bold;');
        console.log('%c🔬 Neuro Research Lab: 5 protocols loaded', 'color: #b000ff; font-size: 12px;');
    }

    // Boot
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

