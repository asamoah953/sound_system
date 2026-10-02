/**
 * NeuroSynth Lab — AI Sound Engine
 * Natural language → synthesis parameters mapping.
 * Uses keyword analysis, semantic pattern matching, and rule-based intelligence
 * to interpret text descriptions and generate complex multi-layer sound configurations.
 */

class AISoundEngine {
    constructor() {
        // Comprehensive keyword → frequency/waveform/effect mapping database
        this.frequencyMap = {
            // Musical notes
            'c1': 32.70, 'c2': 65.41, 'c3': 130.81, 'c4': 261.63, 'c5': 523.25,
            'd4': 293.66, 'e4': 329.63, 'f4': 349.23, 'g4': 392.00, 'a4': 440.00,
            'b4': 493.88, 'a3': 220.00, 'a2': 110.00, 'a1': 55.00,
            // Schumann resonances
            'schumann': 7.83, 'earth': 7.83,
            // Brain waves
            'delta': 2, 'theta': 6, 'alpha': 10, 'beta': 20, 'gamma': 40,
        };

        this.soundProfiles = {
            // Natural sounds
            'thunder': {
                layers: [
                    { waveform: 'sawtooth', frequency: 30, gain: 0.6, detune: -5 },
                    { waveform: 'sawtooth', frequency: 45, gain: 0.4, detune: 10 },
                    { waveform: 'square', frequency: 80, gain: 0.2 },
                    { waveform: 'sawtooth', frequency: 120, gain: 0.15, detune: -20 },
                ],
                effects: { reverb: 0.8, reverbDecay: 6, distortion: 30, filterFreq: 800, filterType: 'lowpass' },
                envelope: { attack: 0.01, decay: 2.0, sustain: 0.1, release: 4.0 },
                description: 'Deep thunder with sub-bass rumble and long reverb tail'
            },
            'rain': {
                layers: [
                    { waveform: 'sawtooth', frequency: 2000, gain: 0.1, detune: 50 },
                    { waveform: 'sawtooth', frequency: 4000, gain: 0.08, detune: -30 },
                    { waveform: 'sawtooth', frequency: 6000, gain: 0.05, detune: 70 },
                    { waveform: 'sawtooth', frequency: 8000, gain: 0.03 },
                ],
                effects: { reverb: 0.5, filterFreq: 6000, filterType: 'lowpass', filterQ: 0.5 },
                envelope: { attack: 0.5, decay: 0.5, sustain: 0.9, release: 2.0 },
                description: 'High-frequency noise texture simulating rainfall'
            },
            'ocean': {
                layers: [
                    { waveform: 'sine', frequency: 60, gain: 0.5 },
                    { waveform: 'sine', frequency: 90, gain: 0.3, detune: 5 },
                    { waveform: 'triangle', frequency: 150, gain: 0.2 },
                    { waveform: 'sawtooth', frequency: 300, gain: 0.08, detune: -10 },
                ],
                effects: { reverb: 0.6, reverbDecay: 4, chorusRate: 0.3, chorusDepth: 60, filterFreq: 1200 },
                envelope: { attack: 2.0, decay: 1.0, sustain: 0.7, release: 3.0 },
                description: 'Rolling ocean waves with deep sub-bass and gentle movement'
            },
            'wind': {
                layers: [
                    { waveform: 'sawtooth', frequency: 200, gain: 0.15, detune: 30 },
                    { waveform: 'sawtooth', frequency: 400, gain: 0.1, detune: -20 },
                    { waveform: 'sawtooth', frequency: 800, gain: 0.06, detune: 50 },
                ],
                effects: { reverb: 0.4, filterFreq: 2000, filterType: 'bandpass', filterQ: 2, chorusRate: 0.5, chorusDepth: 70 },
                envelope: { attack: 1.5, decay: 1.0, sustain: 0.6, release: 3.0 },
                description: 'Howling wind with band-passed noise and slow modulation'
            },

            // Cosmic / Sci-fi
            'cosmic': {
                layers: [
                    { waveform: 'sine', frequency: 40, gain: 0.5 },
                    { waveform: 'sine', frequency: 80, gain: 0.35, detune: 3 },
                    { waveform: 'triangle', frequency: 160, gain: 0.2 },
                    { waveform: 'sine', frequency: 320, gain: 0.12, detune: -7 },
                    { waveform: 'sine', frequency: 640, gain: 0.06 },
                    { waveform: 'sine', frequency: 1280, gain: 0.03, detune: 12 },
                ],
                effects: { reverb: 0.7, reverbDecay: 5, chorusRate: 0.2, chorusDepth: 50, delayTime: 500, delayFeedback: 60 },
                envelope: { attack: 3.0, decay: 2.0, sustain: 0.8, release: 5.0 },
                description: 'Deep cosmic drone with layered harmonic series and space reverb'
            },
            'alien': {
                layers: [
                    { waveform: 'sine', frequency: 333, gain: 0.4, fmEnabled: true, fmRatio: 3.14, fmDepth: 200 },
                    { waveform: 'triangle', frequency: 666, gain: 0.2, fmEnabled: true, fmRatio: 1.618, fmDepth: 150 },
                    { waveform: 'sine', frequency: 111, gain: 0.3, detune: -15 },
                ],
                effects: { reverb: 0.6, delayTime: 200, delayFeedback: 70, chorusRate: 3, chorusDepth: 80 },
                envelope: { attack: 0.5, decay: 1.0, sustain: 0.6, release: 2.0 },
                description: 'Alien signal with FM synthesis using irrational ratios'
            },
            'pulsar': {
                layers: [
                    { waveform: 'sine', frequency: 55, gain: 0.6, fmEnabled: true, fmRatio: 0.5, fmDepth: 500 },
                    { waveform: 'square', frequency: 27.5, gain: 0.2 },
                ],
                effects: { distortion: 10, filterFreq: 2000, delayTime: 100, delayFeedback: 50 },
                envelope: { attack: 0.001, decay: 0.1, sustain: 0.0, release: 0.5 },
                description: 'Rhythmic pulsar beacon with deep FM modulation'
            },

            // Musical / Tonal
            'choir': {
                layers: [
                    { waveform: 'sine', frequency: 220, gain: 0.3, harmonics: [
                        { ratio: 2, amplitude: 0.25 }, { ratio: 3, amplitude: 0.15 },
                        { ratio: 4, amplitude: 0.1 }, { ratio: 5, amplitude: 0.06 },
                        { ratio: 6, amplitude: 0.03 }
                    ]},
                    { waveform: 'sine', frequency: 277.18, gain: 0.25, harmonics: [
                        { ratio: 2, amplitude: 0.2 }, { ratio: 3, amplitude: 0.12 },
                        { ratio: 4, amplitude: 0.08 }
                    ]},
                    { waveform: 'sine', frequency: 329.63, gain: 0.25, harmonics: [
                        { ratio: 2, amplitude: 0.2 }, { ratio: 3, amplitude: 0.1 }
                    ]},
                    { waveform: 'sine', frequency: 440, gain: 0.2 },
                ],
                effects: { reverb: 0.8, reverbDecay: 4, chorusRate: 0.8, chorusDepth: 40 },
                envelope: { attack: 2.0, decay: 1.0, sustain: 0.8, release: 3.0 },
                description: 'Ethereal choir with rich harmonic overtones and lush reverb'
            },
            'bell': {
                layers: [
                    { waveform: 'sine', frequency: 880, gain: 0.4, fmEnabled: true, fmRatio: 1.4, fmDepth: 400 },
                    { waveform: 'sine', frequency: 1760, gain: 0.15 },
                    { waveform: 'sine', frequency: 2640, gain: 0.08 },
                    { waveform: 'sine', frequency: 3520, gain: 0.04 },
                ],
                effects: { reverb: 0.7, reverbDecay: 3 },
                envelope: { attack: 0.001, decay: 3.0, sustain: 0.0, release: 2.0 },
                description: 'Metallic bell with inharmonic FM synthesis partials'
            },

            // Electronic
            'bass': {
                layers: [
                    { waveform: 'sawtooth', frequency: 55, gain: 0.5 },
                    { waveform: 'square', frequency: 55, gain: 0.2, detune: -5 },
                    { waveform: 'sine', frequency: 110, gain: 0.15 },
                ],
                effects: { distortion: 15, filterFreq: 800, filterType: 'lowpass', filterQ: 4 },
                envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.5 },
                description: 'Fat analog bass with saturation and resonant filter'
            },
            'pad': {
                layers: [
                    { waveform: 'sine', frequency: 220, gain: 0.3 },
                    { waveform: 'triangle', frequency: 220.5, gain: 0.25 },
                    { waveform: 'sine', frequency: 330, gain: 0.15 },
                    { waveform: 'sine', frequency: 440, gain: 0.1 },
                    { waveform: 'sine', frequency: 550, gain: 0.05 },
                ],
                effects: { reverb: 0.6, reverbDecay: 3, chorusRate: 1, chorusDepth: 50 },
                envelope: { attack: 2.0, decay: 1.0, sustain: 0.8, release: 4.0 },
                description: 'Lush synthesizer pad with slow beating and rich harmonics'
            },
            'glitch': {
                layers: [
                    { waveform: 'square', frequency: 150, gain: 0.3, fmEnabled: true, fmRatio: 7.3, fmDepth: 800 },
                    { waveform: 'sawtooth', frequency: 300, gain: 0.2, detune: 50 },
                    { waveform: 'square', frequency: 75, gain: 0.15 },
                ],
                effects: { distortion: 40, delayTime: 50, delayFeedback: 80, filterFreq: 3000 },
                envelope: { attack: 0.001, decay: 0.05, sustain: 0.3, release: 0.1 },
                description: 'Digital glitch with harsh FM, heavy distortion, and rapid delay'
            },

            // Neural / Experimental
            'neural': {
                layers: [
                    { waveform: 'sine', frequency: 40, gain: 0.4, fmEnabled: true, fmRatio: 0.15, fmDepth: 30 },
                    { waveform: 'sine', frequency: 6, gain: 0.25 },
                    { waveform: 'triangle', frequency: 10, gain: 0.15 },
                    { waveform: 'sine', frequency: 200, gain: 0.2, harmonics: [
                        { ratio: 2, amplitude: 0.1 }, { ratio: 4, amplitude: 0.05 }
                    ]},
                ],
                effects: { reverb: 0.5, chorusRate: 0.3, chorusDepth: 30, delayTime: 400, delayFeedback: 50 },
                envelope: { attack: 1.0, decay: 0.5, sustain: 0.9, release: 2.0 },
                description: 'Neural oscillation: gamma 40Hz modulated by theta rhythm'
            },
            'meditation': {
                layers: [
                    { waveform: 'sine', frequency: 136.1, gain: 0.3 }, // OM frequency
                    { waveform: 'sine', frequency: 272.2, gain: 0.15 },
                    { waveform: 'sine', frequency: 408.3, gain: 0.08 },
                    { waveform: 'sine', frequency: 528, gain: 0.2 }, // Solfeggio
                ],
                effects: { reverb: 0.8, reverbDecay: 6, chorusRate: 0.2, chorusDepth: 20 },
                envelope: { attack: 3.0, decay: 1.0, sustain: 0.9, release: 5.0 },
                description: 'Meditation drone with OM frequency (136.1Hz) and 528Hz healing tone'
            },
            'crystal': {
                layers: [
                    { waveform: 'sine', frequency: 528, gain: 0.3, harmonics: [
                        { ratio: 1.5, amplitude: 0.2 }, { ratio: 2, amplitude: 0.15 },
                        { ratio: 3, amplitude: 0.1 }, { ratio: 4.5, amplitude: 0.05 },
                        { ratio: 6, amplitude: 0.03 }, { ratio: 8, amplitude: 0.015 }
                    ]},
                    { waveform: 'sine', frequency: 396, gain: 0.15 },
                    { waveform: 'sine', frequency: 639, gain: 0.12 },
                ],
                effects: { reverb: 0.9, reverbDecay: 8, delayTime: 600, delayFeedback: 40 },
                envelope: { attack: 1.5, decay: 0.5, sustain: 0.85, release: 4.0 },
                description: 'Crystalline resonance with Solfeggio frequencies and long shimmer'
            },
            'abyss': {
                layers: [
                    { waveform: 'sine', frequency: 20, gain: 0.6 },
                    { waveform: 'sine', frequency: 25, gain: 0.4, detune: -3 },
                    { waveform: 'triangle', frequency: 40, gain: 0.3 },
                    { waveform: 'sine', frequency: 60, gain: 0.2, fmEnabled: true, fmRatio: 0.5, fmDepth: 10 },
                    { waveform: 'sine', frequency: 100, gain: 0.1, detune: 8 },
                ],
                effects: { reverb: 0.7, reverbDecay: 7, filterFreq: 300, filterType: 'lowpass', filterQ: 2 },
                envelope: { attack: 4.0, decay: 2.0, sustain: 0.9, release: 6.0 },
                description: 'Abyssal sub-bass layers at the threshold of human hearing'
            },
            'machine': {
                layers: [
                    { waveform: 'sawtooth', frequency: 100, gain: 0.3, fmEnabled: true, fmRatio: 1, fmDepth: 300 },
                    { waveform: 'square', frequency: 50, gain: 0.25 },
                    { waveform: 'sawtooth', frequency: 200, gain: 0.15, detune: 25 },
                    { waveform: 'square', frequency: 400, gain: 0.08, detune: -15 },
                ],
                effects: { distortion: 25, filterFreq: 1500, filterType: 'lowpass', filterQ: 6, delayTime: 150, delayFeedback: 60 },
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.5 },
                description: 'Industrial machine pulse with FM grit and resonant filtering'
            },
        };

        // Semantic keyword → profile matching
        this.keywordProfiles = {
            'thunder': 'thunder', 'thunderstorm': 'thunder', 'storm': 'thunder', 'lightning': 'thunder',
            'rain': 'rain', 'rainfall': 'rain', 'drizzle': 'rain',
            'ocean': 'ocean', 'wave': 'ocean', 'sea': 'ocean', 'water': 'ocean', 'surf': 'ocean',
            'wind': 'wind', 'breeze': 'wind', 'gale': 'wind', 'howl': 'wind',
            'cosmic': 'cosmic', 'space': 'cosmic', 'universe': 'cosmic', 'galaxy': 'cosmic', 'nebula': 'cosmic', 'star': 'cosmic',
            'alien': 'alien', 'ufo': 'alien', 'extraterrestrial': 'alien',
            'pulsar': 'pulsar', 'beacon': 'pulsar',
            'choir': 'choir', 'voice': 'choir', 'vocal': 'choir', 'sing': 'choir', 'angelic': 'choir', 'ethereal': 'choir',
            'bell': 'bell', 'chime': 'bell', 'ring': 'bell', 'gong': 'bell',
            'bass': 'bass', 'sub': 'bass', 'deep': 'abyss',
            'pad': 'pad', 'ambient': 'pad', 'atmosphere': 'pad', 'warm': 'pad',
            'glitch': 'glitch', 'digital': 'glitch', 'broken': 'glitch', 'error': 'glitch',
            'neural': 'neural', 'brain': 'neural', 'neuron': 'neural', 'synapse': 'neural', 'cortex': 'neural',
            'meditation': 'meditation', 'om': 'meditation', 'zen': 'meditation', 'healing': 'meditation', 'calm': 'meditation',
            'crystal': 'crystal', 'crystalline': 'crystal', 'glass': 'crystal', 'shimmer': 'crystal', 'solfeggio': 'crystal',
            'abyss': 'abyss', 'void': 'abyss', 'darkness': 'abyss', 'depth': 'abyss', 'infrasound': 'abyss',
            'machine': 'machine', 'industrial': 'machine', 'engine': 'machine', 'mechanical': 'machine', 'robot': 'machine',
            'drone': 'cosmic', 'rumble': 'thunder', 'pulse': 'machine', 'oscillation': 'neural',
        };

        // Modifier keywords that adjust parameters
        this.modifiers = {
            'deep': { freqMultiplier: 0.5, filterFreqMod: -2000 },
            'high': { freqMultiplier: 2.0, filterFreqMod: 3000 },
            'low': { freqMultiplier: 0.5, filterFreqMod: -2000 },
            'bright': { freqMultiplier: 1.5, filterFreqMod: 4000 },
            'dark': { freqMultiplier: 0.7, filterFreqMod: -3000 },
            'heavy': { gainMod: 0.15, distortionMod: 10 },
            'light': { gainMod: -0.15 },
            'thick': { detuneMod: 15, addLayers: true },
            'thin': { gainMod: -0.1 },
            'loud': { gainMod: 0.2 },
            'soft': { gainMod: -0.2 },
            'quiet': { gainMod: -0.3 },
            'harsh': { distortionMod: 20, filterQMod: 5 },
            'gentle': { gainMod: -0.1, reverbMod: 0.2, attackMod: 1.0 },
            'fast': { attackMod: -0.5, decayMod: -0.3 },
            'slow': { attackMod: 1.0, releaseMod: 2.0 },
            'long': { releaseMod: 3.0, reverbDecayMod: 3 },
            'short': { releaseMod: -0.5, reverbDecayMod: -1 },
            'wide': { chorusDepthMod: 30, detuneMod: 20 },
            'narrow': { chorusDepthMod: -20, detuneMod: -10, filterQMod: 5 },
            'pulsating': { fmMod: true, fmRatio: 0.5, fmDepth: 50 },
            'evolving': { chorusRateMod: 0.5, chorusDepthMod: 40, delayFeedbackMod: 20 },
            'metallic': { fmMod: true, fmRatio: 1.4, fmDepth: 300 },
            'warm': { filterFreqMod: -1000, chorusDepthMod: 20 },
            'cold': { filterFreqMod: 2000, reverbMod: 0.2 },
            'massive': { gainMod: 0.2, addLayers: true, detuneMod: 25, reverbMod: 0.2 },
            'tiny': { gainMod: -0.3, freqMultiplier: 2.0 },
            'distorted': { distortionMod: 30 },
            'clean': { distortionMod: -50 },
            'reverberant': { reverbMod: 0.3, reverbDecayMod: 3 },
            'dry': { reverbMod: -0.5, delayMod: -200 },
            'eerie': { detuneMod: 15, chorusDepthMod: 40, reverbMod: 0.2 },
            'haunting': { detuneMod: 20, reverbMod: 0.3, delayFeedbackMod: 20 },
            'powerful': { gainMod: 0.2, distortionMod: 10 },
            'complex': { addLayers: true, harmonicsMod: true },
            'rich': { harmonicsMod: true, chorusDepthMod: 20 },
            'pure': { waveformOverride: 'sine' },
            'buzzy': { waveformOverride: 'sawtooth', distortionMod: 5 },
            'hollow': { waveformOverride: 'square', filterFreqMod: -1000 },
        };
    }

    /**
     * Parse a natural language description and generate synthesis parameters
     */
    analyze(text) {
        const input = text.toLowerCase().trim();
        const words = input.split(/\s+/);
        const result = {
            layers: [],
            effects: {},
            envelope: {},
            binaural: null,
            analysis: [],
            description: ''
        };

        // 1. Check for explicit frequency mentions (e.g., "440Hz", "at 200 hz")
        const freqMatches = input.match(/(\d+(?:\.\d+)?)\s*(?:hz|hertz)/gi);
        const explicitFreqs = freqMatches ? freqMatches.map(m => parseFloat(m)) : [];

        // 2. Check for binaural beat requests
        const binauralMatch = input.match(/binaural\s*(?:beat)?\s*(?:at\s+)?(\d+(?:\.\d+)?)\s*(?:hz)?/i);
        const carrierMatch = input.match(/carrier\s*(?:frequency\s*)?(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:hz)?/i);
        if (binauralMatch || input.includes('binaural')) {
            const beatFreq = binauralMatch ? parseFloat(binauralMatch[1]) : 10;
            const carrierFreq = carrierMatch ? parseFloat(carrierMatch[1]) : 200;
            result.binaural = { carrier: carrierFreq, beat: beatFreq, volume: 0.5 };
            result.analysis.push({
                title: 'Binaural Beat Detection',
                params: [
                    { key: 'carrier_freq', value: `${carrierFreq}Hz` },
                    { key: 'beat_freq', value: `${beatFreq}Hz` },
                    { key: 'brain_wave', value: this._classifyBrainwave(beatFreq) },
                ]
            });
        }

        // 3. Find matching sound profiles
        let matchedProfiles = [];
        for (const word of words) {
            const cleanWord = word.replace(/[^a-z]/g, '');
            if (this.keywordProfiles[cleanWord]) {
                const profileName = this.keywordProfiles[cleanWord];
                if (!matchedProfiles.includes(profileName)) {
                    matchedProfiles.push(profileName);
                }
            }
        }

        // 4. If no profiles matched, create from explicit frequencies or default
        if (matchedProfiles.length === 0 && explicitFreqs.length === 0) {
            matchedProfiles.push('cosmic'); // Default fallback
            result.analysis.push({
                title: 'Interpretation',
                params: [{ key: 'mode', value: 'Default cosmic drone (no specific sound type detected)' }]
            });
        }

        // 5. Build layers from matched profiles
        let baseProfile = null;
        for (const profileName of matchedProfiles) {
            const profile = this.soundProfiles[profileName];
            if (!profile) continue;
            if (!baseProfile) baseProfile = profile;

            result.analysis.push({
                title: `Profile: ${profileName.toUpperCase()}`,
                params: [
                    { key: 'description', value: profile.description },
                    { key: 'layers', value: `${profile.layers.length} oscillators` },
                    { key: 'waveforms', value: [...new Set(profile.layers.map(l => l.waveform))].join(', ') },
                    { key: 'freq_range', value: `${Math.min(...profile.layers.map(l => l.frequency))}Hz - ${Math.max(...profile.layers.map(l => l.frequency))}Hz` },
                ]
            });

            // Add layers (scale gain if combining multiple profiles)
            const gainScale = matchedProfiles.length > 1 ? 0.7 : 1.0;
            for (const layer of profile.layers) {
                result.layers.push({
                    ...layer,
                    gain: layer.gain * gainScale
                });
            }
        }

        // 6. Add explicit frequency layers
        if (explicitFreqs.length > 0) {
            const waveform = this._detectWaveform(input);
            for (const freq of explicitFreqs) {
                // Don't add if it's clearly a binaural parameter
                if (result.binaural && (freq === result.binaural.carrier || freq === result.binaural.beat)) continue;
                result.layers.push({
                    waveform: waveform,
                    frequency: freq,
                    gain: 0.4,
                    detune: 0
                });
                result.analysis.push({
                    title: 'Explicit Frequency',
                    params: [
                        { key: 'frequency', value: `${freq}Hz` },
                        { key: 'waveform', value: waveform },
                        { key: 'note_approx', value: this._freqToNote(freq) },
                    ]
                });
            }
        }

        // 7. Set effects from base profile
        if (baseProfile) {
            result.effects = { ...baseProfile.effects };
            result.envelope = { ...baseProfile.envelope };
        } else {
            result.effects = { reverb: 0.3, filterFreq: 5000 };
            result.envelope = { attack: 0.5, decay: 0.5, sustain: 0.7, release: 2.0 };
        }

        // 8. Apply modifiers
        const appliedMods = [];
        for (const word of words) {
            const cleanWord = word.replace(/[^a-z]/g, '');
            if (this.modifiers[cleanWord]) {
                const mod = this.modifiers[cleanWord];
                appliedMods.push(cleanWord);

                // Apply frequency multiplier
                if (mod.freqMultiplier) {
                    for (const layer of result.layers) {
                        layer.frequency *= mod.freqMultiplier;
                    }
                }
                // Apply gain modification
                if (mod.gainMod) {
                    for (const layer of result.layers) {
                        layer.gain = Math.max(0.01, Math.min(1, layer.gain + mod.gainMod));
                    }
                }
                // Apply detune
                if (mod.detuneMod) {
                    for (const layer of result.layers) {
                        layer.detune = (layer.detune || 0) + mod.detuneMod;
                    }
                }
                // Apply waveform override
                if (mod.waveformOverride) {
                    for (const layer of result.layers) {
                        layer.waveform = mod.waveformOverride;
                    }
                }
                // Apply effect modifications
                if (mod.distortionMod) result.effects.distortion = Math.max(0, (result.effects.distortion || 0) + mod.distortionMod);
                if (mod.filterFreqMod) result.effects.filterFreq = Math.max(20, Math.min(20000, (result.effects.filterFreq || 5000) + mod.filterFreqMod));
                if (mod.filterQMod) result.effects.filterQ = Math.max(0.1, (result.effects.filterQ || 1) + mod.filterQMod);
                if (mod.reverbMod) result.effects.reverb = Math.max(0, Math.min(1, (result.effects.reverb || 0.3) + mod.reverbMod));
                if (mod.reverbDecayMod) result.effects.reverbDecay = Math.max(0.5, (result.effects.reverbDecay || 2) + mod.reverbDecayMod);
                if (mod.chorusRateMod) result.effects.chorusRate = Math.max(0.1, (result.effects.chorusRate || 1.5) + mod.chorusRateMod);
                if (mod.chorusDepthMod) result.effects.chorusDepth = Math.max(0, Math.min(100, (result.effects.chorusDepth || 30) + mod.chorusDepthMod));
                if (mod.delayFeedbackMod) result.effects.delayFeedback = Math.max(0, Math.min(95, (result.effects.delayFeedback || 40) + mod.delayFeedbackMod));
                if (mod.delayMod) result.effects.delayTime = Math.max(0, (result.effects.delayTime || 300) + mod.delayMod);

                // Envelope mods
                if (mod.attackMod) result.envelope.attack = Math.max(0.001, (result.envelope.attack || 0.1) + mod.attackMod);
                if (mod.decayMod) result.envelope.decay = Math.max(0.01, (result.envelope.decay || 0.3) + mod.decayMod);
                if (mod.releaseMod) result.envelope.release = Math.max(0.01, (result.envelope.release || 1.0) + mod.releaseMod);

                // FM modulation
                if (mod.fmMod) {
                    for (const layer of result.layers) {
                        layer.fmEnabled = true;
                        layer.fmRatio = mod.fmRatio || layer.fmRatio || 2;
                        layer.fmDepth = mod.fmDepth || layer.fmDepth || 100;
                    }
                }

                // Add harmonics
                if (mod.harmonicsMod) {
                    for (const layer of result.layers) {
                        if (!layer.harmonics || layer.harmonics.length === 0) {
                            layer.harmonics = [
                                { ratio: 2, amplitude: 0.3 },
                                { ratio: 3, amplitude: 0.15 },
                                { ratio: 4, amplitude: 0.08 },
                                { ratio: 5, amplitude: 0.04 },
                            ];
                        }
                    }
                }

                // Add extra detuned layers for thickness
                if (mod.addLayers && result.layers.length > 0) {
                    const baseLayers = [...result.layers];
                    for (let i = 0; i < Math.min(2, baseLayers.length); i++) {
                        result.layers.push({
                            ...baseLayers[i],
                            detune: (baseLayers[i].detune || 0) + 12 + Math.random() * 8,
                            gain: baseLayers[i].gain * 0.4,
                        });
                        result.layers.push({
                            ...baseLayers[i],
                            detune: (baseLayers[i].detune || 0) - 12 - Math.random() * 8,
                            gain: baseLayers[i].gain * 0.4,
                        });
                    }
                }
            }
        }

        if (appliedMods.length > 0) {
            result.analysis.push({
                title: 'Modifiers Applied',
                params: [{ key: 'modifiers', value: appliedMods.join(', ') }]
            });
        }

        // 9. Generate harmonic series if "harmonic" keyword found
        if (input.includes('harmonic')) {
            const baseFreq = explicitFreqs[0] || (result.layers[0] ? result.layers[0].frequency : 220);
            result.analysis.push({
                title: 'Harmonic Series',
                params: [
                    { key: 'fundamental', value: `${baseFreq}Hz` },
                    { key: 'overtones', value: '2nd through 8th harmonics' },
                ]
            });
            // Add harmonics to first layer or create new
            if (result.layers.length > 0) {
                result.layers[0].harmonics = [
                    { ratio: 2, amplitude: 0.5 },
                    { ratio: 3, amplitude: 0.33 },
                    { ratio: 4, amplitude: 0.25 },
                    { ratio: 5, amplitude: 0.2 },
                    { ratio: 6, amplitude: 0.17 },
                    { ratio: 7, amplitude: 0.14 },
                    { ratio: 8, amplitude: 0.12 },
                ];
            }
        }

        // 10. Cap total layers for performance
        if (result.layers.length > 16) {
            result.layers = result.layers.slice(0, 16);
            result.analysis.push({
                title: 'Optimization',
                params: [{ key: 'note', value: 'Capped at 16 oscillator layers for performance' }]
            });
        }

        // Build description
        result.description = this._buildDescription(result);

        return result;
    }

    _detectWaveform(text) {
        if (text.includes('sine') || text.includes('pure') || text.includes('clean')) return 'sine';
        if (text.includes('sawtooth') || text.includes('saw') || text.includes('buzzy')) return 'sawtooth';
        if (text.includes('square') || text.includes('hollow') || text.includes('retro')) return 'square';
        if (text.includes('triangle') || text.includes('soft') || text.includes('mellow')) return 'triangle';
        return 'sine';
    }

    _freqToNote(freq) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteNum = 12 * (Math.log2(freq / 440)) + 69;
        const note = noteNames[Math.round(noteNum) % 12];
        const octave = Math.floor(Math.round(noteNum) / 12) - 1;
        return `~${note}${octave} (${freq.toFixed(1)}Hz)`;
    }

    _classifyBrainwave(freq) {
        if (freq < 4) return 'Delta (deep sleep)';
        if (freq < 8) return 'Theta (meditation/creativity)';
        if (freq < 14) return 'Alpha (relaxation/focus)';
        if (freq < 30) return 'Beta (alertness/concentration)';
        return 'Gamma (high cognition/perception)';
    }

    _buildDescription(result) {
        const parts = [];
        if (result.layers.length > 0) {
            const freqs = result.layers.map(l => l.frequency);
            const minFreq = Math.min(...freqs).toFixed(0);
            const maxFreq = Math.max(...freqs).toFixed(0);
            const waveforms = [...new Set(result.layers.map(l => l.waveform))];
            parts.push(`${result.layers.length} layers: ${waveforms.join('+')} [${minFreq}-${maxFreq}Hz]`);
        }
        if (result.binaural) {
            parts.push(`Binaural: ${result.binaural.beat}Hz on ${result.binaural.carrier}Hz carrier`);
        }
        return parts.join(' | ');
    }

    /**
     * Get preset text for preset buttons
     */
    getPresetText(presetName) {
        const presets = {
            'cosmic': 'A deep cosmic drone with pulsating harmonics at 40Hz, building layers of crystalline overtones that shimmer and evolve through space',
            'binaural': 'Binaural beat at 10Hz (alpha waves) with a carrier frequency of 200Hz for deep relaxation and mental clarity',
            'thunder': 'Massive thunderstorm with deep sub-bass rumble, rolling thunder, and distant lightning crackle with long reverberant tail',
            'choir': 'Ethereal angelic choir evolving through rich harmonic series from 220Hz to 880Hz with lush reverb and slow chorus',
            'neural': 'Neural oscillation pattern: gamma 40Hz modulated by theta 6Hz with complex interference patterns for cognitive enhancement',
            'crystal': 'Crystal resonance at 528Hz solfeggio frequency with shimmering harmonic overtones and long ethereal reverb tail',
            'abyss': 'Deep abyss drone at the threshold of human hearing, 20-60Hz sub-bass layers with slow evolving pulsation and massive reverb',
            'machine': 'Industrial machine pulse with harsh metallic FM synthesis, resonant filtering, and rhythmic distorted patterns',
        };
        return presets[presetName] || '';
    }
}

window.AISoundEngine = AISoundEngine;
