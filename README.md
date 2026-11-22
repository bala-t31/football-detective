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

Daily picks come from a seeded shuffle of the player pool, so adding players changes which player falls on which future date.

## Website

`website/` is the static site at https://football-detective.netlify.app (Netlify publishes it on every push). Its playable demo uses the real game data: run `npm run website:core` after changing players.
