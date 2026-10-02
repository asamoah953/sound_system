# 🧠 NeuroSynth Lab — AI Neural Sound Research Laboratory

> AI-powered brainwave entrainment and sound synthesis platform for consciousness research, lucid dreaming induction, pineal gland activation, and neural experimentation.

---

## 🚀 Getting Started

### Requirements
- A modern web browser (Chrome, Edge, Firefox, or Brave)
- 🎧 **Stereo headphones are REQUIRED** for binaural beats to work — speakers will NOT produce the entrainment effect

### How to Start

**This is a pure HTML/CSS/JS app — no installation, no dependencies, no build step.**

Simply open the file in your browser:

#### Option 1: Double-click
1. Navigate to the `sound` folder on your Desktop
2. Double-click **`index.html`**

#### Option 2: Drag & drop
1. Open your browser
2. Drag `index.html` into the browser window

#### Option 3: Command line
```bash
# Windows
start index.html

# Or with a specific browser
start chrome index.html
```

#### Option 4: VS Code / Antigravity IDE
- Right-click `index.html` → **Open with Live Server** (if you have the extension)
- Or simply open the file in the browser from the IDE

> **Note:** The first time you click Play or Start a protocol, the browser may ask for audio permission. Click **Allow**.

---

## 📂 Project Structure

```
sound/
├── index.html          # Main application page
├── style.css           # Complete design system & styles
├── synth-engine.js     # Web Audio API synthesis engine
├── ai-engine.js        # AI natural language → sound parameter engine
├── neuro-protocols.js  # Timed brainwave entrainment protocols
├── visualizer.js       # Real-time audio visualizations
├── app.js              # Main application controller
└── README.md           # This file
```

---

## 🎛️ Features

### 1. AI Sound Architect
Type a natural language description of any sound and the AI maps it to frequencies, waveforms, effects, and envelopes.

**Examples:**
- *"Deep cosmic drone with pulsating harmonics at 40Hz"*
- *"Binaural beat at 10Hz with a carrier frequency of 200Hz"*
- *"Ethereal choir evolving through harmonic series from 220Hz"*

### 2. Multi-Layer Synthesis Engine
- **Oscillator types:** Sine, Square, Sawtooth, Triangle
- **FM Synthesis:** Frequency modulation with configurable ratio & depth
- **Additive Synthesis:** Harmonic overtone series generation
- **Per-layer controls:** Frequency, detune, gain

### 3. Effects Chain
- Reverb (convolution with adjustable decay)
- Delay (with feedback)
- Filter (Low Pass / High Pass / Band Pass / Notch)
- Distortion (waveshaper)
- Chorus (LFO-modulated delay)
- Compressor (dynamics)

### 4. Binaural Beat Engine
- Adjustable carrier frequency and beat frequency
- Brainwave presets: δ Delta, θ Theta, α Alpha, β Beta, γ Gamma

### 5. 🔬 Neuro Research Lab
Six timed, multi-phase brainwave entrainment protocols:

| Protocol | Duration | Target |
|---|---|---|
| 👁️ Pineal Gland Activation | 23 min | Pineal, Thalamus, Visual Cortex |
| 🧬 Hypothalamus Entrainment | 23 min | Hypothalamus, Pituitary, HPA Axis |
| 🌙 Lucid Dream Induction | 44 min | Prefrontal Cortex, Temporal Lobe |
| 🚀 Astral Projection / OBE | 41 min | Angular Gyrus, Temporoparietal Junction |
| 💨 Rapid Deep State | 10 min | Whole Brain, Thalamus |
| 🌈 Full Spectrum Explorer | 34 min | All major brain regions |

Each protocol automatically transitions through brainwave states with a live dashboard showing phase timeline, timers, frequency readout, and brainwave classification.

### 6. Real-Time Visualizations
- **Waveform** — Time-domain oscilloscope view
- **Spectrum** — Logarithmic frequency analyzer bars
- **Spectrogram** — Frequency heatmap over time
- **Circular** — Radial frequency visualization

### 7. Export & Reporting
- **WAV Export** — Render any sound or protocol phase as a .wav file
- **Session Report (JSON)** — Timestamped log of every phase, frequency, binaural parameter, and user notes — ready for panel submission

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Stop |
| `Escape` | Stop all (including protocols & binaural) |

---

## 🔬 Research References

The protocols are informed by published neuroscience research:

- **Voss U. et al. (2014)** — *"Induction of self awareness in dreams through frontal low current stimulation of gamma activity"* — Nature Neuroscience
- **Jirakittayakorn & Wongsawat (2017)** — *"Brain Responses to 40-Hz Binaural Beat"* — Int J Psychophysiol
- **Wahbeh et al. (2007)** — *"Binaural Beat Technology in Humans"* — J Alternative & Complementary Medicine
- **Lavallee et al. (2011)** — *"Is the Hypothalamus Involved in Meditation?"* — Medical Hypotheses
- **Blanke & Arzy (2005)** — *"The out-of-body experience: disturbed self-processing at the temporo-parietal junction"*
- **Baconnier et al. (2002)** — Calcite microcrystals in the pineal gland

---

## ⚠️ Disclaimer

This tool is designed for **research and experimentation purposes**. Brainwave entrainment via binaural beats is an area of active scientific study. Results vary between individuals. This software does not make medical claims. If you have epilepsy or a seizure disorder, consult a medical professional before using brainwave entrainment.

---

## 🛠️ Tech Stack

- **Pure HTML5 / CSS3 / JavaScript** — No frameworks, no dependencies
- **Web Audio API** — Real-time audio synthesis and processing
- **Canvas API** — Real-time visualizations
- **OfflineAudioContext** — High-quality WAV rendering

---

*Built with NeuroSynth Lab v3.0 — Neural Engine*
