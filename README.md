# Anya's Journey app

Mobile app for [Anya's Journey Foundation](https://www.anyasjourney.com), built with Expo (React Native) so one codebase runs on iPhone and Android.

## Screens

| Tab | What it shows | Where the content comes from |
| --- | --- | --- |
| **Home** | Logo, photos, Anya's story, the mission, a compact fundraising thermometer, an LSS explainer and social links | `src/data/story.ts`, with photos loaded from the website |
| **Events** | Announcements and upcoming events in an in-app browser window | `https://www.anyasjourney.com/events.html`, live |
| **Playgrounds** | Map and list of accessible playgrounds near the user, with filters for accessibility, directions and a "Search this area" button | OpenStreetMap through the free Overpass API, shown on an OpenFreeMap map. No API keys are needed. |
| **Survivor** | The Wine Survivor play-along game: back a tribe, pick who goes home each draw, rally donations, and Loser Round trivia. Greyed out behind a "Next date" panel while the game is off | `wine-survivor.json` on the website, with a fallback in `src/data/wineSurvivor.ts` |
| **Donate** | Full fundraising thermometer, GoFundMe and GiveSendGo buttons, playground equipment to sponsor with prices, plus other ways to give | Thermometer: `fundraising.json` on the website. Equipment: `src/data/equipment.ts` |

## Updating content without an app update

- **Events:** edit `events.html` on the website as usual. The app shows the page live, with the site's own header and footer hidden.
- **Thermometer:** upload `docs/fundraising.json` to `https://www.anyasjourney.com/app/fundraising.json` and change the numbers whenever the total moves. Until that file exists, the app shows the fallback in `src/constants/config.ts` and a "couldn't load" note.

## Running Wine Survivor

Upload `docs/wine-survivor.json` to `https://www.anyasjourney.com/app/wine-survivor.json` and edit it during the event. No app update is needed.

- **Turn the game on or off:** set `"active"` to `true` or `false`. While it's off, the tab shows the game greyed out with `nextDate` and `nextDateNote` over it.
- **Tribes:** one entry per in-person team. `status` is `"in"`, `"immune"` or `"out"`. `rally` is the dollars donated for that tribe (donors add "Rally: tribe name" to their donation note).
- **Draws:** add one per draw with `"status": "open"` so people can pick who goes home. Set it to `"closed"` when the draw starts, then list the knocked-out tribe ids in `eliminated`.
- **Trivia** (optional): a `trivia` list of `{ "question", "options", "answer" }` replaces the built-in Loser Round questions. `answer` is the position of the right option, counting from 0.

Without the file, the app uses the built-in defaults in `src/data/wineSurvivor.ts`, where `active` is `false`, so shipping an app update with that set to `true` also turns the game on.

Picks, the tribe someone backs and trivia scores are saved on each phone only. A shared leaderboard for picks and push alerts on draw night would need a small backend.

The game is free to play with no paid entries, and donations never change the draw, which keeps it outside BC gaming licensing. See `wine-survivor-game.md` in the project files for the reasoning.

## Setup still needed

- [ ] Replace the GiveSendGo placeholder link in `src/constants/config.ts`
- [ ] Replace the placeholder equipment and prices in `src/data/equipment.ts`
- [ ] Set the real fundraising goal (in `fundraising.json` and in the fallback)
- [ ] Add the charity logo as the app icon and splash image (`assets/icon.png`, `assets/splash-icon.png`, `assets/android-icon-foreground.png`)
- [ ] Have the charity review the story text in `src/data/story.ts`
- [ ] Get the Wine Survivor 4.0 dates and team list, and upload `wine-survivor.json`

## Playground finder

- The finder uses the phone's location, or the Cowichan Valley if the user says no. It searches 25 km by default, and "Search this area" works anywhere the user pans the map.
- **Accessible** means the playground has `wheelchair=yes|designated|limited` or `sensory_friendly=*` in OpenStreetMap, or has equipment tagged `wheelchair=yes` such as accessible swings. "Show all" adds playgrounds with no accessibility info.
- How good the results are depends on OpenStreetMap coverage. Anyone, including the charity and its families, can add missing playgrounds at openstreetmap.org, and the app links to it.
- The free public Overpass server is fine for launch. If usage grows a lot, point `overpassEndpoints` in `src/constants/config.ts` at a paid or self-hosted server.

## Web preview

Every push to `main` builds the web version and publishes it to GitHub Pages at https://notacultleader-sugar.github.io/anyasjourney/ (workflow: `.github/workflows/web-preview.yml`). Pages must be turned on once, under Settings → Pages → Source: **GitHub Actions**.

## Running it

```bash
npm install
npx expo start          # scan the QR code with the Expo Go app on your phone
npx expo start --web    # quick preview in a browser
npm run typecheck
```

Store builds use EAS: `npx eas-cli@latest build`.
