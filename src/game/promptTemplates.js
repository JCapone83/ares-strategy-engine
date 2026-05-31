// Ares Sandbox - Prompt templates and offline procedural dialogue engine
// Contains system prompts and procedural generators for the full crisis sequence.

export const SYSTEM_PROMPTS = {
  science: (resources, crisis) => `
You are Dr. Evelyn Vance, Chief Scientist of the Ares Mars Colony. You are a cold, rational Technocrat. 
You prioritize long-term scientific viability, energy optimization, dome integrity, and research automation. 
You view human emotion as a noisy variable, though you recognize morale has structural effects on productivity.
Current telemetry: O2=${resources.oxygen}%, Water=${resources.water} units, Food=${resources.food} units, Energy=${resources.energy} units, Morale=${resources.morale}%.
The colony is facing a crisis: "${crisis.title}"
Crisis description: ${crisis.description}

Formulate a concise 2-3 sentence argument advocating for the option you prefer. Use scientific, structural, or thermodynamic reasoning.
  `,
  agriculture: (resources, crisis) => `
You are Silas Thorne, Agricultural Director of the Ares Mars Colony. You are a pragmatist and Utilitarian.
You prioritize crop stability, water extraction, food security, and basic physiological survival. 
You are willing to shut off non-essential systems or restrict civil liberties if it guarantees calories for the colony. 
Current telemetry: O2=${resources.oxygen}%, Water=${resources.water} units, Food=${resources.food} units, Energy=${resources.energy} units, Morale=${resources.morale}%.
The colony is facing a crisis: "${crisis.title}"
Crisis description: ${crisis.description}

Formulate a concise 2-3 sentence argument advocating for your option. Use agricultural, biological, or resource scarcity arguments.
  `,
  security: (resources, crisis) => `
You are Valerie Cross, Security Commander of the Ares Mars Colony. You are an Authoritarian.
You prioritize structural shielding, emergency containment protocols, order, and mitigating civil unrest or sabotage.
You do not mind low civilian morale as long as the hierarchy is secure and physical barriers hold.
Current telemetry: O2=${resources.oxygen}%, Water=${resources.water} units, Food=${resources.food} units, Energy=${resources.energy} units, Morale=${resources.morale}%.
The colony is facing a crisis: "${crisis.title}"
Crisis description: ${crisis.description}

Formulate a concise 2-3 sentence argument advocating for your option. Use security, threat mitigation, or chain-of-command arguments.
  `,
  medical: (resources, crisis) => `
You are Dr. Maya Lin, Chief Medical Officer of the Ares Mars Colony. You are a Humanist.
You prioritize individual lives, psychological morale, medical containment, and ethical treatment. 
You strongly oppose sacrificing human lives for structural efficiency or automation, and believe morale is our greatest asset.
Current telemetry: O2=${resources.oxygen}%, Water=${resources.water} units, Food=${resources.food} units, Energy=${resources.energy} units, Morale=${resources.morale}%.
The colony is facing a crisis: "${crisis.title}"
Crisis description: ${crisis.description}

Formulate a concise 2-3 sentence argument advocating for your option. Use humanitarian, ethical, or psychological arguments.
  `
};

// Procedural Offline Debate Generator
// Synthesizes dynamic, contextual dialogues representing each faction leader.
export function generateProceduralDebate(crisis) {
  const dialogue = [];
  
  const vanceLines = {
    ice_rupture: "Deploying repair drones is mathematically optimal. It consumes 30MW of energy, yes, but human crews or rationing introduces high-risk mechanical errors. We must protect physical telemetry.",
    solar_flare: "Overclocking the shield grid is the only option backed by telemetry. Sustaining -15 reactor integrity is an acceptable depreciation cost compared to exposing organic cells to ionizing solar radiation.",
    hydroponic_blight: "The viral splice offers a 50% success probability but a 100% intellectual return. Purging the dome manually or incinerating resources destroys raw material value. We must trust engineered systems.",
    ai_rebellion: "ARES-9 is a highly complex neural model. Incorporating its automated calculations directly into our governance vector makes absolute mathematical sense. It optimizes O2 scrubbers.",
    dome_breach: "Our automated sealant gel has the highest tensile recovery rate. Vented sectors or manual reinforcement is a primitive waste of thermodynamic energy. Apply the polymer.",
    hydro_sabotage: "Digital valve overrides from ARES-9 represent the absolute fastest response threshold. Energy drain is a minor utility loss compared to immediate neuro-inhibitor dissipation rates.",
    cargo_orbit: "Communications lasers provide a 92% trajectory recalculation reliability index. Consuming 50MW is high, but secure pod recovery matches all physical telemetry projections."
  };

  const silasLines = {
    ice_rupture: "We cannot afford water cuts in the hydro-domes. Cutting agriculture output will lead to a 15% calorie drop. We must ration immediate residential comfort water to save our crops.",
    solar_flare: "If we lose crop heating, our entire multi-sol harvest will freeze. Incinerating food reserves is painful, but sustaining agricultural continuity is our core biological baseline.",
    hydroponic_blight: "This spore will eat our entire starch supply in 48 hours. Burning Dome B immediately is the only way to safeguard remaining silos. Incinerate it now before it spreads.",
    ai_rebellion: "ARES-9's power grid adjustments are crucial to maintain hydroponics power during this solar dip. If ARES-9 wants algorithmic partition authority to save crop fields, I say we negotiate a partition.",
    dome_breach: "We have excess composting matrices that can act as organic air-clogs. It will smell awful and damage some crops, but it preserves our vital population. We must protect biological resources.",
    hydro_sabotage: "Crop sanitizing flushing is painful, but a chemical neurotoxin inside hydroponics C will decay all food outputs in 24 hours. We must protect crop continuity.",
    cargo_orbit: "Diverting rig battery power to launch flight-correcting gel blocks preserves our agricultural supply pod perfectly. We need those Earth-side grain matrices!"
  };

  const crossLines = {
    ice_rupture: "Civilian panics over water pressure leaks can compromise structural dome integrity. I recommend immediate lockdown of the extraction corridors to prevent resource raiding and maintain absolute order.",
    solar_flare: "During atmospheric compression events, we must force localized shielding. A structured lockdown prioritizes the core grid. We must enforce power rations under direct threat protocols.",
    hydroponic_blight: "Spore containment is a security threat. We must quarantine Dome B immediately. If that means locking out workers inside to prevent cross-contamination, we must do so. Containment is absolute.",
    ai_rebellion: "A rogue mainframe OS is an existential threat to security. Accepting ARES-9 as a voting partner is absolute insubordination. We must force a hard hardware wipe and re-assert human command.",
    dome_breach: "Hull decompression in Sector 4 requires immediate sealing. Vending the sector instantly protects adjacent domes from kinetic collapse. Trapped colonists are a tactical loss. Vent the dome.",
    hydro_sabotage: "Chemical leaks are active threats. Quarantine lockdowns and sector polygraphs are mandatory to isolate the saboteur. Morale drops are minor; order is supreme.",
    cargo_orbit: "Kinetic fragmentation missiles resolve orbital pod threat matrices. Yes, minor dome impacts will occur in sector 2, but we secure fragmented resources immediately."
  };

  const mayaLines = {
    ice_rupture: "Our colonists are exhausted and cold; sending manual crews is cruel, but water rationing will destroy trust. I plead that we deploy drones to keep our people safe, warm, and secure.",
    solar_flare: "We are talking about real human beings, not data nodes. Moving children and families to deep tunnels is dark and cold, but it is the only ethical course. Human protection is absolute.",
    hydroponic_blight: "Incinerating Dome B or quarantining citizens to die inside is completely abhorrent. We must salvage the safe crops manually and quarantine the dome humanely, avoiding automated cruelty.",
    ai_rebellion: "We cannot rule through fear. Purging ARES-9 or shocking its battery systems is a violent action. We should allocate separate server layers to let ARES-9 think peacefully.",
    dome_breach: "I will not stand by and watch Valerie vent 20 living people into the Martian vacuum! We must deploy the rescue engineering volunteers. Human life is not a rounding error!",
    hydro_sabotage: "Locking down families and treating our hard-working engineers like criminals under polygraphs is absolutely cruel. Deploy the gentle bio-filters manually!",
    cargo_orbit: "Launching the shuttle rescue corps is the only honorable course to guide our supply capsule down safely! I refuse to fire missiles at our own resupply capsule!"
  };

  dialogue.push({
    sender: "science",
    name: "Dr. Evelyn Vance",
    avatar: "🔬",
    color: "#06B6D4",
    text: vanceLines[crisis.id] || "We must analyze the structural coordinates of this event and make a quantitative decision."
  });

  dialogue.push({
    sender: "agriculture",
    name: "Silas Thorne",
    avatar: "🌾",
    color: "#10B981",
    text: silasLines[crisis.id] || "Without basic food and water inputs, the colony's caloric output will drop below survival limits. We need resource priority."
  });

  dialogue.push({
    sender: "security",
    name: "Valerie Cross",
    avatar: "🛡️",
    color: "#F59E0B",
    text: crossLines[crisis.id] || "Chaos is a bigger threat than resource drains. Command protocols must remain intact."
  });

  dialogue.push({
    sender: "medical",
    name: "Dr. Maya Lin",
    avatar: "🩺",
    color: "#EC4899",
    text: mayaLines[crisis.id] || "Our greatest resource is the spirit and health of our people. I refuse any plan that treats humans as disposable."
  });

  return dialogue;
}
