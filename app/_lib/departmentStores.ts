import type { StaticImageData } from "next/image";
import akLogo from "@/public/icons/dept-ak.svg";
import galleriaLogo from "@/public/icons/dept-galleria.svg";
import hyundaiLogo from "@/public/icons/dept-hyundai.svg";
import lotteLogo from "@/public/icons/dept-lotte.svg";
import ncLogo from "@/public/icons/dept-nc.svg";
import shinsegaeLogo from "@/public/icons/dept-shinsegae.svg";
import storeLogo from "@/public/icons/dept-store.svg";
import type { NearbyPlace, NearbyQuery } from "../kakao-places";

const BRANDS: [RegExp, StaticImageData][] = [
  [/롯데백화점|에비뉴엘|롯데\s*영플라자/, lotteLogo],
  [/현대백화점|더현대/, hyundaiLogo],
  [/신세계/, shinsegaeLogo],
  [/갤러리아/, galleriaLogo],
  [/AK\s*플라자|AK&|에이케이/i, akLogo],
  [/NC백화점|엔씨백화점|뉴코아/i, ncLogo],
];

/** Kakao files department stores (including 더현대 서울, which has no "백화점" in its name) under 백화점. */
export const DEPARTMENT_QUERY: NearbyQuery = {
  kind: "keyword",
  keyword: "백화점",
  radius: 800,
  categoryName: "백화점",
  size: 15,
};

export function departmentLogo(name: string): StaticImageData {
  return BRANDS.find(([pattern]) => pattern.test(name))?.[1] ?? storeLogo;
}

/** "롯데백화점 잠실점 에비뉴엘" and the like fold into "롯데백화점 잠실점"; nearest entry wins. */
export function uniqueDepartmentStores(places: NearbyPlace[]): NearbyPlace[] {
  const seen = new Set<string>();
  return places.filter((place) => {
    const key = place.name.split(/\s+/).slice(0, 2).join(" ");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
