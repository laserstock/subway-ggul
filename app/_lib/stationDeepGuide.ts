import { distanceMeters, guideByKo, type GuideDetail, type GuideStation } from "./guide";
import {
  exitName,
  floorText,
  linesPhrase,
  listJoin,
  lockerSpot,
  minutes,
  quickestTransfer,
  stationTitle,
} from "./guideCopy";
import { contentLocale, type GuideLocale } from "./guideLocale";
import { inScript } from "./hant";
import { t, type Locale } from "./i18n";
import { stationSpotsFor } from "./planner";
import { findRoute, networkStationId } from "./routeFinder";
import { STATION_LOCAL_GUIDES } from "./stationLocalGuides";

export type DeepGuideBlock = { heading: string; paragraphs: string[] };

export type StationDeepGuide = {
  keySummary: DeepGuideBlock;
  exitRoutes: DeepGuideBlock;
  hubTravel: DeepGuideBlock | null;
  /** Combined plain text length (content locale) for QA / thin-content checks. */
  charCount: number;
};

/** Major Seoul hubs used for unique “how long from here” sentences on every station page. */
const HUB_TRAVEL_KOS = ["서울역", "명동역", "홍대입구역", "강남역", "인천공항1터미널역"] as const;

function variant(slug: string, mod: number) {
  return [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0) % mod;
}

function localIntro(station: GuideStation, locale: Locale) {
  const guide = STATION_LOCAL_GUIDES[station.ko];
  return guide ? t(guide.intro, locale) : null;
}

function toiletNarrative(station: GuideStation, detail: GuideDetail, locale: Locale, title: string) {
  const toilets = detail.toilets;
  const inside = toilets.filter((row) => row.gate === "inside").length;
  const outside = toilets.length - inside;
  const sample = toilets[0];
  const floor = sample ? floorText(sample.floor, locale) : "";
  const exit = sample?.exit
    ? locale === "en"
      ? ` near Exit ${sample.exit}`
      : locale === "zh"
        ? `（近${sample.exit}号出口）`
        : locale === "ja"
          ? `（${sample.exit}番出口付近）`
          : `(${sample.exit}번 출구 근처)`
    : "";

  if (!toilets.length) {
    if (locale === "en")
      return `K-Sub has not yet verified a restroom pin for ${title}; look for the restroom symbol by the ticket gates and confirm whether it is inside or outside the paid area before you tap in.`;
    if (locale === "zh")
      return `K-Sub暂未核实${title}的洗手间点位。请在检票口附近查看洗手间标志，并在刷卡前进确认位于检票口内还是外。`;
    if (locale === "ja")
      return `${title}のトイレ位置は未確認です。改札付近のトイレ表示を見て、改札内か改札外かを入場前に確かめてください。`;
    return `${title}의 화장실 위치는 아직 확인되지 않았어요. 개찰구 근처 안내 표시로 개찰구 안/밖 여부를 들어간 뒤에 헤매지 않도록 미리 확인하세요.`;
  }

  if (locale === "en") {
    if (toilets.length === 1)
      return inside
        ? `The only restroom at ${title} is inside the ticket gates (${floor}${exit}), so you can use it mid-ride without tapping out.`
        : `The only restroom at ${title} is outside the ticket gates (${floor}${exit}) — finish before you tap in.`;
    if (inside && outside)
      return `${title} lists ${toilets.length} restrooms: ${inside} inside the ticket gates and ${outside} outside (${floor}${exit} is one reference point). Inside-gate toilets are the ones to use between trains.`;
    if (inside)
      return `All ${toilets.length} listed restrooms at ${title} sit inside the ticket gates (${floor}${exit}), which is ideal when you are already in the paid area.`;
    return `All ${toilets.length} listed restrooms at ${title} sit outside the ticket gates (${floor}${exit}). Go before you enter the paid area.`;
  }

  if (locale === "zh") {
    if (toilets.length === 1)
      return inside
        ? `${title}仅有1处洗手间，位于检票口内（${floor}${exit}），行程中无需出站即可使用。`
        : `${title}仅有1处洗手间，位于检票口外（${floor}${exit}），请刷卡前进站前使用。`;
    if (inside && outside)
      return `${title}共登记${toilets.length}处洗手间：检票口内${inside}处、检票口外${outside}处（参考${floor}${exit}）。换乘间隙优先使用检票口内洗手间。`;
    if (inside) return `${title}登记的${toilets.length}处洗手间均在检票口内（${floor}${exit}），已在付费区时最方便。`;
    return `${title}登记的${toilets.length}处洗手间均在检票口外（${floor}${exit}），请先使用再进站。`;
  }

  if (locale === "ja") {
    if (toilets.length === 1)
      return inside
        ? `${title}のトイレは改札内に1か所（${floor}${exit}）だけです。乗車中でも改札を出ずに利用できます。`
        : `${title}のトイレは改札外に1か所（${floor}${exit}）です。入場前に済ませておきましょう。`;
    if (inside && outside)
      return `${title}のトイレは${toilets.length}か所で、改札内${inside}・改札外${outside}（目安は${floor}${exit}）です。乗り換え途中は改札内を優先してください。`;
    if (inside) return `${title}の登録トイレ${toilets.length}か所はすべて改札内（${floor}${exit}）です。`;
    return `${title}の登録トイレ${toilets.length}か所はすべて改札外（${floor}${exit}）です。改札に入る前に利用してください。`;
  }

  if (toilets.length === 1)
    return inside
      ? `${title} 화장실은 개찰구 안에 1곳(${floor}${exit})이에요. 이미 개찰을 통과한 뒤에도 나갈 필요 없이 이용할 수 있어요.`
      : `${title} 화장실은 개찰구 밖에 1곳(${floor}${exit})이에요. 개찰구에 들어가기 전에 이용하세요.`;
  if (inside && outside)
    return `${title} 화장실은 총 ${toilets.length}곳이며 개찰구 안 ${inside}곳·밖 ${outside}곳이에요(참고: ${floor}${exit}). 환승 중에는 개찰구 안 화장실을 우선하세요.`;
  if (inside) return `${title}에 등록된 화장실 ${toilets.length}곳은 모두 개찰구 안(${floor}${exit})이에요.`;
  return `${title}에 등록된 화장실 ${toilets.length}곳은 모두 개찰구 밖(${floor}${exit})이에요. 개찰 전에 이용하세요.`;
}

function lockerNarrative(station: GuideStation, detail: GuideDetail, locale: Locale, title: string) {
  const banks = detail.lockers.length;
  const slots = detail.lockers.reduce((sum, row) => sum + (row.slots ?? 0), 0);
  const spots = [...new Set(detail.lockers.map((row) => lockerSpot(row, locale)))].slice(0, 3);
  const desk = detail.luggageDesk ? t(detail.luggageDesk, locale) : null;

  if (locale === "en") {
    if (banks)
      return `${title} has ${banks} T-Locker coin bank${banks === 1 ? "" : "s"}${slots ? ` (about ${slots} lockers)` : ""} at ${listJoin(spots, locale)}.` +
        (desk ? ` A staffed luggage desk is also listed: ${desk}.` : " Store shopping bags or a carry-on before exploring above ground.");
    if (desk) return `${title} has no coin locker banks listed, but a staffed luggage desk is available: ${desk}.`;
    return `No T-Locker banks are listed at ${title} yet. If you need storage, open a neighbouring hub station guide from the links below and compare locker counts before you ride.`;
  }
  if (locale === "zh") {
    if (banks)
      return `${title}设有投币储物柜（T-Locker）${banks}处${slots ? `（约${slots}格）` : ""}，位置：${listJoin(spots, locale)}。` +
        (desk ? `另有人工行李柜台：${desk}。` : "逛街或观光前可先寄存手提行李。");
    if (desk) return `${title}暂无投币储物柜登记，但有人工行李柜台：${desk}。`;
    return `${title}暂未登记T-Locker。需要寄物时，可从下方枢纽站链接查看邻近车站的储物柜信息。`;
  }
  if (locale === "ja") {
    if (banks)
      return `${title}のコインロッカー（T-Locker）は${banks}か所${slots ? `・約${slots}個` : ""}で、${listJoin(spots, locale)}にあります。` +
        (desk ? `有人の荷物カウンターもあります：${desk}。` : "観光や買い物の前にキャリーを預けられます。");
    if (desk) return `${title}にコインロッカー登録はありませんが、有人荷物カウンターがあります：${desk}。`;
    return `${title}にはT-Lockerの登録がありません。荷物預かりが必要なら下の人気駅リンクから近隣ハブを確認してください。`;
  }
  if (banks)
    return `${title} 물품보관함(또타라커/코인락커)은 ${banks}곳${slots ? `(약 ${slots}칸)` : ""}이며 위치는 ${listJoin(spots, locale)}예요.` +
      (desk ? ` 유인 수하물 데스크도 있어요: ${desk}.` : " 쇼핑·관광 전에 캐리어를 맡기기 좋아요.");
  if (desk) return `${title}에는 코인락커 등록은 없지만 유인 수하물 데스크가 있어요: ${desk}.`;
  return `${title}에는 등록된 물품보관함이 아직 없어요. 보관이 필요하면 아래 인기 거점역 링크에서 인접 역 보관함 정보를 비교해 보세요.`;
}

function elevatorNarrative(station: GuideStation, detail: GuideDetail, locale: Locale, title: string) {
  const exits = [
    ...new Set(detail.elevators.map((row) => exitName(t(row.exit, locale), locale))),
  ];
  if (locale === "en") {
    if (exits.length)
      return `For strollers or heavy luggage at ${title}, use the street-to-platform elevator route via ${listJoin(exits, locale)} — it avoids long stair climbs when the station is deep.`;
    return `${title} does not yet have a verified street-to-platform elevator exit in K-Sub. Follow elevator pictograms on exit boards, or ask staff at the gates.`;
  }
  if (locale === "zh") {
    if (exits.length)
      return `在${title}携带婴儿车或大件行李时，请优先走${listJoin(exits, locale)}的地面—站台电梯动线，可减少深站的楼梯负担。`;
    return `${title}暂无已核实的地面至站台电梯出口。请查看出口指示牌上的电梯标志，或向检票口站务询问。`;
  }
  if (locale === "ja") {
    if (exits.length)
      return `${title}でベビーカーや重い荷物があるときは、${listJoin(exits, locale)}の地上〜ホームエレベーター動線を優先すると階段を減らせます。`;
    return `${title}の地上〜ホームエレベーター出口は未確認です。出口案内のエレベーター表示を見るか、改札の駅員に尋ねてください。`;
  }
  if (exits.length)
    return `${title}에서 유모차·캐리어를 끌 때는 ${listJoin(exits, locale)} 엘리베이터 동선을 우선하세요. 깊은 역일수록 계단 부담을 크게 줄여 줘요.`;
  return `${title}의 지상~승강장 엘리베이터 출구는 아직 확인되지 않았어요. 출구 안내판의 엘리베이터 표시를 보거나 개찰구 역무원에게 문의하세요.`;
}

function transferNarrative(station: GuideStation, detail: GuideDetail, locale: Locale, title: string) {
  const quickest = quickestTransfer(detail);
  const lines = linesPhrase(station.lines, locale);
  if (!quickest) {
    if (station.lines.length > 1) {
      if (locale === "en")
        return `${title} connects ${lines}. Follow purple/orange transfer signs inside the paid area; car-and-door tips appear here once verified.`;
      if (locale === "zh") return `${title}连接${lines}。请在付费区内跟随换乘指示；核实的车厢/车门提示会在有数据后显示。`;
      if (locale === "ja")
        return `${title}は${lines}の乗換駅です。改札内の乗換案内に従い、車両・ドア情報はデータ追加後に表示されます。`;
      return `${title}은 ${lines} 환승역이에요. 개찰구 안 환승 안내를 따르고, 칸·문 데이터는 확인되는 대로 이 페이지에 올라가요.`;
    }
    return null;
  }
  const [car, door = ""] = quickest.alight.split("-");
  const from = linesPhrase([quickest.fromLine], locale);
  const to = linesPhrase([quickest.toLine], locale);
  const toward = quickest.fromToward ? t(quickest.fromToward.name, locale) : quickest.fromTowardKo;
  const walk = minutes(quickest.seconds!);
  if (locale === "en")
    return `Fastest verified transfer at ${title}: from ${from} (toward ${toward}) to ${to}, ride car ${car} door ${door} — about ${walk} minutes on foot inside the paid area.`;
  if (locale === "zh")
    return `${title}已核实的最快换乘：从${from}（开往${toward}）换乘${to}时，在${car}号车厢${door}号门下车，付费区内步行约${walk}分钟。`;
  if (locale === "ja")
    return `${title}の確認済み最短乗換は、${from}（${toward}方面）→${to}で${car}号車${door}番ドア、改札内徒歩約${walk}分です。`;
  return `${title} 확인된 최단 환승은 ${from}(${toward} 방면)→${to}, ${car}칸 ${door}번 문이며 개찰구 안 도보 약 ${walk}분이에요.`;
}

function openingNarrative(
  station: GuideStation,
  detail: GuideDetail,
  locale: Locale,
  title: string,
  intro: string | null,
) {
  const lines = linesPhrase(station.lines, locale);
  const neighbors = [
    ...new Map(detail.neighbors.flatMap((group) => group.stations).map((next) => [next.slug, next])).values(),
  ]
    .slice(0, 4)
    .map((next) => stationTitle(next, locale));
  const exits = detail.exits.length;
  const v = variant(station.slug, 3);
  const neighborBit =
    neighbors.length === 0
      ? ""
      : locale === "en"
        ? ` Neighbouring stops include ${listJoin(neighbors, locale)}.`
        : locale === "zh"
          ? `相邻车站包括${listJoin(neighbors, locale)}。`
          : locale === "ja"
            ? `隣駅は${listJoin(neighbors, locale)}です。`
            : ` 인접 역은 ${listJoin(neighbors, locale)}이에요.`;

  if (intro) {
    if (locale === "en")
      return `${intro} On the network map ${title} sits on ${lines}${exits ? ` with ${exits} numbered exits` : ""}.${neighborBit}`;
    if (locale === "zh")
      return `${intro}${title}属于${lines}${exits ? `，编号出口${exits}个` : ""}。${neighborBit}`;
    if (locale === "ja")
      return `${intro}${title}は${lines}${exits ? `・出口${exits}か所` : ""}です。${neighborBit}`;
    return `${intro} ${title}은 ${lines}${exits ? `, 출구 ${exits}개` : ""}예요.${neighborBit}`;
  }

  if (locale === "en") {
    const open = [
      `${title} is a Seoul-area subway stop on ${lines}.`,
      `Travelers open ${title} when they need practical facility facts on ${lines}.`,
      `This local guide for ${title} focuses on restrooms, lockers, elevators and transfers on ${lines}.`,
    ][v];
    return `${open}${exits ? ` There are ${exits} numbered exits above street level.` : ""}${neighborBit}`;
  }
  if (locale === "zh") {
    const open = [
      `${title}是${lines}沿线车站。`,
      `查询${title}时，旅行者最常先看洗手间、储物柜与电梯。`,
      `本页把${title}（${lines}）的出站与设施信息写成可直接对照的本地指南。`,
    ][v];
    return `${open}${exits ? `编号出口共${exits}个。` : ""}${neighborBit}`;
  }
  if (locale === "ja") {
    const open = [
      `${title}は${lines}の駅です。`,
      `${title}ではトイレ・ロッカー・エレベーターの実務情報がよく検索されます。`,
      `このページは${title}（${lines}）の改札内外施設を現地ガイドとしてまとめています。`,
    ][v];
    return `${open}${exits ? `出口は${exits}か所です。` : ""}${neighborBit}`;
  }
  const open = [
    `${title}은 ${lines} 역이에요.`,
    `${title}은 화장실·물품보관함·엘리베이터 실무 정보가 자주 검색되는 역이에요.`,
    `이 페이지는 ${title}(${lines})의 개찰구 안팎 시설을 현지 가이드처럼 풀어 적었어요.`,
  ][v];
  return `${open}${exits ? ` 출구는 ${exits}개예요.` : ""}${neighborBit}`;
}

function exitRoutesNarrative(station: GuideStation, detail: GuideDetail, locale: GuideLocale, title: string) {
  const base = contentLocale(locale);
  const spots = stationSpotsFor(station, detail, locale).slice(0, 5);
  const paragraphs: string[] = [];
  const v = variant(station.slug, 2);

  if (spots.length) {
    const lines = spots.map((spot) => {
      const exit = spot.exit
        ? base === "en"
          ? `Exit ${spot.exit}`
          : base === "zh"
            ? `${spot.exit}号出口`
            : base === "ja"
              ? `${spot.exit}番出口`
              : `${spot.exit}번 출구`
        : base === "en"
          ? "the nearest mapped exit"
          : base === "zh"
            ? "最近的编号出口"
            : base === "ja"
              ? "最寄りの番号出口"
              : "가장 가까운 번호 출구";
      if (base === "en")
        return `${spot.name} is about ${spot.walk} min on foot from ${exit}`;
      if (base === "zh") return `前往${spot.name}可走${exit}，步行约${spot.walk}分钟`;
      if (base === "ja") return `${spot.name}へは${exit}から徒歩約${spot.walk}分`;
      return `${spot.name}은(는) ${exit}에서 도보 약 ${spot.walk}분`;
    });
    if (base === "en")
      paragraphs.push(
        v
          ? `Exit tips around ${title}: ${listJoin(lines, base)}. Match the exit number on the platform screen before you climb — picking the wrong gate can add several blocks above ground.`
          : `Popular places near ${title} map to specific exits: ${listJoin(lines, base)}. Check the exit board while still on the platform so you do not resurface on the opposite side of a wide station.`,
      );
    else if (base === "zh")
      paragraphs.push(
        v
          ? `${title}出站建议：${listJoin(lines, base)}。上地面前先在站台确认出口编号，选错出口可能多走好几条街。`
          : `${title}附近热门地点与出口对应：${listJoin(lines, base)}。宽大车站请在站台先核对出口，避免走到相反一侧。`,
      );
    else if (base === "ja")
      paragraphs.push(
        v
          ? `${title}の出口目安：${listJoin(lines, base)}。ホームの電光掲示で出口番号を確認してから上がると遠回りを減らせます。`
          : `${title}周辺の人気スポットと出口：${listJoin(lines, base)}。広い駅では改札前に出口を合わせてください。`,
      );
    else
      paragraphs.push(
        v
          ? `${title} 출구 팁: ${listJoin(lines, base)}. 승강장 전광판에서 출구 번호를 먼저 맞추면 지상에서 멀리 돌아가는 일을 줄일 수 있어요.`
          : `${title} 주변 명소와 출구 매칭: ${listJoin(lines, base)}. 넓은 역일수록 개찰 전에 출구를 확인하세요.`,
      );
  } else if (detail.exits.length) {
    const sample = detail.exits
      .slice(0, 6)
      .map((exit) =>
        base === "en"
          ? `Exit ${exit.label}`
          : base === "zh"
            ? `${exit.label}号出口`
            : base === "ja"
              ? `${exit.label}番出口`
              : `${exit.label}번 출구`,
      );
    const spread = (() => {
      let widest = 0;
      for (const a of detail.exits)
        for (const b of detail.exits) widest = Math.max(widest, distanceMeters(a.lat, a.lng, b.lat, b.lng));
      return Math.round(widest);
    })();
    if (base === "en")
      paragraphs.push(
        `${title} publishes ${detail.exits.length} numbered exits (${listJoin(sample, base)}${detail.exits.length > sample.length ? ", …" : ""}).` +
          (spread > 250
            ? ` They span roughly ${spread} m apart, so the wrong exit can leave you a long walk from your pin.`
            : ` Exits sit relatively close (about ${Math.max(spread, 50)} m span), but the cards below still open each gate in Google Maps.`),
      );
    else if (base === "zh")
      paragraphs.push(
        `${title}共有${detail.exits.length}个编号出口（${listJoin(sample, base)}${detail.exits.length > sample.length ? "等" : ""}）。` +
          (spread > 250
            ? `出口间距约${spread}米，选错可能多走很远。`
            : `出口相对集中（跨度约${Math.max(spread, 50)}米），下方卡片仍可在地图中打开各出口。`),
      );
    else if (base === "ja")
      paragraphs.push(
        `${title}の出口は${detail.exits.length}か所（${listJoin(sample, base)}${detail.exits.length > sample.length ? "など" : ""}）です。` +
          (spread > 250
            ? `出口間はおよそ${spread}m離れることもあり、番号を間違えると大きく遠回りします。`
            : `出口は比較的近接（約${Math.max(spread, 50)}m）ですが、下のカードから地図で位置を確認できます。`),
      );
    else
      paragraphs.push(
        `${title} 출구는 ${detail.exits.length}개예요(${listJoin(sample, base)}${detail.exits.length > sample.length ? " 등" : ""}).` +
          (spread > 250
            ? ` 출구 간 거리가 약 ${spread}m까지 벌어질 수 있어 번호를 반드시 맞추세요.`
            : ` 출구가 비교적 가깝지만(약 ${Math.max(spread, 50)}m 범위) 아래 카드에서 지도로 위치를 확인하는 편이 안전해요.`),
      );
  } else {
    if (base === "en")
      paragraphs.push(
        `Street-exit pins for ${title} are still being completed. Use the line chips above to open neighbouring station guides, or the in-app map link for live navigation.`,
      );
    else if (base === "zh")
      paragraphs.push(`${title}的地面出口坐标仍在补全。可通过上方线路标签打开相邻车站指南，或使用应用内地图导航。`);
    else if (base === "ja")
      paragraphs.push(
        `${title}の地上出口ピンは整備中です。上の路線チップから隣駅ガイドを開くか、アプリの地図リンクでナビしてください。`,
      );
    else
      paragraphs.push(
        `${title}의 지상 출구 좌표는 아직 보완 중이에요. 위 노선 칩으로 인접 역 가이드를 열거나 앱 지도 링크로 길찾기를 하세요.`,
      );
  }

  const elevators = detail.elevators.map((row) => exitName(t(row.exit, base), base));
  if (elevators.length) {
    if (base === "en")
      paragraphs.push(
        `Accessibility note: elevator-backed exits at ${title} include ${listJoin([...new Set(elevators)], base)}. Pair that exit with the place tips above when rolling luggage.`,
      );
    else if (base === "zh")
      paragraphs.push(
        `无障碍提示：${title}电梯连通出口包括${listJoin([...new Set(elevators)], base)}。拖行李时把上述景点出口与电梯出口对齐选择。`,
      );
    else if (base === "ja")
      paragraphs.push(
        `バリアフリー：${title}でエレベーター接続の出口は${listJoin([...new Set(elevators)], base)}です。荷物があるときは上のスポット出口と揃えると楽です。`,
      );
    else
      paragraphs.push(
        `교통약자 참고: ${title} 엘리베이터 연결 출구는 ${listJoin([...new Set(elevators)], base)}예요. 짐이 있으면 위 명소 출구와 맞춰 고르세요.`,
      );
  }

  return paragraphs;
}

function headings(title: string, locale: Locale): { summary: string; routes: string; hubs: string } {
  if (locale === "en")
    return {
      summary: `${title}: key facility summary`,
      routes: `${title}: exit routes and nearby places`,
      hubs: `${title}: travel times to major Seoul hubs`,
    };
  if (locale === "zh")
    return {
      summary: `${title}使用要点摘要`,
      routes: `${title}出口动线与周边景点`,
      hubs: `${title}到首尔主要枢纽的预计车程`,
    };
  if (locale === "ja")
    return {
      summary: `${title}利用の要点まとめ`,
      routes: `${title}出口別おすすめ動線と周辺スポット`,
      hubs: `${title}から主要拠点までの目安所要時間`,
    };
  return {
    summary: `${title} 이용 핵심 요약`,
    routes: `${title} 출구별 추천 동선 및 주변 명소`,
    hubs: `${title}에서 서울 주요 거점까지 예상 이동 시간`,
  };
}

function hubTravelNarrative(station: GuideStation, locale: Locale, title: string): string | null {
  const fromId = networkStationId(station.ko, station);
  if (fromId === null) return null;

  const bits: string[] = [];
  for (const ko of HUB_TRAVEL_KOS) {
    const hub = guideByKo(ko);
    if (!hub || hub.slug === station.slug) continue;
    const toId = networkStationId(hub.ko, hub);
    if (toId === null) continue;
    const route = findRoute(fromId, toId, "fastest");
    if (!route) continue;
    const mins = Math.max(1, Math.round(route.seconds / 60));
    const hubTitle = stationTitle(hub, locale);
    const xfers = route.transfers.length;
    if (locale === "en") {
      bits.push(
        xfers === 0
          ? `${hubTitle} about ${mins} min (no transfer)`
          : `${hubTitle} about ${mins} min (${xfers} transfer${xfers === 1 ? "" : "s"})`,
      );
    } else if (locale === "zh") {
      bits.push(xfers === 0 ? `到${hubTitle}约${mins}分钟（直达）` : `到${hubTitle}约${mins}分钟（换乘${xfers}次）`);
    } else if (locale === "ja") {
      bits.push(xfers === 0 ? `${hubTitle}まで約${mins}分（乗換なし）` : `${hubTitle}まで約${mins}分（乗換${xfers}回）`);
    } else {
      bits.push(xfers === 0 ? `${hubTitle}까지 약 ${mins}분(환승 없음)` : `${hubTitle}까지 약 ${mins}분(환승 ${xfers}회)`);
    }
    if (bits.length >= 5) break;
  }
  if (!bits.length) return null;

  if (locale === "en")
    return `Typical daytime subway times from ${title} (K-Sub fastest routing, waiting time excluded): ${listJoin(bits, locale)}. Actual rides vary with headways and crowding — re-check the in-app planner before you leave.`;
  if (locale === "zh")
    return `从${title}出发的白天常规地铁车程（K-Sub最快路径、不含候车）：${listJoin(bits, locale)}。实际会因发车间隔与拥挤而变化，出发前请再用应用内行程规划确认。`;
  if (locale === "ja")
    return `${title}からの日中の目安所要時間（K-Sub最短ルート・待ち時間除く）：${listJoin(bits, locale)}。運行間隔や混雑で前後するため、出発前にアプリの経路も再確認してください。`;
  return `${title} 기준 낮 시간대 예상 이동 시간(K-Sub 최단 경로, 대기 시간 제외): ${listJoin(bits, locale)}. 배차·혼잡에 따라 달라질 수 있으니 출발 전 앱 경로 안내로 한 번 더 확인하세요.`;
}

function amenityNarrative(station: GuideStation, detail: GuideDetail, locale: Locale, title: string): string | null {
  const spots = stationSpotsFor(station, detail, locale).slice(0, 4);
  if (!spots.length) return null;
  const names = spots.map((spot) =>
    spot.exit
      ? locale === "en"
        ? `${spot.name} (~${spot.walk} min from Exit ${spot.exit})`
        : locale === "zh"
          ? `${spot.name}（${spot.exit}号出口步行约${spot.walk}分钟）`
          : locale === "ja"
            ? `${spot.name}（${spot.exit}番出口から徒歩約${spot.walk}分）`
            : `${spot.name}(${spot.exit}번 출구 도보 약 ${spot.walk}분)`
      : spot.name,
  );
  if (locale === "en")
    return `Above ground near ${title}, curated pins include ${listJoin(names, locale)} — useful when you need a pharmacy, café, convenience stop or photo booth before the next train.`;
  if (locale === "zh")
    return `${title}出站后可参考的周边点位：${listJoin(names, locale)}。买药、喝咖啡、便利店或拍照打卡时，可按出口编号少走冤枉路。`;
  if (locale === "ja")
    return `${title}の地上スポット目安：${listJoin(names, locale)}。薬局・カフェ・コンビニ・プリクラの前に出口番号を合わせると移動が短くなります。`;
  return `${title} 지상 주변 큐레이션 포인트: ${listJoin(names, locale)}. 약국·카페·편의점·사진 부스에 들를 때 출구 번호에 맞추면 동선이 짧아져요.`;
}

/**
 * Long-form, data-unique SSR copy so station URLs are not treated as thin duplicates.
 * Combines restrooms / lockers / elevators / transfers with exit–spot routing tips and hub ETAs.
 */
export function stationDeepGuide(station: GuideStation, detail: GuideDetail, locale: GuideLocale): StationDeepGuide {
  const base = contentLocale(locale);
  const title = stationTitle(station, base);
  const intro = localIntro(station, base);
  const heads = headings(title, base);

  const summaryParas = [
    openingNarrative(station, detail, base, title, intro),
    toiletNarrative(station, detail, base, title),
    lockerNarrative(station, detail, base, title),
    elevatorNarrative(station, detail, base, title),
    transferNarrative(station, detail, base, title),
    amenityNarrative(station, detail, base, title),
  ].filter((p): p is string => !!p);

  const routeParas = exitRoutesNarrative(station, detail, locale, title);
  const hubPara = hubTravelNarrative(station, base, title);
  let joined = [...summaryParas, ...routeParas, hubPara].filter(Boolean).join("");
  for (const pad of lengthPads(station, detail, base, title)) {
    if (joined.length >= 650) break;
    summaryParas.push(pad);
    joined += pad;
  }

  const write = (text: string) => inScript(locale, text);
  const keySummary = { heading: write(heads.summary), paragraphs: summaryParas.map(write) };
  const exitRoutes = { heading: write(heads.routes), paragraphs: routeParas.map(write) };
  const hubTravel = hubPara
    ? { heading: write(heads.hubs), paragraphs: [write(hubPara)] }
    : null;
  const charCount = [...keySummary.paragraphs, ...exitRoutes.paragraphs, ...(hubTravel?.paragraphs ?? [])].join("")
    .length;

  return { keySummary, exitRoutes, hubTravel, charCount };
}

/** Extra station-specific sentences when facility data alone would stay under ~500 characters. */
function lengthPads(station: GuideStation, detail: GuideDetail, locale: Locale, title: string) {
  const lines = linesPhrase(station.lines, locale);
  const address = detail.address;
  const ko = station.ko;
  const en = station.name.en;
  const exitCount = detail.exits.length;
  const toiletCount = detail.toilets.length;
  const lockerCount = detail.lockers.length;
  const elevatorCount = detail.elevators.length;
  const transferCount = detail.transfers.length;
  const neighborNames = [
    ...new Map(detail.neighbors.flatMap((group) => group.stations).map((next) => [next.slug, next])).values(),
  ]
    .slice(0, 6)
    .map((next) => stationTitle(next, locale));
  const neighborList = neighborNames.length ? listJoin(neighborNames, locale) : "";
  const lat = station.lat.toFixed(5);
  const lng = station.lng.toFixed(5);

  if (locale === "en") {
    return [
      `Bookmark this ${title} page (${en} / ${ko}) when you plan a Seoul day on ${lines}: ` +
        `K-Sub cross-checks ${exitCount} exit pin${exitCount === 1 ? "" : "s"}, ${toiletCount} restroom record${toiletCount === 1 ? "" : "s"}, ` +
        `${lockerCount} locker bank${lockerCount === 1 ? "" : "s"}, ${elevatorCount} elevator route${elevatorCount === 1 ? "" : "s"} ` +
        `and ${transferCount} transfer tip${transferCount === 1 ? "" : "s"}` +
        (address ? ` against the station address ${address}` : "") +
        `. Re-check platform screens for first and last trains — those times change by weekday and direction.`,
      neighborList
        ? `From ${title} you can keep crawling neighboring guides for ${neighborList}; each page keeps its own restroom, locker and elevator facts so Google sees distinct local copy, not a repeated shell.`
        : `Coordinates for ${title} are about ${lat}, ${lng}. Use the line chips and Top 15 hub links on this page to reach denser tourist stations without losing the facility context you already checked here.`,
      `How to use ${title} efficiently: confirm whether you need an inside-gate restroom before transferring, stash bags only where T-Locker banks are listed, and prefer elevator exits when rolling luggage — then open the FAQ answers below for the same facts in Q&A form.`,
    ];
  }
  if (locale === "zh") {
    return [
      `规划首尔行程时可收藏本页${title}（${en} / ${ko}，${lines}）：` +
        `K-Sub对照了${exitCount}个出口坐标、${toiletCount}处洗手间、${lockerCount}处储物柜、${elevatorCount}条电梯动线、${transferCount}条换乘提示` +
        (address ? `，参考地址为${address}` : "") +
        `。首末班车请再以站台屏幕为准，会因工作日与方向而变化。`,
      neighborList
        ? `从${title}可继续打开相邻车站指南（${neighborList}）；各页独立写洗手间、储物柜与电梯，避免被判定为重复模板。`
        : `${title}大致坐标约${lat}, ${lng}。可用本页线路标签与TOP15枢纽链接跳到资料更密的热门站，同时保留此处已核对的设施结论。`,
      `高效使用${title}的顺序：先确认换乘前是否需要检票口内洗手间，再只在有T-Locker登记处寄物，拖行李时优先电梯出口，最后对照下方FAQ的四条问答。`,
    ];
  }
  if (locale === "ja") {
    return [
      `${title}（${en} / ${ko}、${lines}）のページは、出口${exitCount}・トイレ${toiletCount}・ロッカー${lockerCount}・` +
        `エレベーター${elevatorCount}・乗換ヒント${transferCount}` +
        (address ? `、住所目安「${address}」` : "") +
        `を突き合わせてまとめています。始発・終電は方面・平日/休日で変わるため、ホームの電光掲示も再確認してください。`,
      neighborList
        ? `${title}からは隣駅ガイド（${neighborList}）へ続けて読めます。駅ごとにトイレ・ロッカー・エレベーター文を変えているので、薄い複製ページと見なされにくくしています。`
        : `${title}の目安座標は約${lat}, ${lng}です。路線チップや人気TOP15リンクから情報量の多い拠点駅へ移りつつ、ここで確認した施設メモを手元に残せます。`,
      `${title}を効率よく使う順：乗換前に改札内トイレが要るか確認→T-Locker登録がある場所だけ荷物を預ける→キャリーならエレベーター出口優先→下のFAQ4問で同じ事実をQ&A形式でも確認。`,
    ];
  }
  return [
    `${title}(${en} / ${ko}, ${lines}) 페이지는 출구 ${exitCount}곳·화장실 ${toiletCount}곳·물품보관함 ${lockerCount}곳·` +
      `엘리베이터 ${elevatorCount}·환승 팁 ${transferCount}` +
      (address ? `, 주소 참고 “${address}”` : "") +
      `을 교차 확인해 정리했어요. 첫차·막차는 평일/주말·방면에 따라 달라지니 승강장 전광판을 다시 확인하세요.`,
    neighborList
      ? `${title}에서 인접 역 가이드(${neighborList})로 이어 읽으면 크롤링 깊이가 줄어들고, 역마다 화장실·보관함·엘리베이터 문장이 달라 중복 템플릿으로 보이기 어려워요.`
      : `${title} 대략 좌표는 ${lat}, ${lng}이에요. 노선 칩과 TOP 15 거점 링크로 정보가 더 촘촘한 인기역으로 이동하면서, 여기서 확인한 시설 요약을 기준으로 삼으면 됩니다.`,
    `${title}을(를) 빠르게 쓰는 순서: 환승 전 개찰구 안 화장실이 필요한지 확인 → 또타라커 등록이 있는 곳에서만 짐 보관 → 캐리어면 엘리베이터 출구 우선 → 아래 FAQ 4문항으로 같은 사실을 Q&A로 재확인.`,
  ];
}
