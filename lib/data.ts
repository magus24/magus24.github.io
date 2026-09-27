import type {
  DatasetCard,
  DesignDecision,
  EventReport,
  EventSeg,
  FailureCase,
  ModelCard,
  RiskPoint,
  SampleVideo,
  TeamMember,
} from "./types";

/* ────────────────────────────────────────────────────────────────────────────
 * MEASURED DATA — do not hand-edit the numbers below.
 *
 * Regenerate with `python tools/gen_site_data.py` from the repository root.
 * Provenance, per block:
 *   SPECS            cv2 probe of the four organizer clips
 *   events / risk    Project/Project/predictions_samples.json (C3905, 14 events,
 *                    3825 risk points) — the organizers' own harness, our code
 *   event activity   the same predictions, bucketed into 8 windows
 *   risk profile     the same risk curve, mean per bucket
 *   lanes            Project/Project/scene_config.json (self-calibrated geometry)
 *
 * TODO(team): TEAM below is the only hand-written block left. Names, roles and
 * links come from the team and cannot be measured.
 */

// ── Team ─────────────────────────────────────────────────────────────────────
// TODO(team): replace with the real roster before deploying.
export const TEAM: TeamMember[] = [
  {
    id: "member-1",
    name: "TODO: Firstname Lastname",
    role: "TODO: Computer Vision Engineer",
    contribution: [
      "TODO: Detection, tracking and the 14 event rules",
      "TODO: Scene calibration (scene_config.json)",
      "TODO: The 3x time-budget guard",
    ],
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    portfolio: "https://",
    initials: "FL",
  },
  {
    id: "member-2",
    name: "TODO: Firstname Lastname",
    role: "TODO: Risk / ML Engineer",
    contribution: [
      "TODO: RiskEstimator (Part B) and its tuning",
      "TODO: Metric reverse-engineering from evaluate.py",
      "TODO: Labels and evaluation harness",
    ],
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    portfolio: "https://",
    initials: "FL",
  },
  {
    id: "member-3",
    name: "TODO: Firstname Lastname",
    role: "TODO: Full-stack / Infra Engineer",
    contribution: [
      "TODO: Live-demo backend and this site",
      "TODO: Offline install path (Docker, pinned deps)",
      "TODO: Report and deck",
    ],
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    portfolio: "https://",
    initials: "FL",
  },
];

// ── Sample videos (the organizer's four 4K clips) ────────────────────────────
// The clips are 2.2-6.0 GB each and are NOT redistributed here; `file` is
// empty on purpose. Events and the risk curve exist only for C3905, the clip we
// ran end to end through the organizers' harness (the others are a 40-minute
// GPU run each and are still pending — see Report > what didn't work).
const NO_EVENTS: EventSeg[] = [];
const NO_RISK: RiskPoint[] = [];

export const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    id: "c3896",
    title: "C3896.MP4",
    duration: 340.34,
    fps: 29.97,
    resolution: "3840×2160",
    lighting: "Overcast (mean luma 95)",
    file: "",
    annotatedVideo: "",
    events: NO_EVENTS,
    risk: NO_RISK,
  },
  {
    id: "c3897",
    title: "C3897.MP4",
    duration: 317.82,
    fps: 29.97,
    resolution: "3840×2160",
    lighting: "Overcast (mean luma 95)",
    file: "",
    annotatedVideo: "",
    events: NO_EVENTS,
    risk: NO_RISK,
  },
  {
    id: "c3902",
    title: "C3902.MP4",
    duration: 317.82,
    fps: 29.97,
    resolution: "3840×2160",
    lighting: "Dusk (mean luma 70)",
    file: "",
    annotatedVideo: "",
    events: NO_EVENTS,
    risk: NO_RISK,
  },
  {
    id: "c3905",
    title: "C3905.MP4",
    duration: 127.63,
    fps: 29.97,
    resolution: "3840×2160",
    lighting: "Night (mean luma 48)",
    file: "",
    annotatedVideo: "",
    events: [
    { start: 0.00, end: 5.91, label: "congestion" },
    { start: 0.00, end: 51.35, label: "failure_to_yield" },
    { start: 0.00, end: 127.53, label: "jaywalking" },
    { start: 0.10, end: 127.53, label: "wrong_way" },
    { start: 0.20, end: 9.21, label: "near_miss" },
    { start: 11.31, end: 110.41, label: "near_miss" },
    { start: 35.74, end: 35.94, label: "solid_line_crossing" },
    { start: 48.05, end: 49.15, label: "accident" },
    { start: 52.65, end: 54.76, label: "accident" },
    { start: 53.75, end: 127.53, label: "failure_to_yield" },
    { start: 61.56, end: 63.76, label: "accident" },
    { start: 64.36, end: 64.56, label: "solid_line_crossing" },
    { start: 95.00, end: 95.19, label: "solid_line_crossing" },
    { start: 111.61, end: 126.63, label: "near_miss" },
    ],
    risk: [
  [0.0, 0.4749],
  [1.03, 0.3989],
  [2.07, 0.4559],
  [3.1, 0.4417],
  [4.14, 0.2501],
  [5.17, 0.3789],
  [6.21, 0.1963],
  [7.24, 0.5186],
  [8.27, 0.5186],
  [9.31, 0.3067],
  [10.34, 0.1588],
  [11.38, 0.2108],
  [12.41, 0.5736],
  [13.45, 0.4443],
  [14.48, 0.4443],
  [15.52, 0.2299],
  [16.55, 0.5749],
  [17.58, 0.5305],
  [18.62, 0.5807],
  [19.65, 0.3197],
  [20.69, 0.4599],
  [21.72, 0.3666],
  [22.76, 0.6244],
  [23.79, 0.487],
  [24.82, 0.4809],
  [25.86, 0.501],
  [26.89, 0.5088],
  [27.93, 0.5943],
  [28.96, 0.6106],
  [30.0, 0.4056],
  [31.03, 0.254],
  [32.07, 0.4083],
  [33.1, 0.3819],
  [34.13, 0.3747],
  [35.17, 0.4009],
  [36.2, 0.4538],
  [37.24, 0.4918],
  [38.27, 0.3784],
  [39.31, 0.6405],
  [40.34, 0.4097],
  [41.37, 0.4154],
  [42.41, 0.5099],
  [43.44, 0.5209],
  [44.48, 0.5209],
  [45.51, 0.3561],
  [46.55, 0.4775],
  [47.58, 0.384],
  [48.62, 0.5908],
  [49.65, 0.5852],
  [50.68, 0.4529],
  [51.72, 0.5223],
  [52.75, 0.5697],
  [53.79, 0.5608],
  [54.82, 0.4902],
  [55.86, 0.4972],
  [56.89, 0.5279],
  [57.92, 0.5474],
  [58.96, 0.5299],
  [59.99, 0.5232],
  [61.03, 0.4908],
  [62.06, 0.2814],
  [63.1, 0.5209],
  [64.13, 0.5186],
  [65.17, 0.5812],
  [66.2, 0.473],
  [67.23, 0.449],
  [68.27, 0.4356],
  [69.3, 0.4311],
  [70.34, 0.5314],
  [71.37, 0.6693],
  [72.41, 0.6575],
  [73.44, 0.454],
  [74.47, 0.1628],
  [75.51, 0.3298],
  [76.54, 0.4585],
  [77.58, 0.5923],
  [78.61, 0.5942],
  [79.65, 0.4562],
  [80.68, 0.5842],
  [81.72, 0.5546],
  [82.75, 0.4013],
  [83.78, 0.5813],
  [84.82, 0.1939],
  [85.85, 0.2679],
  [86.89, 0.2639],
  [87.92, 0.1578],
  [88.96, 0.1504],
  [89.99, 0.15],
  [91.02, 0.15],
  [92.06, 0.1911],
  [93.09, 0.2623],
  [94.13, 0.3646],
  [95.16, 0.5832],
  [96.2, 0.2331],
  [97.23, 0.2691],
  [98.26, 0.2225],
  [99.3, 0.1735],
  [100.33, 0.2145],
  [101.37, 0.4833],
  [102.4, 0.5905],
  [103.44, 0.3998],
  [104.47, 0.3204],
  [105.51, 0.163],
  [106.54, 0.291],
  [107.57, 0.449],
  [108.61, 0.402],
  [109.64, 0.3204],
  [110.68, 0.2634],
  [111.71, 0.2727],
  [112.75, 0.4093],
  [113.78, 0.5702],
  [114.81, 0.6239],
  [115.85, 0.6038],
  [116.88, 0.5258],
  [117.92, 0.651],
  [118.95, 0.4461],
  [119.99, 0.4841],
  [121.02, 0.2397],
  [122.06, 0.4361],
  [123.09, 0.3776],
  [124.12, 0.2073],
  [125.16, 0.3775],
  [126.19, 0.4392],
  [127.23, 0.2633],
  ],
  },
];

// ── EDA ──────────────────────────────────────────────────────────────────────
export const EDA_VIDEO_STATS = SAMPLE_VIDEOS.map((v) => ({
  video: v.title,
  resolution: v.resolution,
  fps: v.fps,
  duration: formatDuration(v.duration),
  lighting: v.lighting,
}));

/** Event segments per class over 8 equal windows of C3905 (real, not sampled). */
export const EDA_OBJECT_COUNTS: { label: string; values: number[] }[] = [
  { label: "near_miss", values: [1, 0, 0, 1, 0, 0, 0, 1] },
  { label: "solid_line_crossing", values: [0, 0, 1, 0, 1, 1, 0, 0] },
  { label: "accident", values: [0, 0, 0, 3, 0, 0, 0, 0] },
  { label: "failure_to_yield", values: [0, 1, 0, 0, 0, 1, 0, 0] },
  { label: "congestion", values: [1, 0, 0, 0, 0, 0, 0, 0] },
  { label: "jaywalking", values: [0, 0, 0, 1, 0, 0, 0, 0] },
  { label: "wrong_way", values: [0, 0, 0, 1, 0, 0, 0, 0] },
];

/** Mean Part B risk per 16 s window of C3905 — the real output shape. */
export const EDA_DENSITY: { t: number; v: number }[] = [
  { t: 0.0, v: 0.2862 },
  { t: 16.0, v: 0.3616 },
  { t: 31.9, v: 0.3648 },
  { t: 47.9, v: 0.4145 },
  { t: 63.8, v: 0.4168 },
  { t: 79.8, v: 0.2565 },
  { t: 95.7, v: 0.2577 },
  { t: 111.7, v: 0.3252 },
];

/** Lane directions from the calibrated scene_config.json. */
export const EDA_LANES: { lane: string; direction: string }[] = [
  { lane: "L0 (24.5°)", direction: "→" },
  { lane: "L3 (196.4°)", direction: "←" },
];

export const EDA_DECISIONS: DesignDecision[] = [
  {
    finding:
      "One fixed camera, so the road layout can be calibrated once and reused across every clip — including the hidden test set, which shares the geometry.",
    decision:
      "Ship one resolution-scaled scene_config.json instead of guessing geometry per video. All spatial queries take bottom-center points, full-res pixels.",
  },
  {
    finding:
      "Single-frame detections are noisy; the usable signal is a stable trajectory over a time window.",
    decision:
      "ByteTrack, then a temporal engine per class, then merge fragments and drop sub-second blips before scoring.",
  },
  {
    finding:
      "Measured: the pipeline costs 2.28x real time on our own GPU (0.114 s per detector observation, and Part B runs a second detector pass). The harness voids any video over 3x.",
    decision:
      "Make the sampling rate a pure function of frame count, fps and a DECLARED per-observation cost, and ship it enabled. Wall-clock feedback would break determinism, so the cost is a constant, not a measurement.",
  },
];

// ── Approach ─────────────────────────────────────────────────────────────────
export const MODELS: ModelCard[] = [
  {
    name: "YOLO11x",
    purpose: "Detect road users on sampled video frames",
    input: "Video frame (BGR uint8)",
    output: "Bounding boxes + class + confidence",
    learned: true,
  },
  {
    name: "ByteTrack",
    purpose: "Associate detections into stable track IDs",
    input: "Per-frame detections",
    output: "Track IDs + bottom-center trajectories",
    learned: true,
  },
  {
    name: "Causal RiskEstimator",
    purpose: "Anticipate an accident within 5 s, using past frames only",
    input: "Frames at ~10 Hz, past-only track and motion features",
    output: "P(accident within 5 s) in [0,1]",
    learned: false,
  },
];

export const DATASETS: DatasetCard[] = [
  {
    name: "Organizer sample clips (C3896, C3897, C3902, C3905)",
    usedFor: "Scene calibration, end-to-end verification, timing measurements",
    stage: "calibration / evaluation",
    licence: "Provided with the task; not redistributed by us",
  },
  {
    name: "No training data",
    usedFor: "Nothing — we trained no model. Every parameter is a hand-set threshold or an off-the-shelf pretrained checkpoint.",
    stage: "not used",
    licence: "N/A",
  },
  {
    name: "COCO (indirect)",
    usedFor: "Training data behind the pretrained Ultralytics checkpoint only",
    stage: "not used directly",
    licence: "CC BY 4.0 (annotations © Microsoft)",
  },
];

export const RULE_BASED: string[] = [
  "5 classes on the legacy path: wrong_way, stopped_vehicle, jaywalking, failure_to_yield, congestion",
  "7 classes on calibrated-geometry detectors: accident, near_miss, illegal_turn, illegal_u_turn, solid_line_crossing, stop_line, red_light",
  "One provider per label (DEFAULT_PROVIDERS), so no class can be reported twice",
  "Segment merging, a 0.5 s blip floor and same-class overlap removal",
];

export const LEARNED: string[] = [
  "Object detection: YOLO11x (COCO pretrained, AGPL-3.0)",
  "Multi-object tracking: ByteTrack",
  "Everything else is deterministic geometry and temporal logic",
];

export const EVENT_REPORTS: EventReport[] = [
  {
    label: "accident",
    readiness: "active",
    short: "Contact + aftermath",
    summary:
      "A confirmed collision needs a real contact frame plus independent post-impact evidence; a crossing path or one braking event is not enough.",
    detector:
      "Pairwise motion → contact distance → deceleration, heading change, post-impact stop and persistent co-location → temporal confirmation.",
    evidence:
      "Registered and emitting. On C3905 it produced 3 segments totalling 5.4 s of a 127.6 s clip, and it shares one PairwiseInteractionEngine with near_miss.",
    blocker:
      "Thresholds are untuned against labelled accidents — we have no accident clip, only normal traffic.",
    source: "src/events/accident.py · src/events/manager.py",
    steps: ["Motion", "Impact evidence", "Temporal engine", "EventManager", "Output"],
    completedSteps: 5,
  },
  {
    label: "near_miss",
    readiness: "active",
    short: "Danger without contact",
    summary:
      "A dangerous approach is confirmed when TTC, closing speed and predicted gap align while both current and predicted paths stay outside contact.",
    detector:
      "Pairwise interaction → TTC / closing speed / predicted minimum distance → non-collision gate → temporal confirmation.",
    evidence:
      "Registered. Measured on C3905: 3 segments covering 123.1 s of 127.6 s — that is a FALSE-POSITIVE SATURATION, the single worst result in this run.",
    blocker:
      "Needs per-pair thresholds that require actual approach, not the mere presence of a crossing pair.",
    source: "src/events/near_miss.py · src/events/manager.py",
    steps: ["Tracks", "TTC pair", "Collision gate", "Threshold gate", "Output"],
    completedSteps: 4,
  },
  {
    label: "red_light",
    readiness: "active",
    short: "Red signal crossing",
    summary:
      "A vehicle crosses a configured stop line and continues through while the covering signal is authoritatively RED.",
    detector:
      "Signal state → prior approach → bottom-center line intersection → post-crossing motion → temporal confirmation.",
    evidence:
      "Registered and provably silent: get_traffic_light_state() always returns UNKNOWN because we have no signal classifier, so the detector refuses rather than guessing a colour. Zero events by construction.",
    blocker:
      "Needs a calibrated signal-state classifier; the geometry (2 signal ROIs) is already calibrated.",
    source: "src/events/red_light.py · src/scene/geometry.py",
    steps: ["Signal state", "Approach", "Line crossing", "Post-motion", "Output"],
    completedSteps: 2,
  },
  {
    label: "wrong_way",
    readiness: "active",
    short: "Against the flow",
    summary:
      "A vehicle is flagged when its sustained heading conflicts with the camera's dominant traffic flow.",
    detector:
      "Track heading and speed → angular deviation from the dominant flow → per-lane expected_direction in the calibrated version.",
    evidence:
      "Registered. Measured on C3905: 1 segment of 127.4 s — i.e. it fires on essentially the whole clip, so the flow gate is not discriminating on this camera.",
    blocker:
      "A per-lane expected_direction detector is implemented and calibrated but not yet the default; it needs the same threshold review.",
    source: "src/events/rules.py · src/events/wrong_way.py",
    steps: ["Tracks", "Heading", "Flow gate", "Manager", "Output"],
    completedSteps: 4,
  },
  {
    label: "illegal_u_turn",
    readiness: "flagged",
    short: "Prohibited reversal",
    summary:
      "A U-turn needs a sustained ~180° reversal, a coherent arc and an anchor inside a calibrated U-turn zone.",
    detector:
      "Trajectory window → angular reversal and arc quality → U-turn zone anchor → temporal confirmation.",
    evidence:
      "Implemented and registered behind the provider flag; it emitted nothing on C3905, which contains no reversal.",
    blocker:
      "No labelled U-turn clip exists, so the angular thresholds are unvalidated.",
    source: "src/events/illegal_u_turn.py · src/events/manager.py",
    steps: ["Trajectory", "Reversal", "Zone anchor", "Flag gate", "Output"],
    completedSteps: 4,
  },
  {
    label: "stopped_vehicle",
    readiness: "active",
    short: "Stationary on road",
    summary:
      "A vehicle stays below the motion threshold on the carriageway for at least 10 s before the segment is emitted.",
    detector:
      "Track speed → stationary_at timer → 10 s persistence gate → event post-processing.",
    evidence: "Registered and emitting; silent on C3905, where the traffic never stands still for 10 s.",
    blocker:
      "Does not yet exclude a signal queue, so a legitimate queue would read as a stopped vehicle.",
    source: "src/events/rules.py · src/events/stopped_vehicle.py",
    steps: ["Tracks", "Motion", "10 s hold", "Manager", "Output"],
    completedSteps: 5,
  },
  {
    label: "jaywalking",
    readiness: "active",
    short: "Outside the crossing",
    summary:
      "A pedestrian is on the road polygon and outside every calibrated crosswalk band.",
    detector:
      "Pedestrian tracks → road-polygon test → crosswalk exclusion → frame flags → temporal post-processing.",
    evidence:
      "Registered. Measured on C3905: 1 segment of 127.5 s — full-clip saturation, so the road/crosswalk polygons are effectively not separating anything yet.",
    blocker:
      "The polygons need a visual pass against real frames; they were calibrated by hand from thumbnails.",
    source: "src/events/rules.py · src/events/jaywalking.py",
    steps: ["Pedestrian", "Road polygon", "Crosswalk gate", "Manager", "Output"],
    completedSteps: 4,
  },
  {
    label: "failure_to_yield",
    readiness: "active",
    short: "Crosswalk conflict",
    summary:
      "A vehicle and a pedestrian occupy a calibrated crosswalk band at the same time.",
    detector:
      "Vehicle and pedestrian tracks → shared crosswalk band → co-presence flag → temporal post-processing.",
    evidence:
      "Registered. Measured on C3905: 2 segments covering 125.1 s of 127.6 s — again saturation, driven by pedestrians waiting at the kerb.",
    blocker:
      "Needs a 'vehicle is moving through' condition, not just co-presence in the band.",
    source: "src/events/rules.py · src/events/failure_to_yield.py",
    steps: ["Tracks", "Crosswalk", "Pair presence", "Manager", "Output"],
    completedSteps: 4,
  },
  {
    label: "illegal_turn",
    readiness: "flagged",
    short: "Wrong turn policy",
    summary:
      "The detector first proves that a turn occurred, then compares the originating lane and direction with the allowed-turn policy.",
    detector:
      "Trajectory turn recognition → lane origin and heading → allowed_turns lookup → temporal confirmation.",
    evidence:
      "Implemented; rejects with turn_rule_unknown because scene_config.json declares no turn policy. Correct behaviour, zero events.",
    blocker:
      "The allowed-turn policy for this fixed camera has to be defined and visually verified.",
    source: "src/events/illegal_turn.py · src/events/manager.py",
    steps: ["Trajectory", "Turn proof", "Policy", "Flag gate", "Output"],
    completedSteps: 3,
  },
  {
    label: "solid_line_crossing",
    readiness: "active",
    short: "Cross into a solid line",
    summary:
      "A vehicle crosses from one side of a configured solid segment to the other, with speed, quality and cooldown protections.",
    detector:
      "Bottom-center trajectory → finite-line intersection → side change and jitter protection → temporal event.",
    evidence:
      "Registered. Measured on C3905: 3 segments totalling 0.6 s — short and rare, which is what this class should look like.",
    blocker:
      "Endpoint policy needs review: a crossing at the very end of the segment is ambiguous.",
    source: "src/events/solid_line_crossing.py · src/events/manager.py",
    steps: ["Trajectory", "Line intersection", "Side change", "EventManager", "Output"],
    completedSteps: 5,
  },
  {
    label: "stop_line",
    readiness: "active",
    short: "Cross the line on red",
    summary:
      "The official class is a vehicle stopped before the line on red without entering the intersection; the module detects a crossing instead, which is a different event.",
    detector:
      "Current module: approach history → stop-line segment crossing → post-crossing motion. Deliberately signal-independent.",
    evidence:
      "Registered. On the C3905 render it emitted 15 segments totalling 23.7 s, which is consistent with a crossing detector on a busy junction, not with the official stop-on-red definition.",
    blocker:
      "Needs authoritative RED-state handling and a redesign around stopping BEFORE the line. This is a known semantic mismatch, not a tuning issue.",
    source: "src/events/stop_line.py",
    steps: ["Signal state", "Approach", "Stop evidence", "EventManager", "Output"],
    completedSteps: 2,
  },
  {
    label: "congestion",
    readiness: "active",
    short: "Slow across the flow",
    summary:
      "At least 3 vehicles are present, most of them slow or stopped, and it persists for the hold window.",
    detector:
      "Vehicle count → slow/stopped fraction → 6 s hold → event post-processing.",
    evidence:
      "Registered and the best-behaved class in the run: 1 segment of 5.9 s on C3905 — a plausible duration rather than a full clip.",
    blocker:
      "The legacy rule is direction-agnostic; the calibrated lane-cluster version is not wired.",
    source: "src/events/rules.py · src/events/congestion.py",
    steps: ["Vehicle set", "Slow ratio", "6 s hold", "Manager", "Output"],
    completedSteps: 5,
  },
  {
    label: "road_obstacle",
    readiness: "planned",
    short: "Object in the roadway",
    summary:
      "Debris, animals and fallen objects need their own object evidence to be separable from ordinary road users.",
    detector:
      "Logic is complete and tested, with an explicit label allow-list — but the list is EMPTY on purpose, because no COCO class means 'road obstacle'.",
    evidence:
      "Registered as a provider and provably emitting nothing: DEFAULT_OBSTACLE_LABELS = () and no engine is allocated. Mapping a standing car or a pedestrian here would be a class-confusion double penalty — those are stopped_vehicle and jaywalking, both already implemented.",
    blocker:
      "Needs a model that emits a real obstruction class. Widening the COCO filter to animals is possible but would change the input of every other detector.",
    source: "src/events/road_obstacle.py",
    steps: ["Object model", "Road test", "Persistence", "EventManager", "Output"],
    completedSteps: 2,
  },
  {
    label: "fire_smoke",
    readiness: "planned",
    short: "Fire or smoke",
    summary:
      "Visible fire or smoke is a pure appearance class and needs a dedicated pixel-level model.",
    detector:
      "Not implemented, and there is no path to it: EventManager.step() receives geometry and labels only, never a frame, so no event detector can see a pixel.",
    evidence:
      "A strict HSV survey of all 1275 frames of C3905 found no fire-like region at all (max 64 px, 0.012% of frame). Its one large 'smoke-like' region — 9.2% of frame, persisting 43.6 s — was a truck at confidence 0.97 covering 99.5% of the blob. A colour heuristic would have shipped that false positive.",
    blocker:
      "Would need a second, segmentation-capable perception path. Out of scope for the time we had.",
    source: "src/detection/detector.py",
    steps: ["Fire model", "Smoke model", "Road context", "EventManager", "Output"],
    completedSteps: 0,
  },
];

// ── Failure cases (all measured on the C3905 run) ────────────────────────────
export const FAILURE_CASES: FailureCase[] = [
  {
    id: "fc-1",
    expected: "No event — normal traffic at a junction",
    predicted: "jaywalking for 127.5 s (the whole clip)",
    reason:
      "Road and crosswalk polygons were calibrated by hand from thumbnails, so the road-polygon test does not actually exclude the pavement. One pedestrian waiting at the kerb is enough to hold the segment open once the 0.5 s blip floor and merge rules are applied.",
  },
  {
    id: "fc-2",
    expected: "No event — normal traffic",
    predicted: "wrong_way for 127.4 s and failure_to_yield for 125.1 s",
    reason:
      "Both are co-presence/heading proxies with no discriminative gate: the legacy flow angle is compared against a single global 195° estimate, and the crosswalk rule fires on any vehicle+pedestrian co-presence. Saturation, not misclassification.",
  },
  {
    id: "fc-3",
    expected: "At most a few isolated near-misses",
    predicted: "near_miss in 3 segments covering 123.1 s of 127.6 s",
    reason:
      "The pairwise engine runs over ~350 ordinary pairs per frame and the threshold is low enough that ordinary following at a junction looks like a closing approach. max-aggregation then keeps the largest of them.",
  },
  {
    id: "fc-4",
    expected: "Score_A to collapse on an unlabelled run",
    predicted: "7 of 14 classes fire on almost the entire clip",
    reason:
      "This is the metric's own trap: evaluate.py scores over GT ∪ predictions, and a class predicted but absent from GT scores F1=0 AND joins the macro mean. With no labels of our own we had no way to see the saturation before submitting.",
  },
];

// ── Links ────────────────────────────────────────────────────────────────────
// TODO(links): set the real repository URL once the repo is public.
export const LINKS = {
  repository: "https://github.com/magus24/wiut-cv-track",
  weights: "https://github.com/magus24/wiut-cv-track/tree/main/weights",
  predictions:
    "https://github.com/magus24/wiut-cv-track/blob/main/predictions_samples.json",
  // Per-member handles: still TODO together with TEAM below.
  teamGithub: "https://github.com/magus24",
  teamLinkedin: "https://www.linkedin.com/",
};

/** What the current run actually produced, straight from predictions_samples.json. */
export const RUN_FACTS = {
  video: "C3905.MP4",
  durationSec: 127.63,
  events: 14,
  classes: 7,
  riskPoints: 3825,
  riskMax: 0.669,
  riskMean: 0.3354,
  framesAlarmed: 411,
  alarmRuns: 36,
  wallTimeSec: 290.8,
  realtimeFactor: 2.28,
  budgetFactor: 3.0,
  perClass: {"jaywalking": {"segments": 1, "seconds": 127.5}, "wrong_way": {"segments": 1, "seconds": 127.4}, "failure_to_yield": {"segments": 2, "seconds": 125.1}, "near_miss": {"segments": 3, "seconds": 123.1}, "congestion": {"segments": 1, "seconds": 5.9}, "accident": {"segments": 3, "seconds": 5.4}, "solid_line_crossing": {"segments": 3, "seconds": 0.6}},
};

export const HACKATHON = {
  name: "WIUT Hackathon 2026 · CV Track",
};

// ── helpers ──────────────────────────────────────────────────────────────────
export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Label → readable display name (used for event chips/timelines). */
export const EVENT_LABEL_TEXT: Record<string, string> = {
  accident: "Accident",
  near_miss: "Near Miss",
  red_light: "Red Light",
  wrong_way: "Wrong Way",
  illegal_u_turn: "Illegal U-Turn",
  stopped_vehicle: "Stopped Vehicle",
  jaywalking: "Jaywalking",
  failure_to_yield: "Failure to Yield",
  illegal_turn: "Illegal Turn",
  solid_line_crossing: "Solid-Line Crossing",
  stop_line: "Stop-Line Violation",
  congestion: "Congestion",
  road_obstacle: "Road Obstacle",
  fire_smoke: "Fire / Smoke",
};
