import { distanceMeters, GUIDE_STATIONS, sameGuideLine, type GuideDetail, type GuideStation } from "./guide";
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
import { t, type Locale, type Localized } from "./i18n";
import { formatWon, LOCKER_HOURS, LOCKER_SIZES } from "./luggage";
import { stationSpotsFor } from "./planner";
import { LOCAL_GUIDES_CHECKED, STATION_LOCAL_GUIDES, type LocalNoteKind, type StationLocalGuide } from "./stationLocalGuides";
import { STATION_LOCKERS } from "./stationLockers";

export type StationOverview = {
  /** What the station is and where it leads: lines, area, neighbouring stops, nearby spots, exits. */
  overview: string[];
  /** Restrooms, lockers, elevators and transfers, written out for this station. */
  tips: string[];
  /** Hand-written local notes; empty outside the stations in STATION_LOCAL_GUIDES. */
  notes: { kind: LocalNoteKind; text: string }[];
  checked: string | null;
};

/** Exits further apart than this get a "check the number first" warning; closer than COMPACT reads as one cluster. */
const WIDE_EXITS_METERS = 400;
const COMPACT_EXITS_METERS = 150;
/** Spots and lockers further than this are no longer "nearby" for someone standing at the station. */
const NEAREST_LOCKER_METERS = 3000;
const MAX_SPOTS = 3;
const MAX_NEIGHBOR_LINES = 2;

type Names = [en: string, zh: string, ja: string];

const SEOUL_GU: Record<string, Names> = {
  종로구: ["Jongno-gu", "钟路区", "鍾路区"],
  중구: ["Jung-gu", "中区", "中区"],
  용산구: ["Yongsan-gu", "龙山区", "龍山区"],
  성동구: ["Seongdong-gu", "城东区", "城東区"],
  광진구: ["Gwangjin-gu", "广津区", "広津区"],
  동대문구: ["Dongdaemun-gu", "东大门区", "東大門区"],
  중랑구: ["Jungnang-gu", "中浪区", "中浪区"],
  성북구: ["Seongbuk-gu", "城北区", "城北区"],
  강북구: ["Gangbuk-gu", "江北区", "江北区"],
  도봉구: ["Dobong-gu", "道峰区", "道峰区"],
  노원구: ["Nowon-gu", "芦原区", "蘆原区"],
  은평구: ["Eunpyeong-gu", "恩平区", "恩平区"],
  서대문구: ["Seodaemun-gu", "西大门区", "西大門区"],
  마포구: ["Mapo-gu", "麻浦区", "麻浦区"],
  양천구: ["Yangcheon-gu", "阳川区", "陽川区"],
  강서구: ["Gangseo-gu", "江西区", "江西区"],
  구로구: ["Guro-gu", "九老区", "九老区"],
  금천구: ["Geumcheon-gu", "衿川区", "衿川区"],
  영등포구: ["Yeongdeungpo-gu", "永登浦区", "永登浦区"],
  동작구: ["Dongjak-gu", "铜雀区", "銅雀区"],
  관악구: ["Gwanak-gu", "冠岳区", "冠岳区"],
  서초구: ["Seocho-gu", "瑞草区", "瑞草区"],
  강남구: ["Gangnam-gu", "江南区", "江南区"],
  송파구: ["Songpa-gu", "松坡区", "松坡区"],
  강동구: ["Gangdong-gu", "江东区", "江東区"],
};

const GYEONGGI_CITIES: Record<string, Names> = {
  광명시: ["Gwangmyeong", "光明市", "光明市"],
  성남시: ["Seongnam", "城南市", "城南市"],
  하남시: ["Hanam", "河南市", "河南市"],
  의정부시: ["Uijeongbu", "议政府市", "議政府市"],
};

/** "Mapo-gu, Seoul" from the road address; null for areas without a translated name. */
function district(address: string | null): Localized | null {
  const [province, area] = address?.split(" ") ?? [];
  const seoul = province === "서울특별시" ? SEOUL_GU[area] : undefined;
  if (seoul) return { ko: `서울 ${area}`, en: `${seoul[0]}, Seoul`, zh: `首尔${seoul[1]}`, ja: `ソウル・${seoul[2]}` };
  const city = province === "경기도" ? GYEONGGI_CITIES[area] : undefined;
  if (city) return { ko: `경기 ${area}`, en: `${city[0]}, Gyeonggi-do`, zh: `京畿道${city[1]}`, ja: `京畿道${city[2]}` };
  return null;
}

/** Final-consonant index of the last syllable; null when the word doesn't end in Hangul. */
function batchim(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code < 0 || code > 11171 ? null : code % 28;
}

/** Korean particle pair (은/는, 이/가, 과/와, 이에요/예요) picked by the last syllable of `word`. */
function josa(word: string, afterConsonant: string, afterVowel: string) {
  return word + (batchim(word) ? afterConsonant : afterVowel);
}

/** 으로 after a final consonant other than ㄹ, 로 otherwise. */
function ro(word: string) {
  const final = batchim(word);
  return word + (final && final !== 8 ? "으로" : "로");
}

/** Greatest distance between two exits, rounded to 50 m. */
function exitSpread(detail: GuideDetail) {
  let widest = 0;
  for (const a of detail.exits)
    for (const b of detail.exits) widest = Math.max(widest, distanceMeters(a.lat, a.lng, b.lat, b.lng));
  return Math.max(50, Math.round(widest / 50) * 50);
}

const LOCKER_STATIONS = GUIDE_STATIONS.filter((station) =>
  (STATION_LOCKERS[station.ko] ?? []).some((row) => station.lines.some((line) => sameGuideLine(line, row.line))),
);

function nearestLockers(station: GuideStation) {
  let best: GuideStation | null = null;
  let bestDistance = Infinity;
  for (const other of LOCKER_STATIONS) {
    if (other.slug === station.slug) continue;
    const distance = distanceMeters(station.lat, station.lng, other.lat, other.lng);
    if (distance < bestDistance) {
      best = other;
      bestDistance = distance;
    }
  }
  return best && bestDistance <= NEAREST_LOCKER_METERS ? { station: best, km: Math.round(bestDistance / 100) / 10 } : null;
}

/** The station's own line order (numbered Seoul lines first in the index), so its main line is described first. */
function lineRank(station: GuideStation, line: string) {
  const index = station.lines.findIndex((own) => sameGuideLine(own, line));
  return index < 0 ? station.lines.length : index;
}

function localGuide(station: GuideStation): StationLocalGuide | null {
  const guide = STATION_LOCAL_GUIDES[station.ko];
  if (!guide) return null;
  return !guide.line || station.lines.some((line) => sameGuideLine(line, guide.line!)) ? guide : null;
}

type Facts = {
  title: string;
  lines: string;
  multiLine: boolean;
  district: string | null;
  intro: string | null;
  neighbors: { line: string; names: string[] }[];
  /** Nearby spots grouped by the exit to use, in the order the exits first come up. */
  spots: { exit: string; items: { name: string; walk: number }[] }[];
  exits: number;
  spread: number;
  toilets: { total: number; inside: number; floor: string; exit: string } | null;
  lockers: { banks: number; slots: number; spot: string } | null;
  lockerPrice: string;
  desk: string | null;
  nearest: { name: string; km: number; adjacent: boolean } | null;
  elevatorExits: string[];
  transfer: { from: string; to: string; toward: string; car: string; door: string; walk: number; longest: number } | null;
  /** Picks between equivalent sentence openings so neighbouring pages don't read identically. */
  variant: number;
};

function facts(station: GuideStation, detail: GuideDetail, locale: Locale): Facts {
  const guide = localGuide(station);
  const area = district(detail.address);
  const insideToilets = detail.toilets.filter((row) => row.gate === "inside");
  const toilet = insideToilets[0] ?? detail.toilets[0];
  const biggest = [...detail.lockers].sort((a, b) => (b.slots ?? 0) - (a.slots ?? 0))[0];
  const quickest = quickestTransfer(detail);
  const walks = detail.transfers.map((row) => row.seconds).filter((value): value is number => value !== null);
  const [car, door = ""] = quickest?.alight.split("-") ?? [];
  const nearest = detail.lockers.length || detail.luggageDesk ? null : nearestLockers(station);
  const adjacent = new Set(detail.neighbors.flatMap((group) => group.stations.map((next) => next.slug)));
  return {
    title: stationTitle(station, locale),
    lines: linesPhrase(station.lines, locale),
    multiLine: station.lines.length > 1,
    district: area ? t(area, locale) : null,
    intro: guide ? t(guide.intro, locale) : null,
    neighbors: detail.neighbors
      .filter((group) => group.stations.length)
      .sort((a, b) => lineRank(station, a.line) - lineRank(station, b.line))
      .slice(0, MAX_NEIGHBOR_LINES)
      .map((group) => ({
        line: linesPhrase([group.line], locale),
        names: group.stations.map((next) => t(next.name, locale)),
      })),
    spots: stationSpotsFor(station, detail, locale)
      .filter((spot): spot is typeof spot & { exit: string } => spot.exit !== null)
      .slice(0, MAX_SPOTS)
      .reduce<Facts["spots"]>((groups, spot) => {
        const item = { name: spot.name, walk: spot.walk };
        const group = groups.find((existing) => existing.exit === spot.exit);
        if (group) group.items.push(item);
        else groups.push({ exit: spot.exit, items: [item] });
        return groups;
      }, []),
    exits: detail.exits.length,
    spread: exitSpread(detail),
    toilets: toilet
      ? {
          total: detail.toilets.length,
          inside: insideToilets.length,
          floor: floorText(toilet.floor, locale),
          exit: toilet.exit ?? "",
        }
      : null,
    lockers: biggest
      ? {
          banks: detail.lockers.length,
          slots: detail.lockers.reduce((sum, row) => sum + (row.slots ?? 0), 0),
          spot: lockerSpot(biggest, locale),
        }
      : null,
    lockerPrice: formatWon(LOCKER_SIZES.S.base[0], locale),
    desk: detail.luggageDesk ? t(detail.luggageDesk, locale) : null,
    nearest: nearest
      ? { name: t(nearest.station.name, locale), km: nearest.km, adjacent: adjacent.has(nearest.station.slug) }
      : null,
    elevatorExits: [...new Set(detail.elevators.map((row) => exitName(t(row.exit, locale), locale)))],
    transfer: quickest
      ? {
          from: linesPhrase([quickest.fromLine], locale),
          to: linesPhrase([quickest.toLine], locale),
          toward: quickest.fromToward ? t(quickest.fromToward.name, locale) : quickest.fromTowardKo,
          car,
          door,
          walk: minutes(quickest.seconds!),
          longest: minutes(Math.max(...walks)),
        }
      : null,
    variant: [...station.slug].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 2,
  };
}

type Text = { overview: (string | false | null)[]; care: (string | false | null)[]; moving: (string | false | null)[] };

function english(f: Facts): Text {
  const where = f.district ? ` in ${f.district}` : "";
  const exitAt = f.toilets?.exit ? `, near Exit ${f.toilets.exit}` : "";
  const be = (n: number) => (n === 1 ? "is" : "are");
  const restroom = (() => {
    const r = f.toilets;
    if (!r) return null;
    const outside = r.total - r.inside;
    if (r.total === 1)
      return r.inside
        ? `The station's only restroom is inside the fare gates (${r.floor}${exitAt}), so you can use it mid-journey without tapping out.`
        : `The station's only restroom is outside the fare gates (${r.floor}${exitAt}), so go before you tap in.`;
    const all = r.total === 2 ? "Both" : `All ${r.total}`;
    if (!outside)
      return `${all} restrooms are inside the fare gates (one is on ${r.floor}${exitAt}), so you can use them mid-journey without tapping out.`;
    if (r.total === 2 && r.inside === 1)
      return `One of the two restrooms is inside the fare gates (${r.floor}${exitAt}), handy mid-journey because you don't have to tap out; the other is outside.`;
    if (r.inside)
      return `Of the ${r.total} restrooms, ${r.inside} ${be(r.inside)} inside the fare gates (${r.floor}${exitAt}), handy mid-journey because you don't have to tap out; the other ${outside} ${be(outside)} outside.`;
    return `${all} restrooms are outside the fare gates (one is on ${r.floor}${exitAt}), so go before you tap in.`;
  })();
  const deskText = f.desk && `a staffed T-Luggage desk (${f.desk}) stores big suitcases and offers same-day delivery.`;
  const transferAt = `a transfer station${where ? `${where},` : ""} where ${f.lines} meet`;
  return {
    overview: [
      ...(f.intro
        ? [f.intro, f.multiLine ? `It is ${transferAt}.` : `It is on ${f.lines}${where}.`]
        : [
            f.multiLine
              ? [`${f.title} is ${transferAt}.`, `${f.title}${where ? `,${where},` : ""} is where ${f.lines} meet.`][f.variant]
              : [`${f.title} is a stop on ${f.lines}${where}.`, `${f.title} sits on ${f.lines}${where}.`][f.variant],
          ]),
      ...f.neighbors.map(({ line, names }) => {
        const on = f.multiLine ? `On ${line}, the` : "The";
        return names.length === 1
          ? `${on} next stop is ${names[0]}.`
          : names.length === 2
            ? f.multiLine
              ? `On ${line}, it sits between ${names[0]} and ${names[1]}.`
              : `It sits between ${names[0]} and ${names[1]}.`
            : `${on} next stops are ${listJoin(names, "en")}.`;
      }),
      f.spots.length > 0 &&
        `Heading out? ${f.spots
          .map(
            (group, index) =>
              `Exit ${group.exit}${index ? " to" : " leads to"} ${listJoin(
                group.items.map((item, at) => `${item.name} (about ${item.walk} min${index || at ? "" : " on foot"})`),
                "en",
              )}`,
          )
          .join("; ")}.`,
      f.exits === 1
        ? "It has a single exit."
        : f.exits > 1 &&
          (f.spread >= WIDE_EXITS_METERS
            ? `Its ${f.exits} exits are spread over roughly ${f.spread} m, so check the exit number before you head up: the wrong one can leave you a long block from where you meant to be.`
            : f.spread <= COMPACT_EXITS_METERS
              ? `All ${f.exits} exits are within about ${f.spread} m of each other, so the exit you pick matters less here than at bigger stations.`
              : `Its ${f.exits} exits are spread over about ${f.spread} m; the exit cards below show each one on the map.`),
    ],
    care: [
      restroom,
      f.lockers
        ? `For bags, there ${f.lockers.banks === 1 ? "is 1 T-Locker bank" : `are ${f.lockers.banks} T-Locker banks`}${
            f.lockers.slots ? ` with about ${f.lockers.slots} lockers` : ""
          }; ${f.lockers.banks > 1 ? "the biggest is" : "it is"} on ${f.lockers.spot}. Small lockers start at ${f.lockerPrice} for 4 hours on weekdays, and bags go in and come out between ${LOCKER_HOURS.open}:00 and ${LOCKER_HOURS.close}:00.` +
          (deskText ? ` Also, ${deskText}` : "")
        : deskText
          ? `For bags, ${deskText}`
          : f.nearest &&
            (f.nearest.adjacent
              ? `K-SUB has no T-Locker listed here, but the next stop, ${f.nearest.name}, has them.`
              : `K-SUB has no T-Locker listed here; the closest station that has them is ${f.nearest.name}, about ${f.nearest.km} km away.`),
    ],
    moving: [
      f.elevatorExits.length > 0 &&
        `With a suitcase or stroller, use ${listJoin(f.elevatorExits, "en")}: ${
          f.elevatorExits.length > 1 ? "each has" : "it has"
        } an elevator route all the way between the street and the platform.`,
      f.transfer &&
        `Changing lines? The quickest connection is from ${f.transfer.from} to ${f.transfer.to}: ride in car ${f.transfer.car}, door ${f.transfer.door} (toward ${f.transfer.toward}) and it's about ${f.transfer.walk} min on foot.` +
          (f.transfer.longest > f.transfer.walk ? ` The longest change here takes about ${f.transfer.longest} min.` : ""),
    ],
  };
}

function korean(f: Facts): Text {
  const exitAt = f.toilets?.exit ? `, ${f.toilets.exit}번 출구 쪽` : "";
  const restroom = (() => {
    const r = f.toilets;
    if (!r) return null;
    const outside = r.total - r.inside;
    if (r.total === 1)
      return r.inside
        ? `화장실은 개찰구 안(${r.floor}${exitAt})에 1곳 있어서, 타는 도중에도 개찰구를 나가지 않고 이용할 수 있어요.`
        : `화장실은 개찰구 밖(${r.floor}${exitAt})에 1곳뿐이니 개찰구에 들어가기 전에 들르세요.`;
    if (!outside)
      return `화장실 ${r.total}곳이 모두 개찰구 안(${r.floor}${exitAt} 등)에 있어서, 타는 도중에도 개찰구를 나가지 않고 이용할 수 있어요.`;
    if (r.inside)
      return `화장실 ${r.total}곳 중 ${r.inside}곳은 개찰구 안(${r.floor}${exitAt})에 있어 개찰구를 나가지 않고 쓸 수 있고, 나머지 ${outside}곳은 개찰구 밖에 있어요.`;
    return `화장실 ${r.total}곳은 모두 개찰구 밖(${r.floor}${exitAt} 등)에 있으니 개찰구에 들어가기 전에 들르세요.`;
  })();
  const deskText = f.desk && `유인 T-Luggage 데스크(${f.desk})에서 큰 짐을 보관하거나 당일 배송을 신청할 수 있어요.`;
  const lastName = (names: string[]) => names[names.length - 1];
  return {
    overview: [
      ...(f.intro
        ? [
            f.intro,
            f.multiLine
              ? `${f.district ? `${f.district}에 있는 ` : ""}환승역으로, ${josa(f.lines, "이", "가")} 만나요.`
              : `${f.district ? `${f.district}에 있는 ` : ""}${f.lines} 역이에요.`,
          ]
        : [
            f.multiLine
              ? [
                  `${josa(f.title, "은", "는")} ${f.district ? `${f.district}에 있는 ` : ""}환승역으로, ${josa(f.lines, "이", "가")} 만나요.`,
                  `${josa(f.title, "은", "는")} ${josa(f.lines, "이", "가")} 지나는 환승역이에요.` +
                    (f.district ? ` 위치는 ${josa(f.district, "이에요", "예요")}.` : ""),
                ][f.variant]
              : f.district
                ? [
                    `${josa(f.title, "은", "는")} ${f.district}에 있는 ${f.lines} 역이에요.`,
                    `${josa(f.title, "은", "는")} ${f.lines}의 역으로, ${f.district}에 있어요.`,
                  ][f.variant]
                : `${josa(f.title, "은", "는")} ${f.lines} 역이에요.`,
          ]),
      ...f.neighbors.map(({ line, names }) => {
        const on = f.multiLine ? `${line}의 ` : "";
        return names.length === 1
          ? `${on}다음 역은 ${josa(names[0], "이에요", "예요")}.`
          : names.length === 2
            ? `${f.multiLine ? `${line}에서는 ` : ""}${josa(names[0], "과", "와")} ${names[1]} 사이에 있어요.`
            : `${on}이웃 역은 ${names.slice(0, -1).join(", ")}, ${josa(lastName(names), "이에요", "예요")}.`;
      }),
      f.spots.length > 0 &&
        `${f.spots
          .map((group) => `${group.exit}번 출구로 나가면 ${group.items.map((item) => `${item.name}(도보 약 ${item.walk}분)`).join("과 ")}`)
          .join("이, ")}이 가까워요.`,
      f.exits === 1
        ? "출구는 1개뿐이에요."
        : f.exits > 1 &&
          (f.spread >= WIDE_EXITS_METERS
            ? `출구 ${f.exits}개가 약 ${f.spread}m에 걸쳐 흩어져 있어서, 올라가기 전에 출구 번호를 꼭 확인하세요. 잘못 나오면 한참 돌아가야 할 수 있어요.`
            : f.spread <= COMPACT_EXITS_METERS
              ? `출구 ${f.exits}개가 약 ${f.spread}m 안에 모여 있어서 어느 출구로 나가도 크게 멀지 않아요.`
              : `출구는 ${f.exits}개이고 약 ${f.spread}m 범위에 나뉘어 있어요. 아래 출구 카드에서 지도로 위치를 볼 수 있어요.`),
    ],
    care: [
      restroom,
      f.lockers
        ? `짐은 물품보관함(T-Locker) ${f.lockers.banks}곳${f.lockers.slots ? `, 약 ${f.lockers.slots}칸` : ""}에 맡길 수 있어요. ${
            f.lockers.banks > 1 ? "가장 큰 보관함은" : "보관함은"
          } ${f.lockers.spot}에 있어요. 소형은 평일 4시간 ${f.lockerPrice}부터이고, ${LOCKER_HOURS.open}시부터 ${LOCKER_HOURS.close}시까지만 넣고 찾을 수 있어요.` +
          (deskText ? ` ${deskText}` : "")
        : deskText
          ? `짐은 ${deskText}`
          : f.nearest &&
            (f.nearest.adjacent
              ? `이 역에는 등록된 T-Locker 정보가 없지만, 바로 옆 ${f.nearest.name}에 보관함이 있어요.`
              : `이 역에는 등록된 T-Locker 정보가 없어요. 가장 가까운 보관함은 약 ${f.nearest.km}km 떨어진 ${f.nearest.name}에 있어요.`),
    ],
    moving: [
      f.elevatorExits.length > 0 &&
        `캐리어나 유모차가 있다면 ${ro(f.elevatorExits.join(", "))} 나가세요. 지상에서 승강장까지 엘리베이터로만 이동할 수 있어요.`,
      f.transfer &&
        `환승할 때는 ${f.transfer.from}에서 ${ro(f.transfer.to)} 갈아타는 길이 가장 빨라요. ${f.transfer.toward} 방면 ${f.transfer.car}-${f.transfer.door} 칸에서 내리면 도보 약 ${f.transfer.walk}분이에요.` +
          (f.transfer.longest > f.transfer.walk ? ` 가장 먼 환승은 약 ${f.transfer.longest}분 걸려요.` : ""),
    ],
  };
}

function japanese(f: Facts): Text {
  const exitAt = f.toilets?.exit ? `・${f.toilets.exit}番出口側` : "";
  const restroom = (() => {
    const r = f.toilets;
    if (!r) return null;
    const outside = r.total - r.inside;
    if (r.total === 1)
      return r.inside
        ? `トイレは改札内（${r.floor}${exitAt}）に1か所あり、乗車の途中でも改札を出ずに使えます。`
        : `トイレは改札外（${r.floor}${exitAt}）の1か所だけなので、改札に入る前に済ませておきましょう。`;
    if (!outside) return `トイレは${r.total}か所すべて改札内（${r.floor}${exitAt}など）にあり、乗車の途中でも改札を出ずに使えます。`;
    if (r.inside)
      return `トイレは${r.total}か所のうち${r.inside}か所が改札内（${r.floor}${exitAt}）にあり、改札を出ずに使えます。残りの${outside}か所は改札外です。`;
    return `トイレは${r.total}か所とも改札外（${r.floor}${exitAt}など）にあるので、改札に入る前に済ませておきましょう。`;
  })();
  const deskText = f.desk && `有人のT-Luggageカウンター（${f.desk}）で大きな荷物を預けたり、当日配送を頼んだりできます。`;
  return {
    overview: [
      ...(f.intro
        ? [
            f.intro,
            f.multiLine
              ? `${f.district ? `${f.district}にある` : ""}乗り換え駅で、${f.lines}が乗り入れています。`
              : `${f.district ? `${f.district}にある` : ""}${f.lines}の駅です。`,
          ]
        : [
            f.multiLine
              ? [
                  `${f.title}は${f.district ? `${f.district}にある` : ""}乗り換え駅で、${f.lines}が乗り入れています。`,
                  `${f.title}には${f.lines}が乗り入れ${f.district ? `、${f.district}に位置しています` : "ています"}。`,
                ][f.variant]
              : [
                  `${f.title}は${f.district ? `${f.district}にある` : ""}${f.lines}の駅です。`,
                  `${f.title}は${f.lines}の駅で${f.district ? `、${f.district}にあります` : "す"}。`,
                ][f.variant],
          ]),
      ...f.neighbors.map(({ line, names }) =>
        names.length === 2
          ? `${f.multiLine ? `${line}では` : ""}${names[0]}と${names[1]}の間にあります。`
          : `${f.multiLine ? `${line}の` : ""}隣の駅は${names.join("、")}です。`,
      ),
      f.spots.length > 0 &&
        `${f.spots
          .map((group) => `${group.items.map((item) => `${item.name}（徒歩約${item.walk}分）`).join("や")}へは${group.exit}番出口`)
          .join("、")}が便利です。`,
      f.exits === 1
        ? "出口は1か所だけです。"
        : f.exits > 1 &&
          (f.spread >= WIDE_EXITS_METERS
            ? `出口は${f.exits}か所あり、約${f.spread}mの範囲に散らばっています。地上に出る前に出口番号を確認しないと、目的地から大きく離れてしまうことがあります。`
            : f.spread <= COMPACT_EXITS_METERS
              ? `${f.exits}か所の出口は約${f.spread}m以内にまとまっていて、どの出口から出ても大きく離れません。`
              : `出口は${f.exits}か所で、約${f.spread}mの範囲にあります。下の出口カードから地図で位置を確認できます。`),
    ],
    care: [
      restroom,
      f.lockers
        ? `荷物はコインロッカー（T-Locker）${f.lockers.banks}か所${f.lockers.slots ? `・計約${f.lockers.slots}個` : ""}に預けられます。${
            f.lockers.banks > 1 ? "いちばん大きいのは" : "場所は"
          }${f.lockers.spot}です。小型は平日4時間${f.lockerPrice}からで、出し入れできるのは${LOCKER_HOURS.open}時～${LOCKER_HOURS.close}時です。` +
          (deskText ?? "")
        : deskText
          ? `荷物は${deskText}`
          : f.nearest &&
            (f.nearest.adjacent
              ? `この駅にはT-Lockerの登録がありませんが、隣の${f.nearest.name}にあります。`
              : `この駅にはT-Lockerの登録がありません。最寄りは約${f.nearest.km}km離れた${f.nearest.name}です。`),
    ],
    moving: [
      f.elevatorExits.length > 0 &&
        `スーツケースやベビーカーなら${f.elevatorExits.join("、")}を使いましょう。地上からホームまでエレベーターだけで移動できます。`,
      f.transfer &&
        `乗り換えでいちばん近いのは${f.transfer.from}から${f.transfer.to}への乗り換えで、${f.transfer.toward}方面の${f.transfer.car}号車${f.transfer.door}番ドア付近で降りれば徒歩約${f.transfer.walk}分です。` +
          (f.transfer.longest > f.transfer.walk ? `いちばん遠い乗り換えは約${f.transfer.longest}分かかります。` : ""),
    ],
  };
}

function chinese(f: Facts): Text {
  const exitAt = f.toilets?.exit ? `，${f.toilets.exit}号出口方向` : "";
  const restroom = (() => {
    const r = f.toilets;
    if (!r) return null;
    const outside = r.total - r.inside;
    if (r.total === 1)
      return r.inside
        ? `站内唯一的洗手间位于检票口内（${r.floor}${exitAt}），乘车途中无需出站即可使用。`
        : `站内唯一的洗手间位于检票口外（${r.floor}${exitAt}），建议进站前先去。`;
    if (!outside) return `${r.total}处洗手间都在检票口内（如${r.floor}${exitAt}），乘车途中无需出站即可使用。`;
    if (r.inside)
      return `${r.total}处洗手间中有${r.inside}处在检票口内（${r.floor}${exitAt}），无需出站即可使用；其余${outside}处在检票口外。`;
    return `${r.total}处洗手间都在检票口外（如${r.floor}${exitAt}），建议进站前先去。`;
  })();
  const deskText = f.desk && `人工T-Luggage柜台（${f.desk}）可寄存大件行李，也可办理当日配送。`;
  return {
    overview: [
      ...(f.intro
        ? [f.intro, `车站${f.district ? `位于${f.district}，` : ""}是${f.lines}${f.multiLine ? "的换乘站" : "上的一站"}。`]
        : [
            f.multiLine
              ? [
                  `${f.title}${f.district ? `位于${f.district}，` : ""}是${f.lines}的换乘站。`,
                  `${f.lines}在${f.title}交汇${f.district ? `，车站位于${f.district}` : ""}。`,
                ][f.variant]
              : [
                  `${f.title}${f.district ? `位于${f.district}，` : ""}是${f.lines}的车站。`,
                  `${f.title}是${f.lines}上的一站${f.district ? `，位于${f.district}` : ""}。`,
                ][f.variant],
          ]),
      ...f.neighbors.map(({ line, names }) =>
        names.length === 1
          ? `${f.multiLine ? `${line}的` : ""}下一站是${names[0]}。`
          : names.length === 2
            ? `${f.multiLine ? `在${line}上，` : ""}本站位于${names[0]}和${names[1]}之间。`
            : `${f.multiLine ? `${line}的` : ""}相邻车站有${names.join("、")}。`,
      ),
      f.spots.length > 0 &&
        `${f.spots
          .map((group) => `去${group.items.map((item) => `${item.name}（步行约${item.walk}分钟）`).join("和")}走${group.exit}号出口`)
          .join("；")}。`,
      f.exits === 1
        ? "本站只有1个出口。"
        : f.exits > 1 &&
          (f.spread >= WIDE_EXITS_METERS
            ? `${f.exits}个出口分布在约${f.spread}米的范围内，上地面前请先确认出口编号，走错出口可能要多绕一大段路。`
            : f.spread <= COMPACT_EXITS_METERS
              ? `${f.exits}个出口集中在约${f.spread}米范围内，从哪个出口出去都不会太远。`
              : `本站共有${f.exits}个出口，分布在约${f.spread}米的范围内，可通过下方出口卡片在地图上查看。`),
    ],
    care: [
      restroom,
      f.lockers
        ? `行李可以存放在${f.lockers.banks}处投币储物柜（T-Locker${f.lockers.slots ? `，共约${f.lockers.slots}格` : ""}），${
            f.lockers.banks > 1 ? "规模最大的一处" : "位置"
          }在${f.lockers.spot}。小号柜工作日4小时${f.lockerPrice}起，存取时间为${LOCKER_HOURS.open}:00～${LOCKER_HOURS.close}:00。` +
          (deskText ? `另外，${deskText}` : "")
        : deskText
          ? deskText
          : f.nearest &&
            (f.nearest.adjacent
              ? `本站暂无T-Locker数据，相邻的${f.nearest.name}设有储物柜。`
              : `本站暂无T-Locker数据，最近设有储物柜的车站是约${f.nearest.km}公里外的${f.nearest.name}。`),
    ],
    moving: [
      f.elevatorExits.length > 0 && `带着行李箱或婴儿车时，请走${f.elevatorExits.join("、")}，从地面到站台全程都有电梯。`,
      f.transfer &&
        `换乘时，从${f.transfer.from}换乘${f.transfer.to}最快：在开往${f.transfer.toward}方向的列车${f.transfer.car}号车厢${f.transfer.door}号门附近下车，步行约${f.transfer.walk}分钟。` +
          (f.transfer.longest > f.transfer.walk ? `最远的换乘约需${f.transfer.longest}分钟。` : ""),
    ],
  };
}

const WRITERS: Record<Locale, (f: Facts) => Text> = { en: english, ko: korean, ja: japanese, zh: chinese };

/** Station names such as "Hongik Univ." already end in a full stop, so a closing one would double it. */
function paragraph(sentences: (string | false | null)[], locale: Locale) {
  return sentences
    .filter((sentence): sentence is string => !!sentence)
    .join(locale === "zh" || locale === "ja" ? "" : " ")
    .replace(/\.\./g, ".");
}

/**
 * A written guide to one station built from its own data (lines, area, neighbouring stops, exits, restrooms,
 * lockers, elevators, transfers) plus hand-written notes for the busiest stations. Sentences without data are
 * dropped rather than filled with general advice, so every page says only what is true for that station.
 */
export function stationOverview(station: GuideStation, detail: GuideDetail, locale: GuideLocale): StationOverview {
  const base = contentLocale(locale);
  const text = WRITERS[base](facts(station, detail, base));
  const guide = localGuide(station);
  const write = (p: string) => (locale === "zh-tw" ? inScript(locale, p).replace(/(\d)米/g, "$1公尺") : p);
  return {
    overview: [paragraph(text.overview, base)].filter(Boolean).map(write),
    tips: [paragraph(text.care, base), paragraph(text.moving, base)].filter(Boolean).map(write),
    notes: (guide?.notes ?? []).map((note) => ({ kind: note.kind, text: inScript(locale, t(note.text, base)) })),
    checked: guide ? LOCAL_GUIDES_CHECKED : null,
  };
}
