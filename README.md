# Leonida Legend — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Yuu078/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Yuu078/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Legend is a fully offline trophy guide and progress tracker for
Grand Theft Auto VI on PlayStation 5. It covers all 55 trophies —
1 platinum, 2 gold, 6 silver and 46 bronze — in a single static web app
with no dependencies and no network access required.

## What it does

- A guide entry for every one of the 55 trophies, with the requirements
  and steps written in plain language.
- A progress tracker stored in your browser's localStorage: tick off
  trophies as you earn them and watch the completion percentage and
  per-grade counts update. Progress can be exported to a JSON file and
  imported again on another device.
- Filters by trophy kind (story, collectible, activity, online, and
  more), by grade, and a free-text search, plus an option to hide
  trophies you have already earned.
- Spoiler protection, on by default: story trophies stay hidden until
  you mark them earned, so you can plan a run without ruining the plot.
- A five-stage roadmap that orders the work from the first story steps
  to the platinum, with the missable trophies flagged along the way.

## How to use it

Open `app/index.html` in any modern web browser. That is all — there is
nothing to install, build or serve, and the app works completely
offline once the files are on your machine.

To hand it in, run `node main.ts` — it copies `app/` and `screenshots/` to the output directory and writes `dossier.json` there. The entry verifies itself at hand-in: it prints an output manifest of the files it delivered and runs a trophy-data consistency check before finishing.

## About

This app was built for the make.fun gta6-trophy-guide-01 bounty.
Licensed under MIT (see LICENSE).
