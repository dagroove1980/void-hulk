import { NarrativeEvent, FloorBriefing } from '../types';

export const NARRATIVE_EVENTS: NarrativeEvent[] = [
  {
    id: 'wounded_marine',
    title: 'Wounded Marine',
    description: 'You find a marine slumped against the wall, clutching a wound. His breathing is labored but he\'s still alive. He gestures weakly toward his pack.',
    choices: [
      {
        label: 'Help him',
        description: 'Share your medikit and tend to his wounds.',
        outcome: { text: 'The marine thanks you and shares intel about the deck layout.', hpChange: -3, xpChange: 25 },
      },
      {
        label: 'Take his gear',
        description: 'He\'s not going to make it. Salvage what you can.',
        outcome: { text: 'You take his supplies. His eyes follow you as you leave.', scrapChange: 20, item: true },
      },
      {
        label: 'Leave him',
        description: 'You can\'t risk stopping. Move on.',
        outcome: { text: 'You press on. His coughing fades behind you.', xpChange: 5 },
      },
    ],
  },
  {
    id: 'alien_egg_cluster',
    title: 'Alien Egg Cluster',
    description: 'A cluster of pulsating alien eggs fills a corner of the room. They glow with a faint bioluminescent light. Some appear dormant, others are close to hatching.',
    choices: [
      {
        label: 'Destroy them',
        description: 'Burn them all before they hatch.',
        outcome: { text: 'The eggs burst with acidic fluid. Some splashes on you, but the threat is neutralized.', hpChange: -2, xpChange: 20 },
      },
      {
        label: 'Study them',
        description: 'Carefully examine the eggs for useful biomatter.',
        outcome: { text: 'You extract a strange compound from the eggs. It could be valuable.', xpChange: 15, scrapChange: 15 },
      },
      {
        label: 'Leave quickly',
        description: 'Don\'t disturb them. Back away slowly.',
        outcome: { text: 'You slip away before anything notices you.', xpChange: 5 },
      },
    ],
  },
  {
    id: 'corrupted_terminal',
    title: 'Corrupted Terminal',
    description: 'A ship terminal flickers with corrupted data. Alien code has merged with the ship\'s systems. You might be able to extract something useful... or trigger a defense protocol.',
    choices: [
      {
        label: 'Hack it',
        description: 'Attempt to break through the corruption and access ship data.',
        outcome: { text: 'You extract the deck manifest and security codes. The terminal sparks and dies.', xpChange: 30, scrapChange: 10 },
      },
      {
        label: 'Rip out components',
        description: 'Salvage the hardware. Forget the data.',
        outcome: { text: 'You strip the terminal for parts. Good haul.', scrapChange: 25 },
      },
    ],
  },
  {
    id: 'sealed_armory',
    title: 'Sealed Armory',
    description: 'A reinforced door with a military lock. "AUTHORIZED PERSONNEL ONLY" is stenciled above. The lock looks like it could be forced, but it might trigger an alarm.',
    choices: [
      {
        label: 'Force the lock',
        description: 'Break it open. Whatever\'s inside is worth the noise.',
        outcome: { text: 'The lock snaps! Inside you find military-grade equipment.', item: true, scrapChange: 10 },
      },
      {
        label: 'Bypass carefully',
        description: 'Take your time and disable the alarm first.',
        outcome: { text: 'You carefully bypass the alarm and open the door. A neat stash of supplies awaits.', scrapChange: 30 },
      },
    ],
  },
  {
    id: 'medical_bay',
    title: 'Abandoned Medical Bay',
    description: 'The medical bay is trashed but functional. Auto-doc stations line the walls. One still has power, though its readouts show alien biosignatures mixed with human.',
    choices: [
      {
        label: 'Use the auto-doc',
        description: 'Let the machine patch you up. What could go wrong?',
        outcome: { text: 'The auto-doc whirs to life and patches your wounds efficiently.', hpChange: 8 },
      },
      {
        label: 'Salvage supplies',
        description: 'Grab medical supplies from the cabinets instead.',
        outcome: { text: 'You stuff your pockets with stims and bandages.', item: true },
      },
      {
        label: 'Inject the compound',
        description: 'There\'s a syringe with an unknown substance. Take the risk?',
        outcome: { text: 'A surge of energy courses through you. You feel... stronger.', hpChange: 5, xpChange: 20 },
      },
    ],
  },
  {
    id: 'hull_breach',
    title: 'Hull Breach',
    description: 'A section of the hull has been torn open. Stars glitter through the gap. The area is depressurizing slowly. You spot some floating cargo containers.',
    choices: [
      {
        label: 'Grab the cargo',
        description: 'Risk the breach to snag the floating containers.',
        outcome: { text: 'You snatch two containers before the breach worsens. Good loot!', scrapChange: 25, hpChange: -3 },
      },
      {
        label: 'Seal the breach',
        description: 'Use emergency sealant to patch the hole. Might find something in the supply closet.',
        outcome: { text: 'You seal the breach. The crew would be proud. You find a toolkit nearby.', xpChange: 15, scrapChange: 10 },
      },
    ],
  },
  {
    id: 'alien_shrine',
    title: 'Alien Shrine',
    description: 'Strange organic structures have grown around a central pillar. It pulses with an eerie rhythm, almost like a heartbeat. You feel drawn to it.',
    choices: [
      {
        label: 'Touch the pillar',
        description: 'Reach out and make contact with the alien structure.',
        outcome: { text: 'Visions flood your mind. Alien knowledge sears into your consciousness.', xpChange: 35, hpChange: -4 },
      },
      {
        label: 'Destroy it',
        description: 'Smash the pillar. Nothing alien should be left standing.',
        outcome: { text: 'The pillar shatters, releasing a shower of crystallized fragments.', scrapChange: 20 },
      },
      {
        label: 'Observe from afar',
        description: 'Study it without getting close. Note patterns.',
        outcome: { text: 'You sketch the patterns. The intel could prove useful later.', xpChange: 15 },
      },
    ],
  },
  {
    id: 'survivor_cache',
    title: 'Survivor\'s Cache',
    description: 'You find a hidden compartment behind a wall panel. Inside, someone has stashed supplies and left a note: "If you\'re reading this, I didn\'t make it. Take what you need."',
    choices: [
      {
        label: 'Take everything',
        description: 'Grab all the supplies. Survival first.',
        outcome: { text: 'You fill your pack with their stash. Their sacrifice won\'t be in vain.', scrapChange: 20, item: true },
      },
      {
        label: 'Take only essentials',
        description: 'Leave some for the next survivor who might pass through.',
        outcome: { text: 'You take what you need and seal the cache again.', hpChange: 5, scrapChange: 10 },
      },
    ],
  },
  {
    id: 'power_junction',
    title: 'Power Junction',
    description: 'A power junction box is sparking dangerously. The lights in this section are flickering. You could try to redirect power to restore life support... or overload it as a weapon.',
    choices: [
      {
        label: 'Restore power',
        description: 'Fix the junction and restore systems to this deck.',
        outcome: { text: 'Lights stabilize and life support kicks in. You feel revitalized in the warm air.', hpChange: 4, xpChange: 10 },
      },
      {
        label: 'Overload it',
        description: 'Rig it to explode as a trap for pursuing aliens.',
        outcome: { text: 'The junction overloads spectacularly. Anything following you just had a bad day.', xpChange: 20 },
      },
    ],
  },
  {
    id: 'data_vault',
    title: 'Data Vault',
    description: 'A secure data vault still has active storage drives. Ship logs, crew manifests, and research data are all accessible. This could explain what happened here.',
    choices: [
      {
        label: 'Download everything',
        description: 'Copy all data to your suit\'s storage. Intel is power.',
        outcome: { text: 'You download crew logs revealing the alien outbreak\'s origin. Invaluable intelligence.', xpChange: 25 },
      },
      {
        label: 'Search for access codes',
        description: 'Look for security codes that might open locked areas.',
        outcome: { text: 'You find access codes for the armory on the next deck.', scrapChange: 15, xpChange: 10 },
      },
    ],
  },
  {
    id: 'cryo_chamber',
    title: 'Cryo Chamber',
    description: 'Rows of cryogenic pods line the walls. Most are shattered and empty, but one still has a blinking status light. Someone—or something—is still frozen inside.',
    choices: [
      {
        label: 'Open the pod',
        description: 'Thaw the occupant. Could be a survivor.',
        outcome: { text: 'A frost-bitten engineer stumbles out. He shares his toolkit before collapsing.', item: true, xpChange: 10 },
      },
      {
        label: 'Leave it sealed',
        description: 'Whatever is in there can stay frozen.',
        outcome: { text: 'You move on. Some doors are better left closed.', xpChange: 5 },
      },
      {
        label: 'Salvage the pod',
        description: 'The cryo system has valuable components.',
        outcome: { text: 'You strip the pod for parts. The status light goes dark.', scrapChange: 25 },
      },
    ],
  },
  {
    id: 'fungal_growth',
    title: 'Fungal Growth',
    description: 'An alien fungus has overtaken this room. Bioluminescent spores drift lazily in the air. The growth seems to be converting the ship\'s material into something organic.',
    choices: [
      {
        label: 'Harvest spores',
        description: 'Collect the bioluminescent spores. Could be useful as medicine.',
        outcome: { text: 'The spores have regenerative properties! You feel your wounds closing.', hpChange: 6 },
      },
      {
        label: 'Burn it out',
        description: 'Purge the fungal growth with fire.',
        outcome: { text: 'The fungus shrieks as it burns. Behind it, you find a supply cache.', scrapChange: 15, xpChange: 10 },
      },
    ],
  },
];

export const FLOOR_BRIEFINGS: FloorBriefing[] = [
  {
    floor: 1,
    title: 'Cargo Deck',
    description: 'You breach the outer hull and enter the cargo deck. Emergency lights flicker in the corridors. Something has been nesting here—organic growths line the walls. Proceed with caution, operative.',
  },
  {
    floor: 2,
    title: 'Engineering Deck',
    description: 'The elevator groans as it descends to Engineering. The air is thick with heat and the sound of machinery. Stronger creatures have made this their territory. The infestation runs deeper than expected.',
  },
  {
    floor: 3,
    title: 'Bio-Lab Alpha',
    description: 'The deepest level. Bio-Lab Alpha is where it all started—the alien specimens, the failed containment. The Brood Queen\'s lair lies ahead. This ends here, one way or another.',
  },
];

/** Get a random event appropriate for the current floor */
export function getRandomEvent(
  floor: number,
  rng: { pick: <T>(arr: T[]) => T }
): NarrativeEvent {
  const available = NARRATIVE_EVENTS.filter(e => !e.minFloor || e.minFloor <= floor);
  return rng.pick(available);
}
