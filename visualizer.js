/**
 * NeuroSynth Lab — Real-time Audio Visualizer
 * Waveform, Spectrum Analyzer, Spectrogram, and Circular visualizations
 * driven by Web Audio API AnalyserNode data.
 */

class AudioVisualizer {
    constructor(canvas, analyserNode) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.analyser = analyserNode;
        this.mode = 'waveform'; // waveform | spectrum | spectrogram | circular
        this.animationId = null;
        this.isRunning = false;

        // Spectrogram history
        this.spectrogramData = [];
        this.spectrogramMaxHistory = 300;

        // Color palette
        this.colors = {
            cyan: '#00f0ff',
            purple: '#b000ff',
            magenta: '#ff00aa',
            green: '#00ff88',
            blue: '#4466ff',
            bg: 'rgba(5, 8, 15, 0.95)',
            grid: 'rgba(255, 255, 255, 0.04)',
            text: 'rgba(136, 146, 168, 0.8)',
        };

        // Handle resize
        this._resize();
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.width = rect.width;
        this.height = rect.height;
    }

    setMode(mode) {
        this.mode = mode;
        if (mode === 'spectrogram') {
            this.spectrogramData = [];
        }
    }

    setAnalyser(analyser) {
        this.analyser = analyser;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this._animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    _animate() {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.width, this.height);

        switch (this.mode) {
            case 'waveform':
                this._drawWaveform();
                break;
            case 'spectrum':
                this._drawSpectrum();
                break;
            case 'spectrogram':
                this._drawSpectrogram();
                break;
            case 'circular':
                this._drawCircular();
                break;
        }

        this.animationId = requestAnimationFrame(() => this._animate());
    }

    /* ========== Waveform ========== */
    _drawWaveform() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Background
        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, w, h);

        // Grid
        this._drawGrid();

        if (!this.analyser) {
            this._drawIdleWave();
            return;
        }

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);

        // Glow effect - draw multiple passes
        for (let pass = 0; pass < 3; pass++) {
            ctx.beginPath();
            ctx.lineWidth = pass === 2 ? 2 : (pass === 1 ? 4 : 8);
            
            const gradient = ctx.createLinearGradient(0, 0, w, 0);
            if (pass === 2) {
                gradient.addColorStop(0, this.colors.cyan);
                gradient.addColorStop(0.5, this.colors.purple);
                gradient.addColorStop(1, this.colors.magenta);
            } else {
                const alpha = pass === 0 ? 0.1 : 0.25;
                gradient.addColorStop(0, `rgba(0, 240, 255, ${alpha})`);
                gradient.addColorStop(0.5, `rgba(176, 0, 255, ${alpha})`);
                gradient.addColorStop(1, `rgba(255, 0, 170, ${alpha})`);
            }
            ctx.strokeStyle = gradient;

            const sliceWidth = w / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * h) / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                x += sliceWidth;
            }

            ctx.stroke();
        }

        // Center line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
    }

    /* ========== Spectrum Analyzer ========== */
    _drawSpectrum() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, w, h);
        this._drawGrid();

        if (!this.analyser) {
            this._drawIdleBars();
            return;
        }

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        // Use logarithmic frequency scale for better visualization
        const barCount = Math.min(128, Math.floor(w / 4));
        const barWidth = (w / barCount) - 1;

        for (let i = 0; i < barCount; i++) {
            // Map bar index to frequency bin (logarithmic)
            const logIndex = Math.pow(i / barCount, 2) * bufferLength;
            const binIndex = Math.min(Math.floor(logIndex), bufferLength - 1);
            
            // Average a few bins for smoother display
            let sum = 0;
            const numBins = Math.max(1, Math.floor(bufferLength / barCount));
            for (let j = 0; j < numBins; j++) {
                const idx = Math.min(binIndex + j, bufferLength - 1);
                sum += dataArray[idx];
            }
            const value = sum / numBins;

            const barHeight = (value / 255) * h * 0.9;
            const x = i * (barWidth + 1);
            const y = h - barHeight;

            // Gradient per bar
            const hue = (i / barCount) * 260; // Cyan to Purple
            const gradient = ctx.createLinearGradient(x, h, x, y);
            gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.8)`);
            gradient.addColorStop(1, `hsla(${hue + 30}, 100%, 50%, 0.3)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Glow top
            ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.9)`;
            ctx.fillRect(x, y, barWidth, 2);

            // Reflection
            const reflGradient = ctx.createLinearGradient(x, h, x, h + barHeight * 0.3);
            reflGradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.15)`);
            reflGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = reflGradient;
            ctx.fillRect(x, h, barWidth, barHeight * 0.3);
        }

        // Frequency labels
        ctx.fillStyle = this.colors.text;
        ctx.font = '9px "JetBrains Mono"';
        const labels = ['20', '50', '100', '200', '500', '1k', '2k', '5k', '10k', '20k'];
        const freqs = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
        const sampleRate = 44100;
        for (let i = 0; i < labels.length; i++) {
            const binPos = (freqs[i] / (sampleRate / 2));
            const x = Math.sqrt(binPos) * w;
            if (x > 0 && x < w - 20) {
                ctx.fillText(labels[i], x, h - 4);
            }
        }
    }

    /* ========== Spectrogram ========== */
    _drawSpectrogram() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, w, h);

        if (!this.analyser) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        // Store current frame
        this.spectrogramData.push(new Uint8Array(dataArray));
        if (this.spectrogramData.length > this.spectrogramMaxHistory) {
            this.spectrogramData.shift();
        }

        // Draw spectrogram
        const colWidth = w / this.spectrogramMaxHistory;
        const rowHeight = h / 128; // Use 128 frequency bands

        for (let col = 0; col < this.spectrogramData.length; col++) {
            const frame = this.spectrogramData[col];
            for (let row = 0; row < 128; row++) {
                // Logarithmic frequency mapping
                const binIndex = Math.floor(Math.pow(row / 128, 2) * bufferLength);
                const value = frame[Math.min(binIndex, bufferLength - 1)];
                
                if (value > 5) {
                    // Color: dark blue -> cyan -> magenta -> white
                    const intensity = value / 255;
                    const hue = 200 - intensity * 160; // Blue to magenta
                    const lightness = 20 + intensity * 60;
                    const saturation = 100 - intensity * 20;
                    ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${intensity * 0.9 + 0.1})`;
                    ctx.fillRect(
                        col * colWidth,
                        h - (row + 1) * rowHeight,
                        colWidth + 1,
                        rowHeight + 1
                    );
                }
            }
        }

        // Frequency axis labels
        ctx.fillStyle = this.colors.text;
        ctx.font = '9px "JetBrains Mono"';
        const freqLabels = ['100', '500', '1k', '5k', '20k'];
        const freqVals = [100, 500, 1000, 5000, 20000];
        for (let i = 0; i < freqLabels.length; i++) {
            const ratio = freqVals[i] / 22050;
            const row = Math.sqrt(ratio) * 128;
            const y = h - row * rowHeight;
            if (y > 10 && y < h - 10) {
                ctx.fillText(freqLabels[i] + 'Hz', 4, y);
            }
        }
    }

    /* ========== Circular Visualization ========== */
    _drawCircular() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const cx = w / 2;
        const cy = h / 2;
        const maxRadius = Math.min(w, h) * 0.4;

        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, w, h);

        if (!this.analyser) {
            this._drawIdleCircle(cx, cy, maxRadius);
            return;
        }

        const bufferLength = this.analyser.frequencyBinCount;
        const freqData = new Uint8Array(bufferLength);
        const timeData = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(freqData);
        this.analyser.getByteTimeDomainData(timeData);

        const points = 180;

        // Outer glow ring
        for (let pass = 0; pass < 3; pass++) {
            ctx.beginPath();
            const alpha = pass === 2 ? 0.9 : (pass === 1 ? 0.3 : 0.1);
            const lineW = pass === 2 ? 2 : (pass === 1 ? 5 : 10);
            ctx.lineWidth = lineW;

            for (let i = 0; i <= points; i++) {
                const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
                const freqIndex = Math.floor((i / points) * bufferLength * 0.5);
                const freqValue = freqData[freqIndex] / 255;
                const radius = maxRadius * 0.3 + freqValue * maxRadius * 0.7;

                const x = cx + Math.cos(angle) * radius;
                const y = cy + Math.sin(angle) * radius;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.closePath();
            const gradient = ctx.createLinearGradient(cx - maxRadius, cy, cx + maxRadius, cy);
            gradient.addColorStop(0, `rgba(0, 240, 255, ${alpha})`);
            gradient.addColorStop(0.33, `rgba(176, 0, 255, ${alpha})`);
            gradient.addColorStop(0.66, `rgba(255, 0, 170, ${alpha})`);
            gradient.addColorStop(1, `rgba(0, 240, 255, ${alpha})`);
            ctx.strokeStyle = gradient;
            ctx.stroke();
        }

        // Inner waveform circle
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        const innerRadius = maxRadius * 0.25;

        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
            const timeIndex = Math.floor((i / points) * bufferLength);
            const timeValue = (timeData[timeIndex] - 128) / 128;
            const radius = innerRadius + timeValue * innerRadius * 0.8;

            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.strokeStyle = `rgba(0, 255, 136, 0.7)`;
        ctx.stroke();

        // Center glow
        const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 0.15);
        centerGlow.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
        centerGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = centerGlow;
        ctx.fillRect(0, 0, w, h);
    }

    /* ========== Idle Animations ========== */
    _drawGrid() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 1;

        // Horizontal lines
        for (let y = 0; y < h; y += h / 6) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Vertical lines
        for (let x = 0; x < w; x += w / 10) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
    }

    _drawIdleWave() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const time = Date.now() / 1000;

        for (let pass = 0; pass < 2; pass++) {
            ctx.beginPath();
            ctx.lineWidth = pass === 0 ? 6 : 2;
            const alpha = pass === 0 ? 0.1 : 0.4;

            for (let x = 0; x < w; x++) {
                const t = x / w;
                const y = h / 2 + Math.sin(t * 4 * Math.PI + time * 2) * 15 * Math.sin(t * Math.PI)
                    + Math.sin(t * 7 * Math.PI + time * 1.3) * 8 * Math.sin(t * Math.PI);

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.stroke();
        }
    }

    _drawIdleBars() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const time = Date.now() / 1000;
        const barCount = 64;
        const barWidth = (w / barCount) - 1;

        for (let i = 0; i < barCount; i++) {
            const barHeight = (Math.sin(i * 0.2 + time * 2) * 0.5 + 0.5) * 20 + 5;
            const x = i * (barWidth + 1);
            const hue = (i / barCount) * 260;
            ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.2)`;
            ctx.fillRect(x, h - barHeight, barWidth, barHeight);
        }
    }

    _drawIdleCircle(cx, cy, maxRadius) {
        const ctx = this.ctx;
        const time = Date.now() / 1000;
        const points = 120;

        ctx.beginPath();
        ctx.lineWidth = 2;
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = maxRadius * 0.3 + Math.sin(angle * 6 + time * 2) * maxRadius * 0.05;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.stroke();
    }

    /**
     * Get current frequency/amplitude info for display
     */
    getInfo() {
        if (!this.analyser) return '';
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        // Find peak frequency
        let maxVal = 0;
        let maxIdx = 0;
        for (let i = 0; i < bufferLength; i++) {
            if (dataArray[i] > maxVal) {
                maxVal = dataArray[i];
                maxIdx = i;
            }
        }

        const sampleRate = 44100;
        const peakFreq = (maxIdx * sampleRate / (2 * bufferLength)).toFixed(0);
        const peakDb = ((maxVal / 255) * 100).toFixed(0);

        // RMS
        let rms = 0;
        for (let i = 0; i < bufferLength; i++) {
            rms += dataArray[i] * dataArray[i];
        }
        rms = Math.sqrt(rms / bufferLength).toFixed(0);

        return `Peak: ${peakFreq}Hz @ ${peakDb}% | RMS: ${rms}`;
    }
}

window.AudioVisualizer = AudioVisualizer;
