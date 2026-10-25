// Renders the app's train mark (TrainMark in app/_components/icons.tsx) into the native app icons and
// launch screens for Capacitor. Run with `npm run icons:build` after changing the mark or colours.
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";

const HONEY = "#f5a700";
const HONEY_STRONG = "#e39300";
const HONEY_SOFT = "#fff6dc";
const SPLASH_BACKGROUND = "#ffffff";
const APP_NAME = "지하철꿀정보";
const FONT = "'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";

const ANDROID_RES = "android/app/src/main/res";
const IOS_ASSETS = "ios/App/App/Assets.xcassets";
const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

/** TrainMark's 24×24 drawing, placed at (x, y) with the given box size. */
function mark(x, y, size, color = HONEY) {
  const s = size / 24;
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="2">
    <rect x="5" y="2.5" width="14" height="15" rx="4"/>
    <path d="M5 10h14"/>
    <path d="M10 5.5h4" stroke-linecap="round"/>
    <circle cx="9" cy="13.6" r="1.3" fill="${color}" stroke="none"/>
    <circle cx="15" cy="13.6" r="1.3" fill="${color}" stroke="none"/>
    <path d="M8.5 21.5l1.6-3.6M15.5 21.5l-1.6-3.6" stroke-linecap="round"/>
  </g>`;
}

function svg(width, height, body) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`,
  );
}

/** Same proportions as the home screen logo: the mark fills 68/112 of a soft honey tile. */
const MARK_RATIO = 68 / 112;

function iconSvg(size, shape) {
  const markSize = size * MARK_RATIO;
  const offset = (size - markSize) / 2;
  const background =
    shape === "circle"
      ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${HONEY_SOFT}"/>`
      : shape === "rounded"
        ? `<rect width="${size}" height="${size}" rx="${size * (32 / 112)}" fill="${HONEY_SOFT}"/>`
        : `<rect width="${size}" height="${size}" fill="${HONEY_SOFT}"/>`;
  return svg(size, size, background + mark(offset, offset, markSize));
}

/** Android adaptive icon layer: 108dp canvas whose middle 66dp always stays visible. */
function foregroundSvg(size) {
  const markSize = size * 0.5;
  const offset = (size - markSize) / 2;
  return svg(size, size, mark(offset, offset, markSize));
}

/** The web splash (SplashScreen.tsx) in dp: 112dp tile, 20dp gap, 22px bold name. */
function splashLogo(cx, top, unit) {
  const tile = 112 * unit;
  const markSize = 68 * unit;
  const x = cx - tile / 2;
  return `<rect x="${x}" y="${top}" width="${tile}" height="${tile}" rx="${32 * unit}" fill="${HONEY_SOFT}"/>
    ${mark(cx - markSize / 2, top + (tile - markSize) / 2, markSize)}
    <text x="${cx}" y="${top + tile + 20 * unit + 22 * unit}" text-anchor="middle" font-family="${FONT}"
      font-size="${22 * unit}" font-weight="800" letter-spacing="${-0.4 * unit}" fill="${HONEY_STRONG}">${APP_NAME}</text>`;
}

const SPLASH_LOGO_DP = { width: 160, height: 164 };

async function png(buffer, path, { flatten } = {}) {
  await mkdir(dirname(path), { recursive: true });
  let image = sharp(buffer).png();
  if (flatten) image = image.flatten({ background: flatten });
  await image.toFile(path);
}

async function write(path, contents) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents);
}

// Store and source icons.
await png(iconSvg(1024, "square"), "assets/app-icon-1024.png", { flatten: HONEY_SOFT });
await png(iconSvg(512, "square"), "assets/play-store-icon-512.png", { flatten: HONEY_SOFT });

// iOS: a single opaque 1024 icon; the system applies the rounded mask.
await png(iconSvg(1024, "square"), join(IOS_ASSETS, "AppIcon.appiconset/AppIcon-512@2x.png"), {
  flatten: HONEY_SOFT,
});

// iOS launch screen: 2732² image shown aspect-fill, so the logo is sized for a ~852pt-tall phone.
const IOS_SPLASH = 2732;
const iosUnit = IOS_SPLASH / 852;
const iosLogoHeight = SPLASH_LOGO_DP.height * iosUnit;
const iosSplash = svg(
  IOS_SPLASH,
  IOS_SPLASH,
  `<rect width="${IOS_SPLASH}" height="${IOS_SPLASH}" fill="${SPLASH_BACKGROUND}"/>` +
    splashLogo(IOS_SPLASH / 2, (IOS_SPLASH - iosLogoHeight) / 2, iosUnit),
);
for (const name of ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]) {
  await png(iosSplash, join(IOS_ASSETS, "Splash.imageset", name));
}

// Android launcher icons.
for (const [density, scale] of Object.entries(DENSITIES)) {
  const dir = join(ANDROID_RES, `mipmap-${density}`);
  await png(iconSvg(48 * scale, "rounded"), join(dir, "ic_launcher.png"));
  await png(iconSvg(48 * scale, "circle"), join(dir, "ic_launcher_round.png"));
  await png(foregroundSvg(108 * scale), join(dir, "ic_launcher_foreground.png"));
}
await write(
  join(ANDROID_RES, "values/ic_launcher_background.xml"),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${HONEY_SOFT.toUpperCase()}</color>
</resources>
`,
);

// Android launch screen: a centred logo bitmap per density instead of stretched full-screen images.
for (const density of Object.keys(DENSITIES)) {
  for (const orientation of ["port", "land"]) {
    await rm(join(ANDROID_RES, `drawable-${orientation}-${density}`), { recursive: true, force: true });
  }
}
await rm(join(ANDROID_RES, "drawable/splash.png"), { force: true });
for (const [density, scale] of Object.entries(DENSITIES)) {
  const width = SPLASH_LOGO_DP.width * scale;
  const height = SPLASH_LOGO_DP.height * scale;
  await png(svg(width, height, splashLogo(width / 2, 0, scale)), join(ANDROID_RES, `drawable-${density}/splash_logo.png`));
}
await write(
  join(ANDROID_RES, "drawable/splash.xml"),
  `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background" />
    <item>
        <bitmap android:gravity="center" android:src="@drawable/splash_logo" />
    </item>
</layer-list>
`,
);
await write(
  join(ANDROID_RES, "values/splash.xml"),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="splash_background">${SPLASH_BACKGROUND.toUpperCase()}</color>
</resources>
`,
);

console.log("App icons and launch screens written.");
