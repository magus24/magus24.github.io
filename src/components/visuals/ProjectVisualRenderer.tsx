import type { Project, VisualKey } from '../../data/projects'
import { AntifakeMock } from './AntifakeMock'
import { ShieldxMock } from './ShieldxMock'
import { YotoqhonamMock } from './YotoqhonamMock'

/* 1. SPUTNIK-AI: Orbital Constellation & Digital Twin Radar */
export function SputnikMock() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock-title">
        <span className="l">ORBITAL MISSION CONTROL</span>
        <span className="r">ALT: 540 KM • V: 7.6 KM/S</span>
      </div>
      <div className="mock-body" style={{ minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <svg viewBox="0 0 320 150" style={{ width: '100%', borderRadius: 6, background: '#090a10', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Earth horizon arc */}
          <circle cx="160" cy="240" r="160" fill="none" stroke="rgba(0,240,255,0.25)" strokeWidth="1.5" />
          <circle cx="160" cy="240" r="180" fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 6" />
          {/* Orbital path */}
          <path d="M 20 80 Q 160 10 300 80" fill="none" stroke="#00f0ff" strokeWidth="1.5" />
          {/* Satellites */}
          <circle cx="90" cy="46" r="4" fill="#00f0ff">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x="76" y="36" fill="#00f0ff" fontSize="8" fontFamily="ui-monospace, monospace">SAT-01 [ACTIVE]</text>
          
          <circle cx="180" cy="30" r="5" fill="#fde68a" />
          <line x1="180" y1="30" x2="220" y2="48" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 3" />
          <circle cx="220" cy="48" r="3" fill="#f43f5e" />
          <text x="188" y="24" fill="#fde68a" fontSize="8" fontFamily="ui-monospace, monospace">SAT-02 [CORE]</text>
          <text x="226" y="52" fill="#f43f5e" fontSize="7" fontFamily="ui-monospace, monospace">DEBRIS #904 [EVADED]</text>
          
          {/* Telemetry Grid */}
          <line x1="30" y1="130" x2="290" y2="130" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
          <text x="30" y="142" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="ui-monospace, monospace">PROPAGATION: RK4</text>
          <text x="150" y="142" fill="#38bdf8" fontSize="7" fontFamily="ui-monospace, monospace">ORBIT PERIOD: 94.8 MIN</text>
          <text x="260" y="142" fill="#4ade80" fontSize="7" fontFamily="ui-monospace, monospace">STATUS: NOMINAL</text>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'rgba(255,255,255,0.7)' }}>
          <span><b>10K+</b> Simulated Orbits</span>
          <span><b>&lt;16ms</b> Frame Budget</span>
          <span><b>99.4%</b> Collision Safety</span>
        </div>
      </div>
    </div>
  )
}

/* 2. PASSIVEAGENT: Telegram Threat Intelligence & Graph Radar */
export function PassiveAgentMock() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock-title">
        <span className="l">TELEGRAM OSINT & THREAT GRAPH</span>
        <span className="r">MTPROTO STREAM // ACTIVE</span>
      </div>
      <div className="mock-body" style={{ minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <svg viewBox="0 0 320 150" style={{ width: '100%', borderRadius: 6, background: '#0a0d14', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Threat Nodes */}
          <line x1="50" y1="70" x2="130" y2="40" stroke="rgba(244,63,94,0.4)" strokeWidth="1.2" />
          <line x1="50" y1="70" x2="130" y2="105" stroke="rgba(244,63,94,0.4)" strokeWidth="1.2" />
          <line x1="130" y1="40" x2="230" y2="60" stroke="rgba(56,189,248,0.5)" strokeWidth="1.2" />
          <line x1="130" y1="105" x2="230" y2="60" stroke="rgba(56,189,248,0.5)" strokeWidth="1.2" />
          <line x1="230" y1="60" x2="290" y2="75" stroke="#4ade80" strokeWidth="1.5" />
          
          <circle cx="50" cy="70" r="14" fill="#1e1320" stroke="#f43f5e" strokeWidth="1.5" />
          <text x="50" y="73" fill="#f43f5e" fontSize="7" textAnchor="middle" fontFamily="ui-monospace, monospace">TG CHANNEL</text>
          
          <circle cx="130" cy="40" r="12" fill="#101826" stroke="#38bdf8" strokeWidth="1.2" />
          <text x="130" y="43" fill="#38bdf8" fontSize="6.5" textAnchor="middle" fontFamily="ui-monospace, monospace">PGVECTOR</text>
          
          <circle cx="130" cy="105" r="12" fill="#101826" stroke="#38bdf8" strokeWidth="1.2" />
          <text x="130" y="108" fill="#38bdf8" fontSize="6.5" textAnchor="middle" fontFamily="ui-monospace, monospace">NEO4J</text>
          
          <circle cx="230" cy="60" r="15" fill="#1c1917" stroke="#fde68a" strokeWidth="1.5" />
          <text x="230" y="63" fill="#fde68a" fontSize="7" textAnchor="middle" fontFamily="ui-monospace, monospace">LLaMA-3.3</text>
          
          <circle cx="290" cy="75" r="10" fill="#064e3b" stroke="#4ade80" strokeWidth="1.2" />
          <text x="290" y="78" fill="#4ade80" fontSize="7" textAnchor="middle" fontFamily="ui-monospace, monospace">MITIGATED</text>
          
          <text x="20" y="22" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="ui-monospace, monospace">SIMILARITY CLUSTER: 0.94</text>
          <text x="200" y="138" fill="#f43f5e" fontSize="7" fontFamily="ui-monospace, monospace">SCAM SIGNATURE MATCHED</text>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'rgba(255,255,255,0.7)' }}>
          <span><b>50K+</b> Ingested Chats</span>
          <span><b>98.7%</b> Threat Detection</span>
          <span><b>Realtime</b> Graph Ingestion</span>
        </div>
      </div>
    </div>
  )
}

/* 3. EXAMGUARD: Kiosk Fullscreen & Sandbox Watchdog */
export function ExamGuardMock() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock-title">
        <span className="l">DESKTOP KIOSK DEFENSE</span>
        <span className="r">STATE: ENFORCED</span>
      </div>
      <div className="mock-body" style={{ minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <svg viewBox="0 0 320 150" style={{ width: '100%', borderRadius: 6, background: '#0b0c10', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Frame window */}
          <rect x="15" y="15" width="290" height="120" rx="4" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <rect x="15" y="15" width="290" height="22" fill="rgba(255,255,255,0.04)" />
          <circle cx="30" cy="26" r="3.5" fill="#f43f5e" />
          <circle cx="42" cy="26" r="3.5" fill="#fde68a" />
          <circle cx="54" cy="26" r="3.5" fill="#4ade80" />
          <text x="70" y="29" fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="ui-monospace, monospace">EXAMGUARD // KIOSK MODE ACTIVE</text>
          
          {/* Security status chips */}
          <rect x="30" y="50" width="125" height="24" rx="3" fill="#131c18" stroke="#4ade80" strokeWidth="0.8" />
          <text x="38" y="65" fill="#4ade80" fontSize="7.5" fontFamily="ui-monospace, monospace">HOOK: WIN32 LOCKED</text>
          
          <rect x="165" y="50" width="125" height="24" rx="3" fill="#131c18" stroke="#4ade80" strokeWidth="0.8" />
          <text x="173" y="65" fill="#4ade80" fontSize="7.5" fontFamily="ui-monospace, monospace">CLIPBOARD: SHIELDED</text>
          
          <rect x="30" y="85" width="125" height="24" rx="3" fill="#131c18" stroke="#4ade80" strokeWidth="0.8" />
          <text x="38" y="100" fill="#4ade80" fontSize="7.5" fontFamily="ui-monospace, monospace">VM DETECTION: CLEAN</text>
          
          <rect x="165" y="85" width="125" height="24" rx="3" fill="#1c1917" stroke="#fde68a" strokeWidth="0.8" />
          <text x="173" y="100" fill="#fde68a" fontSize="7.5" fontFamily="ui-monospace, monospace">CRYPTO: PBKDF2-SHA256</text>
          
          <text x="30" y="126" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="ui-monospace, monospace">WATCHDOG LATENCY: 0.8MS // ZERO CLOUD LEAK</text>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'rgba(255,255,255,0.7)' }}>
          <span><b>0</b> Bypass Tolerance</span>
          <span><b>100%</b> Offline Capable</span>
          <span><b>256-bit</b> Encryption</span>
        </div>
      </div>
    </div>
  )
}

/* 4. MEDVISION: Offline Edge Computer Vision & MMS-TTS Voice Assist */
export function MedVisionMock() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock-title">
        <span className="l">EDGE ASSISTIVE VISION</span>
        <span className="r">OFFLINE MMS-TTS VOICE</span>
      </div>
      <div className="mock-body" style={{ minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <svg viewBox="0 0 320 150" style={{ width: '100%', borderRadius: 6, background: '#0a0d12', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Depth / vision horizon */}
          <line x1="0" y1="100" x2="320" y2="100" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
          
          {/* Obstacle box: Curb */}
          <rect x="40" y="70" width="80" height="40" rx="3" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="40" y="58" width="80" height="12" fill="#38bdf8" />
          <text x="44" y="67" fill="#000" fontSize="7" fontFamily="ui-monospace, monospace" fontWeight="bold">CURB • 1.2M DIST</text>
          
          {/* Obstacle box: Traffic light */}
          <rect x="200" y="25" width="75" height="55" rx="3" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <rect x="200" y="13" width="75" height="12" fill="#4ade80" />
          <text x="204" y="22" fill="#000" fontSize="7" fontFamily="ui-monospace, monospace" fontWeight="bold">GREEN LIGHT • 8M</text>
          
          {/* Audio voice wave */}
          <path d="M 40 130 Q 70 120 100 130 T 160 130 T 220 130 T 280 130" fill="none" stroke="#fde68a" strokeWidth="1.5" />
          <text x="40" y="142" fill="#fde68a" fontSize="7" fontFamily="ui-monospace, monospace">TTS CUE: "YO'L OCHIQ, TO'SIQ YO'Q" (0.2s)</text>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'rgba(255,255,255,0.7)' }}>
          <span><b>30 FPS</b> Edge Inference</span>
          <span><b>100%</b> Offline Privacy</span>
          <span><b>0.2s</b> Voice Trigger</span>
        </div>
      </div>
    </div>
  )
}

/* 5. FIREDETECT: Autonomous Drone Edge GPU & Fire Recon */
export function FireDetectMock() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock-title">
        <span className="l">DRONE FIRE RECONNAISSANCE</span>
        <span className="r">ALT: 42M • JETSON NANO</span>
      </div>
      <div className="mock-body" style={{ minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <svg viewBox="0 0 320 150" style={{ width: '100%', borderRadius: 6, background: '#0e0b0b', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Crosshair HUD */}
          <circle cx="160" cy="75" r="45" fill="none" stroke="rgba(244,63,94,0.3)" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="160" y1="20" x2="160" y2="40" stroke="#f43f5e" strokeWidth="1.5" />
          <line x1="160" y1="110" x2="160" y2="130" stroke="#f43f5e" strokeWidth="1.5" />
          <line x1="100" y1="75" x2="120" y2="75" stroke="#f43f5e" strokeWidth="1.5" />
          <line x1="200" y1="75" x2="220" y2="75" stroke="#f43f5e" strokeWidth="1.5" />
          
          {/* Target flame bounding box */}
          <rect x="135" y="55" width="50" height="40" rx="3" fill="none" stroke="#f43f5e" strokeWidth="1.8" />
          <text x="135" y="50" fill="#f43f5e" fontSize="7.5" fontFamily="ui-monospace, monospace">FLAME: 98.4%</text>
          
          {/* ESP32 payload status */}
          <rect x="20" y="115" width="130" height="22" rx="3" fill="#1f1113" stroke="#f43f5e" strokeWidth="0.8" />
          <text x="26" y="129" fill="#f43f5e" fontSize="7" fontFamily="ui-monospace, monospace">ESP32 UART: PAYLOAD READY</text>
          
          <text x="180" y="129" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="ui-monospace, monospace">LATENCY: 45MS (EDGE GPU)</text>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'rgba(255,255,255,0.7)' }}>
          <span><b>45ms</b> Inference Latency</span>
          <span><b>98.2%</b> Fire Recall</span>
          <span><b>40m</b> Operational Altitude</span>
        </div>
      </div>
    </div>
  )
}

/* 6. SMARTWATER: Hydraulic Network ML Leak Anomaly Detection */
export function SmartWaterMock() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock-title">
        <span className="l">HYDRAULIC TELEMETRY RADAR</span>
        <span className="r">KUVASOY GRID // SECTOR-4</span>
      </div>
      <div className="mock-body" style={{ minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <svg viewBox="0 0 320 150" style={{ width: '100%', borderRadius: 6, background: '#080d14', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Pipe grid */}
          <line x1="30" y1="50" x2="140" y2="50" stroke="#00f0ff" strokeWidth="3" />
          <line x1="140" y1="50" x2="220" y2="90" stroke="#f43f5e" strokeWidth="3" strokeDasharray="3 2" />
          <line x1="140" y1="50" x2="140" y2="120" stroke="#00f0ff" strokeWidth="3" />
          <line x1="220" y1="90" x2="290" y2="90" stroke="rgba(244,63,94,0.5)" strokeWidth="2" />
          
          {/* Sensor Nodes */}
          <circle cx="30" cy="50" r="6" fill="#00f0ff" />
          <circle cx="140" cy="50" r="6" fill="#00f0ff" />
          <circle cx="140" cy="120" r="6" fill="#00f0ff" />
          <circle cx="220" cy="90" r="8" fill="#f43f5e">
            <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
          </circle>
          
          <text x="235" y="85" fill="#f43f5e" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="bold">
            LEAK DETECTED (93.5% SCORE)
          </text>
          <text x="235" y="97" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="ui-monospace, monospace">
            PRESSURE DROP: -2.4 BAR
          </text>
          
          <text x="30" y="32" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="ui-monospace, monospace">
            MODEL: ISOLATION FOREST • 24/7 STREAM
          </text>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'rgba(255,255,255,0.7)' }}>
          <span><b>93.5%</b> Anomaly Score</span>
          <span><b>2 min</b> Fracture Alert</span>
          <span><b>GIS</b> Hydro-Spatial Grid</span>
        </div>
      </div>
    </div>
  )
}

/* 7. ESHITAMAN: Audio Speech Spectrogram & LLM Summarizer */
export function EshitamanMock() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock-title">
        <span className="l">NEURAL AUDIO PIPELINE</span>
        <span className="r">UZBEK ASR & CODE-SWITCH</span>
      </div>
      <div className="mock-body" style={{ minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <svg viewBox="0 0 320 150" style={{ width: '100%', borderRadius: 6, background: '#0c0d12', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Audio spectrogram bars */}
          {Array.from({ length: 28 }).map((_, i) => {
            const h = 15 + Math.sin(i * 0.45) * 12 + ((i * 17) % 25)
            return (
              <rect
                key={i}
                x={20 + i * 10}
                y={65 - h / 2}
                width="6"
                height={h}
                rx="2"
                fill={i % 3 === 0 ? '#38bdf8' : '#818cf8'}
              />
            )
          })}
          
          <text x="20" y="105" fill="#fde68a" fontSize="8" fontFamily="ui-monospace, monospace">
            TRANSCRIPT: "Hozirgi sun'iy intellekt modeli juda tez ishlamoqda..."
          </text>
          <text x="20" y="122" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="ui-monospace, monospace">
            CONFIDENCE: 95.1% • ZERO-LATENCY WEBSOCKET STREAM
          </text>
          <text x="20" y="136" fill="#4ade80" fontSize="7" fontFamily="ui-monospace, monospace">
            SUMMARY GENERATION: COMPLETE (LLaMA-3)
          </text>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'rgba(255,255,255,0.7)' }}>
          <span><b>95.1%</b> Word Accuracy</span>
          <span><b>2x</b> Pipeline Speedup</span>
          <span><b>Uz/Ru</b> Code-Switching</span>
        </div>
      </div>
    </div>
  )
}

/* 8. SMART TRAFFIC & WIUT CV TRACK: Trajectory & Crash Anticipation */
export function SmartTrafficMock() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock-title">
        <span className="l">CV ACCIDENT ANTICIPATION</span>
        <span className="r">YOLO11X + BYTETRACK</span>
      </div>
      <div className="mock-body" style={{ minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <svg viewBox="0 0 320 150" style={{ width: '100%', borderRadius: 6, background: '#0a0d10', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Road intersection */}
          <line x1="20" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.15)" strokeDasharray="6 6" />
          <line x1="160" y1="15" x2="160" y2="135" stroke="rgba(255,255,255,0.15)" strokeDasharray="6 6" />
          
          {/* Vehicle 1 */}
          <rect x="70" y="60" width="35" height="20" rx="3" fill="#13202e" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="73" y="55" fill="#38bdf8" fontSize="7" fontFamily="ui-monospace, monospace">CAR #12 (42 KM/H)</text>
          <line x1="105" y1="70" x2="140" y2="70" stroke="#38bdf8" strokeWidth="1.5" />
          
          {/* Vehicle 2 heading into intersection */}
          <rect x="145" y="25" width="20" height="30" rx="3" fill="#2d1316" stroke="#f43f5e" strokeWidth="1.5" />
          <text x="170" y="38" fill="#f43f5e" fontSize="7" fontFamily="ui-monospace, monospace">TRUCK #08 (58 KM/H)</text>
          <line x1="155" y1="55" x2="155" y2="85" stroke="#f43f5e" strokeWidth="1.5" />
          
          {/* Intersection Collision Warning */}
          <circle cx="155" cy="70" r="14" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3">
            <animate attributeName="r" values="8;16;8" dur="1s" repeatCount="indefinite" />
          </circle>
          <text x="180" y="74" fill="#f43f5e" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="bold">
            TTC: 1.4s (PRE-WARNING)
          </text>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'rgba(255,255,255,0.7)' }}>
          <span><b>YOLO11x</b> Architecture</span>
          <span><b>96.4%</b> Track Retention</span>
          <span><b>1.4s</b> Collision Pre-warn</span>
        </div>
      </div>
    </div>
  )
}

/* 9. UNIVERSAL CYBERNETIC MOCK (for any repository) */
export function CyberProjectMock({ project }: { project?: Project }) {
  const title = project?.title ?? 'ACTIVE REPOSITORY'
  const tags = project?.tags ?? ['SYSTEMS', 'ALGORITHMS', 'INNOVATION']
  
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock-title">
        <span className="l">{title} // SYSTEM RUNTIME</span>
        <span className="r">STATUS: VERIFIED</span>
      </div>
      <div className="mock-body" style={{ minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <svg viewBox="0 0 320 150" style={{ width: '100%', borderRadius: 6, background: '#090a10', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Top telemetry grid */}
          <rect x="15" y="15" width="290" height="30" rx="3" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" />
          <text x="25" y="34" fill="#00f0ff" fontSize="8" fontFamily="ui-monospace, monospace">
            SRC: GITHUB.COM/MAGUS24
          </text>
          <text x="210" y="34" fill="#4ade80" fontSize="8" fontFamily="ui-monospace, monospace">
            BUILD: PASSING
          </text>
          
          {/* Neural state pipeline */}
          <circle cx="50" cy="85" r="16" fill="#131c26" stroke="#38bdf8" strokeWidth="1.2" />
          <text x="50" y="88" fill="#38bdf8" fontSize="7" textAnchor="middle" fontFamily="ui-monospace, monospace">INGEST</text>
          
          <line x1="66" y1="85" x2="135" y2="85" stroke="#38bdf8" strokeWidth="1.5" />
          
          <circle cx="150" cy="85" r="16" fill="#1e1320" stroke="#f43f5e" strokeWidth="1.2" />
          <text x="150" y="88" fill="#f43f5e" fontSize="7" textAnchor="middle" fontFamily="ui-monospace, monospace">COMPUTE</text>
          
          <line x1="166" y1="85" x2="235" y2="85" stroke="#f43f5e" strokeWidth="1.5" />
          
          <circle cx="250" cy="85" r="16" fill="#132418" stroke="#4ade80" strokeWidth="1.2" />
          <text x="250" y="88" fill="#4ade80" fontSize="7" textAnchor="middle" fontFamily="ui-monospace, monospace">EXECUTE</text>
          
          {/* Tags preview */}
          <text x="25" y="132" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="ui-monospace, monospace">
            PIPELINE TAGS: {tags.slice(0, 3).join(' • ')}
          </text>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'rgba(255,255,255,0.7)' }}>
          <span><b>Open Source</b> Public Repo</span>
          <span><b>Verified</b> Architecture</span>
          <span><b>Production</b> Grade</span>
        </div>
      </div>
    </div>
  )
}

/* Master Visual Resolver */
export function ProjectVisualRenderer({ visual, project }: { visual: VisualKey; project?: Project }) {
  switch (visual) {
    case 'yotoqhonam':
      return <YotoqhonamMock />
    case 'antifake':
      return <AntifakeMock />
    case 'shieldx':
      return <ShieldxMock />
    case 'sputnik':
      return <SputnikMock />
    case 'passiveagent':
      return <PassiveAgentMock />
    case 'examguard':
      return <ExamGuardMock />
    case 'medvision':
      return <MedVisionMock />
    case 'firedetect':
      return <FireDetectMock />
    case 'smartwater':
      return <SmartWaterMock />
    case 'eshitaman':
      return <EshitamanMock />
    case 'smarttraffic':
    case 'wiutcv':
      return <SmartTrafficMock />
    default:
      return <CyberProjectMock project={project} />
  }
}
