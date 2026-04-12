import type { AiHealthAlert, AiHealthWindowSnapshot } from '@/types/marketplace-ai';

type ListingStatusSummary = {
  suspect: number;
  needsReview: number;
};

type AlertThresholds = {
  fallbackRateWarning: number;
  fallbackRateCritical: number;
  errorRateWarning: number;
  errorRateCritical: number;
  suspectWarning: number;
  suspectCritical: number;
  needsReviewWarning: number;
  needsReviewCritical: number;
};

export const defaultAiAlertThresholds: AlertThresholds = {
  fallbackRateWarning: 20,
  fallbackRateCritical: 35,
  errorRateWarning: 5,
  errorRateCritical: 12,
  suspectWarning: 5,
  suspectCritical: 10,
  needsReviewWarning: 12,
  needsReviewCritical: 20
};

export function buildAiHealthAlerts(params: {
  metrics: AiHealthWindowSnapshot;
  listings: ListingStatusSummary;
  thresholds?: Partial<AlertThresholds>;
}): AiHealthAlert[] {
  const thresholds = { ...defaultAiAlertThresholds, ...(params.thresholds ?? {}) };
  const alerts: AiHealthAlert[] = [];

  const pushRateAlert = (id: string, metric: string, value: number, warning: number, critical: number) => {
    if (value >= critical) {
      alerts.push({ id: `${id}-critical`, level: 'critical', metric, value, threshold: critical, message: `${metric} ${value}% >= ${critical}%` });
      return;
    }
    if (value >= warning) {
      alerts.push({ id: `${id}-warning`, level: 'warning', metric, value, threshold: warning, message: `${metric} ${value}% >= ${warning}%` });
    }
  };

  const pushCountAlert = (id: string, metric: string, value: number, warning: number, critical: number) => {
    if (value >= critical) {
      alerts.push({ id: `${id}-critical`, level: 'critical', metric, value, threshold: critical, message: `${metric}: ${value} >= ${critical}` });
      return;
    }
    if (value >= warning) {
      alerts.push({ id: `${id}-warning`, level: 'warning', metric, value, threshold: warning, message: `${metric}: ${value} >= ${warning}` });
    }
  };

  pushRateAlert('fallback-rate', 'Fallback rate', params.metrics.fallbackRate, thresholds.fallbackRateWarning, thresholds.fallbackRateCritical);
  pushRateAlert('error-rate', 'Error rate', params.metrics.errorRate, thresholds.errorRateWarning, thresholds.errorRateCritical);
  pushCountAlert('suspect-listings', 'Suspect listings', params.listings.suspect, thresholds.suspectWarning, thresholds.suspectCritical);
  pushCountAlert('needs-review-listings', 'Needs review listings', params.listings.needsReview, thresholds.needsReviewWarning, thresholds.needsReviewCritical);

  if (alerts.length === 0) {
    alerts.push({
      id: 'health-ok',
      level: 'info',
      metric: 'Platform health',
      value: 0,
      threshold: 0,
      message: 'No critical AI health alerts for the selected period.'
    });
  }

  const rank = { critical: 3, warning: 2, info: 1 };
  return alerts.sort((a, b) => rank[b.level] - rank[a.level]);
}
