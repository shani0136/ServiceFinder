export type ServiceCategory =
  | 'Electrician'
  | 'Plumber'
  | 'Carpenter'
  | 'Painter'
  | 'AC & Appliance Repair'
  | 'Refrigerator Repair'
  | 'Washing Machine Repair'
  | 'RO / Water Purifier Repair'
  | 'TV Repair'
  | 'Computer & Laptop Repair'
  | 'Mobile Repair'
  | 'Vehicle Mechanic'
  | 'Home Cleaning'
  | 'Pest Control';

export interface ServiceMeta {
  label: ServiceCategory;
  emoji: string;
  description: string;
  color: string;
}

export const CORE_SERVICES: ServiceMeta[] = [
  {
    label: 'Electrician',
    emoji: '⚡',
    description: 'Wiring, switches, MCB tripping, fan fitting & power repairs',
    color: 'radial-gradient(circle, rgba(234, 179, 8, 0.35) 0%, transparent 70%)',
  },
  {
    label: 'Plumber',
    emoji: '🔧',
    description: 'Pipe leaks, tap fixing, bathroom fixtures & drainage cleaning',
    color: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, transparent 70%)',
  },
  {
    label: 'Carpenter',
    emoji: '🪚',
    description: 'Door locks, furniture repair, hinge alignment & woodwork',
    color: 'radial-gradient(circle, rgba(249, 115, 22, 0.35) 0%, transparent 70%)',
  },
  {
    label: 'Painter',
    emoji: '🎨',
    description: 'Wall painting, waterproof touch-ups, POP & repainting',
    color: 'radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, transparent 70%)',
  },
  {
    label: 'AC & Appliance Repair',
    emoji: '❄️',
    description: 'Split/window AC servicing, cooling troubleshooting & installation',
    color: 'radial-gradient(circle, rgba(20, 184, 166, 0.35) 0%, transparent 70%)',
  },
  {
    label: 'Refrigerator Repair',
    emoji: '🧊',
    description: 'Fridge cooling issues, compressor inspection & gas refill',
    color: 'radial-gradient(circle, rgba(14, 165, 233, 0.35) 0%, transparent 70%)',
  },
  {
    label: 'Washing Machine Repair',
    emoji: '🧺',
    description: 'Drum vibration, motor issues, water drainage & spin cycle fixes',
    color: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
  },
  {
    label: 'RO / Water Purifier Repair',
    emoji: '💧',
    description: 'Filter replacement, membrane service & water flow fixes',
    color: 'radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, transparent 70%)',
  },
  {
    label: 'TV Repair',
    emoji: '📺',
    description: 'LED/LCD display repair, backlight fixing & sound issues',
    color: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 70%)',
  },
  {
    label: 'Computer & Laptop Repair',
    emoji: '💻',
    description: 'OS reload, hardware upgrade, motherboard & screen repair',
    color: 'radial-gradient(circle, rgba(79, 70, 229, 0.35) 0%, transparent 70%)',
  },
  {
    label: 'Mobile Repair',
    emoji: '📱',
    description: 'Broken screen replacement, battery health & charging port fixes',
    color: 'radial-gradient(circle, rgba(217, 70, 239, 0.35) 0%, transparent 70%)',
  },
  {
    label: 'Vehicle Mechanic',
    emoji: '🔩',
    description: 'Two-wheeler and car breakdown, jumpstarts & on-spot servicing',
    color: 'radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, transparent 70%)',
  },
  {
    label: 'Home Cleaning',
    emoji: '🧹',
    description: 'Deep kitchen, bathroom, sofa and floor sanitization',
    color: 'radial-gradient(circle, rgba(34, 197, 94, 0.35) 0%, transparent 70%)',
  },
  {
    label: 'Pest Control',
    emoji: '🐜',
    description: 'Cockroach gel treatment, termite control & bedbug elimination',
    color: 'radial-gradient(circle, rgba(132, 204, 22, 0.35) 0%, transparent 70%)',
  },
];

export const SERVICE_NAMES: ServiceCategory[] = CORE_SERVICES.map((s) => s.label);

export const TRADE_SKILL_SUGGESTIONS: Record<ServiceCategory, string[]> = {
  Electrician: [
    'Switch Repair',
    'Fan Installation',
    'Light Installation',
    'Wiring',
    'MCB Repair',
    'Inverter Setup',
    'Appliance Earthing',
  ],
  Plumber: [
    'Tap Repair',
    'Pipe Repair',
    'Leakage Repair',
    'Bathroom Plumbing',
    'Kitchen Plumbing',
    'Water Tank Repair',
    'Drainage Cleaning',
  ],
  Carpenter: [
    'Door Lock Repair',
    'Furniture Assembly',
    'Hinge Repair',
    'Wood Polishing',
    'Cupboard Fitting',
    'Window Repair',
  ],
  Painter: [
    'Interior Wall Painting',
    'Exterior Wall Painting',
    'Waterproof Coating',
    'POP & Putty Work',
    'Texture Paint',
    'Wood Varnish',
  ],
  'AC & Appliance Repair': [
    'Split AC Servicing',
    'Window AC Servicing',
    'Gas Refill',
    'Compressor Check',
    'AC Installation',
    'Cooling Coil Repair',
  ],
  'Refrigerator Repair': [
    'Single Door Fridge Repair',
    'Double Door Fridge Repair',
    'Compressor Replacement',
    'Gas Leak Fix',
    'Thermostat Replacement',
    'Defrost Timer Repair',
  ],
  'Washing Machine Repair': [
    'Front Load Repair',
    'Top Load Repair',
    'Drum Noise Fix',
    'Water Drainage Issue',
    'Motor Repair',
    'Spin Cycle Troubleshooting',
  ],
  'RO / Water Purifier Repair': [
    'Sediment Filter Change',
    'RO Membrane Replacement',
    'UV Lamp Fix',
    'Pump Repair',
    'TDS Adjustment',
    'Annual Maintenance',
  ],
  'TV Repair': [
    'LED TV Screen Repair',
    'LCD Panel Fix',
    'Backlight Replacement',
    'Power Supply Repair',
    'Sound Issue Troubleshooting',
    'HDMI Port Repair',
  ],
  'Computer & Laptop Repair': [
    'OS Installation',
    'Screen Replacement',
    'Keyboard Fix',
    'SSD / RAM Upgrade',
    'Motherboard Repair',
    'Virus Removal',
  ],
  'Mobile Repair': [
    'Screen Replacement',
    'Battery Replacement',
    'Charging Port Fix',
    'Speaker / Mic Repair',
    'Water Damage Recovery',
    'Camera Glass Repair',
  ],
  'Vehicle Mechanic': [
    'Two-Wheeler Servicing',
    'Car Oil Change',
    'Brake Pad Replacement',
    'Battery Jumpstart',
    'Puncture Repair',
    'Clutch Repair',
  ],
  'Home Cleaning': [
    'Full House Deep Cleaning',
    'Bathroom Deep Cleaning',
    'Kitchen Deep Cleaning',
    'Sofa Shampooing',
    'Balcony Cleaning',
    'Floor Scrubbing',
  ],
  'Pest Control': [
    'Cockroach Gel Treatment',
    'Termite Treatment',
    'Bedbug Eradication',
    'Ant Control',
    'Mosquito Fogging',
    'Rodent Management',
  ],
};

export function getServiceMeta(category: string): ServiceMeta | undefined {
  return CORE_SERVICES.find((s) => s.label.toLowerCase() === category.toLowerCase());
}
