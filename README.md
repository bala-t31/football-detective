# Football Detective

**Download for Android:** [football-detective.apk](https://github.com/bala-t31/football-detective/releases/latest/download/football-detective.apk) (always the latest build)

A daily football mystery game. Identify the footballer from clues that get more specific, in six attempts.

## Run it on your Mac

You need Node.js 22 or newer. Check with `node -v`; if it's missing, get the LTS installer from nodejs.org.

```bash
cd "~/Personal Projects/Football Detective"
npm install        # first time only
npm run dev        # then open http://localhost:5173 (keep this Terminal window open)
```

Other commands:

```bash
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
npm test           # data-integrity + game-logic checks
```

No API keys, backend or accounts. Progress is saved in the browser's LocalStorage (or the app's storage on Android).

## Android APK

The `android/` folder is a ready-made Capacitor project. There are two ways to get an APK.

**Option A: Android Studio (on your Mac)**

1. Install Android Studio from developer.android.com/studio and open it once so it downloads the Android SDK.
2. Run `npm run android:sync`, then `npm run android:open`.
3. In Android Studio, choose **Build → Generate App Bundles or APKs → Generate APKs**.
4. The APK appears at `android/app/build/outputs/apk/debug/app-debug.apk`. Copy it to your phone and open it (allow "install unknown apps" when asked).

Once Android Studio is installed, `npm run android:apk` builds the same APK from Terminal.

**Option B: GitHub (no Android Studio needed)**

Push this folder to a GitHub repository. The workflow in `.github/workflows/android-apk.yml` builds the APK automatically. Open the repo's **Actions** tab, pick the latest "Build Android APK" run, and download `football-detective-apk` from **Artifacts**.

After changing the game, run `npm run android:sync` (or push again) to rebuild the APK with the new code.

This is a debug-signed APK, which is fine for sideloading and sharing. Publishing to the Play Store needs a release build signed with your own key.

## Modes

| Mode | Attempts | Hints | XP | Pool |
|---|---|---|---|---|
| Daily Case | 6 | yes | ×1 | easy + medium, same player for everyone on a local date |
| Practice | 6 | yes | ×1 | pick a level: Casual, Ball Knower, Elite or Mixed |
| Hardcore | 3 | no | ×1.5 | medium + hard |
| Career Detective | 6 | club-by-club | ×1.2 | players with 3+ clubs |
| Weekly Legends | 6 | yes | ×1.3 | five retired greats a week, same for everyone |
| Club Path Run | 2 per player | no | run | clubs only; one miss ends the run |
| Name the Teammate | 3 lives | no | 40 per name | teammates of a star at one club |
| Guess the XI | free text | no | 25 per starter, +50 full XI | 12 famous line-ups (`src/data/lineups.ts`) |
| Higher or Lower | 1 per pair | no | 40 + 5 per streak | who started their senior career first |
| Emoji Clue | 3 | extra hint per miss | 150 / 100 / 60 | a career in emojis |
| Transfer Fee | 8 questions | no | 50 each | reported fees (`src/data/transfers.ts`) |

Any finished case except the daily can be sent as a challenge link (`/c/#code`). The code holds the player and the friend's result, so no server is needed. On Android the website offers "Open in the app" (`footballdetective://challenge/<code>`); otherwise the friend plays it on the website.

Scoring: 1000 for a solve, −100 per wrong guess, −75 per extra clue, +300 for a first-guess solve, +200 for a no-hint solve. A loss scores 0, and the score never goes below 0.

## Project structure

```
src/
  data/        players (players/*.ts), honours (trophy hints), club→league map, nations, positions, teammates
  game/        engine, feedback, scoring, daily selection, search, share, progression (ranks/achievements/streaks)
  hooks/       useProfile (persistent profile context), useRound, useRouter, useCountdown
  components/  ui/, game/, layout/
  pages/       Home, Game, Stats, Players
  utils/       storage (safe LocalStorage), date, sound (Web Audio), native (Capacitor: share sheet, status bar)
  types/
scripts/test-engine.ts
android/       Capacitor Android project. The icon, themed (monochrome) icon and splash are vector drawables
               generated from one artwork; don't regenerate them with capacitor-assets.
assets/        source app icon + splash images
```

## Adding players

Add an entry to one of the files in `src/data/players/`. Give famous players an `honours` line so the first hint says what they won. Clues go from vague to specific, and none should contain the player's name. Every club must exist in `src/data/clubs.ts`. Run `npm test` to catch missing clubs and nations, clues that give away the name, and duplicate IDs.

The daily schedule and the Weekly Legends pool are frozen lists (`src/data/dailyPool.ts`, `src/data/legendsPool.ts`), so adding players never moves a future daily.

## Updating the game without a new APK

The app reads three files from the website (`website/data/`) a moment after it opens. Edit them, push, and Netlify publishes them. Nothing to pay for and nothing to run.

| File | What it does |
|---|---|
| `version.json` | When `latest` is newer than the installed app, a pop-up offers the download (`notes` are the bullet points). Bump it after a new release. |
| `announcement.json` | A one-off message. Change `id` to show a new one; each `id` is shown once. `until` stops it after a date. |
| `content.json` | New or fixed players, extra clubs/nations, and scheduled daily players with a match-day theme (`daily`). Raise `rev` every time. Downloads apply the next time the app opens. |

Run `npm run content:check` before pushing `content.json`: it loads the file the way the app does and runs every test on the merged data. A player whose clubs or nation the app doesn't know is ignored by the app, so add those under `clubs` / `nations` in the same file.

Motion follows `docs/ANIMATION.md`.

## Website

`website/` is the static site at https://football-detective.netlify.app (Netlify publishes it on every push). Its playable demo uses the real game data: run `npm run website:core` after changing players.
