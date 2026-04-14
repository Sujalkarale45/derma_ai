export interface HealthTip {
  icon: string;
  titleKey: string;
  bodyKey: string;
}

export const HEALTH_TIPS: HealthTip[] = [
  { icon: '☀️', titleKey: 'tips.sunscreen.title', bodyKey: 'tips.sunscreen.body' },
  { icon: '🔍', titleKey: 'tips.selfExam.title', bodyKey: 'tips.selfExam.body' },
  { icon: '💧', titleKey: 'tips.hydrate.title', bodyKey: 'tips.hydrate.body' },
  { icon: '🎩', titleKey: 'tips.cover.title', bodyKey: 'tips.cover.body' },
  { icon: '🍎', titleKey: 'tips.diet.title', bodyKey: 'tips.diet.body' },
  { icon: '🩺', titleKey: 'tips.checkup.title', bodyKey: 'tips.checkup.body' },
  { icon: '🚫', titleKey: 'tips.noTanning.title', bodyKey: 'tips.noTanning.body' },
];

/** Returns tip based on day of year, cycling through all tips */
export function getDailyTip(): HealthTip {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return HEALTH_TIPS[dayOfYear % HEALTH_TIPS.length];
}
