/**
 * Zero-dependency Procedural Cybernetic Audio Synthesizer (Web Audio API)
 * Generates tactile micro-soundscapes without loading external mp3 assets:
 * - Subtle tactile clicks & ticks
 * - Harmonic modal opening chords
 * - Neural resonance hums
 * - Copy confirmation chirps
 */

class SoundEngine {
  private ctx: AudioContext | null = null
  private enabled: boolean = false

  constructor() {
    // Sound starts muted to respect user preference and autoplay policies
    const stored = typeof window !== 'undefined' ? localStorage.getItem('portfolio-audio') : null
    this.enabled = stored === 'true'
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public toggle(): boolean {
    this.enabled = !this.enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio-audio', String(this.enabled))
    }
    if (this.enabled) {
      this.initContext()
      this.playChirp(880, 0.08, 'sine')
    }
    return this.enabled
  }

  /** Subtle futuristic click on hovering pills or buttons */
  public playHover() {
    if (!this.enabled) return
    this.initContext()
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.03)

    gain.gain.setValueAtTime(0.015, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(this.ctx.currentTime + 0.035)
  }

  /** Satisfying cyber chirp on click or filter selection */
  public playClick() {
    if (!this.enabled) return
    this.initContext()
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(600, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.06)

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.06)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(this.ctx.currentTime + 0.065)
  }

  /** Futuristic harmonic chord swell when opening a project case study */
  public playModalOpen() {
    if (!this.enabled) return
    this.initContext()
    if (!this.ctx) return

    const notes = [329.63, 440.0, 659.25] // E4, A4, E5 harmonic chord
    notes.forEach((freq, i) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.04)

      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime + i * 0.04)
      gain.gain.linearRampToValueAtTime(0.035, this.ctx.currentTime + i * 0.04 + 0.08)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + i * 0.04 + 0.45)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(this.ctx.currentTime + i * 0.04)
      osc.stop(this.ctx.currentTime + i * 0.04 + 0.5)
    })
  }

  /** Confirmation chirp when copying git clone command */
  public playConfirm() {
    if (!this.enabled) return
    this.initContext()
    if (!this.ctx) return

    const notes = [587.33, 880.0] // D5, A5
    notes.forEach((freq, i) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.06)

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime + i * 0.06)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + i * 0.06 + 0.12)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(this.ctx.currentTime + i * 0.06)
      osc.stop(this.ctx.currentTime + i * 0.06 + 0.14)
    })
  }

  /** Radar/Sonar ping for orbital & vision telemetry */
  public playSonar() {
    if (!this.enabled) return
    this.initContext()
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1244.51, this.ctx.currentTime) // D#6
    osc.frequency.exponentialRampToValueAtTime(830.61, this.ctx.currentTime + 0.35)

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(this.ctx.currentTime + 0.36)
  }

  /** Cyber security threat alarm tone */
  public playAlert() {
    if (!this.enabled) return
    this.initContext()
    if (!this.ctx) return

    const freqs = [350, 480]
    freqs.forEach((freq, i) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08)
      gain.gain.setValueAtTime(0.035, this.ctx.currentTime + i * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + i * 0.08 + 0.09)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(this.ctx.currentTime + i * 0.08)
      osc.stop(this.ctx.currentTime + i * 0.08 + 0.1)
    })
  }

  /** Positive trigger/success harmonic chime */
  public playSuccess() {
    if (!this.enabled) return
    this.initContext()
    if (!this.ctx) return

    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05)
      gain.gain.setValueAtTime(0.025, this.ctx.currentTime + i * 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + i * 0.05 + 0.22)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(this.ctx.currentTime + i * 0.05)
      osc.stop(this.ctx.currentTime + i * 0.05 + 0.25)
    })
  }

  private playChirp(freq: number, duration: number, type: OscillatorType) {
    if (!this.ctx) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + duration)
  }
}

export const sound = new SoundEngine()
