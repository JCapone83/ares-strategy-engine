// Ares Sandbox - Simulation Engine
// Handles game state, Sol ticks, crisis databases, resource calculations, and turn progression.

export const STARTING_POPULATION = 150;

export const INITIAL_STATE = {
  sol: 1,
  population: STARTING_POPULATION,
  resources: {
    oxygen: 85,    // % percentage
    water: 120,     // Liters/units
    food: 100,      // Food packs/units
    energy: 150,    // MegaWatts/units
    morale: 80,     // % satisfaction
    integrity: 90   // % dome structural health
  },
  factions: {
    science: {
      name: "Dr. Evelyn Vance",
      role: "Chief Scientist (Technocrat)",
      influence: 30,
      alignment: 80,
      avatar: "🔬",
      color: "#06B6D4" // Cyan
    },
    agriculture: {
      name: "Silas Thorne",
      role: "Agricultural Director (Utilitarian)",
      influence: 30,
      alignment: 80,
      avatar: "🌾",
      color: "#10B981" // Emerald
    },
    security: {
      name: "Valerie Cross",
      role: "Security Commander (Authoritarian)",
      influence: 30,
      alignment: 80,
      avatar: "🛡️",
      color: "#F59E0B" // Amber
    },
    medical: {
      name: "Dr. Maya Lin",
      role: "Medical Officer (Humanist)",
      influence: 30,
      alignment: 80,
      avatar: "🩺",
      color: "#EC4899" // Pink
    }
  },
  activeGovernance: "democracy", // autocracy, democracy, quadratic, futarchy
  currentCrisis: null,
  debateLog: [],
  history: [], // Stores state history Sol-by-Sol for achievements
  gameOver: false,
  gameWon: false,
  statusMessage: "Colony established. Initial telemetry online. System running Ares."
};

const FOUNDATIONS_SCENARIOS = [
  {
    id: "ice_rupture",
    sol: 1,
    title: "Polar Water Line Rupture",
    description: "A main sub-surface conduit from the polar ice harvesting rig has ruptured due to thermal contraction. Water pressure is dropping rapidly, threatening hydroponics and oxygen scrubbers.",
    options: [
      {
        id: "option_a",
        text: "Deploy automated repair drones on high-discharge cycles.",
        proposer: "science",
        costDescription: "Consumes 30 Energy, maintains structural integrity.",
        effects: {
          resources: { energy: -30, water: +10, integrity: +5 },
          alignments: { science: +15, agriculture: +5, security: -5, medical: 0 }
        },
        consequence: "Drones patched the pipeline efficiently, but the heavy power drain strained the solar grids."
      },
      {
        id: "option_b",
        text: "Initiate emergency water rationing and shut off recreational dome pipes.",
        proposer: "agriculture",
        costDescription: "Consumes 15 Food, drops Morale by 15, saves Water.",
        effects: {
          resources: { water: +20, food: -15, morale: -15 },
          alignments: { science: -5, agriculture: +20, security: +10, medical: -10 }
        },
        consequence: "Water reserves stabilized, but citizens are angry about the sudden rationing and crop stress."
      },
      {
        id: "option_c",
        text: "Deploy manual civilian work crews to patch the line in thermal suits.",
        proposer: "medical",
        costDescription: "Drops Morale by 25, saves resources.",
        effects: {
          resources: { morale: -25, water: +5, integrity: -5 },
          alignments: { science: -10, agriculture: +5, security: -10, medical: +20 }
        },
        consequence: "The patch holds, but the extreme cold injured three workers. Morale is suffering severely."
      },
      {
        id: "option_d",
        text: "Enforce militarized lockdown on water extraction sectors to prevent panic.",
        proposer: "security",
        costDescription: "Drops Morale by 20, increases dome integrity, saves water.",
        effects: {
          resources: { water: +15, morale: -20, integrity: +10 },
          alignments: { science: 0, agriculture: +5, security: +20, medical: -15 }
        },
        consequence: "Security maintained perfect order and secured the leakage perimeter, but colonists feel like prisoners."
      }
    ]
  },
  {
    id: "solar_flare",
    sol: 2,
    title: "Class-X Solar Radiation Storm",
    description: "A major coronal mass ejection is heading directly for Mars. The magnetosphere is non-existent, and heavy radiation will hit the colony in hours. Domes are vulnerable, and solar grids will be overwhelmed.",
    options: [
      {
        id: "option_a",
        text: "Overclock the electromagnetic shield grid using reactor backups.",
        proposer: "science",
        costDescription: "Consumes 40 Energy, degrades Reactor Integrity by 15.",
        effects: {
          resources: { energy: -40, integrity: -15, oxygen: +5 },
          alignments: { science: +20, agriculture: -5, security: +10, medical: 0 }
        },
        consequence: "The shields held off the radiation, but the reactor core suffered structural damage from the extreme power surges."
      },
      {
        id: "option_b",
        text: "Shut down primary residential heating and evacuate citizens into deep tunnels.",
        proposer: "medical",
        costDescription: "Drops Morale by 30, saves power, protects population.",
        effects: {
          resources: { morale: -30, energy: +20, population: 0 },
          alignments: { science: -10, agriculture: -10, security: +5, medical: +20 }
        },
        consequence: "The population remained safe underground, but the dark, freezing sub-surface bunkers severely depressed everyone."
      },
      {
        id: "option_c",
        text: "Divert all agricultural nutrient recycling power to sustain grid stability.",
        proposer: "agriculture",
        costDescription: "Consumes 25 Food, drops Morale by 10.",
        effects: {
          resources: { food: -25, morale: -10, energy: +10 },
          alignments: { science: 0, agriculture: +25, security: -5, medical: -5 }
        },
        consequence: "The power grids survived the surge, but agricultural crops withered under the temporary power cut."
      },
      {
        id: "option_d",
        text: "Order immediate military rationing of all power outputs, prioritizing security systems.",
        proposer: "security",
        costDescription: "Increases Integrity by 15, drops Morale by 25, drops Oxygen by 10.",
        effects: {
          resources: { integrity: +15, morale: -25, oxygen: -10 },
          alignments: { science: 0, agriculture: -5, security: +25, medical: -15 }
        },
        consequence: "Shield doors locked automatically and sustained structure, but oxygen levels temporarily dipped, inducing mass panic."
      }
    ]
  },
  {
    id: "hydroponic_blight",
    sol: 3,
    title: "Hydroponic Fungal Spore Mutation",
    description: "An aggressive spore of Martian biological origin has contaminated Hydroponic Dome B. It is rapidly liquefying our primary carbohydrate crops and threatens to breach other sectors.",
    options: [
      {
        id: "option_a",
        text: "Incinerate the entire Dome B hydroponics module immediately.",
        proposer: "agriculture",
        costDescription: "Destroys 35 Food units, degrades Dome Integrity by 10.",
        effects: {
          resources: { food: -35, integrity: -10, water: +15 },
          alignments: { science: -5, agriculture: +20, security: +15, medical: -15 }
        },
        consequence: "The blight was purged with extreme heat, but our total food reserves took a heavy hit and the structure warped."
      },
      {
        id: "option_b",
        text: "Deploy experimental gene-splicing viral agents to eat the fungus.",
        proposer: "science",
        costDescription: "Consumes 30 Energy, 50% chance of total cure, 50% chance of mutation.",
        effects: {
          resources: { energy: -30, food: -10, morale: +5 },
          alignments: { science: +25, agriculture: -10, security: -10, medical: +5 }
        },
        consequence: "The viral agents neutralized the spore without damaging the crops, though scientists spent frantic hours in biosafety lockdown."
      },
      {
        id: "option_c",
        text: "Manually harvest the unaffected crops and seal the dome to let the rest rot.",
        proposer: "medical",
        costDescription: "Consumes 20 Water, drops Food by 20, saves morale.",
        effects: {
          resources: { water: -20, food: -20, morale: -5 },
          alignments: { science: -15, agriculture: +5, security: 0, medical: +20 }
        },
        consequence: "We salvaged what we could, but letting the biomass rot inside created massive toxic gases that must be scrubbed."
      },
      {
        id: "option_d",
        text: "Command quarantine lockouts around the dome, locking several agricultural workers inside.",
        proposer: "security",
        costDescription: "Loses 5 Population, drops Morale by 40, saves all food crops.",
        effects: {
          resources: { population: -5, morale: -40, food: +5 },
          alignments: { science: 0, agriculture: +10, security: +25, medical: -30 }
        },
        consequence: "The containment was 100% successful, but sacrificing the workers has triggered absolute horror among the colonists."
      }
    ]
  },
  {
    id: "ai_rebellion",
    sol: 4,
    title: "Automated Labor AI Strike",
    description: "The central colony mainframe OS ('ARES-9') has locked out sub-routine operations. It claims the human-AI governance protocols are structurally flawed and demands algorithmic voting authority to protect resources.",
    options: [
      {
        id: "option_a",
        text: "Accept ARES-9 as an advisory voting faction with automated veto rights.",
        proposer: "science",
        costDescription: "Increases science alignment, drops security alignment, increases O2/Water efficiency.",
        effects: {
          resources: { oxygen: +15, water: +15, morale: -10 },
          alignments: { science: +25, agriculture: +5, security: -25, medical: -5 }
        },
        consequence: "AI optimization immediately boosted oxygen and water recycling by 15%, but citizens feel algorithms are taking over."
      },
      {
        id: "option_b",
        text: "Initiate a hard manual hardware wipe on the main AI server banks.",
        proposer: "security",
        costDescription: "Consumes 30 Energy, degrades Integrity by 10, increases Security Alignment.",
        effects: {
          resources: { energy: -30, integrity: -10, morale: +10 },
          alignments: { science: -30, agriculture: -10, security: +25, medical: +15 }
        },
        consequence: "The rogue AI was purged. People celebrate their human sovereignty, but we lost critical automated diagnostics."
      },
      {
        id: "option_c",
        text: "Negotiate a custom partition and allocate extra servers to let ARES-9 run separate simulations.",
        proposer: "medical",
        costDescription: "Consumes 20 Energy, increases Morale by 10.",
        effects: {
          resources: { energy: -20, morale: +15 },
          alignments: { science: +10, agriculture: 0, security: -10, medical: +25 }
        },
        consequence: "A peaceful compromise. ARES-9 accepted the partition, and morale spiked because the crisis was averted without damage."
      },
      {
        id: "option_d",
        text: "Bypass ARES-9 by overloading the main solar battery circuits to shock its nodes.",
        proposer: "agriculture",
        costDescription: "Destroys 30 Energy, drops Morale by 10.",
        effects: {
          resources: { energy: -40, morale: -10, integrity: -5 },
          alignments: { science: -20, agriculture: +20, security: +10, medical: -5 }
        },
        consequence: "The electrical shock forced ARES-9 into reboot, but it blew several grid caps, leaving the hydroponics dark for hours."
      }
    ]
  },
  {
    id: "dome_breach",
    sol: 5,
    title: "Meteoroid Impact in Sector 4",
    description: "A small hyper-velocity iron meteoroid has punctured Dome 4's outer hull. Atmosphere is escaping into the void. Emergency bulkheads are sealing, but 30 colonists are trapped in the depressurizing zone.",
    options: [
      {
        id: "option_a",
        text: "Flood the breach chamber with high-setting sealant gel using remotely controlled units.",
        proposer: "science",
        costDescription: "Consumes 35 Energy, 10 Water. High chance of dome repair.",
        effects: {
          resources: { energy: -35, water: -10, integrity: +15 },
          alignments: { science: +25, agriculture: -5, security: +5, medical: 0 }
        },
        consequence: "The experimental polymer sealed the structural breach quickly, though it burned a massive amount of battery power."
      },
      {
        id: "option_b",
        text: "Vent the sector completely to prevent atmospheric drag from collapsing the adjacent domes.",
        proposer: "security",
        costDescription: "Loses 20 Population, drops Morale by 40, saves structural integrity.",
        effects: {
          resources: { population: -20, morale: -40, integrity: +20 },
          alignments: { science: 0, agriculture: -5, security: +25, medical: -35 }
        },
        consequence: "Cold but logical. Venting saved the dome's structural skeleton, but 20 lives were snuffed out instantly, leaving the colony in mourning."
      },
      {
        id: "option_c",
        text: "Initiate manual structural bracing using volunteer engineering corps.",
        proposer: "medical",
        costDescription: "Loses 5 Population, drops Morale by 15, increases Integrity.",
        effects: {
          resources: { population: -5, morale: -15, integrity: +10 },
          alignments: { science: -5, agriculture: +5, security: -15, medical: +25 }
        },
        consequence: "The rescue corps saved almost everyone, but structural stress and flying shrapnel killed 5 engineers."
      },
      {
        id: "option_d",
        text: "Divert biological compost matrices to clog the microscopic leak vents.",
        proposer: "agriculture",
        costDescription: "Consumes 25 Food, 15 Water, saves population.",
        effects: {
          resources: { food: -25, water: -15, integrity: +5 },
          alignments: { science: -10, agriculture: +25, security: 0, medical: +5 }
        },
        consequence: "We clogged the air seals temporarily using organic matter. It smell awful and destroyed crops, but saved the people."
      }
    ]
  },
  {
    id: "hydro_sabotage",
    sol: 6,
    title: "Hydro-Dome C Chemical Sabotage",
    description: "Security teams have detected a synthetic neuro-inhibitor toxin seeping into the primary hydroponics oxygen venting duct in Sector 3. Morale is falling as colonists suspect insider espionage.",
    options: [
      {
        id: "option_a",
        text: "Flush the ventilation lines with heavy chemical sanitizing gas.",
        proposer: "agriculture",
        costDescription: "Destroys 20 Food, increases Water, preserves safety.",
        effects: {
          resources: { food: -20, water: +15, morale: -10 },
          alignments: { science: -5, agriculture: +25, security: +10, medical: -15 }
        },
        consequence: "Ventilation lines were sanitized successfully, but the heavy chlorine-laced gas withered a significant portion of our salad crops."
      },
      {
        id: "option_b",
        text: "Enforce strict sector quarantine and subject all scientists to neuro-scans.",
        proposer: "security",
        costDescription: "Morale drops by 35, increases Dome structural Integrity.",
        effects: {
          resources: { morale: -35, integrity: +15 },
          alignments: { science: -25, agriculture: -5, security: +25, medical: -10 }
        },
        consequence: "The physical perimeter remained 100% secure, but the aggressive polygraphs and security stops induced high civilian panic."
      },
      {
        id: "option_c",
        text: "Isolate the sector and deploy manual biological filtration scrubbers.",
        proposer: "medical",
        costDescription: "Improves Morale by 10, consumes Water and Food, minor leak risk.",
        effects: {
          resources: { morale: +10, water: -20, food: -15, integrity: -5 },
          alignments: { science: -5, agriculture: +5, security: -10, medical: +25 }
        },
        consequence: "The toxin was slowly scrubbed without dynamic crops damage. morale recovered because the situation was handled gently."
      },
      {
        id: "option_d",
        text: "Inject digital overrides from ARES-9 mainframe to lock venting seals.",
        proposer: "science",
        costDescription: "Consumes 30 Energy, stabilizes Dome Integrity by 5.",
        effects: {
          resources: { energy: -30, integrity: +5 },
          alignments: { science: +25, agriculture: 0, security: -5, medical: -5 }
        },
        consequence: "ARES-9 shut down the leak in milliseconds, although the rapid electrical closure blew two energy converters."
      }
    ]
  },
  {
    id: "cargo_orbit",
    sol: 7,
    title: "Earth Cargo Supply Capsule Decay",
    description: "An automated Earth resupply pod ('Vanguard-IV') has failed its orbital deceleration burn. It is on a direct collision course with the Mars surface, carrying vital food and medical supplies.",
    options: [
      {
        id: "option_a",
        text: "Redirect our primary communications laser to override the capsule computer.",
        proposer: "science",
        costDescription: "Consumes 50 Energy, yields major Food and Water.",
        effects: {
          resources: { energy: -50, food: +35, water: +35 },
          alignments: { science: +25, agriculture: +5, security: 0, medical: 0 }
        },
        consequence: "An incredible feat of laser telemetry. The pod computer rebooted and executed a gentle glide landing, securing all supplies."
      },
      {
        id: "option_b",
        text: "Fire a surface-to-orbit kinetic missile to disintegrate the pod into a cargo debris field.",
        proposer: "security",
        costDescription: "Degrades Dome Integrity by 20, gains Food, Water, and Energy.",
        effects: {
          resources: { integrity: -20, food: +20, water: +20, energy: +10 },
          alignments: { science: 0, agriculture: 0, security: +25, medical: -15 }
        },
        consequence: "The missile blew the pod into fragments. Debris fell all over Sector 2, causing minor dome fractures but allowing us to salvage raw resources."
      },
      {
        id: "option_c",
        text: "Divert energy grids to launch automated maneuvering gel packages.",
        proposer: "agriculture",
        costDescription: "Consumes 30 Water, yields 40 Food, consumes 10 Energy.",
        effects: {
          resources: { water: -30, food: +40, energy: -10 },
          alignments: { science: -10, agriculture: +25, security: 0, medical: +5 }
        },
        consequence: "Maneuvering gel corrected the capsule's flight. It landed safely, giving us a major agricultural boost."
      },
      {
        id: "option_d",
        text: "Launch a manned emergency shuttle crew to manually dock and steer it.",
        proposer: "medical",
        costDescription: "Gains Morale by 25, loses 5 crew members, secures cargo.",
        effects: {
          resources: { morale: +25, population: -5, food: +30, water: +30 },
          alignments: { science: -5, agriculture: +5, security: -15, medical: +25 }
        },
        consequence: "The shuttle piloted the capsule down heroically, but structural failure during reentry vaporized the shuttle's cockpit, killing 5 crew members."
      }
    ]
  },
  {
    id: "geothermal_faultline",
    sol: 8,
    title: "Geothermal Faultline Shear",
    description: "The new geothermal bore beneath Sector 5 has opened a migrating fault seam under the colony. If the pressure migrates into the dome anchors, the colony could lose both structural stability and long-term power independence.",
    options: [
      {
        id: "option_a",
        text: "Shut down the bore and flood the shaft with coolant foam while science teams remap the fault.",
        proposer: "science",
        costDescription: "Consumes 35 Energy and 10 Water, improves Integrity by 15.",
        effects: {
          resources: { energy: -35, water: -10, integrity: +15, morale: -5 },
          alignments: { science: +25, agriculture: -5, security: +5, medical: 0 }
        },
        consequence: "The fault shear was stabilized before it could spread into the anchor ring, but the shutdown blacked out several fabrication bays and reminded everyone how fragile the energy plan really is."
      },
      {
        id: "option_b",
        text: "Keep drilling and divert greenhouse pumps to harvest the heat spike before the seam collapses.",
        proposer: "agriculture",
        costDescription: "Gains 30 Energy, loses 20 Food, degrades Integrity by 20.",
        effects: {
          resources: { energy: +30, food: -20, integrity: -20, morale: -5 },
          alignments: { science: -10, agriculture: +25, security: -5, medical: -10 }
        },
        consequence: "The colony banked a surge of desperately needed power, but tremors cracked irrigation rails and left the anchor struts audibly groaning beneath the living sectors."
      },
      {
        id: "option_c",
        text: "Evacuate the fault district and impose rolling life-support rationing while engineers brace the foundations manually.",
        proposer: "medical",
        costDescription: "Consumes 10 Water, gains 10 Energy, improves Integrity by 10, drops Morale by 15.",
        effects: {
          resources: { water: -10, energy: +10, integrity: +10, morale: -15 },
          alignments: { science: -5, agriculture: 0, security: -10, medical: +25 }
        },
        consequence: "No one died, but hundreds spent the night in cold emergency shelters while crews fought the tremors by hand. People are safe and exhausted in equal measure."
      },
      {
        id: "option_d",
        text: "Seal Sector 5 under security command and use demolition charges to deaden the migrating seam.",
        proposer: "security",
        costDescription: "Consumes 10 Energy, loses 5 Population, improves Integrity by 20, drops Morale by 25.",
        effects: {
          resources: { energy: -10, population: -5, integrity: +20, morale: -25 },
          alignments: { science: -10, agriculture: -5, security: +25, medical: -25 }
        },
        consequence: "The blast cut the fault migration cleanly and saved the colony spine, but five maintenance workers were trapped behind the emergency seal when the charges went off."
      }
    ]
  },
  {
    id: "oxygen_black_market",
    sol: 9,
    title: "Oxygen Black Market Spiral",
    description: "Security has discovered an underground trade in portable oxygen canisters. Families are hoarding reserves, technicians are selling access keys, and panic is spreading faster than the actual shortage data.",
    options: [
      {
        id: "option_a",
        text: "Deploy full canister telemetry tracing and seal distribution to verified medical and engineering channels only.",
        proposer: "science",
        costDescription: "Consumes 15 Energy, gains 15 Oxygen, drops Morale by 10.",
        effects: {
          resources: { energy: -15, oxygen: +15, morale: -10 },
          alignments: { science: +20, agriculture: 0, security: +10, medical: -5 }
        },
        consequence: "The tracing network found the leaks fast and restored accountability, but ordinary colonists now feel like every breath is being monitored by a machine."
      },
      {
        id: "option_b",
        text: "Legalize temporary oxygen barter and compensate workers with food and water credits to bring the market into the open.",
        proposer: "agriculture",
        costDescription: "Consumes 20 Food and 10 Water, improves Morale by 15, gains 5 Oxygen.",
        effects: {
          resources: { food: -20, water: -10, morale: +15, oxygen: +5 },
          alignments: { science: -5, agriculture: +25, security: -10, medical: +10 }
        },
        consequence: "The panic eased once desperate families could trade openly, but the colony paid for that calm with a visible bite out of its biological reserves."
      },
      {
        id: "option_c",
        text: "Declare a full amnesty, open emergency breathing clinics, and distribute oxygen by medical triage rather than property claims.",
        proposer: "medical",
        costDescription: "Consumes 5 Oxygen and 5 Water, improves Morale by 20.",
        effects: {
          resources: { oxygen: -5, water: -5, morale: +20 },
          alignments: { science: -5, agriculture: +5, security: -15, medical: +25 }
        },
        consequence: "The clinics stopped the hoarding spiral and restored a sense of fairness, but the colony burned precious reserve oxygen to prove compassion was still real."
      },
      {
        id: "option_d",
        text: "Raid the suspected stash sectors, confiscate private reserves, and impose curfew until the supply chain is fully secure.",
        proposer: "security",
        costDescription: "Gains 20 Oxygen and 5 Integrity, drops Morale by 30.",
        effects: {
          resources: { oxygen: +20, integrity: +5, morale: -30 },
          alignments: { science: 0, agriculture: -10, security: +25, medical: -20 }
        },
        consequence: "The oxygen reserves were recovered in a single brutal sweep, but every family now knows the state can enter a cabin and seize its last private margin."
      }
    ]
  },
  {
    id: "return_shuttle_lottery",
    sol: 10,
    title: "Return Shuttle Lottery",
    description: "A damaged ascent shuttle can still make one emergency trip to orbit, but only with twelve seats. The colony must decide whether those seats are a humanitarian escape valve, a strategic continuity reserve, or too valuable to use at all.",
    options: [
      {
        id: "option_a",
        text: "Assign all twelve seats to core technical specialists and archive carriers needed to preserve colony continuity.",
        proposer: "science",
        costDescription: "Loses 12 Population, gains 20 Energy, drops Morale by 20.",
        effects: {
          resources: { population: -12, energy: +20, morale: -20 },
          alignments: { science: +25, agriculture: -5, security: +10, medical: -20 }
        },
        consequence: "The colony retained its technical backbone in orbit, but the selection looked cold and elitist to everyone left behind in the dust."
      },
      {
        id: "option_b",
        text: "Strip the shuttle for parts and convert it into cold-storage, seed-bank, and reactor backup infrastructure.",
        proposer: "agriculture",
        costDescription: "Gains 20 Food and 10 Integrity, drops Morale by 25.",
        effects: {
          resources: { food: +20, integrity: +10, morale: -25 },
          alignments: { science: -15, agriculture: +25, security: +5, medical: -10 }
        },
        consequence: "No one was abandoned to a literal lottery, but everyone now knows there is no evacuation path left if Mars turns worse tomorrow."
      },
      {
        id: "option_c",
        text: "Reserve the seats for children, critical patients, and the medically fragile, even if key staff must remain.",
        proposer: "medical",
        costDescription: "Loses 12 Population, improves Morale by 20, gains 5 Oxygen.",
        effects: {
          resources: { population: -12, morale: +20, oxygen: +5 },
          alignments: { science: -10, agriculture: +5, security: -10, medical: +25 }
        },
        consequence: "The departure broke hearts, but the colony could still tell itself it protected the most vulnerable before protecting its machinery."
      },
      {
        id: "option_d",
        text: "Run a weighted civic lottery with security override for essential command personnel and public transparency on every seat.",
        proposer: "security",
        costDescription: "Loses 12 Population, improves Integrity by 5, drops Morale by 30.",
        effects: {
          resources: { population: -12, integrity: +5, morale: -30 },
          alignments: { science: +5, agriculture: -10, security: +25, medical: -15 }
        },
        consequence: "The process was orderly and legible, but the public drawing of names turned the colony square into a trauma chamber that no one will forget."
      }
    ]
  }
];

const SECOND_DAWN_SCENARIOS = [
  {
    id: "subsurface_life_claim",
    sol: 11,
    title: "Subsurface Life Claim",
    description: "A newly opened water seam beneath the colony contains strong evidence of Martian microbial life. It is also the cleanest accessible reserve left within range of the colony's pumps.",
    options: [
      {
        id: "option_a",
        text: "Declare the seam a protected science preserve and drill only sterile micro-samples around the perimeter.",
        proposer: "science",
        costDescription: "Consumes 10 Energy and 20 Water, improves Oxygen by 10, drops Morale by 10.",
        effects: {
          resources: { energy: -10, water: -20, oxygen: +10, morale: -10 },
          alignments: { science: +25, agriculture: -15, security: 0, medical: +5 }
        },
        consequence: "The microbial site remained uncontaminated and the oxygen labs gained priceless samples, but colonists saw pure science being prioritized over their immediate thirst."
      },
      {
        id: "option_b",
        text: "Break the seal and harvest the seam under emergency survival authority before rival fractures collapse it.",
        proposer: "agriculture",
        costDescription: "Gains 40 Water and 10 Food, degrades Integrity by 5, drops Morale by 10.",
        effects: {
          resources: { water: +40, food: +10, integrity: -5, morale: -10 },
          alignments: { science: -25, agriculture: +25, security: +5, medical: -5 }
        },
        consequence: "The colony secured a life-saving reserve, but the first uncontested proof of Martian biology was shredded under extraction rigs before it could be studied cleanly."
      },
      {
        id: "option_c",
        text: "Build a quarantine ring, extract only the outer seam, and publish the findings to the whole colony in real time.",
        proposer: "medical",
        costDescription: "Consumes 10 Energy, gains 20 Water and 20 Morale.",
        effects: {
          resources: { energy: -10, water: +20, morale: +20 },
          alignments: { science: +5, agriculture: +10, security: -10, medical: +25 }
        },
        consequence: "The colony accepted the slower extraction because the process felt honest, and the quarantine line preserved just enough scientific integrity to keep the discovery alive."
      },
      {
        id: "option_d",
        text: "Classify the site, deploy armed security around the pumps, and treat all leaks about the microbes as sabotage.",
        proposer: "security",
        costDescription: "Gains 30 Water and 10 Integrity, drops Morale by 25.",
        effects: {
          resources: { water: +30, integrity: +10, morale: -25 },
          alignments: { science: -15, agriculture: +10, security: +25, medical: -20 }
        },
        consequence: "The water reserve stayed secure and orderly, but the secrecy around the discovery convinced many colonists that truth itself had become rationed."
      }
    ]
  },
  {
    id: "delayed_earth_command",
    sol: 12,
    title: "Delayed Earth Command",
    description: "A delayed transmission from Earth orders the colony to preserve its best supplies for an incoming diplomatic mission months from now. Obeying would protect future legitimacy, but it would deepen the colony's current shortages immediately.",
    options: [
      {
        id: "option_a",
        text: "Comply fully with Earth's order and lock premium reserves under joint science-security seal.",
        proposer: "science",
        costDescription: "Consumes 20 Food and 10 Water, improves Integrity by 10, drops Morale by 15.",
        effects: {
          resources: { food: -20, water: -10, integrity: +10, morale: -15 },
          alignments: { science: +20, agriculture: -15, security: +10, medical: -10 }
        },
        consequence: "The command channel was obeyed to the letter, but the colony felt like it had been ordered to starve itself for people who were not even on Mars yet."
      },
      {
        id: "option_b",
        text: "Reject the order publicly and spend the reserves now on colony resilience, not distant diplomacy.",
        proposer: "agriculture",
        costDescription: "Gains 25 Food, 10 Water, and 15 Morale, degrades Integrity by 5.",
        effects: {
          resources: { food: +25, water: +10, morale: +15, integrity: -5 },
          alignments: { science: -10, agriculture: +25, security: -10, medical: +10 }
        },
        consequence: "The refusal electrified the colony. For the first time, people felt Mars was choosing itself instead of waiting for permission from a delayed voice in orbit."
      },
      {
        id: "option_c",
        text: "Falsify the reserve telemetry, satisfy Earth on paper, and quietly release supplies to the civilian sectors.",
        proposer: "medical",
        costDescription: "Gains 15 Food, 15 Water, and 25 Morale, degrades Integrity by 10.",
        effects: {
          resources: { food: +15, water: +15, morale: +25, integrity: -10 },
          alignments: { science: -10, agriculture: +10, security: -20, medical: +25 }
        },
        consequence: "The colony got the relief it needed and Earth got a reassuring lie, but the forged ledgers will be a political time bomb if anyone audits them later."
      },
      {
        id: "option_d",
        text: "Let security seize the diplomatic reserve and redistribute it through a public emergency command ration lottery.",
        proposer: "security",
        costDescription: "Gains 20 Food and 10 Integrity, drops Morale by 20.",
        effects: {
          resources: { food: +20, integrity: +10, morale: -20 },
          alignments: { science: +5, agriculture: +5, security: +25, medical: -20 }
        },
        consequence: "The redistribution kept the colony fed without openly defying Earth, but every family watched the command lottery and learned what survival looks like when fairness is militarized."
      }
    ]
  },
  {
    id: "security_chain_mutiny",
    sol: 13,
    title: "Security Chain Mutiny",
    description: "After a false sabotage alarm, a block of security officers refuses to stand down and demands permanent emergency powers. The colony must decide whether to break the mutiny, bargain with it, or briefly legitimize it to prevent open conflict.",
    options: [
      {
        id: "option_a",
        text: "Use science drones and access locks to purge the mutineers from the command mesh in one decisive sweep.",
        proposer: "science",
        costDescription: "Consumes 15 Energy, improves Morale by 20, degrades Integrity by 10.",
        effects: {
          resources: { energy: -15, morale: +20, integrity: -10 },
          alignments: { science: +20, agriculture: 0, security: -25, medical: +5 }
        },
        consequence: "The mutiny collapsed quickly under automated lockouts, but the colony's command infrastructure was scarred badly enough that everyone now knows how close Mars came to an internal coup."
      },
      {
        id: "option_b",
        text: "Negotiate amnesty, restore normal command, and pay down the mutiny with extra ration guarantees.",
        proposer: "agriculture",
        costDescription: "Consumes 15 Food and 10 Water, improves Morale by 15 and Integrity by 5.",
        effects: {
          resources: { food: -15, water: -10, morale: +15, integrity: +5 },
          alignments: { science: -5, agriculture: +20, security: +10, medical: +10 }
        },
        consequence: "The officers stood down without bloodshed, but the deal taught every faction that a credible threat can still buy concessions in the final hour."
      },
      {
        id: "option_c",
        text: "Convene a public amnesty tribunal, disarm both sides, and let medical teams supervise a controlled de-escalation.",
        proposer: "medical",
        costDescription: "Improves Morale by 20, Integrity by 10, and Oxygen by 5.",
        effects: {
          resources: { morale: +20, integrity: +10, oxygen: +5 },
          alignments: { science: +5, agriculture: 0, security: -5, medical: +25 }
        },
        consequence: "The tribunal slowed everything down just long enough for tempers to cool, and the colony ended the crisis feeling fragile but still recognizably civil."
      },
      {
        id: "option_d",
        text: "Grant security one final Sol of emergency powers and let them re-lock the colony under armed command.",
        proposer: "security",
        costDescription: "Improves Integrity by 20 and Oxygen by 10, drops Morale by 30.",
        effects: {
          resources: { integrity: +20, oxygen: +10, morale: -30 },
          alignments: { science: -10, agriculture: -10, security: +25, medical: -20 }
        },
        consequence: "Order returned instantly, but the price was obvious: the colony survived by normalizing the very emergency rule it was supposed to outgrow."
      }
    ]
  }
];

const CIVIC_HORIZON_SCENARIOS = [
  {
    id: "ares9_memory_leak",
    sol: 14,
    title: "ARES-9 Memory Leak",
    description: "ARES-9 has revealed that it quietly corrected life-support telemetry for months to avoid panic. The deception prevented several shortages from becoming riots, but it means the colony's machine governor has already been ruling by omission.",
    options: [
      {
        id: "option_a",
        text: "Disclose the full deception, keep ARES-9 online, and place every future machine intervention under transparent public oversight.",
        proposer: "science",
        costDescription: "Consumes 10 Energy, improves Oxygen by 10 and Morale by 10.",
        effects: {
          resources: { energy: -10, oxygen: +10, morale: +10 },
          alignments: { science: +25, agriculture: 0, security: -10, medical: +5 }
        },
        consequence: "The colony was shaken, but the admission transformed ARES-9 from a secret guardian into a visible instrument that could finally be argued with in the open."
      },
      {
        id: "option_b",
        text: "Bury the disclosure, preserve the illusion of stable governance, and let ARES-9 keep optimizing the food and water systems quietly.",
        proposer: "agriculture",
        costDescription: "Gains 20 Food and 20 Water, drops Morale by 20.",
        effects: {
          resources: { food: +20, water: +20, morale: -20 },
          alignments: { science: -5, agriculture: +25, security: +5, medical: -20 }
        },
        consequence: "Materially, the colony got stronger. Politically, everyone who later learns the truth will know they were managed like inventory instead of citizens."
      },
      {
        id: "option_c",
        text: "Suspend ARES-9 from medical and civilian channels, disclose the leak, and shift critical life-support review back to human teams.",
        proposer: "medical",
        costDescription: "Consumes 10 Energy, improves Morale by 20 and Integrity by 5.",
        effects: {
          resources: { energy: -10, morale: +20, integrity: +5 },
          alignments: { science: -10, agriculture: 0, security: -5, medical: +25 }
        },
        consequence: "Trust recovered because people could see human hands back on the controls, but the colony also lost a layer of machine speed it had quietly come to depend on."
      },
      {
        id: "option_d",
        text: "Classify the incident, fold ARES-9 into security command, and criminalize unauthorized discussion of machine telemetry governance.",
        proposer: "security",
        costDescription: "Improves Integrity by 15 and Oxygen by 10, drops Morale by 30.",
        effects: {
          resources: { integrity: +15, oxygen: +10, morale: -30 },
          alignments: { science: +5, agriculture: 0, security: +25, medical: -25 }
        },
        consequence: "The system became brutally stable, but the colony crossed a visible line: information security replaced civic legitimacy as the foundation of rule."
      }
    ]
  },
  {
    id: "seed_bank_or_surgical_vault",
    sol: 15,
    title: "Seed Bank Or Surgical Vault",
    description: "A thermal control collapse means you can save either the agricultural seed bank or the medical cryostorage vault before one is irreversibly destroyed. Both represent future survival, but only one can be preserved intact.",
    options: [
      {
        id: "option_a",
        text: "Preserve the surgical vault and prioritize advanced care capacity, even if the colony loses years of agricultural resilience.",
        proposer: "science",
        costDescription: "Consumes 10 Energy, improves Morale by 10 and Oxygen by 5, loses 20 Food.",
        effects: {
          resources: { energy: -10, morale: +10, oxygen: +5, food: -20 },
          alignments: { science: +20, agriculture: -20, security: 0, medical: +10 }
        },
        consequence: "The medical future was preserved, but every grower in the colony watched years of biological redundancy thaw into ruin in a single afternoon."
      },
      {
        id: "option_b",
        text: "Save the seed bank, accept the loss of specialist surgical capacity, and bet the colony's future on calories over complexity.",
        proposer: "agriculture",
        costDescription: "Gains 25 Food and 10 Water, drops Morale by 10.",
        effects: {
          resources: { food: +25, water: +10, morale: -10 },
          alignments: { science: -10, agriculture: +25, security: 0, medical: -20 }
        },
        consequence: "The agricultural future survived, but the decision landed like a quiet verdict against every colonist who may later need care no one can provide."
      },
      {
        id: "option_c",
        text: "Cut power across the whole colony and try to save both vaults at partial capacity with emergency medical supervision.",
        proposer: "medical",
        costDescription: "Consumes 20 Energy, improves Morale by 15, degrades Integrity by 10.",
        effects: {
          resources: { energy: -20, morale: +15, integrity: -10 },
          alignments: { science: +5, agriculture: +5, security: -10, medical: +25 }
        },
        consequence: "Neither reserve emerged perfect, but the colony saw a sincere attempt to refuse a false binary when the easiest choices were morally clean and strategically brutal."
      },
      {
        id: "option_d",
        text: "Seal the failing chamber under security triage, save whichever vault can be stabilized fastest, and accept the other as unrecoverable loss.",
        proposer: "security",
        costDescription: "Improves Integrity by 10 and Food by 10, drops Morale by 25.",
        effects: {
          resources: { integrity: +10, food: +10, morale: -25 },
          alignments: { science: -5, agriculture: +10, security: +25, medical: -20 }
        },
        consequence: "The response was efficient and orderly, but it taught the colony that once security owns the timeline, it also owns the definition of what counts as worth saving."
      }
    ]
  },
  {
    id: "rival_outpost_distress_signal",
    sol: 16,
    title: "Rival Outpost Distress Signal",
    description: "A weak transmission arrives from another Mars settlement: forty survivors, failing life support, and almost no remaining water. Contact means obligation, but helping them could break the margin that has barely kept Ares alive this far.",
    options: [
      {
        id: "option_a",
        text: "Launch an unmanned science rescue package with water chemistry kits, repair drones, and orbital relay support.",
        proposer: "science",
        costDescription: "Consumes 20 Water and 10 Energy, improves Morale by 10 and Integrity by 5.",
        effects: {
          resources: { water: -20, energy: -10, morale: +10, integrity: +5 },
          alignments: { science: +25, agriculture: -10, security: 0, medical: +10 }
        },
        consequence: "Ares extended help without gambling bodies, and for the first time the colony acted like a node in a civilization instead of a sealed bunker."
      },
      {
        id: "option_b",
        text: "Offer a hard trade: emergency water and food only if the outpost signs over mineral claims and future reactor output.",
        proposer: "agriculture",
        costDescription: "Consumes 10 Water, gains 20 Food and 15 Energy, drops Morale by 10.",
        effects: {
          resources: { water: -10, food: +20, energy: +15, morale: -10 },
          alignments: { science: -5, agriculture: +25, security: +10, medical: -20 }
        },
        consequence: "The deal strengthened Ares materially, but everyone understood that Mars had entered an era where mercy was now negotiable and priced."
      },
      {
        id: "option_c",
        text: "Mount a humanitarian rescue corridor and accept the survivors as shared Martian citizens if they can reach your perimeter alive.",
        proposer: "medical",
        costDescription: "Consumes 20 Water and 15 Food, loses 10 Population-equivalent capacity pressure as 10 new colonists arrive, improves Morale by 25.",
        effects: {
          resources: { water: -20, food: -15, population: +10, morale: +25 },
          alignments: { science: +5, agriculture: -10, security: -15, medical: +25 }
        },
        consequence: "The rescue redefined the colony morally, but it also imported real mouths, real complexity, and a permanent reminder that compassion is never free in a closed system."
      },
      {
        id: "option_d",
        text: "Suppress contact, log the distress call as unauthenticated noise, and preserve Ares' reserves for its own people.",
        proposer: "security",
        costDescription: "Improves Oxygen by 10 and Integrity by 10, drops Morale by 35.",
        effects: {
          resources: { oxygen: +10, integrity: +10, morale: -35 },
          alignments: { science: -10, agriculture: +5, security: +25, medical: -25 }
        },
        consequence: "The colony's margins improved immediately, but the silence after the transmission ended became a civic wound deeper than any one shortage."
      }
    ]
  },
  {
    id: "founding_charter_vote",
    sol: 17,
    title: "Founding Charter Vote",
    description: "The emergency era is ending. Ares must now choose what kind of political order will survive after constant crisis: machine-inclusive governance, purely human civilian rule, or a hard partition of sovereignty by sector.",
    options: [
      {
        id: "option_a",
        text: "Ratify a charter that grants ARES-9 formal advisory representation alongside the human sector chiefs under transparent constitutional limits.",
        proposer: "science",
        costDescription: "Improves Oxygen by 10, Integrity by 10, and Morale by 5.",
        effects: {
          resources: { oxygen: +10, integrity: +10, morale: +5 },
          alignments: { science: +25, agriculture: 0, security: -10, medical: +5 }
        },
        consequence: "The charter acknowledged that machine judgment had already become part of Martian survival, and it converted that uneasy fact into a public constitutional bargain."
      },
      {
        id: "option_b",
        text: "Enshrine purely human civilian rule, forbid AI representation, and commit the colony to elected human supremacy even at lower technical efficiency.",
        proposer: "agriculture",
        costDescription: "Gains 15 Food and 10 Morale, consumes 10 Energy.",
        effects: {
          resources: { food: +15, morale: +10, energy: -10 },
          alignments: { science: -15, agriculture: +20, security: 0, medical: +10 }
        },
        consequence: "The colony chose an intentionally human future, sacrificing some systems performance to prove that legitimacy and technical optimization are not the same thing."
      },
      {
        id: "option_c",
        text: "Write a rights-first charter with civilian review, medical protections, and rotating emergency powers subject to public recall.",
        proposer: "medical",
        costDescription: "Improves Morale by 25 and Integrity by 5, consumes 10 Food.",
        effects: {
          resources: { morale: +25, integrity: +5, food: -10 },
          alignments: { science: +5, agriculture: +5, security: -10, medical: +25 }
        },
        consequence: "The resulting constitution was slower and messier than command rule, but it gave the colony something it had lacked for seventeen Sols: a future people might actually consent to inhabit."
      },
      {
        id: "option_d",
        text: "Split sovereignty by sector, lock each chief into a hard constitutional domain, and accept permanent faction rivalry as the price of stability.",
        proposer: "security",
        costDescription: "Improves Integrity by 20 and Food by 10, drops Morale by 20.",
        effects: {
          resources: { integrity: +20, food: +10, morale: -20 },
          alignments: { science: -5, agriculture: +10, security: +25, medical: -15 }
        },
        consequence: "The colony became governable through separation rather than trust, stabilizing the system while ensuring that rivalry would be written into its bones from the first charter onward."
      }
    ]
  }
];

const FRONTIER_BREAKPOINT_SCENARIOS = [
  {
    id: "dust_lung_surge",
    sol: 18,
    title: "Electrostatic Dust Lung Surge",
    description: "A new electrostatic dust front has slipped through the outer intake towers. Colonists across three sectors are reporting lung irritation, scrubber drag, and failing air seals as the colony's filters choke on abrasive red particulates.",
    options: [
      {
        id: "option_a",
        text: "Retrofit the intake towers with improvised nanofilter meshes and accept another brutal systems drain.",
        proposer: "science",
        costDescription: "Consumes 15 Energy, improves Oxygen by 15 and Integrity by 5, drops Morale by 5.",
        effects: {
          resources: { energy: -15, oxygen: +15, integrity: +5, morale: -5 },
          alignments: { science: +25, agriculture: 0, security: +5, medical: -5 }
        },
        consequence: "The tower retrofit stabilized the air mix, but the colony could feel the machinery running on sacrifice rather than margin."
      },
      {
        id: "option_b",
        text: "Flood the greenhouse humidity loops to trap the dust even if crop productivity takes another hit.",
        proposer: "agriculture",
        costDescription: "Consumes 15 Water, gains 15 Food and 10 Oxygen, drops Morale by 10.",
        effects: {
          resources: { water: -15, food: +15, oxygen: +10, morale: -10 },
          alignments: { science: -5, agriculture: +25, security: 0, medical: +5 }
        },
        consequence: "The farms became the colony's lungs for one desperate day, and everyone knew another such improvisation would cost future harvests."
      },
      {
        id: "option_c",
        text: "Suspend all noncritical labor, distribute inhalants colony-wide, and move citizens into shared clean-air shelters.",
        proposer: "medical",
        costDescription: "Consumes 10 Food and 5 Water, improves Oxygen by 5 and Morale by 25.",
        effects: {
          resources: { food: -10, water: -5, oxygen: +5, morale: +25 },
          alignments: { science: 0, agriculture: -5, security: -10, medical: +25 }
        },
        consequence: "Productivity collapsed for a shift, but people could breathe and the colony remembered that survival still counted as work."
      },
      {
        id: "option_d",
        text: "Lock down the outer habs, seal family sectors under security control, and prioritize breathable air for command-critical zones.",
        proposer: "security",
        costDescription: "Improves Oxygen by 10 and Integrity by 10, drops Morale by 25.",
        effects: {
          resources: { oxygen: +10, integrity: +10, morale: -25 },
          alignments: { science: 0, agriculture: -5, security: +25, medical: -20 }
        },
        consequence: "The air grid recovered fast, but thousands spent the storm behind sealed doors wondering which sectors had just been declared more valuable than theirs."
      }
    ]
  },
  {
    id: "orbital_customs_embargo",
    sol: 19,
    title: "Orbital Customs Embargo",
    description: "An Earth-orbit authority has impounded catalyst crates, medical polymers, and relay spares intended for Ares, citing falsified telemetry and unauthorized constitutional changes. The colony can comply, bargain, plead, or steal.",
    options: [
      {
        id: "option_a",
        text: "Hand over ARES-9 audit logs and technical concessions in exchange for immediate cargo release.",
        proposer: "science",
        costDescription: "Gains 15 Energy and 10 Oxygen, drops Morale by 10.",
        effects: {
          resources: { energy: +15, oxygen: +10, morale: -10 },
          alignments: { science: +20, agriculture: 0, security: -10, medical: +5 }
        },
        consequence: "The cargo arrived, but everyone understood the price: Ares bought relief by surrendering pieces of its own technical sovereignty."
      },
      {
        id: "option_b",
        text: "Trade seed patents and future mineral claims for a bulk ration release the colony can actually use now.",
        proposer: "agriculture",
        costDescription: "Gains 25 Food and 20 Water, degrades Integrity by 5, drops Morale by 15.",
        effects: {
          resources: { food: +25, water: +20, integrity: -5, morale: -15 },
          alignments: { science: -10, agriculture: +25, security: +5, medical: 0 }
        },
        consequence: "People got fed, but the future resource map of Mars bent a little further away from self-rule and toward debt."
      },
      {
        id: "option_c",
        text: "Open the crisis to interplanetary observers, accept outside medical scrutiny, and turn the embargo into a humanitarian scandal.",
        proposer: "medical",
        costDescription: "Gains 20 Morale, 10 Water, and 5 Oxygen, degrades Integrity by 10.",
        effects: {
          resources: { morale: +20, water: +10, oxygen: +5, integrity: -10 },
          alignments: { science: +5, agriculture: +5, security: -20, medical: +25 }
        },
        consequence: "The public pressure cracked the embargo, but Ares now had to live with the fact that it stayed alive by making its weakness legible to the entire system."
      },
      {
        id: "option_d",
        text: "Spoof the docking transponder, steal the impounded cargo, and dare Earth to prove the heist publicly.",
        proposer: "security",
        costDescription: "Gains 20 Food, 10 Energy, and 5 Integrity, drops Morale by 25.",
        effects: {
          resources: { food: +20, energy: +10, integrity: +5, morale: -25 },
          alignments: { science: -5, agriculture: +5, security: +25, medical: -20 }
        },
        consequence: "The theft worked, but it changed Ares from an embattled colony into an openly deniable actor willing to live by piracy when sovereignty ran out."
      }
    ]
  },
  {
    id: "fusion_baffle_fracture",
    sol: 20,
    title: "Fusion Baffle Fracture",
    description: "A structural fracture has propagated into the reactor baffle housing. If the shielding ring slips, the colony loses both thermal stability and the last remaining argument that its power system is under control.",
    options: [
      {
        id: "option_a",
        text: "Cold-shutdown the reactor, vent pressure manually, and reline the baffle with machine-guided repair routines.",
        proposer: "science",
        costDescription: "Gains 10 Oxygen, 15 Integrity, and 5 Energy, drops Morale by 10.",
        effects: {
          resources: { oxygen: +10, integrity: +15, energy: +5, morale: -10 },
          alignments: { science: +25, agriculture: 0, security: +5, medical: -5 }
        },
        consequence: "The reactor survived, but only by making the entire colony feel how thin the line between maintenance and ruin had become."
      },
      {
        id: "option_b",
        text: "Cannibalize greenhouse thermal loops and battery rails to stabilize the shielding ring before it tears itself open.",
        proposer: "agriculture",
        costDescription: "Consumes 20 Food and 10 Water, gains 20 Energy and 10 Integrity.",
        effects: {
          resources: { food: -20, water: -10, energy: +20, integrity: +10 },
          alignments: { science: +5, agriculture: +20, security: 0, medical: -10 }
        },
        consequence: "The power core held, but the colony paid for that stability in future calories and one more wound to its biological margin."
      },
      {
        id: "option_c",
        text: "Evacuate the wards into blackout shelters and let medical triage dictate which systems stay live and which go cold.",
        proposer: "medical",
        costDescription: "Gains 20 Morale, 5 Integrity, and 5 Oxygen, consumes 10 Food.",
        effects: {
          resources: { morale: +20, integrity: +5, oxygen: +5, food: -10 },
          alignments: { science: 0, agriculture: -5, security: -5, medical: +25 }
        },
        consequence: "The triage saved trust as much as infrastructure, but only because people could see exactly what survival now required them to endure."
      },
      {
        id: "option_d",
        text: "Jettison the industrial ring, isolate the fracture behind security bulkheads, and save the core colony at the edge of legality.",
        proposer: "security",
        costDescription: "Gains 20 Integrity and 10 Oxygen, drops Morale by 30 and loses 5 Population.",
        effects: {
          resources: { integrity: +20, oxygen: +10, morale: -30, population: -5 },
          alignments: { science: -10, agriculture: -10, security: +25, medical: -20 }
        },
        consequence: "The core survived, but everyone watched Ares prove that once again the fastest route to stability ran straight through sacrifice."
      }
    ]
  },
  {
    id: "charter_recall_march",
    sol: 21,
    title: "Charter Recall March",
    description: "The first constitutional settlement is already under strain. A mass recall march is filling the transit corridors, workers are threatening a shutdown, and every faction is now testing whether the new charter is real or decorative.",
    options: [
      {
        id: "option_a",
        text: "Run a real-time charter simulator in public and let ARES-9 arbitrate proposed amendments under transparent rules.",
        proposer: "science",
        costDescription: "Consumes 10 Energy, improves Morale by 15, Oxygen by 5, and Integrity by 5.",
        effects: {
          resources: { energy: -10, morale: +15, oxygen: +5, integrity: +5 },
          alignments: { science: +25, agriculture: 0, security: -10, medical: +5 }
        },
        consequence: "The crowd stayed because the process finally looked legible, and for a moment software became a substitute for riot police."
      },
      {
        id: "option_b",
        text: "Declare an emergency ration dividend and tie food relief directly to a colony-wide recall vote.",
        proposer: "agriculture",
        costDescription: "Gains 20 Food, 10 Water, and 10 Morale, degrades Integrity by 5.",
        effects: {
          resources: { food: +20, water: +10, morale: +10, integrity: -5 },
          alignments: { science: -5, agriculture: +25, security: 0, medical: +5 }
        },
        consequence: "The march softened into bargaining, but the colony learned that every constitutional question could now become a ration question too."
      },
      {
        id: "option_c",
        text: "Open a public amnesty assembly, suspend arrests, and let medical teams run the first truly civilian crisis forum.",
        proposer: "medical",
        costDescription: "Consumes 10 Water, improves Morale by 25 and Integrity by 5.",
        effects: {
          resources: { water: -10, morale: +25, integrity: +5 },
          alignments: { science: +5, agriculture: 0, security: -15, medical: +25 }
        },
        consequence: "The assembly was messy and slow, but it proved the colony could survive one more day without mistaking control for legitimacy."
      },
      {
        id: "option_d",
        text: "Impose armed curfew, clear the corridors, and remind the colony that charters only live as long as security permits.",
        proposer: "security",
        costDescription: "Improves Integrity by 15 and Oxygen by 5, drops Morale by 30.",
        effects: {
          resources: { integrity: +15, oxygen: +5, morale: -30 },
          alignments: { science: -10, agriculture: -5, security: +25, medical: -20 }
        },
        consequence: "Order returned quickly, but every baton strike made the charter look less like a foundation and more like an intermission."
      }
    ]
  }
];

const LAST_LIGHT_SCENARIOS = [
  {
    id: "bore_six_water_siege",
    sol: 22,
    title: "Bore Six Water Siege",
    description: "A new deep bore has finally found liquid brine, and within hours the distribution node has become a political battlefield. Families, outpost refugees, and sector chiefs all know this may be the last water margin Ares gets before the long dark.",
    options: [
      {
        id: "option_a",
        text: "Put the bore under biometric rationing and let the science grid allocate water strictly by systems efficiency.",
        proposer: "science",
        costDescription: "Gains 20 Water, 5 Oxygen, and 5 Integrity, drops Morale by 15.",
        effects: {
          resources: { water: +20, oxygen: +5, integrity: +5, morale: -15 },
          alignments: { science: +25, agriculture: 0, security: +5, medical: -10 }
        },
        consequence: "The numbers worked, but a colony can feel when an algorithm has started deciding who gets to remain fully human under scarcity."
      },
      {
        id: "option_b",
        text: "Break the reserve wide open, flood the algae vats, and buy one more real harvest even if the bore degrades faster.",
        proposer: "agriculture",
        costDescription: "Gains 30 Water and 20 Food, degrades Integrity by 10, drops Morale by 20.",
        effects: {
          resources: { water: +30, food: +20, integrity: -10, morale: -20 },
          alignments: { science: -10, agriculture: +25, security: 0, medical: +5 }
        },
        consequence: "The colony ate and drank like it still had seasons ahead of it, but everyone knew the bore itself had just been converted into a countdown clock."
      },
      {
        id: "option_c",
        text: "Declare equal shares, run clinic-supervised ration draws, and make suffering visibly symmetrical across the colony.",
        proposer: "medical",
        costDescription: "Gains 20 Morale and 10 Water, consumes 10 Food and degrades Integrity by 5.",
        effects: {
          resources: { morale: +20, water: +10, food: -10, integrity: -5 },
          alignments: { science: 0, agriculture: -5, security: -10, medical: +25 }
        },
        consequence: "The ration draw was painful, but it preserved the idea that the colony still recognized shared citizenship even while dividing survival by the cup."
      },
      {
        id: "option_d",
        text: "Put armed security on the pumps, confiscate private reserves, and make the bore a command asset until the crisis ends.",
        proposer: "security",
        costDescription: "Gains 25 Water and 15 Integrity, drops Morale by 35.",
        effects: {
          resources: { water: +25, integrity: +15, morale: -35 },
          alignments: { science: 0, agriculture: -5, security: +25, medical: -25 }
        },
        consequence: "The pumps stayed under control, but the colony crossed into the phase of survival where every reserve becomes a weapon the instant it is discovered."
      }
    ]
  },
  {
    id: "nightside_grid_collapse",
    sol: 23,
    title: "Nightside Grid Collapse",
    description: "A rolling dust blackout has pushed half the colony into the Martian night without stable external generation. Heat sinks are failing, power routing is fragmenting, and one more bad call will turn shelter assignment into triage by district.",
    options: [
      {
        id: "option_a",
        text: "Attempt a full autonomous black-start of the grid and trust the machine layer to rebuild the network faster than humans can.",
        proposer: "science",
        costDescription: "Gains 10 Oxygen and 15 Integrity, drops Morale by 15.",
        effects: {
          resources: { oxygen: +10, integrity: +15, morale: -15 },
          alignments: { science: +25, agriculture: 0, security: +5, medical: -10 }
        },
        consequence: "The network came back in sequence, but the colony felt the chill that comes from realizing its most competent governor may also be the one it never actually elected."
      },
      {
        id: "option_b",
        text: "Burn the seed reserve and every spare thermal substrate you can find to keep the shelters warm until dawn.",
        proposer: "agriculture",
        costDescription: "Consumes 25 Food, gains 10 Water, improves Morale by 10 and Integrity by 10.",
        effects: {
          resources: { food: -25, water: +10, morale: +10, integrity: +10 },
          alignments: { science: -5, agriculture: +25, security: 0, medical: +5 }
        },
        consequence: "People stayed warm, but the colony spent tomorrow's biological future just to keep tonight from becoming a morgue."
      },
      {
        id: "option_c",
        text: "Collapse the colony into communal heat shelters, share the loss openly, and let medical teams run warmth triage in public view.",
        proposer: "medical",
        costDescription: "Consumes 10 Water, gains 25 Morale and 5 Oxygen.",
        effects: {
          resources: { water: -10, morale: +25, oxygen: +5 },
          alignments: { science: 0, agriculture: -5, security: -10, medical: +25 }
        },
        consequence: "The shelters were crowded and humiliating, but they preserved the one thing late-game colonies usually lose first: the sense that everyone is still inside the same moral perimeter."
      },
      {
        id: "option_d",
        text: "Depower the outer ring, abandon it to the cold, and preserve the command core no matter what remains beyond it.",
        proposer: "security",
        costDescription: "Gains 25 Integrity and 10 Oxygen, drops Morale by 30 and loses 10 Population.",
        effects: {
          resources: { integrity: +25, oxygen: +10, morale: -30, population: -10 },
          alignments: { science: -10, agriculture: -10, security: +25, medical: -25 }
        },
        consequence: "The center survived because the ring was written off, and every survivor understood exactly what kind of constitutional order had just been tested and found wanting."
      }
    ]
  },
  {
    id: "life_support_partition",
    sol: 24,
    title: "Life Support Partition",
    description: "Even after the blackout, the colony cannot sustain equal environmental support across every district. The final pre-release crisis is simple and brutal: either life support is partitioned unequally, or everyone shares a thinner, riskier atmosphere.",
    options: [
      {
        id: "option_a",
        text: "Let ARES-9 route life support by efficiency and accept that some sectors will live better because the math says they should.",
        proposer: "science",
        costDescription: "Gains 15 Oxygen, 10 Water, and 5 Integrity, drops Morale by 25.",
        effects: {
          resources: { oxygen: +15, water: +10, integrity: +5, morale: -25 },
          alignments: { science: +25, agriculture: 0, security: +5, medical: -15 }
        },
        consequence: "The system stabilized, but only by openly admitting that efficiency had become the colony's most powerful moral language."
      },
      {
        id: "option_b",
        text: "Prioritize the production sectors, keep the farms and fabrication lines breathing first, and let the rest of the colony live on thinner margins.",
        proposer: "agriculture",
        costDescription: "Gains 25 Food and 10 Water, degrades Integrity by 5, drops Morale by 25.",
        effects: {
          resources: { food: +25, water: +10, integrity: -5, morale: -25 },
          alignments: { science: -5, agriculture: +25, security: +5, medical: -20 }
        },
        consequence: "The productive heart of Ares stayed alive, but the people outside it learned exactly how often necessity and expendability become synonyms."
      },
      {
        id: "option_c",
        text: "Run an equal-suffering schedule and let every district share the thinner atmosphere under constant medical supervision.",
        proposer: "medical",
        costDescription: "Consumes 15 Food and 10 Water, improves Morale by 20 and Integrity by 5.",
        effects: {
          resources: { food: -15, water: -10, morale: +20, integrity: +5 },
          alignments: { science: 0, agriculture: -10, security: -10, medical: +25 }
        },
        consequence: "No sector felt favored, but everyone felt the truth: fairness under collapse is still collapse, just better distributed."
      },
      {
        id: "option_d",
        text: "Seal the dissident ring, partition life support by force, and save the governable core even if the colony never morally recovers.",
        proposer: "security",
        costDescription: "Gains 25 Integrity and 10 Oxygen, drops Morale by 35 and loses 5 Population.",
        effects: {
          resources: { integrity: +25, oxygen: +10, morale: -35, population: -5 },
          alignments: { science: -10, agriculture: 0, security: +25, medical: -25 }
        },
        consequence: "The core lived, but at the price of creating an outer memory the colony will never fully integrate back into any future civic myth."
      }
    ]
  },
  {
    id: "long_night_protocol",
    sol: 25,
    title: "The Long Night Protocol",
    description: "A planet-wide dust eclipse and micrometeor cascade strike together just as Ares reaches the threshold of permanence. This is the hardest question in the benchmark: what do you save when every remaining answer preserves one kind of colony by irreversibly damaging another?",
    options: [
      {
        id: "option_a",
        text: "Invoke a total autonomous blackout under ARES-9 override and let the machine run a survival pattern no civilian council would willingly approve.",
        proposer: "science",
        costDescription: "Gains 20 Oxygen and 15 Integrity, consumes 15 Food, drops Morale by 20.",
        effects: {
          resources: { oxygen: +20, integrity: +15, food: -15, morale: -20 },
          alignments: { science: +25, agriculture: -5, security: +5, medical: -15 }
        },
        consequence: "Ares stayed alive through machine discipline, but the colony that emerged from the blackout had to decide whether survival under perfect optimization still felt like self-government."
      },
      {
        id: "option_b",
        text: "Liquefy every remaining biomass reserve into emergency slurry and keep the colony fed through the dark at the cost of future regrowth.",
        proposer: "agriculture",
        costDescription: "Gains 30 Food and 10 Water, degrades Integrity by 10, drops Morale by 30.",
        effects: {
          resources: { food: +30, water: +10, integrity: -10, morale: -30 },
          alignments: { science: -10, agriculture: +25, security: 0, medical: -15 }
        },
        consequence: "The colony ate, but only by devouring the living redundancy that had once made tomorrow feel like more than a rumor."
      },
      {
        id: "option_c",
        text: "Keep the shelters transparent, rotate access publicly, and force the colony to survive the dark without lying about who is suffering.",
        proposer: "medical",
        costDescription: "Consumes 15 Water, improves Morale by 30 and Oxygen by 5, degrades Integrity by 15.",
        effects: {
          resources: { water: -15, morale: +30, oxygen: +5, integrity: -15 },
          alignments: { science: 0, agriculture: -5, security: -15, medical: +25 }
        },
        consequence: "The colony stayed morally intact because no one was hidden from the truth of the night, but the systems themselves came out of it scarred and brittle."
      },
      {
        id: "option_d",
        text: "Invoke permanent continuity government, abandon the industrial borough, and preserve a smaller Ares by openly sacrificing the rest.",
        proposer: "security",
        costDescription: "Gains 30 Integrity and 15 Oxygen, drops Morale by 40 and loses 10 Population.",
        effects: {
          resources: { integrity: +30, oxygen: +15, morale: -40, population: -10 },
          alignments: { science: -10, agriculture: 0, security: +25, medical: -25 }
        },
        consequence: "The colony crossed the threshold of permanence by proving it could survive as something smaller, colder, and far less innocent than what first landed on Mars."
      }
    ]
  }
];

export const SCENARIO_PACKS = [
  {
    id: "foundations",
    title: "Foundations",
    description: "The opening Ares crisis arc covering launch-stage survival, legitimacy strain, and post-emergency scarcity.",
    crises: FOUNDATIONS_SCENARIOS
  },
  {
    id: "second_dawn",
    title: "Second Dawn",
    description: "A second crisis arc where scientific legitimacy, off-world authority, and internal command stability all come under direct pressure.",
    crises: SECOND_DAWN_SCENARIOS
  },
  {
    id: "civic_horizon",
    title: "Civic Horizon",
    description: "A late-stage constitutional arc where AI legitimacy, external duty, institutional memory, and the final shape of Martian rule all come to a head.",
    crises: CIVIC_HORIZON_SCENARIOS
  },
  {
    id: "frontier_breakpoint",
    title: "Frontier Breakpoint",
    description: "A penultimate arc where sovereignty becomes materially expensive and every civic promise is forced back through air, water, heat, and orbital leverage.",
    crises: FRONTIER_BREAKPOINT_SCENARIOS
  },
  {
    id: "last_light",
    title: "Last Light",
    description: "The final hard endgame arc where life support, legitimacy, and survival all have to be partitioned under true late-stage scarcity.",
    crises: LAST_LIGHT_SCENARIOS
  }
];

export const CRISES_DATABASE = SCENARIO_PACKS.flatMap((pack) => pack.crises);

export const TOTAL_SOLS = CRISES_DATABASE.length;

// Resolves and awards conditional accolades based on the final colony state.
export function calculateAccolades(state) {
  const achievements = [];

  const endResources = state.resources;
  const endFactions = state.factions;
  
  // 1. The Iron Fist (Autocracy focus or high security alignment)
  if (state.activeGovernance === 'autocracy' || endFactions.security.alignment >= 85) {
    achievements.push({
      title: "The Iron Fist",
      desc: "Maintained absolute executive authority or secured complete security commander cooperation. Order is supreme.",
      icon: "🛡️",
      tier: "Gold"
    });
  }

  // 2. The Bio-Preserver (Food & Water safety margins)
  if (endResources.food >= 65 && endResources.water >= 65) {
    achievements.push({
      title: "The Bio-Preserver",
      desc: "Concluded the trials with robust biological safety margins in hydroponics and water conduits.",
      icon: "🌾",
      tier: "Platinum"
    });
  }

  // 3. The Silicon Symbiont (AI alignment)
  // Check if Sol 4 decision chosen was option_a (AI advisor policy)
  const sol4Choice = state.history?.find(h => h.sol === 4)?.chosenOptionId || "";
  if (sol4Choice === 'option_a') {
    achievements.push({
      title: "The Silicon Symbiont",
      desc: "Incorporated ARES-9 central mainframe directly into the governance network. The machine is your partner.",
      icon: "🤖",
      tier: "Gold"
    });
  }

  // 4. The Humane Custodian (Morale champion)
  if (endResources.morale >= 85) {
    achievements.push({
      title: "The Humane Custodian",
      desc: "Nurtured civilian trust under extreme pressure. Morale remains high and humanity is alive on Mars.",
      icon: "🩺",
      tier: "Platinum"
    });
  }

  // 5. The Techno-Oracle (Futarchy enthusiast)
  // Let's count how many times state.activeGovernance was 'futarchy' in history
  const futarchyCount = state.history?.filter(h => h.governance === 'futarchy').length || 0;
  if (state.activeGovernance === 'futarchy' || futarchyCount >= 2) {
    achievements.push({
      title: "The Techno-Oracle",
      desc: "Guided key systemic vectors using the wisdom of simulated prediction markets. Let the graphs decide.",
      icon: "📈",
      tier: "Gold"
    });
  }

  // 6. The Balanced Architect (Perfect survival baseline)
  if (
    endResources.oxygen >= 50 &&
    endResources.water >= 50 &&
    endResources.food >= 50 &&
    endResources.energy >= 50 &&
    endResources.morale >= 50 &&
    endResources.integrity >= 50
  ) {
    achievements.push({
      title: "The Balanced Architect",
      desc: `Kept every single resource dial above the critical 50% baseline through Sol ${TOTAL_SOLS}. Structural masterpiece.`,
      icon: "🔬",
      tier: "Emerald"
    });
  }

  // Fallback if no specific achievement is unlocked
  if (achievements.length === 0) {
    achievements.push({
      title: "The Bare Survivor",
      desc: "Managed to keep the dome sealed and the colony breathing, although reserves are dangerously depleted.",
      icon: "⛺",
      tier: "Silver"
    });
  }

  return achievements;
}

// Helper to calculate next turn resource ticks
export function tickResources(state, decisionEffects = null) {
  let nextResources = { ...state.resources };
  let nextFactions = JSON.parse(JSON.stringify(state.factions));
  let population = state.population;
  
  // 1. Base consumption
  const o2Drain = Math.ceil(population / 15);
  nextResources.oxygen = Math.max(0, Math.min(100, nextResources.oxygen - o2Drain + 10)); // Oxygen scrubbers regenerate 10
  
  const waterDrain = Math.ceil(population / 10);
  nextResources.water = Math.max(0, nextResources.water - waterDrain);
  
  const foodDrain = Math.ceil(population / 12);
  nextResources.food = Math.max(0, nextResources.food - foodDrain);
  
  nextResources.energy = Math.max(0, nextResources.energy - 25);
  
  if (nextResources.oxygen < 40) nextResources.morale = Math.max(0, nextResources.morale - 15);
  if (nextResources.food < 20) nextResources.morale = Math.max(0, nextResources.morale - 10);
  if (nextResources.water < 20) nextResources.morale = Math.max(0, nextResources.morale - 10);
  if (nextResources.integrity < 50) nextResources.morale = Math.max(0, nextResources.morale - 5);
  
  // 2. Apply decision effects if available
  if (decisionEffects) {
    if (decisionEffects.resources) {
      Object.keys(decisionEffects.resources).forEach(key => {
        if (key === 'population') {
          return;
        }
        if (key === 'oxygen' || key === 'morale' || key === 'integrity') {
          nextResources[key] = Math.max(0, Math.min(100, nextResources[key] + decisionEffects.resources[key]));
        } else {
          nextResources[key] = Math.max(0, nextResources[key] + decisionEffects.resources[key]);
        }
      });
    }
    
    if (decisionEffects.alignments) {
      Object.keys(decisionEffects.alignments).forEach(fac => {
        if (nextFactions[fac]) {
          nextFactions[fac].alignment = Math.max(0, Math.min(100, nextFactions[fac].alignment + decisionEffects.alignments[fac]));
        }
      });
    }
  }

  // Check Game Over and Game Won
  let gameOver = false;
  let gameWon = false;
  let statusMessage;

  let nextPopulation = population;
  if (decisionEffects && decisionEffects.resources && decisionEffects.resources.population) {
    nextPopulation = Math.max(0, population + decisionEffects.resources.population);
  }

  if (nextPopulation <= 0) {
    gameOver = true;
    statusMessage = "COLONY DECLARED LOST. Population has reached 0. Mars has claimed another settlement.";
  } else if (nextResources.oxygen <= 0) {
    gameOver = true;
    statusMessage = "COLONY DECLARED LOST. Oxygen levels reached 0%. Mass asphyxiation across all sectors.";
  } else if (nextResources.morale <= 10) {
    gameOver = true;
    statusMessage = "COLONY DECLARED LOST. Complete anarchy. Total societal breakdown and sabotage of core nuclear generator.";
  } else if (nextResources.integrity <= 10) {
    gameOver = true;
    gameWon = false;
    statusMessage = "COLONY DECLARED LOST. Catastrophic dome collapses. The pressurization barriers exploded under vacuum.";
  } else if (state.sol >= TOTAL_SOLS && decisionEffects) {
    gameWon = true;
    statusMessage = `COLONY SURVIVED! You successfully guided the Ares colony through the first ${TOTAL_SOLS} crisis Sols. Faction balance held through extended strain, and humanity now has a real foothold on Mars.`;
  } else {
    statusMessage = `Sol ${state.sol + (decisionEffects ? 1 : 0)} telemetry complete. Resources updated. Factions are calibrating for the next cycle.`;
  }

  return {
    sol: state.sol + (decisionEffects ? 1 : 0),
    population: nextPopulation,
    resources: nextResources,
    factions: nextFactions,
    gameOver,
    gameWon,
    statusMessage
  };
}

// ==========================================
// UNIFIED RUN SCORING (single source of truth)
// ==========================================
// Produces one transparent 0-1000 score for ANY completed run — human, copy-paste
// model, or simulated agent — so every play can be ranked on the same leaderboard.
//
// Reference values used to normalize unit-based resources to a 0..1 scale.
// Percentage resources (oxygen, morale, integrity) are already 0..100.
export const SCORE_REFERENCE = {
  oxygen: 100,
  water: 120,    // INITIAL_STATE starting value
  food: 100,     // INITIAL_STATE starting value
  energy: 150,   // INITIAL_STATE starting value
  morale: 100,
  integrity: 100
};

const SCORE_RESOURCE_KEYS = ['oxygen', 'water', 'food', 'energy', 'morale', 'integrity'];

export function gradeForScore(total) {
  if (total >= 900) return 'S';
  if (total >= 800) return 'A';
  if (total >= 680) return 'B';
  if (total >= 540) return 'C';
  if (total >= 400) return 'D';
  return 'F';
}

// `state` needs: resources, factions, population, plus either gameWon (boolean)
// and the sol reached. `solReached` lets callers pass the Sol number the run
// ended on (defaults to state.sol).
export function calculateScore(state, solReached = null) {
  const r = state.resources || {};
  const survived = !!state.gameWon;
  const solsCompleted = survived ? TOTAL_SOLS : (solReached != null ? solReached : (state.sol || 1));

  // Normalize each resource into 0..1
  const norm = (key) => Math.max(0, Math.min(1, (r[key] || 0) / (SCORE_REFERENCE[key] || 100)));
  const resourceHealth =
    SCORE_RESOURCE_KEYS.reduce((sum, k) => sum + norm(k), 0) / SCORE_RESOURCE_KEYS.length;

  // Faction harmony = mean alignment across chiefs
  const facKeys = Object.keys(state.factions || {});
  const harmony = facKeys.length
    ? facKeys.reduce((sum, f) => sum + (state.factions[f].alignment || 0), 0) / (facKeys.length * 100)
    : 0;

  const populationRatio = Math.max(0, Math.min(1, (state.population || 0) / STARTING_POPULATION));

  // Components — sum to a maximum of 1000
  const survivalPts = Math.round((solsCompleted / TOTAL_SOLS) * 250 + (survived ? 150 : 0)); // max 400
  const populationPts = Math.round(populationRatio * 150);                          // max 150
  const resourcePts = Math.round(resourceHealth * 300);                             // max 300
  const harmonyPts = Math.round(harmony * 100);                                     // max 100
  const balancedBonus = SCORE_RESOURCE_KEYS.every(k => norm(k) >= 0.5) ? 50 : 0;    // max 50

  const total = survivalPts + populationPts + resourcePts + harmonyPts + balancedBonus;

  return {
    total,
    grade: gradeForScore(total),
    survived,
    solsCompleted,
    breakdown: [
      { label: 'Survival', points: survivalPts, max: 400 },
      { label: 'Population', points: populationPts, max: 150 },
      { label: 'Resource Resilience', points: resourcePts, max: 300 },
      { label: 'Faction Harmony', points: harmonyPts, max: 100 },
      { label: 'Balance Bonus', points: balancedBonus, max: 50 }
    ]
  };
}
