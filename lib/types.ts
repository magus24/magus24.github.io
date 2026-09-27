// ─── Shared types for the WIUT 2026 CV Track website ────────────────────────

/** The 14 official event classes from the hackathon task. */
export const EVENT_CLASSES = [
  "accident",
  "near_miss",
  "red_light",
  "wrong_way",
  "illegal_u_turn",
  "stopped_vehicle",
  "jaywalking",
  "failure_to_yield",
  "illegal_turn",
  "solid_line_crossing",
  "stop_line",
  "congestion",
  "road_obstacle",
  "fire_smoke",
] as const;

export type EventLabel = (typeof EVENT_CLASSES)[number];
export type EventReadiness = "active" | "blocked" | "planned";

export interface EventReport {
  label: EventLabel;
  readiness: EventReadiness;
  short: string;
  summary: string;
  detector: string;
  evidence: string;
  blocker: string;
  source: string;
  steps: string[];
  completedSteps: number;
  blockerStep: number;
}

export interface EventSeg {
  start: number; // seconds
  end: number; // seconds
  label: EventLabel;
}

export type RiskPoint = [number, number]; // [t_sec, score]

export interface VideoMeta {
  id: string;
  title: string;
  duration: number; // seconds
  fps: number;
  resolution: string; // "3840×2160"
  lighting: string;
  file?: string; // path of the video in /public (empty → placeholder)
  annotatedVideo?: string; // path of the rendered annotated video in /public
  poster?: string; // poster frame, shown before the video is played
}

/** What one clip contributed in the measured run, straight from its log entry. */
export interface VideoRun {
  events: number;
  classes: number;
  riskPoints: number;
  riskMax: number;
  riskMean: number;
  framesAlarmed: number;
  partASec: number;
  budgetSec: number;
  /** Part A wall time as a percentage of the 3× budget. */
  budgetUsed: number;
}

export interface SampleVideo extends VideoMeta {
  events: EventSeg[];
  risk: RiskPoint[];
  run: VideoRun;
  /** Mean luma of the sampled frames, 0-255. */
  luma: number;
  /** Mean Laplacian variance: a proxy for how sharp the footage is. */
  sharpness: number;
  /** Size of the 720p annotated render in MB. */
  annotatedMB: number;
  /** null when the clip decodes cleanly end to end. */
  decodeNote: string | null;
}

/** One clip's line in the cross-clip comparison: the same numbers as VideoRun, plus identity. */
export interface RunSummary {
  id: string;
  title: string;
  duration: number;
  events: number;
  classes: number;
  riskPoints: number;
  riskMax: number;
  riskMean: number;
  framesAlarmed: number;
  partASec: number;
  budgetSec: number;
  budgetUsed: number;
  /** path of the 720p annotated render in /public */
  render: string;
  /** poster frame in /public */
  poster: string;
}

/** One row of the per-class matrix: segment counts and coverage per clip. */
export interface ClassMatrixRow {
  label: EventLabel;
  /** Segment count per clip, in CLIP_ORDER. */
  segments: number[];
  /** Share of that clip's duration, in percent. */
  coverage: number[];
  totalSegments: number;
  totalSeconds: number;
}

/** Mean Part B risk over one window of a clip; t is a fraction of the clip. */
export interface RiskProfilePoint {
  t: number;
  v: number;
}

export interface RiskProfile {
  title: string;
  points: RiskProfilePoint[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  contribution: string[];
  github: string;
  linkedin: string;
  portfolio: string;
  /** initials shown in the avatar placeholder, e.g. "AS" */
  initials: string;
}

export interface FailureCase {
  id: string;
  expected: string;
  predicted: string;
  reason: string;
}

export interface ModelCard {
  name: string;
  purpose: string;
  input: string;
  output: string;
  learned: boolean;
}

export interface DatasetCard {
  name: string;
  usedFor: string;
  stage: string;
  licence: string;
}

export interface DesignDecision {
  finding: string;
  decision: string;
}

/** Shape returned by the demo backend (`POST {API_BASE}/api/analyze`). */
export interface DemoResult {
  video_id: string;
  filename: string;
  duration: number;
  fps: number;
  width: number;
  height: number;
  events: EventSeg[];
  risk: RiskPoint[];
  annotated_video_url?: string | null;
}
