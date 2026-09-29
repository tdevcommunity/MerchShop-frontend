import type { AnalyticsEventName, AnalyticsPayload } from "./events";

type AnalyticsSink = (
  event: AnalyticsEventName,
  payload: AnalyticsPayload,
) => void;

let sink: AnalyticsSink = () => {
  // Provider (GA, Plausible, etc.) à brancher ici sans toucher aux composants.
};

export function setAnalyticsSink(next: AnalyticsSink): void {
  sink = next;
}

export function track(
  event: AnalyticsEventName,
  payload: AnalyticsPayload = {},
): void {
  sink(event, payload);
}
