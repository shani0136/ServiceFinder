/**
 * Mumbai Western Line corridor locations (South to North).
 * ServiceFinder currently operates strictly in these designated Mumbai areas.
 */
export const MUMBAI_LOCATIONS = [
  'Churchgate',
  'Marine Lines',
  'Charni Road',
  'Grant Road',
  'Mumbai Central',
  'Mahalaxmi',
  'Lower Parel',
  'Prabhadevi',
  'Dadar',
  'Matunga Road',
  'Mahim',
  'Bandra',
  'Khar',
  'Santacruz',
  'Vile Parle',
  'Andheri',
  'Jogeshwari',
  'Ram Mandir',
  'Goregaon',
  'Malad',
  'Kandivali',
  'Borivali',
  'Dahisar',
] as const;

export type MumbaiLocation = typeof MUMBAI_LOCATIONS[number];

export function isValidMumbaiLocation(loc: string): loc is MumbaiLocation {
  return MUMBAI_LOCATIONS.includes(loc as MumbaiLocation);
}
