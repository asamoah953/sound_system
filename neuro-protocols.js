/**
 * NeuroSynth Lab — Neuro Research Protocol Engine
 * 
 * Implements timed, multi-phase brainwave entrainment protocols based on
 * published neuroscience research for:
 *   - Pineal gland stimulation (melatonin/DMT pathways)
 *   - Hypothalamic entrainment (circadian rhythm, sleep regulation)
 *   - Lucid dreaming induction (Voss et al., 2014 gamma stimulation)
 *   - Astral projection / OBE protocols (Monroe Institute focus levels)
 *   - Sleep stage transitions (wake → NREM → REM cycling)
 *
 * References:
 *   - Voss U. et al. (2014) "Induction of self awareness in dreams through
 *     frontal low current stimulation of gamma activity" Nature Neuroscience
 *   - Jirakittayakorn & Wongsawat (2017) "Brain Responses to 40-Hz Binaural 
 *     Beat and Effects on Emotion and Memory" Int J Psychophysiol
 *   - Wahbeh et al. (2007) "Binaural Beat Technology in Humans" 
 *     J Alternative & Complementary Medicine
 *   - Lavallee et al. (2011) "Is the Hypothalamus Involved in Meditation?"
 *     Medical Hypotheses
 */

class NeuroProtocolEngine {
    constructor(synthEngine) {
        this.synth = synthEngine;
        this.currentProtocol = null;
        this.currentPhaseIndex = -1;
        this.phaseTimer = null;
        this.isRunning = false;
        this.startTime = null;
        this.sessionLog = [];
        this.onPhaseChange = null; // callback(phaseIndex, phase, protocol)
        this.onProtocolEnd = null; // callback(sessionLog)
        this.onTick = null; // callback(elapsed, phaseElapsed, phaseRemaining)
        this.tickInterval = null;

        this._defineProtocols();
    }

    _defineProtocols() {
        this.protocols = {

            // ============================================================
            // PINEAL GLAND ACTIVATION PROTOCOL
            // Targets: Pineal gland (third eye), melatonin/serotonin pathways
            // Based on solfeggio frequencies and gamma entrainment research
            // ============================================================
            'pineal-activation': {
                name: 'Pineal Gland Activation',
                icon: '👁️',
                description: 'Stimulates the pineal gland through specific frequency resonance. Uses 936Hz (solfeggio crown), 852Hz (third eye), and 40Hz gamma entrainment to activate pineal crystalline structures. Research suggests these frequencies may influence melatonin/DMT production pathways.',
                totalDuration: null, // calculated from phases
                targetRegions: ['Pineal Gland', 'Thalamus', 'Visual Cortex'],
                references: [
                    'Baconnier et al. (2002) - Calcite microcrystals in the pineal gland',
                    'Luke & Terhune (2013) - The induction of synaesthesia with chemical agents',
                ],
                phases: [
                    {
                        name: '🌀 Grounding & Relaxation',
                        duration: 180, // 3 min
                        description: 'Alpha-theta crossover to quiet the mind',
                        binaural: { carrier: 200, beat: 10, volume: 0.4 },
                        layers: [
                            { waveform: 'sine', frequency: 136.1, gain: 0.2 }, // OM frequency
                            { waveform: 'sine', frequency: 272.2, gain: 0.1 },
                        ],
                        effects: { reverb: 0.6, reverbDecay: 5, filterFreq: 2000 },
                        envelope: { attack: 3, decay: 1, sustain: 0.9, release: 3 }
                    },
                    {
                        name: '🔮 Third Eye Resonance',
                        duration: 300, // 5 min
                        description: 'Solfeggio 852Hz with theta binaural for pineal resonance',
                        binaural: { carrier: 426, beat: 6.5, volume: 0.45 }, // 852/2 carrier, theta
                        layers: [
                            { waveform: 'sine', frequency: 852, gain: 0.25, harmonics: [
                                { ratio: 0.5, amplitude: 0.3 }, { ratio: 2, amplitude: 0.15 },
                                { ratio: 3, amplitude: 0.08 }
                            ]},
                            { waveform: 'sine', frequency: 426, gain: 0.15 },
                            { waveform: 'triangle', frequency: 213, gain: 0.1 },
                        ],
                        effects: { reverb: 0.7, reverbDecay: 6, chorusRate: 0.3, chorusDepth: 30 },
                        envelope: { attack: 4, decay: 1, sustain: 0.85, release: 4 }
                    },
                    {
                        name: '⚡ Gamma Activation',
                        duration: 300, // 5 min
                        description: '40Hz gamma entrainment — associated with heightened awareness and pineal activation',
                        binaural: { carrier: 468, beat: 40, volume: 0.5 }, // 936/2 carrier, gamma
                        layers: [
                            { waveform: 'sine', frequency: 936, gain: 0.25, harmonics: [
                                { ratio: 0.5, amplitude: 0.2 }, { ratio: 2, amplitude: 0.1 }
                            ]},
                            { waveform: 'sine', frequency: 963, gain: 0.15 }, // Crown solfeggio
                            { waveform: 'sine', frequency: 40, gain: 0.2, fmEnabled: true, fmRatio: 0.15, fmDepth: 20 },
                        ],
                        effects: { reverb: 0.65, reverbDecay: 4, delayTime: 400, delayFeedback: 30 },
                        envelope: { attack: 2, decay: 1, sustain: 0.8, release: 3 }
                    },
                    {
                        name: '💎 Deep Pineal Immersion',
                        duration: 420, // 7 min
                        description: 'Full spectrum pineal stimulation with sub-delta modulation and solfeggio stack',
                        binaural: { carrier: 234, beat: 3, volume: 0.45 }, // Deep delta
                        layers: [
                            { waveform: 'sine', frequency: 936, gain: 0.2 },
                            { waveform: 'sine', frequency: 852, gain: 0.15 },
                            { waveform: 'sine', frequency: 528, gain: 0.15 }, // DNA repair
                            { waveform: 'sine', frequency: 396, gain: 0.1 },
                            { waveform: 'sine', frequency: 111, gain: 0.12 }, // Cell regeneration
                            { waveform: 'sine', frequency: 40, gain: 0.15 }, // Gamma carrier
                        ],
                        effects: { reverb: 0.8, reverbDecay: 8, chorusRate: 0.2, chorusDepth: 20 },
                        envelope: { attack: 5, decay: 2, sustain: 0.9, release: 5 }
                    },
                    {
                        name: '🌅 Integration & Return',
                        duration: 180, // 3 min
                        description: 'Gentle alpha return to waking consciousness',
                        binaural: { carrier: 200, beat: 10, volume: 0.35 },
                        layers: [
                            { waveform: 'sine', frequency: 528, gain: 0.15 },
                            { waveform: 'sine', frequency: 264, gain: 0.12 },
                        ],
                        effects: { reverb: 0.5, reverbDecay: 3 },
                        envelope: { attack: 3, decay: 1, sustain: 0.7, release: 5 }
                    }
                ]
            },

            // ============================================================
            // HYPOTHALAMUS ENTRAINMENT PROTOCOL
            // Targets: Hypothalamus, SCN (suprachiasmatic nucleus), HPA axis
            // For circadian regulation, hormone modulation, deep homeostasis
            // ============================================================
            'hypothalamus-entrainment': {
                name: 'Hypothalamus Deep Entrainment',
                icon: '🧬',
                description: 'Targets the hypothalamic-pituitary axis through sub-delta and theta oscillations. The hypothalamus regulates sleep/wake cycles, body temperature, hunger, and hormone release. Low-frequency entrainment (0.5-4Hz) with Schumann resonance (7.83Hz) carrier may influence these autonomic functions.',
                targetRegions: ['Hypothalamus', 'Pituitary Gland', 'SCN', 'HPA Axis'],
                references: [
                    'Lavallee et al. (2011) - Hypothalamus involvement in meditation',
                    'Persinger (1983) - Religious and mystical experiences as artifacts of temporal lobe function',
                ],
                phases: [
                    {
                        name: '🌊 Autonomic Calming',
                        duration: 180,
                        description: 'Vagal nerve tone enhancement via 10Hz alpha',
                        binaural: { carrier: 150, beat: 10, volume: 0.4 },
                        layers: [
                            { waveform: 'sine', frequency: 7.83, gain: 0.2 }, // Schumann resonance
                            { waveform: 'sine', frequency: 136.1, gain: 0.15 },
                            { waveform: 'triangle', frequency: 15.66, gain: 0.1 }, // 2nd Schumann harmonic
                        ],
                        effects: { reverb: 0.5, reverbDecay: 4, filterFreq: 1500, filterType: 'lowpass' },
                        envelope: { attack: 4, decay: 1, sustain: 0.9, release: 4 }
                    },
                    {
                        name: '🧠 Theta Descent',
                        duration: 300,
                        description: 'Deep theta (4-6Hz) for hypothalamic engagement',
                        binaural: { carrier: 150, beat: 5, volume: 0.45 },
                        layers: [
                            { waveform: 'sine', frequency: 5, gain: 0.15 },
                            { waveform: 'sine', frequency: 7.83, gain: 0.2 },
                            { waveform: 'sine', frequency: 111, gain: 0.12 },
                            { waveform: 'sine', frequency: 174, gain: 0.08 }, // Solfeggio - foundation
                        ],
                        effects: { reverb: 0.6, reverbDecay: 6, chorusRate: 0.15, chorusDepth: 25 },
                        envelope: { attack: 5, decay: 2, sustain: 0.9, release: 4 }
                    },
                    {
                        name: '🔬 Sub-Delta Hypothalamic Pulse',
                        duration: 420,
                        description: 'Ultra-low 0.5-2Hz entrainment targeting hypothalamic oscillation cycles',
                        binaural: { carrier: 100, beat: 1.5, volume: 0.4 },
                        layers: [
                            { waveform: 'sine', frequency: 0.5, gain: 0.15, fmEnabled: true, fmRatio: 4, fmDepth: 3 },
                            { waveform: 'sine', frequency: 2, gain: 0.12 },
                            { waveform: 'sine', frequency: 7.83, gain: 0.2 },
                            { waveform: 'sine', frequency: 40, gain: 0.08 }, // Gamma overlay
                            { waveform: 'sine', frequency: 83, gain: 0.06 },
                        ],
                        effects: { reverb: 0.7, reverbDecay: 8, filterFreq: 500, filterType: 'lowpass', filterQ: 1.5 },
                        envelope: { attack: 6, decay: 2, sustain: 0.95, release: 6 }
                    },
                    {
                        name: '💫 HPA Axis Harmonization',
                        duration: 300,
                        description: 'Cortisol regulation frequencies with Schumann resonance stack',
                        binaural: { carrier: 125, beat: 3, volume: 0.4 },
                        layers: [
                            { waveform: 'sine', frequency: 3, gain: 0.12 },
                            { waveform: 'sine', frequency: 7.83, gain: 0.2 },
                            { waveform: 'sine', frequency: 14.3, gain: 0.1 }, // 3rd Schumann harmonic
                            { waveform: 'sine', frequency: 20.8, gain: 0.08 }, // 4th Schumann harmonic
                            { waveform: 'sine', frequency: 33.8, gain: 0.06 }, // 5th Schumann harmonic
                            { waveform: 'sine', frequency: 528, gain: 0.1 }, // Healing solfeggio
                        ],
                        effects: { reverb: 0.75, reverbDecay: 7, chorusRate: 0.1, chorusDepth: 15 },
                        envelope: { attack: 5, decay: 2, sustain: 0.9, release: 5 }
                    },
                    {
                        name: '🌅 Gentle Resurfacing',
                        duration: 180,
                        description: 'Alpha-beta transition back to waking state',
                        binaural: { carrier: 200, beat: 12, volume: 0.35 },
                        layers: [
                            { waveform: 'sine', frequency: 528, gain: 0.12 },
                            { waveform: 'sine', frequency: 396, gain: 0.1 },
                        ],
                        effects: { reverb: 0.4, reverbDecay: 3 },
                        envelope: { attack: 3, decay: 1, sustain: 0.7, release: 4 }
                    }
                ]
            },

            // ============================================================
            // LUCID DREAMING INDUCTION PROTOCOL
            // Based on Voss et al. (2014) 40Hz gamma stimulation research
            // and Monroe Institute Hemi-Sync methodology
            // ============================================================
            'lucid-dream-induction': {
                name: 'Lucid Dream Induction',
                icon: '🌙',
                description: 'Multi-phase protocol designed to guide consciousness through wake → hypnagogic → NREM → REM stages while maintaining metacognitive awareness. Based on Voss et al. (2014): 40Hz frontal gamma stimulation during REM sleep induced lucid dreaming in 77% of subjects. Protocol includes delta descent for sleep onset, followed by theta-gamma coupling for lucid REM induction.',
                targetRegions: ['Prefrontal Cortex', 'Temporal Lobe', 'Thalamus', 'Pineal Gland', 'Reticular Formation'],
                references: [
                    'Voss U. et al. (2014) Nature Neuroscience - 40Hz gamma lucid dream induction',
                    'LaBerge S. (1980) - Lucid dreaming: psychophysiological studies',
                    'Stumbrys et al. (2012) - Induction of lucid dreams: A systematic review',
                ],
                phases: [
                    {
                        name: '🌆 Conscious Relaxation',
                        duration: 300, // 5 min
                        description: 'Progressive alpha relaxation — body still, mind alert',
                        binaural: { carrier: 200, beat: 10, volume: 0.4 },
                        layers: [
                            { waveform: 'sine', frequency: 174, gain: 0.12 }, // Foundation solfeggio
                            { waveform: 'sine', frequency: 136.1, gain: 0.15 },
                            { waveform: 'sine', frequency: 396, gain: 0.08 },
                        ],
                        effects: { reverb: 0.6, reverbDecay: 5, chorusRate: 0.2, chorusDepth: 20 },
                        envelope: { attack: 5, decay: 2, sustain: 0.9, release: 5 }
                    },
                    {
                        name: '🌀 Hypnagogic Gateway',
                        duration: 420, // 7 min
                        description: 'Theta descent (4-7Hz) — the hypnagogic border between wake and sleep where visual imagery begins',
                        binaural: { carrier: 180, beat: 5.5, volume: 0.45 },
                        layers: [
                            { waveform: 'sine', frequency: 5.5, gain: 0.15 },
                            { waveform: 'sine', frequency: 174, gain: 0.1 },
                            { waveform: 'sine', frequency: 111, gain: 0.12 },
                            { waveform: 'sine', frequency: 7.83, gain: 0.1 }, // Schumann
                        ],
                        effects: { reverb: 0.7, reverbDecay: 7, chorusRate: 0.15, chorusDepth: 30, delayTime: 600, delayFeedback: 25 },
                        envelope: { attack: 6, decay: 2, sustain: 0.9, release: 6 }
                    },
                    {
                        name: '🌑 Deep Sleep Descent',
                        duration: 600, // 10 min
                        description: 'Delta (0.5-3Hz) for NREM sleep stage entry — body falls asleep',
                        binaural: { carrier: 100, beat: 2, volume: 0.4 },
                        layers: [
                            { waveform: 'sine', frequency: 1, gain: 0.12 },
                            { waveform: 'sine', frequency: 2.5, gain: 0.1 },
                            { waveform: 'sine', frequency: 7.83, gain: 0.08 },
                            { waveform: 'sine', frequency: 63, gain: 0.06 },
                        ],
                        effects: { reverb: 0.8, reverbDecay: 9, filterFreq: 400, filterType: 'lowpass' },
                        envelope: { attack: 8, decay: 3, sustain: 0.95, release: 8 }
                    },
                    {
                        name: '⚡ Lucid REM Trigger (Voss Protocol)',
                        duration: 600, // 10 min
                        description: '40Hz gamma burst over theta baseline — the Voss et al. protocol. 40Hz frontal gamma stimulation has been shown to induce self-reflective awareness during REM sleep',
                        binaural: { carrier: 220, beat: 40, volume: 0.35 },
                        layers: [
                            { waveform: 'sine', frequency: 40, gain: 0.2 }, // Primary gamma
                            { waveform: 'sine', frequency: 4, gain: 0.12 }, // Theta baseline
                            { waveform: 'sine', frequency: 80, gain: 0.08 }, // Gamma harmonic
                            { waveform: 'sine', frequency: 25, gain: 0.06 }, // Beta bridge
                            { waveform: 'sine', frequency: 7.83, gain: 0.08 }, // Schumann anchor
                            { waveform: 'sine', frequency: 852, gain: 0.05 }, // Third eye solfeggio
                        ],
                        effects: { reverb: 0.6, reverbDecay: 5, chorusRate: 0.3, chorusDepth: 20 },
                        envelope: { attack: 4, decay: 2, sustain: 0.85, release: 5 }
                    },
                    {
                        name: '🦋 Lucid Stabilization',
                        duration: 480, // 8 min
                        description: 'Sustained theta-gamma coupling to maintain lucid awareness within the dream state',
                        binaural: { carrier: 200, beat: 25, volume: 0.3 },
                        layers: [
                            { waveform: 'sine', frequency: 40, gain: 0.15 },
                            { waveform: 'sine', frequency: 6, gain: 0.12 },
                            { waveform: 'sine', frequency: 12, gain: 0.08 }, // Alpha-theta border
                            { waveform: 'sine', frequency: 528, gain: 0.06 },
                            { waveform: 'sine', frequency: 936, gain: 0.04 }, // Pineal
                        ],
                        effects: { reverb: 0.65, reverbDecay: 6, delayTime: 500, delayFeedback: 20 },
                        envelope: { attack: 5, decay: 2, sustain: 0.9, release: 5 }
                    },
                    {
                        name: '🌅 Gentle Awakening',
                        duration: 240, // 4 min
                        description: 'Gradual alpha-beta return — preserve dream memory during wake transition',
                        binaural: { carrier: 200, beat: 14, volume: 0.35 },
                        layers: [
                            { waveform: 'sine', frequency: 14, gain: 0.1 }, // Low beta
                            { waveform: 'sine', frequency: 10, gain: 0.12 }, // Alpha
                            { waveform: 'sine', frequency: 528, gain: 0.08 },
                        ],
                        effects: { reverb: 0.4, reverbDecay: 3 },
                        envelope: { attack: 3, decay: 1, sustain: 0.7, release: 4 }
                    }
                ]
            },

            // ============================================================
            // ASTRAL PROJECTION / OBE PROTOCOL
            // Based on Monroe Institute Focus Level methodology
            // and Tart's psychophysiological research on OBE
            // ============================================================
            'astral-projection': {
                name: 'Astral Projection / OBE Protocol',
                icon: '🚀',
                description: 'Progressive dissociation protocol using Monroe Institute Focus Level methodology. Guides through Focus 10 (body asleep/mind awake) → Focus 12 (expanded awareness) → Focus 15 (no-time state) → Focus 21 (bridge to other states). Uses specific binaural frequencies mapped to each focus level to systematically separate body-awareness from consciousness.',
                targetRegions: ['Angular Gyrus', 'Temporoparietal Junction', 'Prefrontal Cortex', 'Pineal Gland', 'Vestibular System'],
                references: [
                    'Monroe R. (1971) - Journeys Out of the Body',
                    'Blanke & Arzy (2005) - The out-of-body experience: disturbed self-processing at the temporo-parietal junction',
                    'Tart C. (1968) - Psychophysiological study of out-of-body experiences',
                ],
                phases: [
                    {
                        name: '🛏️ Preparatory Relaxation',
                        duration: 240,
                        description: 'Full body relaxation scan — alpha entrainment for physical release',
                        binaural: { carrier: 200, beat: 10, volume: 0.4 },
                        layers: [
                            { waveform: 'sine', frequency: 136.1, gain: 0.15 },
                            { waveform: 'sine', frequency: 174, gain: 0.1 },
                            { waveform: 'sine', frequency: 396, gain: 0.08 },
                        ],
                        effects: { reverb: 0.6, reverbDecay: 5, chorusRate: 0.2, chorusDepth: 20 },
                        envelope: { attack: 5, decay: 2, sustain: 0.9, release: 5 }
                    },
                    {
                        name: '🎯 Focus 10 — Mind Awake / Body Asleep',
                        duration: 420,
                        description: 'The foundational state: body sensations fade while mental clarity remains. 4Hz theta binaural with alpha carrier.',
                        binaural: { carrier: 200, beat: 4, volume: 0.45 },
                        layers: [
                            { waveform: 'sine', frequency: 4, gain: 0.15 },
                            { waveform: 'sine', frequency: 7.83, gain: 0.12 },
                            { waveform: 'sine', frequency: 100, gain: 0.1 },
                            { waveform: 'sine', frequency: 10, gain: 0.08 }, // Alpha anchor
                        ],
                        effects: { reverb: 0.7, reverbDecay: 6, filterFreq: 800, filterType: 'lowpass' },
                        envelope: { attack: 6, decay: 2, sustain: 0.9, release: 6 }
                    },
                    {
                        name: '🌌 Focus 12 — Expanded Awareness',
                        duration: 420,
                        description: 'Awareness expands beyond physical body. Sensory input reduces. 3Hz delta-theta border with Schumann resonance.',
                        binaural: { carrier: 150, beat: 3, volume: 0.45 },
                        layers: [
                            { waveform: 'sine', frequency: 3, gain: 0.12 },
                            { waveform: 'sine', frequency: 7.83, gain: 0.15 },
                            { waveform: 'sine', frequency: 63, gain: 0.08 },
                            { waveform: 'sine', frequency: 852, gain: 0.06 }, // Third eye
                            { waveform: 'sine', frequency: 40, gain: 0.05 }, // Gamma thread
                        ],
                        effects: { reverb: 0.75, reverbDecay: 8, chorusRate: 0.15, chorusDepth: 25, delayTime: 700, delayFeedback: 25 },
                        envelope: { attack: 7, decay: 2, sustain: 0.92, release: 7 }
                    },
                    {
                        name: '⏳ Focus 15 — State of No-Time',
                        duration: 480,
                        description: 'Temporal disorientation — perception of time dissolves. Deep delta (1.5Hz) with gamma overlay for maintained awareness.',
                        binaural: { carrier: 120, beat: 1.5, volume: 0.4 },
                        layers: [
                            { waveform: 'sine', frequency: 1.5, gain: 0.12, fmEnabled: true, fmRatio: 3, fmDepth: 2 },
                            { waveform: 'sine', frequency: 7.83, gain: 0.12 },
                            { waveform: 'sine', frequency: 40, gain: 0.1 }, // Awareness thread
                            { waveform: 'sine', frequency: 936, gain: 0.05 }, // Crown
                            { waveform: 'sine', frequency: 111, gain: 0.08 },
                        ],
                        effects: { reverb: 0.85, reverbDecay: 10, filterFreq: 400, filterType: 'lowpass', filterQ: 1 },
                        envelope: { attack: 8, decay: 3, sustain: 0.95, release: 8 }
                    },
                    {
                        name: '🌠 Focus 21 — Bridge State',
                        duration: 600,
                        description: 'The bridge to non-physical reality. Ultra-deep delta (0.5Hz) with 963Hz crown activation. The separation point.',
                        binaural: { carrier: 100, beat: 0.5, volume: 0.35 },
                        layers: [
                            { waveform: 'sine', frequency: 0.5, gain: 0.1 },
                            { waveform: 'sine', frequency: 963, gain: 0.08 }, // Crown solfeggio
                            { waveform: 'sine', frequency: 936, gain: 0.06 },
                            { waveform: 'sine', frequency: 852, gain: 0.05 },
                            { waveform: 'sine', frequency: 40, gain: 0.08 }, // Gamma awareness
                            { waveform: 'sine', frequency: 7.83, gain: 0.1 },
                            { waveform: 'sine', frequency: 3.5, gain: 0.07 },
                        ],
                        effects: { reverb: 0.9, reverbDecay: 10, chorusRate: 0.1, chorusDepth: 15, delayTime: 800, delayFeedback: 30 },
                        envelope: { attack: 10, decay: 3, sustain: 0.95, release: 10 }
                    },
                    {
                        name: '🌅 Return Protocol',
                        duration: 300,
                        description: 'Gradual reintegration — theta to alpha to beta progression for safe return',
                        binaural: { carrier: 200, beat: 10, volume: 0.35 },
                        layers: [
                            { waveform: 'sine', frequency: 10, gain: 0.12 },
                            { waveform: 'sine', frequency: 528, gain: 0.1 },
                            { waveform: 'sine', frequency: 396, gain: 0.08 },
                        ],
                        effects: { reverb: 0.4, reverbDecay: 3 },
                        envelope: { attack: 3, decay: 1, sustain: 0.7, release: 4 }
                    }
                ]
            },

            // ============================================================
            // RAPID DEEP STATE (Short 10-min protocol for quick sessions)
            // ============================================================
            'rapid-deep-state': {
                name: 'Rapid Deep State Induction',
                icon: '💨',
                description: 'Accelerated 10-minute protocol for quickly reaching theta-delta consciousness. Uses aggressive frequency ramping and multi-layer binaural beats. Designed for experienced practitioners who can transition states quickly.',
                targetRegions: ['Whole Brain', 'Thalamus', 'Reticular Formation'],
                references: [
                    'Kennel et al. (2010) - Pilot feasibility study of binaural auditory beats',
                ],
                phases: [
                    {
                        name: '⚡ Alpha Flash',
                        duration: 120,
                        description: 'Rapid alpha onset',
                        binaural: { carrier: 200, beat: 10, volume: 0.45 },
                        layers: [
                            { waveform: 'sine', frequency: 200, gain: 0.2 },
                            { waveform: 'sine', frequency: 10, gain: 0.15 },
                        ],
                        effects: { reverb: 0.5, reverbDecay: 3 },
                        envelope: { attack: 1, decay: 0.5, sustain: 0.9, release: 2 }
                    },
                    {
                        name: '🌀 Theta Plunge',
                        duration: 180,
                        description: 'Fast theta descent',
                        binaural: { carrier: 160, beat: 5, volume: 0.5 },
                        layers: [
                            { waveform: 'sine', frequency: 5, gain: 0.18 },
                            { waveform: 'sine', frequency: 7.83, gain: 0.15 },
                            { waveform: 'sine', frequency: 111, gain: 0.1 },
                        ],
                        effects: { reverb: 0.65, reverbDecay: 5 },
                        envelope: { attack: 2, decay: 1, sustain: 0.9, release: 3 }
                    },
                    {
                        name: '🌑 Delta Floor',
                        duration: 240,
                        description: 'Deep delta immersion',
                        binaural: { carrier: 100, beat: 2, volume: 0.45 },
                        layers: [
                            { waveform: 'sine', frequency: 2, gain: 0.15 },
                            { waveform: 'sine', frequency: 0.5, gain: 0.1 },
                            { waveform: 'sine', frequency: 7.83, gain: 0.12 },
                            { waveform: 'sine', frequency: 40, gain: 0.06 },
                        ],
                        effects: { reverb: 0.8, reverbDecay: 8, filterFreq: 300, filterType: 'lowpass' },
                        envelope: { attack: 4, decay: 2, sustain: 0.95, release: 4 }
                    },
                    {
                        name: '🌅 Quick Return',
                        duration: 60,
                        description: 'Fast alpha-beta return',
                        binaural: { carrier: 200, beat: 14, volume: 0.35 },
                        layers: [
                            { waveform: 'sine', frequency: 14, gain: 0.12 },
                            { waveform: 'sine', frequency: 528, gain: 0.08 },
                        ],
                        effects: { reverb: 0.3, reverbDecay: 2 },
                        envelope: { attack: 1, decay: 0.5, sustain: 0.7, release: 2 }
                    }
                ]
            },

            // ============================================================
            // FULL SPECTRUM CONSCIOUSNESS EXPLORER
            // Comprehensive 45-min protocol hitting all brain targets
            // ============================================================
            'full-spectrum': {
                name: 'Full Spectrum Consciousness Explorer',
                icon: '🌈',
                description: 'The most comprehensive protocol — a 45-minute journey through every major brainwave state (beta → alpha → theta → delta → gamma) while simultaneously targeting the pineal gland, hypothalamus, temporal lobes, and prefrontal cortex. Includes all solfeggio frequencies and Schumann resonance harmonics. Designed for deep research sessions.',
                targetRegions: ['Pineal Gland', 'Hypothalamus', 'Prefrontal Cortex', 'Temporal Lobes', 'Thalamus', 'Angular Gyrus', 'Visual Cortex'],
                references: [
                    'All previous references combined',
                    'Radin D. (2006) - Entangled Minds',
                ],
                phases: [
                    {
                        name: '🌤️ Beta Baseline',
                        duration: 120,
                        description: 'Establish normal waking consciousness baseline for comparison',
                        binaural: { carrier: 250, beat: 20, volume: 0.35 },
                        layers: [
                            { waveform: 'sine', frequency: 20, gain: 0.12 },
                            { waveform: 'sine', frequency: 250, gain: 0.1 },
                        ],
                        effects: { reverb: 0.3, reverbDecay: 2 },
                        envelope: { attack: 2, decay: 1, sustain: 0.8, release: 2 }
                    },
                    {
                        name: '🧘 Alpha Meditation',
                        duration: 300,
                        description: 'Deep alpha relaxation with OM frequency',
                        binaural: { carrier: 200, beat: 10, volume: 0.4 },
                        layers: [
                            { waveform: 'sine', frequency: 136.1, gain: 0.18 },
                            { waveform: 'sine', frequency: 272.2, gain: 0.1 },
                            { waveform: 'sine', frequency: 528, gain: 0.08 },
                        ],
                        effects: { reverb: 0.6, reverbDecay: 5, chorusRate: 0.2, chorusDepth: 20 },
                        envelope: { attack: 4, decay: 2, sustain: 0.9, release: 4 }
                    },
                    {
                        name: '🔮 Theta Vision',
                        duration: 420,
                        description: 'Theta state with solfeggio stack — heightened imagery and creativity',
                        binaural: { carrier: 180, beat: 6, volume: 0.45 },
                        layers: [
                            { waveform: 'sine', frequency: 396, gain: 0.1 },
                            { waveform: 'sine', frequency: 417, gain: 0.08 },
                            { waveform: 'sine', frequency: 528, gain: 0.1 },
                            { waveform: 'sine', frequency: 639, gain: 0.07 },
                            { waveform: 'sine', frequency: 741, gain: 0.06 },
                            { waveform: 'sine', frequency: 852, gain: 0.05 },
                            { waveform: 'sine', frequency: 963, gain: 0.04 },
                            { waveform: 'sine', frequency: 7.83, gain: 0.12 },
                        ],
                        effects: { reverb: 0.75, reverbDecay: 7, chorusRate: 0.15, chorusDepth: 25, delayTime: 500, delayFeedback: 20 },
                        envelope: { attack: 6, decay: 2, sustain: 0.9, release: 6 }
                    },
                    {
                        name: '🌑 Delta Abyss',
                        duration: 480,
                        description: 'Full delta descent with hypothalamic sub-frequencies and Schumann stack',
                        binaural: { carrier: 100, beat: 1.5, volume: 0.4 },
                        layers: [
                            { waveform: 'sine', frequency: 0.5, gain: 0.1 },
                            { waveform: 'sine', frequency: 1.5, gain: 0.12 },
                            { waveform: 'sine', frequency: 3, gain: 0.1 },
                            { waveform: 'sine', frequency: 7.83, gain: 0.15 },
                            { waveform: 'sine', frequency: 14.3, gain: 0.08 },
                            { waveform: 'sine', frequency: 20.8, gain: 0.06 },
                            { waveform: 'sine', frequency: 111, gain: 0.08 },
                        ],
                        effects: { reverb: 0.85, reverbDecay: 10, filterFreq: 400, filterType: 'lowpass', filterQ: 1.5 },
                        envelope: { attack: 8, decay: 3, sustain: 0.95, release: 8 }
                    },
                    {
                        name: '⚡ Gamma Transcendence',
                        duration: 420,
                        description: '40Hz gamma burst from delta — simultaneous pineal activation with full solfeggio resonance',
                        binaural: { carrier: 468, beat: 40, volume: 0.4 },
                        layers: [
                            { waveform: 'sine', frequency: 40, gain: 0.2 },
                            { waveform: 'sine', frequency: 936, gain: 0.1 },
                            { waveform: 'sine', frequency: 852, gain: 0.08 },
                            { waveform: 'sine', frequency: 963, gain: 0.06 },
                            { waveform: 'sine', frequency: 528, gain: 0.08 },
                            { waveform: 'sine', frequency: 7.83, gain: 0.1 },
                            { waveform: 'sine', frequency: 4, gain: 0.08 }, // Theta floor
                        ],
                        effects: { reverb: 0.7, reverbDecay: 6, chorusRate: 0.3, chorusDepth: 30, delayTime: 400, delayFeedback: 25 },
                        envelope: { attack: 4, decay: 2, sustain: 0.85, release: 5 }
                    },
                    {
                        name: '🌅 Integration & Return',
                        duration: 300,
                        description: 'Slow return through all states — gamma → beta → alpha for full integration',
                        binaural: { carrier: 200, beat: 12, volume: 0.35 },
                        layers: [
                            { waveform: 'sine', frequency: 12, gain: 0.12 },
                            { waveform: 'sine', frequency: 528, gain: 0.1 },
                            { waveform: 'sine', frequency: 396, gain: 0.08 },
                            { waveform: 'sine', frequency: 174, gain: 0.06 },
                        ],
                        effects: { reverb: 0.5, reverbDecay: 4 },
                        envelope: { attack: 3, decay: 1, sustain: 0.7, release: 5 }
                    }
                ]
            }
        };

        // Calculate total durations
        for (const key of Object.keys(this.protocols)) {
            const p = this.protocols[key];
            p.totalDuration = p.phases.reduce((sum, phase) => sum + phase.duration, 0);
        }
    }

    /* ========== Protocol Execution ========== */

    startProtocol(protocolKey) {
        const protocol = this.protocols[protocolKey];
        if (!protocol) throw new Error(`Unknown protocol: ${protocolKey}`);

        this.stopProtocol();
        this.synth.init();

        this.currentProtocol = protocol;
        this.currentPhaseIndex = -1;
        this.isRunning = true;
        this.startTime = Date.now();
        this.sessionLog = [];

        this._log('SESSION_START', {
            protocol: protocol.name,
            totalDuration: protocol.totalDuration,
            phases: protocol.phases.length,
            targetRegions: protocol.targetRegions,
            timestamp: new Date().toISOString()
        });

        // Start first phase
        this._nextPhase();

        // Start tick interval
        this.tickInterval = setInterval(() => this._tick(), 500);
    }

    _nextPhase() {
        if (!this.isRunning) return;

        this.currentPhaseIndex++;

        if (this.currentPhaseIndex >= this.currentProtocol.phases.length) {
            this._endProtocol();
            return;
        }

        const phase = this.currentProtocol.phases[this.currentPhaseIndex];

        this._log('PHASE_START', {
            phaseIndex: this.currentPhaseIndex,
            phaseName: phase.name,
            duration: phase.duration,
            description: phase.description,
            binaural: phase.binaural,
            layerCount: phase.layers.length,
            frequencies: phase.layers.map(l => l.frequency),
            timestamp: new Date().toISOString()
        });

        // Stop current sounds
        this.synth.stop();
        if (this.synth.isBinauralPlaying) this.synth.stopBinaural();

        // Clear and set new layers
        for (const layer of [...this.synth.getLayers()]) {
            this.synth.removeLayer(layer.id);
        }

        for (const layerConfig of phase.layers) {
            this.synth.addLayer(layerConfig);
        }

        // Set effects
        if (phase.effects) {
            const fx = phase.effects;
            if (fx.reverb !== undefined) this.synth.setReverbMix(fx.reverb);
            if (fx.reverbDecay !== undefined) this.synth.setReverbDecay(fx.reverbDecay);
            if (fx.delayTime !== undefined) this.synth.setDelayTime(fx.delayTime / 1000);
            if (fx.delayFeedback !== undefined) this.synth.setDelayFeedback(fx.delayFeedback / 100);
            if (fx.filterType) this.synth.setFilterType(fx.filterType);
            if (fx.filterFreq !== undefined) this.synth.setFilterFreq(fx.filterFreq);
            if (fx.filterQ !== undefined) this.synth.setFilterQ(fx.filterQ);
            if (fx.distortion !== undefined) this.synth.setDistortion(fx.distortion);
            if (fx.chorusRate !== undefined) this.synth.setChorusRate(fx.chorusRate);
            if (fx.chorusDepth !== undefined) this.synth.setChorusDepth(fx.chorusDepth / 100);
        }

        // Set envelope
        if (phase.envelope) {
            this.synth.setEnvelope(phase.envelope);
        }

        // Start binaural
        if (phase.binaural) {
            this.synth.startBinaural(phase.binaural.carrier, phase.binaural.beat, phase.binaural.volume);
        }

        // Play layers
        this.synth.play(phase.duration + 2); // +2s for crossfade

        // Notify callback
        if (this.onPhaseChange) {
            this.onPhaseChange(this.currentPhaseIndex, phase, this.currentProtocol);
        }

        // Schedule next phase
        this.phaseTimer = setTimeout(() => this._nextPhase(), phase.duration * 1000);
    }

    _tick() {
        if (!this.isRunning || !this.onTick) return;

        const elapsed = (Date.now() - this.startTime) / 1000;
        let phaseStart = 0;
        for (let i = 0; i < this.currentPhaseIndex; i++) {
            phaseStart += this.currentProtocol.phases[i].duration;
        }
        const phaseElapsed = elapsed - phaseStart;
        const phaseDuration = this.currentProtocol.phases[this.currentPhaseIndex]?.duration || 0;
        const phaseRemaining = Math.max(0, phaseDuration - phaseElapsed);

        this.onTick(elapsed, phaseElapsed, phaseRemaining);
    }

    _endProtocol() {
        this._log('SESSION_END', {
            totalElapsed: (Date.now() - this.startTime) / 1000,
            phasesCompleted: this.currentPhaseIndex,
            timestamp: new Date().toISOString()
        });

        this.isRunning = false;
        this.synth.stop();
        if (this.synth.isBinauralPlaying) this.synth.stopBinaural();

        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }

        if (this.onProtocolEnd) {
            this.onProtocolEnd(this.sessionLog);
        }
    }

    stopProtocol() {
        if (this.phaseTimer) {
            clearTimeout(this.phaseTimer);
            this.phaseTimer = null;
        }
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }

        if (this.isRunning) {
            this._log('SESSION_ABORT', {
                abortedAtPhase: this.currentPhaseIndex,
                elapsed: this.startTime ? (Date.now() - this.startTime) / 1000 : 0,
                timestamp: new Date().toISOString()
            });
        }

        this.synth.stop();
        if (this.synth.isBinauralPlaying) this.synth.stopBinaural();
        this.isRunning = false;
    }

    _log(event, data) {
        this.sessionLog.push({ event, data, time: Date.now() });
    }

    /* ========== Session Log Export ========== */

    exportSessionLog() {
        if (this.sessionLog.length === 0) return null;

        const protocol = this.currentProtocol || {};
        const report = {
            title: `NeuroSynth Lab — Session Report`,
            protocol: protocol.name || 'Unknown',
            description: protocol.description || '',
            targetRegions: protocol.targetRegions || [],
            references: protocol.references || [],
            generatedAt: new Date().toISOString(),
            events: this.sessionLog,
            summary: this._buildSummary()
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        return blob;
    }

    _buildSummary() {
        const events = this.sessionLog;
        const startEvent = events.find(e => e.event === 'SESSION_START');
        const endEvent = events.find(e => e.event === 'SESSION_END' || e.event === 'SESSION_ABORT');
        const phaseEvents = events.filter(e => e.event === 'PHASE_START');

        return {
            protocolName: startEvent?.data?.protocol || 'Unknown',
            startTime: startEvent?.data?.timestamp || null,
            endTime: endEvent?.data?.timestamp || null,
            totalDuration: endEvent?.data?.totalElapsed || null,
            phasesCompleted: phaseEvents.length,
            allFrequenciesUsed: [...new Set(phaseEvents.flatMap(e => e.data.frequencies || []))].sort((a, b) => a - b),
            binauralBeatsUsed: phaseEvents.map(e => e.data.binaural).filter(Boolean),
            aborted: !!events.find(e => e.event === 'SESSION_ABORT'),
        };
    }

    /* ========== Getters ========== */

    getProtocols() {
        return this.protocols;
    }

    getSessionLog() {
        return [...this.sessionLog];
    }

    getCurrentPhase() {
        if (!this.currentProtocol || this.currentPhaseIndex < 0) return null;
        return this.currentProtocol.phases[this.currentPhaseIndex];
    }

    getProgress() {
        if (!this.currentProtocol || !this.startTime) return 0;
        const elapsed = (Date.now() - this.startTime) / 1000;
        return Math.min(1, elapsed / this.currentProtocol.totalDuration);
    }
}

window.NeuroProtocolEngine = NeuroProtocolEngine;
