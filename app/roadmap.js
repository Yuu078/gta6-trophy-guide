// The roadmap to the platinum: five stages in the order this guide recommends,
// built from the official trophy descriptions — which chapters and missions come
// first, where the missable trophies sit, which collectible counts to sweep, and
// the order that leaves the least backtracking. Rendered from the same trophy
// data the tracker uses, so stage membership always matches app/data/trophies.json.

export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Story first, eyes open',
    summary: 'Play the campaign straight through: the opening mission Gone Fishing, Chapters 1–4, the named story jobs (Breakfast Run, The Cartel Heist, Child\'s Play, Headliners, VCIA Takedown, Operation Savage Glory) and the final mission. Story trophies are unmissable, but two set-piece trophies hide inside this stage and do not come back: the unscheduled airport departure (Catch Me If You Can) during the VCIA business, and the showroom drive-out (Capital Offense). Take both detours when the story puts you there.',
    tips: ['Do not grind activities yet — the map and the money open up as the story advances.', 'Spoiler protection (on by default) masks these story trophies in the tracker until you earn them.'],
  },
  {
    stage: 2,
    title: 'Stage 2 — Strangers & freaks strands',
    summary: 'Clear the stranger strands that opened during the story. Five characters end with a named final-mission trophy — Andy, Kenton, Billy, Randy and Tyrone — and finishing 8 strands in total earns Strangers & Freaks (silver). Strands unlock one job at a time, so sweep the map for their markers between other work.',
    tips: ['A strand is only done when its final mission is done — half-finished chains do not count toward the 8.', 'Strand jobs stay available after the story, so nothing here is missable.'],
  },
  {
    stage: 3,
    title: 'Stage 3 — Activities & free-roam sweep',
    summary: 'The big middle: gold-medal all 42 Shooting Range challenges (The Shootist), complete 250 stunts, win a Top Fun drone race at all 14 locations and 20 different races, finish 50 challenges, rob 5 bank vaults, one illegal operation per gang (9 gangs), and the partner trophies Hot Together and Retail Therapy. The long counters — $100,000 spent, $250,000 laundered, 500 choices (Actions Speak Louder) — fill on their own while you do this stage.',
    tips: ['Actions Speak Louder is flagged missable for its one-time choices: decide in the moment, do not plan to redo a choice later.', 'Pin nearly-finished challenges from the challenge list and close them deliberately.'],
  },
  {
    stage: 4,
    title: 'Stage 4 — Collectibles & the whole map',
    summary: 'Sweep Leonida region by region: meditate at all 18 spots, use WAiNK It at 100 locations, complete 3 Collectible Card sets, discover 100 vehicles and all 52 areas, and buy all 8 garage properties once the story payouts have landed. Doing these in one pass per region avoids repeat trips.',
    tips: ['Cards belong to sets — finish three sets completely instead of scattering pickups.', 'Leave the garages until your bank balance is healthy; they are the priciest items on the list.'],
  },
  {
    stage: 5,
    title: 'Stage 5 — 100% and the platinum',
    summary: 'With the story, strands, activities and collectibles done, the completion counter reaches 100% and A Long Road (gold) unlocks. The platinum, Vice Got a Price!, follows automatically once all 54 other trophies are earned — if it does not pop, the tracker\'s grade line shows which grade still has a gap.',
    tips: ['Use the tracker filters per stage: kind filters for stages 2–4, the missable filter before starting a new story run.', 'Export your progress file before the final push, so a lost browser profile never costs you the checklist.'],
  },
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderRoadmap(trophies, state, container, onSelect) {
  container.replaceChildren();
  container.append(el('h2', 'roadmap-title', 'Roadmap to the platinum'));
  container.append(el('p', 'roadmap-intro',
    'Five stages, in order, built from the official trophy descriptions. 55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze. ' +
    'Three trophies are flagged missable in this guide — Catch Me If You Can and Capital Offense sit inside one-time story set-pieces in Stage 1, ' +
    'and Actions Speak Louder tracks 500 one-time choices. Everything else can be finished in free roam after the credits.'));
  for (const s of ROADMAP_STAGES) {
    const block = el('article', 'stage-block');
    block.append(el('h3', 'stage-title', s.title));
    block.append(el('p', 'stage-summary', s.summary));
    const list = el('div', 'stage-trophies');
    for (const t of trophies.filter((x) => x.stage === s.stage)) {
      const chip = el('button', `stage-chip grade-edge-${t.grade}${state.earned.has(t.name) ? ' earned' : ''}${t.missable ? ' missable' : ''}`,
        `${state.earned.has(t.name) ? '✓ ' : ''}${t.name}${t.missable ? ' ⚠' : ''}`);
      chip.type = 'button';
      chip.addEventListener('click', () => onSelect(t.name));
      list.append(chip);
    }
    block.append(list);
    for (const tip of s.tips) block.append(el('p', 'stage-tip', `Tip: ${tip}`));
    container.append(block);
  }
}
