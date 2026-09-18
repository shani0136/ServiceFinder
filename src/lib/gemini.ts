import type { ClassifyResponse, Urgency } from '../types';
import { SERVICE_NAMES, type ServiceCategory } from '../constants/services';

const VALID_URGENCIES: Urgency[] = ['low', 'medium', 'high'];

function isValidCategory(val: string): val is ServiceCategory {
  return SERVICE_NAMES.includes(val as ServiceCategory);
}

function isValidUrgency(val: string): val is Urgency {
  return VALID_URGENCIES.includes(val as Urgency);
}

// ─── Local Heuristic Keyword Fallback (with rich solutions) ───────────────
function heuristicClassify(problem: string): {
  service: ServiceCategory;
  urgency: Urgency;
  likelyCause: string;
  suggestedSolution: string;
} {
  const p = problem.toLowerCase();

  // High urgency checks
  const isHigh =
    p.includes('leak') ||
    p.includes('flood') ||
    p.includes('burst') ||
    p.includes('spark') ||
    p.includes('shock') ||
    p.includes('short circuit') ||
    p.includes('smoke') ||
    p.includes('emergency') ||
    p.includes('jaldi') ||
    p.includes('urgent');

  // Fan-specific issues (e.g. "mera fan kaam nahi kar raha hai", "fan slow")
  if (p.includes('fan') || p.includes('pankha')) {
    return {
      service: 'Electrician',
      urgency: isHigh ? 'high' : 'medium',
      likelyCause: 'Ceiling fan capacitor burnout, faulty electronic speed regulator, or motor winding issue.',
      suggestedSolution: 'An electrician will test the capacitor rating (2.5µF / 3.15µF), check regulator wiring, and replace the capacitor or repair motor coils. Switch off the regulator until inspected.',
    };
  }

  // Short circuit / spark / MCB / electrical
  if (
    p.includes('spark') ||
    p.includes('short circuit') ||
    p.includes('shock') ||
    p.includes('mcb') ||
    p.includes('fuse') ||
    p.includes('switch') ||
    p.includes('wire') ||
    p.includes('wiring') ||
    p.includes('bijli') ||
    p.includes('light') ||
    p.includes('power') ||
    p.includes('inverter') ||
    p.includes('electric')
  ) {
    return {
      service: 'Electrician',
      urgency: isHigh ? 'high' : 'medium',
      likelyCause: 'Circuit overload, loose terminal screw, or degraded wire insulation causing earth leakage.',
      suggestedSolution: 'Turn off the main MCB breaker switch immediately. A certified electrician will perform insulation continuity tests and replace burnt switches or damaged wiring.',
    };
  }

  // Plumbing / tap / pipe / leak
  if (
    p.includes('pipe') ||
    p.includes('tap') ||
    p.includes('leak') ||
    p.includes('drain') ||
    p.includes('bathroom') ||
    p.includes('sink') ||
    p.includes('commode') ||
    p.includes('flush') ||
    p.includes('paani') ||
    p.includes('pani') ||
    p.includes('plumb')
  ) {
    return {
      service: 'Plumber',
      urgency: isHigh ? 'high' : 'medium',
      likelyCause: 'Worn spindle washer, degraded Teflon thread seal, or internal hairline crack in PVC/brass fitting.',
      suggestedSolution: 'Turn off the localized angle cock or main water valve. Plumber will replace the spindle/washer cartridge and reseal pipe threads.',
    };
  }

  // Refrigerator
  if (p.includes('fridge') || p.includes('refrigerator') || p.includes('freezer')) {
    return {
      service: 'Refrigerator Repair',
      urgency: isHigh ? 'high' : 'medium',
      likelyCause: 'Choked condenser coils, failed defrost thermostat timer, or faulty compressor PTC start relay.',
      suggestedSolution: 'A refrigerator technician will inspect refrigerant gas pressure, test the thermostat sensor, and clean rear heat dissipation coils.',
    };
  }

  // Washing machine
  if (p.includes('washing machine') || p.includes('washing') || p.includes('dryer') || p.includes('spin') || p.includes('drum')) {
    return {
      service: 'Washing Machine Repair',
      urgency: isHigh ? 'high' : 'low',
      likelyCause: 'Worn drive belt, blocked drain pump impeller filter, or faulty door interlock sensor.',
      suggestedSolution: 'Appliance specialist will clean the pump lint trap, inspect belt tension, and test the spin cycle capacitor.',
    };
  }

  // RO / Purifier
  if (p.includes('ro') || p.includes('water purifier') || p.includes('aquaguard') || p.includes('purifier') || p.includes('tds') || p.includes('kent')) {
    return {
      service: 'RO / Water Purifier Repair',
      urgency: isHigh ? 'high' : 'medium',
      likelyCause: 'Exhausted sediment/carbon pre-filters, fouled RO membrane, or failed booster pump head.',
      suggestedSolution: 'Water technician will test input and output TDS, sanitize the storage tank, and replace exhausted filter cartridges.',
    };
  }

  // AC & Appliance
  if (p.includes('ac') || p.includes('air conditioner') || p.includes('cooling') || p.includes('thanda') || p.includes('gas refill') || p.includes('appliance')) {
    return {
      service: 'AC & Appliance Repair',
      urgency: isHigh ? 'high' : 'medium',
      likelyCause: 'Clogged indoor cooling fins, low R32/R410A refrigerant charge, or dual run capacitor failure.',
      suggestedSolution: 'AC technician will pressure-test gas lines, clean blower and condenser coils with jet pump, and calibrate compressor cut-off.',
    };
  }

  // Vehicle Mechanic
  if (p.includes('bike') || p.includes('car') || p.includes('mechanic') || p.includes('puncture') || p.includes('scooter') || p.includes('motorcycle') || p.includes('engine') || p.includes('brake')) {
    return {
      service: 'Vehicle Mechanic',
      urgency: isHigh ? 'high' : 'medium',
      likelyCause: 'Discharged 12V battery, fouled spark plug electrode, or carburetor/fuel line blockage.',
      suggestedSolution: 'Mechanic will jump-start or test battery voltage, clean spark plug gap, and inspect fuel delivery system.',
    };
  }

  // TV Repair
  if (p.includes('tv') || p.includes('television') || p.includes('led tv') || p.includes('lcd') || p.includes('display panel')) {
    return {
      service: 'TV Repair',
      urgency: 'low',
      likelyCause: 'Blown backlight LED strip (sound working, dark screen), swollen power board capacitors, or faulty T-con board.',
      suggestedSolution: 'TV technician will test output rail voltages on the SMPS power supply and replace defective backlight LED strips.',
    };
  }

  // Computer / Laptop
  if (p.includes('laptop') || p.includes('computer') || p.includes('pc') || p.includes('windows') || p.includes('format') || p.includes('ssd') || p.includes('ram')) {
    return {
      service: 'Computer & Laptop Repair',
      urgency: isHigh ? 'high' : 'low',
      likelyCause: 'Corrupted OS bootloader, failing SSD/HDD sectors, RAM pin oxidation, or thermal throttling.',
      suggestedSolution: 'Technician will run hardware diagnostics on memory/storage, clean fan vents, and re-apply thermal paste or repair OS boot.',
    };
  }

  // Mobile Repair
  if (p.includes('mobile') || p.includes('phone') || p.includes('screen') || p.includes('touch') || p.includes('charging port')) {
    return {
      service: 'Mobile Repair',
      urgency: 'low',
      likelyCause: 'Damaged digitizer glass, oxidized USB-C/Lightning connector pins, or worn battery health.',
      suggestedSolution: 'Technician will clean port with anti-static solution, test charging wattage, or install OEM display replacement.',
    };
  }

  // Carpenter
  if (p.includes('lock') || p.includes('door') || p.includes('hinge') || p.includes('furniture') || p.includes('wood') || p.includes('carpenter') || p.includes('cupboard') || p.includes('table')) {
    return {
      service: 'Carpenter',
      urgency: 'low',
      likelyCause: 'Wood swelling from Mumbai humidity, loose hinge mortise screws, or misaligned lock latch plate.',
      suggestedSolution: 'Carpenter will plane rubbing door edges, tighten hinge fixings, and realign or lubricate the cylinder lock.',
    };
  }

  // Painter
  if (p.includes('paint') || p.includes('putty') || p.includes('pop') || p.includes('wall') || p.includes('color') || p.includes('waterproof') || p.includes('damp')) {
    return {
      service: 'Painter',
      urgency: 'low',
      likelyCause: 'Wall moisture seepage, efflorescence salt deposits, or aging primer coat peeling off.',
      suggestedSolution: 'Painter will scrape surface to masonry, apply anti-fungal waterproofing barrier, smooth with acrylic putty, and coat with washable paint.',
    };
  }

  // Pest Control
  if (p.includes('cockroach') || p.includes('termite') || p.includes('pest') || p.includes('bedbug') || p.includes('insect') || p.includes('kida') || p.includes('rodent')) {
    return {
      service: 'Pest Control',
      urgency: 'low',
      likelyCause: 'Moisture in plumbing conduits, kitchen cabinet crevices, or seasonal pest entry.',
      suggestedSolution: 'Pest control technician will place herbal gel baiting inside dry cabinets and spray residual barrier treatment along skirting lines.',
    };
  }

  // Home Cleaning
  if (p.includes('clean') || p.includes('deep clean') || p.includes('sofa') || p.includes('sanitize') || p.includes('sanitization') || p.includes('dusting')) {
    return {
      service: 'Home Cleaning',
      urgency: 'low',
      likelyCause: 'Accumulated particulate dust, bathroom hard-water scale, and upholstery fabric grime.',
      suggestedSolution: 'Cleaning team will use industrial vacuum extractors, microfiber scrubbing, and eco-friendly descaling agents for deep sanitization.',
    };
  }

  return {
    service: 'Electrician',
    urgency: 'low',
    likelyCause: 'General electrical or fixture fault.',
    suggestedSolution: 'A local electrician will inspect the appliance, verify circuit safety, and repair or replace worn components.',
  };
}

/**
 * Sends the user's natural-language problem description to Cloudflare Worker `/api/classify`.
 * Gemini classifies into one of the 14 everyday service categories and provides likely cause and solution.
 */
export async function classifyProblem(problem: string): Promise<ClassifyResponse> {
  const clean = problem.trim();
  const fallbackMatch = heuristicClassify(clean);

  const fallback: ClassifyResponse = {
    serviceCategory: fallbackMatch.service,
    confidence: 0.9,
    urgency: fallbackMatch.urgency,
    problemSummary: clean.slice(0, 100),
    likelyCause: fallbackMatch.likelyCause,
    suggestedSolution: fallbackMatch.suggestedSolution,
    error: false,
  };

  if (!clean || clean.length < 3) {
    return {
      serviceCategory: 'Electrician',
      confidence: 0,
      urgency: 'low',
      problemSummary: '',
      likelyCause: 'Unspecified issue',
      suggestedSolution: 'Please provide a few words describing what needs repair.',
      error: true,
    };
  }

  try {
    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: clean }),
    });

    if (!response.ok) {
      return fallback;
    }

    const raw = await response.json() as Partial<ClassifyResponse>;

    if (raw.error || !raw.serviceCategory || (typeof raw.confidence === 'number' && raw.confidence < 0.2)) {
      return fallback;
    }

    const serviceCategory = isValidCategory(raw.serviceCategory ?? '')
      ? (raw.serviceCategory as ServiceCategory)
      : fallbackMatch.service;

    const confidence = typeof raw.confidence === 'number'
      ? Math.max(0, Math.min(1, raw.confidence))
      : 0.9;

    const urgency = isValidUrgency(raw.urgency ?? '')
      ? (raw.urgency as Urgency)
      : fallbackMatch.urgency;

    const problemSummary = typeof raw.problemSummary === 'string' && raw.problemSummary.trim()
      ? raw.problemSummary.slice(0, 200)
      : clean.slice(0, 100);

    const likelyCause = typeof raw.likelyCause === 'string' && raw.likelyCause.trim()
      ? raw.likelyCause.slice(0, 250)
      : fallbackMatch.likelyCause;

    const suggestedSolution = typeof raw.suggestedSolution === 'string' && raw.suggestedSolution.trim()
      ? raw.suggestedSolution.slice(0, 350)
      : fallbackMatch.suggestedSolution;

    return {
      serviceCategory,
      confidence,
      urgency,
      problemSummary,
      likelyCause,
      suggestedSolution,
      error: raw.error,
    };
  } catch {
    return fallback;
  }
}
