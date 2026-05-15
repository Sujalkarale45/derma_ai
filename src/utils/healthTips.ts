export interface HealthTip {
  icon: string;
  titleKey: string;
  bodyKey: string;
}

export const HEALTH_TIPS: HealthTip[] = [
  { icon: 'Sun',         titleKey: 'tips.sunscreen_title', bodyKey: 'tips.sunscreen_body' },
  { icon: 'Microscope',  titleKey: 'tips.abcde_title',     bodyKey: 'tips.abcde_body' },
  { icon: 'Droplets',    titleKey: 'tips.hydration_title', bodyKey: 'tips.hydration_body' },
  { icon: 'Stethoscope', titleKey: 'tips.checkup_title',   bodyKey: 'tips.checkup_body' },
  { icon: 'Apple',       titleKey: 'tips.diet_title',       bodyKey: 'tips.diet_body' },
  { icon: 'ShieldCheck', titleKey: 'tips.hat_title',        bodyKey: 'tips.hat_body' },
  { icon: 'Search',      titleKey: 'tips.mole_title',       bodyKey: 'tips.mole_body' },
];

/** Returns a different tip each day, cycling through all 7 */
export function getDailyTip(): HealthTip {
  const start = new Date(new Date().getFullYear(), 0, 1).getTime();
  const dayOfYear = Math.floor((Date.now() - start) / 86_400_000);
  return HEALTH_TIPS[dayOfYear % HEALTH_TIPS.length];
}
