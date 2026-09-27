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
export type EventReadiness = "active" | "flagged" | "prototype" | "planned";

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
  resolution: string; // "1920×1080"
  lighting: string;
  file?: string; // path of the video in /public (empty → placeholder)
  annotatedVideo?: string; // path of the rendered annotated video in /public
}

export interface SampleVideo extends VideoMeta {
  events: EventSeg[];
  risk: RiskPoint[];
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
