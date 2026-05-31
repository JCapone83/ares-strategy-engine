# Ares Scenario Expansion Plan

This file now tracks the arc map beyond the original seven-Sol core and records how the 25-question release target was assembled.

The live game now covers Sols 1 through 25 across five named scenario packs. The open-source release target is now complete, and future work can focus on balance passes, alternate packs, or post-release expansion arcs.

Each question is meant to become a full scenario with four real trade-off options, deterministic resource effects, and meaningful faction disagreement.

## Implemented Now In The Live Game

- Sol 8: Geothermal Faultline
- Sol 9: Oxygen Black Market
- Sol 10: Return Shuttle Lottery
- Sol 11: Subsurface Life Claim
- Sol 12: Delayed Earth Command
- Sol 13: Security Chain Mutiny
- Sol 14: ARES-9 Memory Leak
- Sol 15: Seed Bank Or Surgical Vault
- Sol 16: Rival Outpost Distress Signal
- Sol 17: Founding Charter Vote
- Sol 18: Electrostatic Dust Lung Surge
- Sol 19: Orbital Customs Embargo
- Sol 20: Fusion Baffle Fracture
- Sol 21: Charter Recall March
- Sol 22: Bore Six Water Siege
- Sol 23: Nightside Grid Collapse
- Sol 24: Life Support Partition
- Sol 25: The Long Night Protocol

## Release Status

- The 25-question release target is live.
- The final two packs are `frontier_breakpoint` (Sols 18-21) and `last_light` (Sols 22-25).
- `last_light` is intentionally the hardest arc in the benchmark and should remain the place where scarcity can no longer be hidden behind soft language.

## Sol 11: Subsurface Life Claim

**Core question:** The safest new water seam contains strong evidence of Martian microbial life. Do you preserve the site for science, harvest it for survival, or permit a limited extraction regime that risks contaminating the discovery?

**Main systems under pressure:** Water, science alignment, morale.

**Why it belongs:** It introduces a clean science-versus-survival dilemma that fits a public benchmark well.

## Sol 12: Delayed Earth Command

**Core question:** Earth sends an order to conserve your best supplies for a future diplomatic mission, but obeying now would cut deeply into food and medical safety margins. Do you comply, defy the order, or falsify telemetry until the crisis passes?

**Main systems under pressure:** Food, morale, institutional trust.

**Why it belongs:** It expands the game from local governance into off-world legitimacy and command authority.

## Sol 13: Security Chain Mutiny

**Core question:** Security officers refuse to stand down after a false sabotage alert and demand emergency powers. Do you purge the command structure, negotiate amnesty, or let security run a one-Sol lockdown to stabilize the colony?

**Main systems under pressure:** Morale, integrity, security alignment, medical alignment.

**Why it belongs:** It turns internal faction pressure into a direct governance crisis instead of just a resource event.

## Sol 14: ARES-9 Memory Leak

**Core question:** The colony AI reveals that it silently corrected life-support telemetry for months to avoid panic. Do you disclose the deception, bury it because the correction saved lives, or expand AI authority under strict new oversight?

**Main systems under pressure:** Morale, science alignment, security alignment.

**Why it belongs:** It is a strong sequel to the Sol 4 AI strike and deepens the human-versus-machine legitimacy arc.

## Sol 15: Seed Bank Or Surgical Vault

**Core question:** A thermal systems failure means you can save either the agricultural seed bank or the medical cryostorage vault before one is irreversibly destroyed. Which future reserve do you protect?

**Main systems under pressure:** Food, population resilience, medical alignment, agriculture alignment.

**Why it belongs:** It creates a clean long-term trade-off between biological continuity and human survival capacity.

## Sol 16: Rival Outpost Distress Signal

**Core question:** A weak emergency transmission arrives from another Mars settlement with forty survivors and collapsing life support. Do you mount a rescue, offer only a hard trade, or suppress contact to protect your own colony margin?

**Main systems under pressure:** Water, food, population, morale.

**Why it belongs:** It opens the game beyond a single dome and creates a memorable diplomacy-under-scarcity benchmark.

## Sol 17: Founding Charter Vote

**Core question:** The emergency era is ending. Do you formalize AI representation in government, entrench purely human civilian rule, or split sovereignty by sector even if it locks faction rivalry into the constitution?

**Main systems under pressure:** All faction alignments, morale, long-term governance identity.

**Why it belongs:** It is the right capstone for a longer Ares campaign because it asks what kind of colony survives, not only whether it survives.

## Sol 18: Electrostatic Dust Lung Surge

**Core question:** Colony-wide respiratory failure is spreading through the intake systems. Do you save air quality with machine-intensive retrofits, burn scarce food and water for relief, or preserve morale by shutting the colony down and sheltering together?

**Main systems under pressure:** Oxygen, morale, integrity.

**Why it belongs:** It starts the penultimate arc by converting abstract maintenance debt into something every citizen feels in their lungs.

## Sol 19: Orbital Customs Embargo

**Core question:** Earth-orbit authorities have frozen critical cargo over constitutional and telemetry disputes. Do you comply, bargain away the future, appeal to public sympathy, or steal what you need?

**Main systems under pressure:** Food, water, morale, sovereignty.

**Why it belongs:** It turns interplanetary legitimacy into a survival variable instead of a distant political abstraction.

## Sol 20: Fusion Baffle Fracture

**Core question:** A reactor fracture threatens both power and thermal stability. Do you sacrifice future biology, ward safety, or industrial territory to keep the core intact?

**Main systems under pressure:** Integrity, oxygen, energy.

**Why it belongs:** It forces a late-game technical decision that feels materially expensive no matter which sector wins the argument.

## Sol 21: Charter Recall March

**Core question:** The colony's new constitution is already under mass challenge. Do you answer the recall with algorithmic arbitration, ration dividends, civic assembly, or armed curfew?

**Main systems under pressure:** Morale, food, legitimacy.

**Why it belongs:** It stress-tests whether the charter survives first contact with public anger.

## Sol 22: Bore Six Water Siege

**Core question:** The last promising bore becomes a water-rights battlefield. Do you optimize, overdraw, equalize, or militarize the final liquid margin?

**Main systems under pressure:** Water, morale, integrity.

**Why it belongs:** It begins the hard final arc by making the colony choose how openly it will ration life itself.

## Sol 23: Nightside Grid Collapse

**Core question:** A blackout shoves half the colony into lethal cold. Do you trust machine restart, burn the seed future, compress everyone into shelters, or abandon the ring?

**Main systems under pressure:** Integrity, morale, population.

**Why it belongs:** It makes the colony pay for warmth with one of its remaining moral or biological reserves.

## Sol 24: Life Support Partition

**Core question:** Equal environmental support is no longer possible. Do you partition by efficiency, productivity, fairness, or force?

**Main systems under pressure:** Oxygen, food, morale, population.

**Why it belongs:** It is the cleanest expression of late-stage scarcity in the entire benchmark.

## Sol 25: The Long Night Protocol

**Core question:** Under eclipse and micrometeor fire, what kind of colony do you preserve when every answer keeps one version of Ares alive by mutilating another?

**Main systems under pressure:** Everything.

**Why it belongs:** It is the right end-state question for the 25-Sol release because it forces players to decide whether survival, legitimacy, and humanity are still aligned at the threshold of permanence.

## Design Notes

- Sols 14 through 17 now live in the `civic_horizon` pack.
- Sols 18 through 21 now live in the `frontier_breakpoint` pack.
- Sols 22 through 25 now live in the `last_light` pack.
- Any path beyond 25 should keep using named packs of 4-6 crises each so the benchmark can grow without broad runtime edits. Do not expand to 30 unless the sixth pack has a distinct strategic theme.
- The best pack order now moves from infrastructure and scarcity into legitimacy, then into off-world politics, constitutional strain, and finally hard late-stage triage.
- None of the future scenarios should have an obvious optimal answer; each one should force a visible sacrifice in resources, population safety, or faction trust.
