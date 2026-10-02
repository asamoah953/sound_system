/**
 * NeuroSynth Lab — Core Synthesis Engine
 * Advanced Web Audio API synthesis with multi-layer oscillators, 
 * effects chain, binaural beats, FM/additive synthesis, and WAV export.
 */

class SynthEngine {
    constructor() {
        this.audioCtx = null;
        this.masterGain = null;
        this.analyserNode = null;
        this.compressorNode = null;
        this.oscillators = [];
        this.layers = [];
        this.effectNodes = {};
        this.binauralOscs = null;
        this.isPlaying = false;
        this.isBinauralPlaying = false;
        this.playTimeout = null;

        // ADSR defaults
        this.envelope = {
            attack: 0.1,
            decay: 0.3,
            sustain: 0.7,
            release: 1.0
        };
    }

    init() {
        if (this.audioCtx) return;
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Master chain: source -> effects -> compressor -> analyser -> masterGain -> destination
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 0.7;

        this.analyserNode = this.audioCtx.createAnalyser();
        this.analyserNode.fftSize = 4096;
        this.analyserNode.smoothingTimeConstant = 0.8;

        this.compressorNode = this.audioCtx.createDynamicsCompressor();
        this.compressorNode.threshold.value = -24;
        this.compressorNode.ratio.value = 4;
        this.compressorNode.attack.value = 0.003;
        this.compressorNode.release.value = 0.25;

        // Build effects chain
        this._buildEffectsChain();

        // Connect: effectsOutput -> compressor -> analyser -> masterGain -> destination
        this.compressorNode.connect(this.analyserNode);
        this.analyserNode.connect(this.masterGain);
        this.masterGain.connect(this.audioCtx.destination);
    }

    _buildEffectsChain() {
        const ctx = this.audioCtx;

        // --- Reverb (convolver) ---
        const reverbGain = ctx.createGain();
        reverbGain.gain.value = 0.2;
        const reverbDry = ctx.createGain();
        reverbDry.gain.value = 0.8;
        const convolver = ctx.createConvolver();
        this._generateReverbIR(2.0).then(buf => { convolver.buffer = buf; });
        this.effectNodes.reverb = { wet: reverbGain, dry: reverbDry, convolver, mix: 0.2, decay: 2.0 };

        // --- Delay ---
        const delayNode = ctx.createDelay(5.0);
        delayNode.delayTime.value = 0.3;
        const delayFeedback = ctx.createGain();
        delayFeedback.gain.value = 0.4;
        const delayWet = ctx.createGain();
        delayWet.gain.value = 0.3;
        delayNode.connect(delayFeedback);
        delayFeedback.connect(delayNode);
        delayNode.connect(delayWet);
        this.effectNodes.delay = { node: delayNode, feedback: delayFeedback, wet: delayWet };

        // --- Filter ---
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 5000;
        filter.Q.value = 1;
        this.effectNodes.filter = { node: filter };

        // --- Distortion (waveshaper) ---
        const distortion = ctx.createWaveShaper();
        distortion.curve = this._makeDistortionCurve(0);
        distortion.oversample = '4x';
        const distGain = ctx.createGain();
        distGain.gain.value = 1;
        this.effectNodes.distortion = { node: distortion, gain: distGain, amount: 0 };

        // --- Chorus (LFO-modulated delay) ---
        const chorusDelay = ctx.createDelay(0.1);
        chorusDelay.delayTime.value = 0.015;
        const chorusLfo = ctx.createOscillator();
        chorusLfo.type = 'sine';
        chorusLfo.frequency.value = 1.5;
        const chorusDepth = ctx.createGain();
        chorusDepth.gain.value = 0.003; // 30% depth mapped to small delay modulation
        chorusLfo.connect(chorusDepth);
        chorusDepth.connect(chorusDelay.delayTime);
        chorusLfo.start();
        const chorusWet = ctx.createGain();
        chorusWet.gain.value = 0.3;
        chorusDelay.connect(chorusWet);
        this.effectNodes.chorus = { delay: chorusDelay, lfo: chorusLfo, depth: chorusDepth, wet: chorusWet };

        // Effects input/output routing node
        this.effectsInput = ctx.createGain();
        this.effectsInput.gain.value = 1;
        this.effectsOutput = ctx.createGain();
        this.effectsOutput.gain.value = 1;

        // Route: input -> filter -> distortion -> chorus(wet) + dry -> reverb(wet) + dry -> delay(wet) + dry -> output
        // Simplified chain:
        this.effectsInput.connect(filter);
        filter.connect(distortion);
        distortion.connect(chorusDelay);
        distortion.connect(this.effectsOutput); // dry path
        chorusWet.connect(this.effectsOutput);

        // Reverb path
        this.effectsInput.connect(convolver);
        convolver.connect(reverbGain);
        reverbGain.connect(this.effectsOutput);

        // Delay path
        this.effectsInput.connect(delayNode);
        delayWet.connect(this.effectsOutput);

        this.effectsOutput.connect(this.compressorNode);
    }

    async _generateReverbIR(duration) {
        const ctx = this.audioCtx;
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * duration;
        const buffer = ctx.createBuffer(2, length, sampleRate);

        for (let ch = 0; ch < 2; ch++) {
            const data = buffer.getChannelData(ch);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        return buffer;
    }

    _makeDistortionCurve(amount) {
        const k = amount;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; i++) {
            const x = (i * 2) / n_samples - 1;
            if (k === 0) {
                curve[i] = x;
            } else {
                curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
            }
        }
        return curve;
    }

    /* ========== Layer Management ========== */

    addLayer(config = {}) {
        const id = Date.now() + Math.random();
        const layer = {
            id,
            waveform: config.waveform || 'sine',
            frequency: config.frequency || 440,
            detune: config.detune || 0,
            gain: config.gain !== undefined ? config.gain : 0.5,
            pan: config.pan || 0,
            // FM synthesis params
            fmEnabled: config.fmEnabled || false,
            fmRatio: config.fmRatio || 2,
            fmDepth: config.fmDepth || 100,
            // Harmonics
            harmonics: config.harmonics || [], // array of {ratio, amplitude}
            // Active audio nodes (set during play)
            nodes: null
        };
        this.layers.push(layer);
        return layer;
    }

    removeLayer(id) {
        const idx = this.layers.findIndex(l => l.id === id);
        if (idx >= 0) {
            if (this.layers[idx].nodes) {
                this._stopLayerNodes(this.layers[idx]);
            }
            this.layers.splice(idx, 1);
        }
    }

    updateLayer(id, updates) {
        const layer = this.layers.find(l => l.id === id);
        if (!layer) return;
        Object.assign(layer, updates);

        // Live update if playing
        if (layer.nodes && this.isPlaying) {
            const { osc, gainNode, panNode } = layer.nodes;
            if (osc) {
                osc.type = layer.waveform;
                osc.frequency.setValueAtTime(layer.frequency, this.audioCtx.currentTime);
                osc.detune.setValueAtTime(layer.detune, this.audioCtx.currentTime);
            }
            if (gainNode) {
                gainNode.gain.setValueAtTime(layer.gain, this.audioCtx.currentTime);
            }
            if (panNode) {
                panNode.pan.setValueAtTime(layer.pan, this.audioCtx.currentTime);
            }
        }
    }

    /* ========== Playback ========== */

    play(duration = 10) {
        this.init();
        if (this.isPlaying) this.stop();

        const ctx = this.audioCtx;
        if (ctx.state === 'suspended') ctx.resume();

        this.isPlaying = true;
        const now = ctx.currentTime;

        for (const layer of this.layers) {
            this._startLayerNodes(layer, now, duration);
        }

        // Auto-stop
        this.playTimeout = setTimeout(() => {
            this.stop();
        }, duration * 1000);
    }

    _startLayerNodes(layer, startTime, duration) {
        const ctx = this.audioCtx;
        const { attack, decay, sustain, release } = this.envelope;

        // Create oscillator
        const osc = ctx.createOscillator();
        osc.type = layer.waveform;
        osc.frequency.setValueAtTime(layer.frequency, startTime);
        osc.detune.setValueAtTime(layer.detune, startTime);

        // Gain (with ADSR envelope)
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(layer.gain, startTime + attack);
        gainNode.gain.linearRampToValueAtTime(layer.gain * sustain, startTime + attack + decay);
        // Hold sustain
        gainNode.gain.setValueAtTime(layer.gain * sustain, startTime + duration - release);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        // Panner
        const panNode = ctx.createStereoPanner();
        panNode.pan.setValueAtTime(layer.pan, startTime);

        // FM synthesis
        let fmOsc = null;
        let fmGain = null;
        if (layer.fmEnabled) {
            fmOsc = ctx.createOscillator();
            fmOsc.type = 'sine';
            fmOsc.frequency.setValueAtTime(layer.frequency * layer.fmRatio, startTime);
            fmGain = ctx.createGain();
            fmGain.gain.setValueAtTime(layer.fmDepth, startTime);
            fmOsc.connect(fmGain);
            fmGain.connect(osc.frequency);
            fmOsc.start(startTime);
            fmOsc.stop(startTime + duration + 0.1);
        }

        // Harmonics (additive synthesis)
        const harmonicOscs = [];
        if (layer.harmonics && layer.harmonics.length > 0) {
            for (const h of layer.harmonics) {
                const hOsc = ctx.createOscillator();
                hOsc.type = layer.waveform;
                hOsc.frequency.setValueAtTime(layer.frequency * h.ratio, startTime);
                const hGain = ctx.createGain();
                hGain.gain.setValueAtTime(0, startTime);
                hGain.gain.linearRampToValueAtTime(layer.gain * h.amplitude, startTime + attack);
                hGain.gain.linearRampToValueAtTime(layer.gain * h.amplitude * sustain, startTime + attack + decay);
                hGain.gain.setValueAtTime(layer.gain * h.amplitude * sustain, startTime + duration - release);
                hGain.gain.linearRampToValueAtTime(0, startTime + duration);
                hOsc.connect(hGain);
                hGain.connect(panNode);
                hOsc.start(startTime);
                hOsc.stop(startTime + duration + 0.1);
                harmonicOscs.push({ osc: hOsc, gain: hGain });
            }
        }

        // Connect: osc -> gain -> pan -> effectsInput
        osc.connect(gainNode);
        gainNode.connect(panNode);
        panNode.connect(this.effectsInput);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);

        layer.nodes = { osc, gainNode, panNode, fmOsc, fmGain, harmonicOscs };
    }

    _stopLayerNodes(layer) {
        if (!layer.nodes) return;
        const { osc, fmOsc, harmonicOscs } = layer.nodes;
        try { osc.stop(); } catch (e) {}
        try { if (fmOsc) fmOsc.stop(); } catch (e) {}
        if (harmonicOscs) {
            for (const h of harmonicOscs) {
                try { h.osc.stop(); } catch (e) {}
            }
        }
        layer.nodes = null;
    }

    stop() {
        if (this.playTimeout) {
            clearTimeout(this.playTimeout);
            this.playTimeout = null;
        }
        for (const layer of this.layers) {
            this._stopLayerNodes(layer);
        }
        this.isPlaying = false;
    }

    /* ========== Binaural Beats ========== */

    startBinaural(carrier = 200, beatFreq = 10, volume = 0.5) {
        this.init();
        if (this.isBinauralPlaying) this.stopBinaural();

        const ctx = this.audioCtx;
        if (ctx.state === 'suspended') ctx.resume();

        const leftOsc = ctx.createOscillator();
        const rightOsc = ctx.createOscillator();
        leftOsc.type = 'sine';
        rightOsc.type = 'sine';
        leftOsc.frequency.value = carrier;
        rightOsc.frequency.value = carrier + beatFreq;

        const merger = ctx.createChannelMerger(2);
        const leftGain = ctx.createGain();
        const rightGain = ctx.createGain();
        leftGain.gain.value = volume;
        rightGain.gain.value = volume;

        leftOsc.connect(leftGain);
        rightOsc.connect(rightGain);
        leftGain.connect(merger, 0, 0);
        rightGain.connect(merger, 0, 1);
        merger.connect(this.analyserNode);
        merger.connect(this.masterGain);

        leftOsc.start();
        rightOsc.start();

        this.binauralOscs = { leftOsc, rightOsc, leftGain, rightGain, merger };
        this.isBinauralPlaying = true;
    }

    updateBinaural(carrier, beatFreq, volume) {
        if (!this.binauralOscs) return;
        const { leftOsc, rightOsc, leftGain, rightGain } = this.binauralOscs;
        const now = this.audioCtx.currentTime;
        leftOsc.frequency.setValueAtTime(carrier, now);
        rightOsc.frequency.setValueAtTime(carrier + beatFreq, now);
        leftGain.gain.setValueAtTime(volume, now);
        rightGain.gain.setValueAtTime(volume, now);
    }

    stopBinaural() {
        if (!this.binauralOscs) return;
        try { this.binauralOscs.leftOsc.stop(); } catch (e) {}
        try { this.binauralOscs.rightOsc.stop(); } catch (e) {}
        this.binauralOscs = null;
        this.isBinauralPlaying = false;
    }

    /* ========== Effects Controls ========== */

    setReverbMix(mix) {
        if (!this.effectNodes.reverb) return;
        this.effectNodes.reverb.wet.gain.value = mix;
        this.effectNodes.reverb.dry.gain.value = 1 - mix;
        this.effectNodes.reverb.mix = mix;
    }

    async setReverbDecay(decay) {
        if (!this.effectNodes.reverb || !this.audioCtx) return;
        this.effectNodes.reverb.decay = decay;
        const newBuf = await this._generateReverbIR(decay);
        this.effectNodes.reverb.convolver.buffer = newBuf;
    }

    setDelayTime(time) {
        if (!this.effectNodes.delay) return;
        this.effectNodes.delay.node.delayTime.setValueAtTime(time, this.audioCtx.currentTime);
    }

    setDelayFeedback(fb) {
        if (!this.effectNodes.delay) return;
        this.effectNodes.delay.feedback.gain.setValueAtTime(fb, this.audioCtx.currentTime);
    }

    setFilterType(type) {
        if (!this.effectNodes.filter) return;
        this.effectNodes.filter.node.type = type;
    }

    setFilterFreq(freq) {
        if (!this.effectNodes.filter) return;
        this.effectNodes.filter.node.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    }

    setFilterQ(q) {
        if (!this.effectNodes.filter) return;
        this.effectNodes.filter.node.Q.setValueAtTime(q, this.audioCtx.currentTime);
    }

    setDistortion(amount) {
        if (!this.effectNodes.distortion) return;
        this.effectNodes.distortion.amount = amount;
        this.effectNodes.distortion.node.curve = this._makeDistortionCurve(amount);
    }

    setChorusRate(rate) {
        if (!this.effectNodes.chorus) return;
        this.effectNodes.chorus.lfo.frequency.setValueAtTime(rate, this.audioCtx.currentTime);
    }

    setChorusDepth(depth) {
        if (!this.effectNodes.chorus) return;
        // Map 0-1 to 0-0.01 delay modulation
        this.effectNodes.chorus.depth.gain.value = depth * 0.01;
    }

    setCompressor(threshold, ratio) {
        if (!this.compressorNode) return;
        this.compressorNode.threshold.value = threshold;
        this.compressorNode.ratio.value = ratio;
    }

    setMasterVolume(vol) {
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
        }
    }

    setEnvelope(adsr) {
        Object.assign(this.envelope, adsr);
    }

    /* ========== WAV Export ========== */

    async exportWAV(duration = 10) {
        // Create an offline context for rendering
        const sampleRate = 44100;
        const length = sampleRate * duration;
        const offlineCtx = new OfflineAudioContext(2, length, sampleRate);

        // Recreate the synthesis chain in offline context
        const masterGain = offlineCtx.createGain();
        masterGain.gain.value = this.masterGain ? this.masterGain.gain.value : 0.7;
        masterGain.connect(offlineCtx.destination);

        const compressor = offlineCtx.createDynamicsCompressor();
        compressor.threshold.value = this.compressorNode ? this.compressorNode.threshold.value : -24;
        compressor.ratio.value = this.compressorNode ? this.compressorNode.ratio.value : 4;
        compressor.connect(masterGain);

        const { attack, decay, sustain, release } = this.envelope;

        for (const layer of this.layers) {
            const osc = offlineCtx.createOscillator();
            osc.type = layer.waveform;
            osc.frequency.value = layer.frequency;
            osc.detune.value = layer.detune;

            const gainNode = offlineCtx.createGain();
            gainNode.gain.setValueAtTime(0, 0);
            gainNode.gain.linearRampToValueAtTime(layer.gain, attack);
            gainNode.gain.linearRampToValueAtTime(layer.gain * sustain, attack + decay);
            gainNode.gain.setValueAtTime(layer.gain * sustain, duration - release);
            gainNode.gain.linearRampToValueAtTime(0, duration);

            const panNode = offlineCtx.createStereoPanner();
            panNode.pan.value = layer.pan;

            // FM
            if (layer.fmEnabled) {
                const fmOsc = offlineCtx.createOscillator();
                fmOsc.type = 'sine';
                fmOsc.frequency.value = layer.frequency * layer.fmRatio;
                const fmGain = offlineCtx.createGain();
                fmGain.gain.value = layer.fmDepth;
                fmOsc.connect(fmGain);
                fmGain.connect(osc.frequency);
                fmOsc.start(0);
                fmOsc.stop(duration);
            }

            // Harmonics
            if (layer.harmonics && layer.harmonics.length > 0) {
                for (const h of layer.harmonics) {
                    const hOsc = offlineCtx.createOscillator();
                    hOsc.type = layer.waveform;
                    hOsc.frequency.value = layer.frequency * h.ratio;
                    const hGain = offlineCtx.createGain();
                    hGain.gain.setValueAtTime(0, 0);
                    hGain.gain.linearRampToValueAtTime(layer.gain * h.amplitude, attack);
                    hGain.gain.linearRampToValueAtTime(layer.gain * h.amplitude * sustain, attack + decay);
                    hGain.gain.setValueAtTime(layer.gain * h.amplitude * sustain, duration - release);
                    hGain.gain.linearRampToValueAtTime(0, duration);
                    hOsc.connect(hGain);
                    hGain.connect(panNode);
                    hOsc.start(0);
                    hOsc.stop(duration);
                }
            }

            osc.connect(gainNode);
            gainNode.connect(panNode);
            panNode.connect(compressor);
            osc.start(0);
            osc.stop(duration);
        }

        // Render
        const renderedBuffer = await offlineCtx.startRendering();

        // Encode to WAV
        return this._bufferToWav(renderedBuffer);
    }

    _bufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;

        const dataLength = buffer.length * blockAlign;
        const headerLength = 44;
        const totalLength = headerLength + dataLength;

        const arrayBuffer = new ArrayBuffer(totalLength);
        const view = new DataView(arrayBuffer);

        // WAV header
        this._writeString(view, 0, 'RIFF');
        view.setUint32(4, totalLength - 8, true);
        this._writeString(view, 8, 'WAVE');
        this._writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // fmt chunk size
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        this._writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true);

        // Interleave channel data
        const channels = [];
        for (let ch = 0; ch < numChannels; ch++) {
            channels.push(buffer.getChannelData(ch));
        }

        let offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            for (let ch = 0; ch < numChannels; ch++) {
                let sample = Math.max(-1, Math.min(1, channels[ch][i]));
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(offset, sample, true);
                offset += 2;
            }
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    _writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    /* ========== Getters ========== */

    getAnalyser() {
        return this.analyserNode;
    }

    getAudioContext() {
        return this.audioCtx;
    }

    getLayers() {
        return [...this.layers];
    }
}

// Export globally
window.SynthEngine = SynthEngine;
