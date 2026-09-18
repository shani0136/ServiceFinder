import { CORE_SERVICES, SERVICE_NAMES, type ServiceCategory, type ServiceMeta, getServiceMeta } from './services';

export { CORE_SERVICES, SERVICE_NAMES, getServiceMeta };
export type { ServiceCategory, ServiceMeta };

export const CATEGORIES = CORE_SERVICES;
export const ALL_CATEGORIES = SERVICE_NAMES;

export const POPULAR_CATEGORIES: ServiceCategory[] = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'AC & Appliance Repair',
  'Painter',
  'Home Cleaning',
  'RO / Water Purifier Repair',
  'Vehicle Mechanic',
];
