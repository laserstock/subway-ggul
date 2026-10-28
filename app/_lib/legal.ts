import type { Localized } from "./i18n";

/** Shown in the privacy policy and terms; null until the operator sets a public contact address. */
export const CONTACT_EMAIL: string | null = "lukoco1000@gmail.com";

export const LEGAL_UPDATED = "2026-10-28";

export type LegalSection = { title: Localized; body: Localized[] };

export const PRIVACY_TITLE: Localized = {
  ko: "개인정보처리방침",
  en: "Privacy Policy",
  zh: "隐私政策",
  ja: "プライバシーポリシー",
};

export const TERMS_TITLE: Localized = {
  ko: "이용약관 · 커뮤니티 가이드라인",
  en: "Terms of Use & Community Guidelines",
  zh: "使用条款 · 社区准则",
  ja: "利用規約・コミュニティガイドライン",
};

const contact: Localized = CONTACT_EMAIL
  ? {
      ko: `앱의 [메뉴 → 의견 보내기] 또는 이메일(${CONTACT_EMAIL})로 문의할 수 있어요.`,
      en: `Contact us through Menu → Send feedback in the app, or by email at ${CONTACT_EMAIL}.`,
      zh: `可通过应用内的「菜单 → 发送意见」或电子邮件（${CONTACT_EMAIL}）联系我们。`,
      ja: `アプリの「メニュー → ご意見を送る」またはメール（${CONTACT_EMAIL}）でお問い合わせいただけます。`,
    }
  : {
      ko: "앱의 [메뉴 → 의견 보내기]로 문의할 수 있어요. 남겨 주신 내용은 운영자에게 바로 전달돼요.",
      en: "Contact us through Menu → Send feedback in the app; messages go straight to the operator.",
      zh: "可通过应用内的「菜单 → 发送意见」联系我们，内容会直接送达运营者。",
      ja: "アプリの「メニュー → ご意見を送る」からお問い合わせください。内容は運営者に直接届きます。",
    };

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: { ko: "1. 수집하는 정보", en: "1. Information we collect", zh: "1. 我们收集的信息", ja: "1. 収集する情報" },
    body: [
      {
        ko: "회원가입 없이 이용할 수 있으며, 이름·전화번호·이메일 같은 개인 식별 정보는 수집하지 않아요.",
        en: "The app works without sign-up. We do not collect names, phone numbers or email addresses.",
        zh: "无需注册即可使用，我们不收集姓名、电话号码、电子邮件等个人身份信息。",
        ja: "会員登録なしで利用でき、氏名・電話番号・メールアドレスなどの個人を特定する情報は収集しません。",
      },
      {
        ko: "기기별 익명 계정 ID: 제보·글·댓글·투표를 내 것으로 관리하기 위해 기기마다 무작위 익명 ID가 자동으로 만들어져요.",
        en: "Anonymous account ID: a random ID is created per device so your reports, posts, comments and votes can be managed as yours.",
        zh: "设备匿名账号 ID：为了管理您发布的上报、帖子、评论和投票，每台设备会自动生成一个随机匿名 ID。",
        ja: "端末ごとの匿名アカウント ID：投稿・コメント・情報・投票をご自身のものとして管理するため、端末ごとにランダムな匿名 ID が自動作成されます。",
      },
      {
        ko: "직접 올린 내용: 역 제보, 꿀스팟 글·댓글, 닉네임·캐릭터, 시설 투표, 의견 보내기 내용.",
        en: "Content you post: station reports, plaza posts and comments, nickname and character, facility votes and feedback.",
        zh: "您发布的内容：车站上报、广场帖子和评论、昵称和角色、设施投票以及意见反馈。",
        ja: "ご自身が投稿した内容：駅の情報、広場の投稿・コメント、ニックネーム・キャラクター、施設投票、ご意見。",
      },
      {
        ko: "위치 정보: 가까운 역 찾기와 하차 알림을 위해 기기의 위치를 사용해요. 위치는 기기 안에서 처리되며 우리 서버에 저장하거나 전송하지 않아요. 다만 주변 매장·시설을 검색할 때는 검색 기준 좌표가 Kakao 장소 검색에 전송돼요.",
        en: "Location: used on your device to find the nearest station and for arrival alerts. It is processed on the device and never stored on or sent to our servers. When you search for nearby shops or facilities, the search coordinates are sent to Kakao place search.",
        zh: "位置信息：用于查找最近的车站和下车提醒。位置在设备上处理，不会存储或发送到我们的服务器。但搜索周边店铺或设施时，搜索基准坐标会发送给 Kakao 地点搜索。",
        ja: "位置情報：最寄り駅の検索と降車アラームに使用します。位置情報は端末内で処理され、当社サーバーに保存・送信されることはありません。ただし周辺の店舗・施設を検索する際は、検索基準の座標が Kakao の場所検索に送信されます。",
      },
      {
        ko: "기기 저장소: 내 역, 언어·테마 설정, 최근 본 역, 차단 목록 등은 기기(브라우저 저장소)에만 저장돼요.",
        en: "On-device storage: saved stations, language and theme settings, recently viewed stations and your block list stay on your device.",
        zh: "设备存储：我的车站、语言和主题设置、最近查看的车站、屏蔽列表等仅保存在设备（浏览器存储）中。",
        ja: "端末内の保存：マイ駅、言語・テーマ設定、最近見た駅、ブロックリストなどは端末（ブラウザのストレージ）にのみ保存されます。",
      },
    ],
  },
  {
    title: { ko: "2. 이용 목적", en: "2. How we use it", zh: "2. 使用目的", ja: "2. 利用目的" },
    body: [
      {
        ko: "가까운 역·시설 안내, 하차 알림, 실시간 열차 도착 정보, 실시간 제보와 커뮤니티 기능 제공, 서비스 개선과 부정 이용 방지에만 사용해요. 광고나 마케팅 목적으로 쓰거나 제3자에게 판매하지 않아요.",
        en: "Only to show nearby stations and facilities, send arrival alerts, show live train arrivals, run live reports and the community, improve the service and prevent abuse. We never use it for advertising or sell it to third parties.",
        zh: "仅用于提供附近车站和设施指南、下车提醒、实时列车到站信息、实时上报和社区功能，以及改进服务和防止滥用。不会用于广告或营销，也不会出售给第三方。",
        ja: "最寄り駅・施設の案内、降車アラーム、リアルタイムの列車到着情報、リアルタイム情報とコミュニティ機能の提供、サービス改善と不正利用防止のためにのみ使用します。広告やマーケティングに使用したり、第三者に販売したりすることはありません。",
      },
    ],
  },
  {
    title: {
      ko: "3. 백그라운드 위치 사용 (앱)",
      en: "3. Background location (app)",
      zh: "3. 后台位置使用（应用）",
      ja: "3. バックグラウンドでの位置情報の使用（アプリ）",
    },
    body: [
      {
        ko: "하차 알림을 켠 동안에만, 화면이 꺼져 있거나 다른 앱을 쓰는 중에도 도착역에 가까워졌는지 확인하기 위해 위치를 사용해요. 이때 알림 표시줄에 위치 사용 중 알림이 계속 표시되며, 하차 알림을 끄거나 도착하면 즉시 중단돼요.",
        en: "Only while an arrival alert is on, the app keeps checking your location with the screen off or while you use other apps, to tell when you near your stop. An ongoing notification is shown the whole time, and tracking stops as soon as you turn the alert off or arrive.",
        zh: "仅在开启下车提醒期间，即使屏幕关闭或正在使用其他应用，也会使用位置来确认是否接近目的站。此时通知栏会持续显示位置使用通知，关闭下车提醒或到达后会立即停止。",
        ja: "降車アラームをオンにしている間だけ、画面がオフのときや他のアプリを使用中でも、到着駅に近づいたかを確認するために位置情報を使用します。その間は通知バーに位置情報使用中の通知が表示され続け、降車アラームをオフにするか到着するとすぐに停止します。",
      },
    ],
  },
  {
    title: { ko: "4. 보관 기간과 삭제", en: "4. Retention and deletion", zh: "4. 保存期限与删除", ja: "4. 保存期間と削除" },
    body: [
      {
        ko: "역 제보는 최대 24시간 동안만 피드에 사용되며, 글·댓글은 직접 삭제하거나 계정을 삭제할 때까지 보관돼요.",
        en: "Station reports are used in feeds for at most 24 hours; posts and comments are kept until you delete them or your account.",
        zh: "车站上报最多在动态中使用 24 小时；帖子和评论会保留到您自行删除或删除账号为止。",
        ja: "駅の情報はフィードで最大 24 時間のみ使用され、投稿・コメントはご自身で削除するかアカウントを削除するまで保存されます。",
      },
      {
        ko: "[마이 → 내 데이터 모두 삭제]를 누르면 익명 계정과 그 계정으로 올린 제보·글·댓글·투표·의견이 서버에서 즉시 영구 삭제돼요. 기기에 저장된 설정도 함께 지워져요.",
        en: "Tap My → Delete all my data to permanently delete your anonymous account and every report, post, comment, vote and feedback message it made. Settings stored on the device are cleared too.",
        zh: "点击「我的 → 删除我的全部数据」，匿名账号及其发布的上报、帖子、评论、投票和意见将立即从服务器永久删除，设备上保存的设置也会一并清除。",
        ja: "「マイ → 自分のデータをすべて削除」を押すと、匿名アカウントとそのアカウントで投稿した情報・投稿・コメント・投票・ご意見がサーバーから即座に完全削除されます。端末に保存された設定も削除されます。",
      },
      {
        ko: "앱을 쓸 수 없는 경우 아래 문의처로 삭제를 요청하면 확인 후 지체 없이 삭제해 드려요.",
        en: "If you can't use the app, request deletion through the contact below and we will delete your data promptly after verification.",
        zh: "如无法使用应用，可通过下方联系方式申请删除，我们确认后将尽快删除。",
        ja: "アプリを使用できない場合は、下記の連絡先に削除をご依頼いただければ、確認後速やかに削除します。",
      },
    ],
  },
  {
    title: {
      ko: "5. 처리 위탁과 외부 서비스",
      en: "5. Processors and third-party services",
      zh: "5. 委托处理与外部服务",
      ja: "5. 処理の委託と外部サービス",
    },
    body: [
      {
        ko: "Supabase(데이터베이스·익명 인증), Vercel(웹 호스팅), Kakao(지도·장소 검색), 서울시 열린데이터광장(실시간 열차 도착 정보, 역 이름만 전송), 번역 API(번역 버튼을 누른 글만 전송)를 이용해요. 각 서비스는 해당 기능을 제공하는 데 필요한 범위에서만 정보를 처리해요.",
        en: "We use Supabase (database and anonymous sign-in), Vercel (hosting), Kakao (maps and place search), Seoul Open Data Plaza (live train arrivals; only the station name is sent) and a translation API (only text you choose to translate). Each processes data only as needed for its function.",
        zh: "我们使用 Supabase（数据库和匿名登录）、Vercel（网站托管）、Kakao（地图和地点搜索）、首尔市开放数据广场（实时列车到站信息，仅发送车站名称）以及翻译 API（仅发送您点击翻译的内容）。各服务仅在提供相应功能所需的范围内处理信息。",
        ja: "Supabase（データベース・匿名認証）、Vercel（ウェブホスティング）、Kakao（地図・場所検索）、ソウル市オープンデータ広場（リアルタイム列車到着情報、駅名のみ送信）、翻訳 API（翻訳ボタンを押した内容のみ送信）を利用しています。各サービスは該当機能の提供に必要な範囲でのみ情報を処理します。",
      },
    ],
  },
  {
    title: { ko: "6. 아동의 이용", en: "6. Children", zh: "6. 儿童使用", ja: "6. お子様の利用" },
    body: [
      {
        ko: "만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를 알면서 수집하지 않아요.",
        en: "The service is not directed at children under 14 and we do not knowingly collect their personal data.",
        zh: "本服务不以未满 14 岁的儿童为对象，也不会故意收集儿童的个人信息。",
        ja: "本サービスは 14 歳未満のお子様を対象としておらず、お子様の個人情報を故意に収集することはありません。",
      },
    ],
  },
  {
    title: { ko: "7. 문의와 권리 행사", en: "7. Contact and your rights", zh: "7. 联系与权利行使", ja: "7. お問い合わせと権利の行使" },
    body: [
      contact,
      {
        ko: "언제든지 내 정보의 열람·삭제를 요청할 수 있으며, 앱 안에서 직접 삭제할 수도 있어요.",
        en: "You may ask to see or delete your data at any time, or delete it yourself in the app.",
        zh: "您可以随时申请查看或删除您的信息，也可以在应用内自行删除。",
        ja: "いつでもご自身の情報の閲覧・削除を請求でき、アプリ内で直接削除することもできます。",
      },
    ],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: { ko: "1. 서비스", en: "1. The service", zh: "1. 服务", ja: "1. サービス" },
    body: [
      {
        ko: "지하철꿀정보는 역 시설·환승·경로·실시간 도착 정보와 이용자 제보를 제공해요. 소요시간·도착·시설 정보는 공공데이터와 이용자 제보를 바탕으로 한 참고 정보이며, 실제와 다를 수 있어요.",
        en: "Subway Tips provides station facilities, transfers, routes, live arrivals and rider reports. Times, arrivals and facility details are guidance based on open data and reports and may differ from reality.",
        zh: "地铁小贴士提供车站设施、换乘、路线、实时到站信息以及用户上报。所需时间、到站和设施信息是基于公共数据和用户上报的参考信息，可能与实际情况不同。",
        ja: "地下鉄おトク情報は、駅の施設・乗り換え・経路・リアルタイム到着情報と利用者の情報を提供します。所要時間・到着・施設情報は公共データと利用者の情報に基づく参考情報であり、実際と異なる場合があります。",
      },
    ],
  },
  {
    title: { ko: "2. 커뮤니티 가이드라인", en: "2. Community guidelines", zh: "2. 社区准则", ja: "2. コミュニティガイドライン" },
    body: [
      {
        ko: "다음 내용은 올릴 수 없어요: 욕설·혐오·차별·괴롭힘, 음란물, 폭력·불법 행위 조장, 광고·스팸, 타인의 개인정보(사진·연락처·차량번호 등) 노출, 허위 제보.",
        en: "Not allowed: abuse, hate, discrimination or harassment; sexual content; promoting violence or illegal acts; ads or spam; exposing anyone's personal information (photos, contacts, plates, etc.); false reports.",
        zh: "禁止发布：辱骂、仇恨、歧视或骚扰；色情内容；煽动暴力或违法行为；广告或垃圾信息；泄露他人个人信息（照片、联系方式、车牌号等）；虚假上报。",
        ja: "次の内容は投稿できません：暴言・差別・嫌がらせ、わいせつな内容、暴力・違法行為の助長、広告・スパム、他人の個人情報（写真・連絡先・ナンバープレートなど）の露出、虚偽の情報。",
      },
      {
        ko: "부적절한 글·댓글·제보는 [신고] 버튼으로 알려 주세요. 여러 명이 신고한 콘텐츠는 자동으로 숨겨지고, 운영자가 확인 후 삭제해요. [차단]을 누르면 그 사용자의 콘텐츠가 더 이상 보이지 않아요.",
        en: "Use Report on any inappropriate post, comment or report. Content reported by several people is hidden automatically and reviewed by the operator. Block hides everything from that user.",
        zh: "如发现不当的帖子、评论或上报，请点击「举报」。被多人举报的内容会被自动隐藏，并由运营者审核后删除。点击「屏蔽」后将不再显示该用户的内容。",
        ja: "不適切な投稿・コメント・情報は「通報」ボタンでお知らせください。複数人に通報された内容は自動的に非表示になり、運営者が確認後に削除します。「ブロック」を押すと、そのユーザーの内容は表示されなくなります。",
      },
      {
        ko: "가이드라인을 어긴 콘텐츠는 예고 없이 삭제될 수 있고, 반복해서 어기면 이용이 제한될 수 있어요.",
        en: "Content that breaks these rules may be removed without notice, and repeated violations may lead to restrictions.",
        zh: "违反准则的内容可能会在未事先通知的情况下被删除，多次违反可能会被限制使用。",
        ja: "ガイドラインに違反した内容は予告なく削除されることがあり、繰り返し違反すると利用が制限される場合があります。",
      },
    ],
  },
  {
    title: { ko: "3. 게시물의 권리와 책임", en: "3. Your content", zh: "3. 发布内容的权利与责任", ja: "3. 投稿内容の権利と責任" },
    body: [
      {
        ko: "올린 내용의 책임은 작성자에게 있으며, 서비스 안에서 다른 이용자에게 보여주고 번역하는 데 필요한 범위에서 사용할 수 있도록 허락하는 것으로 봐요. 내 글은 언제든 직접 삭제할 수 있어요.",
        en: "You are responsible for what you post and allow us to display and translate it within the service. You can delete your posts at any time.",
        zh: "发布内容的责任由作者承担，并视为允许我们在服务内向其他用户展示和翻译所需的范围内使用。您可以随时删除自己的内容。",
        ja: "投稿内容の責任は投稿者にあり、サービス内で他の利用者に表示・翻訳するために必要な範囲で使用することを許諾したものとみなします。ご自身の投稿はいつでも削除できます。",
      },
    ],
  },
  {
    title: { ko: "4. 면책", en: "4. Disclaimer", zh: "4. 免责声明", ja: "4. 免責" },
    body: [
      {
        ko: "열차 운행 상황, 시설 고장, 위치 오차 등으로 정보·알림이 늦거나 틀릴 수 있어요. 중요한 일정은 공식 안내도 함께 확인해 주세요.",
        en: "Information and alerts can be late or wrong due to service changes, facility outages or location errors. Check official sources for anything important.",
        zh: "由于列车运行情况、设施故障、定位误差等原因，信息和提醒可能会延迟或有误。重要行程请同时确认官方信息。",
        ja: "列車の運行状況、施設の故障、位置情報の誤差などにより、情報やアラームが遅れたり誤っていたりすることがあります。大切な予定は公式の案内もあわせてご確認ください。",
      },
    ],
  },
  {
    title: { ko: "5. 문의", en: "5. Contact", zh: "5. 联系我们", ja: "5. お問い合わせ" },
    body: [contact],
  },
];
