import type { Localized } from "./i18n";

/** Shown in the privacy policy and terms; null until the operator sets a public contact address. */
export const CONTACT_EMAIL: string | null = "lukoco1000@gmail.com";

export const LEGAL_UPDATED = "2026-11-04";

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

export const CONTACT_TITLE: Localized = {
  ko: "문의하기",
  en: "Contact Us",
  zh: "联系我们",
  ja: "お問い合わせ",
};

export const DELETION_TITLE: Localized = {
  ko: "계정·데이터 삭제 요청",
  en: "Delete your account and data",
  zh: "删除账号与数据",
  ja: "アカウント・データの削除",
};

const deletionEmail: Localized = CONTACT_EMAIL
  ? {
      ko: `앱을 쓸 수 없거나 앱을 이미 삭제했다면 이메일(${CONTACT_EMAIL})로 제목에 "데이터 삭제 요청"이라고 적어 보내 주세요. 닉네임과 글을 올린 역·대략적인 날짜를 함께 적어 주시면 본인 데이터를 찾는 데 도움이 돼요.`,
      en: `If you can't use the app or have already uninstalled it, email ${CONTACT_EMAIL} with the subject "Data deletion request". Include your nickname and the stations and rough dates of anything you posted so we can find your data.`,
      zh: `如果无法使用应用或已卸载应用，请发送邮件至 ${CONTACT_EMAIL}，标题注明"数据删除申请"。请附上您的昵称以及发布内容的车站和大致日期，以便我们找到您的数据。`,
      ja: `アプリを使用できない場合やすでに削除した場合は、件名を「データ削除依頼」として ${CONTACT_EMAIL} までメールをお送りください。ニックネームと投稿した駅・おおよその日付を添えていただくと、データの特定に役立ちます。`,
    }
  : {
      ko: "앱을 쓸 수 없다면 [메뉴 → 의견 보내기]로 삭제를 요청해 주세요.",
      en: "If you can't use the app, request deletion through Menu → Send feedback.",
      zh: "如无法使用应用，请通过「菜单 → 发送意见」申请删除。",
      ja: "アプリを使用できない場合は「メニュー → ご意見を送る」から削除をご依頼ください。",
    };

export const DELETION_SECTIONS: LegalSection[] = [
  {
    title: { ko: "대상 앱", en: "App", zh: "适用应用", ja: "対象アプリ" },
    body: [
      {
        ko: "지하철꿀정보 (K-Sub: Seoul Subway Guide) · Android 앱(com.subwayggul.app)과 웹(www.k-sub.com). 이 페이지는 운영자가 직접 관리해요.",
        en: "지하철꿀정보 (K-Sub: Seoul Subway Guide) · Android app (com.subwayggul.app) and web (www.k-sub.com). This page is maintained by the developer.",
        zh: "지하철꿀정보（K-Sub 首尔地铁指南）· Android 应用（com.subwayggul.app）及网页版（www.k-sub.com）。本页面由开发者维护。",
        ja: "지하철꿀정보（K-Sub ソウル地下鉄ガイド）· Android アプリ（com.subwayggul.app）と Web 版（www.k-sub.com）。このページは開発者が管理しています。",
      },
    ],
  },
  {
    title: {
      ko: "1. 앱에서 바로 삭제하기",
      en: "1. Delete it yourself in the app",
      zh: "1. 在应用内直接删除",
      ja: "1. アプリで今すぐ削除する",
    },
    body: [
      {
        ko: "① 앱 또는 www.k-sub.com 을 열어요. ② 하단의 [마이] 탭으로 이동해요. ③ 맨 아래 [내 데이터 모두 삭제]를 누르고 확인해요.",
        en: "① Open the app or www.k-sub.com. ② Go to the Me tab at the bottom. ③ Scroll down, tap Delete all my data and confirm.",
        zh: "① 打开应用或 www.k-sub.com。② 进入底部的「我的」标签页。③ 滑到最下方，点击「删除我的全部数据」并确认。",
        ja: "① アプリまたは www.k-sub.com を開きます。② 下部の「マイ」タブに移動します。③ 一番下の「自分のデータをすべて削除」を押して確認します。",
      },
      {
        ko: "확인하는 즉시 서버에서 영구 삭제되며 되돌릴 수 없어요. 기기에 저장된 설정도 함께 지워져요.",
        en: "Everything is permanently deleted from our servers right away and cannot be restored. Settings stored on the device are cleared too.",
        zh: "确认后数据会立即从服务器永久删除，且无法恢复。设备上保存的设置也会一并清除。",
        ja: "確認するとすぐにサーバーから完全に削除され、元に戻すことはできません。端末に保存された設定も削除されます。",
      },
    ],
  },
  {
    title: {
      ko: "2. 이메일로 삭제 요청하기",
      en: "2. Request deletion by email",
      zh: "2. 通过邮件申请删除",
      ja: "2. メールで削除を依頼する",
    },
    body: [
      deletionEmail,
      {
        ko: "확인 후 지체 없이, 늦어도 30일 이내에 삭제하고 결과를 답장으로 알려 드려요.",
        en: "We delete your data promptly after verification, within 30 days at the latest, and reply to confirm.",
        zh: "我们会在确认后尽快删除，最迟不超过 30 天，并回复邮件告知结果。",
        ja: "確認後速やかに、遅くとも 30 日以内に削除し、結果を返信でお知らせします。",
      },
    ],
  },
  {
    title: { ko: "3. 삭제되는 데이터", en: "3. What gets deleted", zh: "3. 删除的数据", ja: "3. 削除されるデータ" },
    body: [
      {
        ko: "익명 계정 ID, 역 제보와 제보 확인·해결 기록, 꿀스팟 글·댓글, 공감·스크랩, 닉네임·캐릭터, 시설 투표, 신고 기록, 의견 보내기 내용이 모두 삭제돼요.",
        en: "Your anonymous account ID, station reports and report confirmations, plaza posts and comments, likes and saves, nickname and character, facility votes, content flags and feedback messages.",
        zh: "匿名账号 ID、车站上报及确认/解决记录、广场帖子和评论、点赞和收藏、昵称和角色、设施投票、举报记录以及意见反馈内容都会被删除。",
        ja: "匿名アカウント ID、駅の情報とその確認・解決の記録、広場の投稿・コメント、いいね・保存、ニックネーム・キャラクター、施設投票、通報の記録、ご意見の内容がすべて削除されます。",
      },
    ],
  },
  {
    title: {
      ko: "4. 남는 데이터와 보관 기간",
      en: "4. What we keep and for how long",
      zh: "4. 保留的数据与期限",
      ja: "4. 残るデータと保存期間",
    },
    body: [
      {
        ko: "별도로 보관하는 개인 데이터는 없어요. 다만 호스팅·데이터베이스 업체의 서버 접속 기록과 백업에 남은 정보는 각 업체 정책에 따라 최대 30일 안에 자동으로 지워져요.",
        en: "We keep no personal data after deletion. Server access logs and backups at our hosting and database providers are erased automatically under their policies, within 30 days at most.",
        zh: "删除后我们不会保留任何个人数据。托管和数据库服务商的服务器访问日志及备份中的信息，将根据各服务商政策在最多 30 天内自动清除。",
        ja: "削除後に個人データを保持することはありません。ただし、ホスティング・データベース事業者のアクセスログやバックアップに残る情報は、各社のポリシーに従い最長 30 日以内に自動的に消去されます。",
      },
    ],
  },
];

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
        ko: "가까운 역·시설 안내, 하차 알림, 실시간 열차 도착 정보, 실시간 제보와 커뮤니티 기능 제공, 서비스 개선과 부정 이용 방지에만 사용해요. 우리가 수집한 정보를 광고·마케팅에 쓰거나 제3자에게 판매하지 않아요. 웹사이트의 광고 쿠키는 6항을 참고해 주세요.",
        en: "Only to show nearby stations and facilities, send arrival alerts, show live train arrivals, run live reports and the community, improve the service and prevent abuse. We never use the information we collect for advertising or sell it to third parties. For advertising cookies on the website, see section 6.",
        zh: "仅用于提供附近车站和设施指南、下车提醒、实时列车到站信息、实时上报和社区功能，以及改进服务和防止滥用。我们不会将收集的信息用于广告或营销，也不会出售给第三方。网站的广告 Cookie 请参阅第 6 条。",
        ja: "最寄り駅・施設の案内、降車アラーム、リアルタイムの列車到着情報、リアルタイム情報とコミュニティ機能の提供、サービス改善と不正利用防止のためにのみ使用します。収集した情報を広告・マーケティングに使用したり、第三者に販売したりすることはありません。ウェブサイトの広告 Cookie については第 6 条をご覧ください。",
      },
    ],
  },
  {
    title: {
      ko: "3. 위치 정보 (저장하지 않음)",
      en: "3. Location (never stored)",
      zh: "3. 位置信息（不保存）",
      ja: "3. 位置情報（保存しません）",
    },
    body: [
      {
        ko: "현재 위치 좌표는 기기 안에서 가까운 역을 찾고 하차 알림을 판단하는 데에만 쓰이며, 우리 서버나 데이터베이스에 저장·전송하거나 이동 기록으로 남기지 않아요. 위치 정보를 광고에 사용하거나 제3자에게 제공하지도 않아요.",
        en: "Your current coordinates are used only on your device to find the nearest station and to time arrival alerts. They are never sent to or stored on our servers or database, and no location history is kept. Location is never used for advertising or shared with third parties.",
        zh: "当前位置坐标仅在设备上用于查找最近的车站和判断下车提醒，不会发送或保存到我们的服务器或数据库，也不会留下移动记录。位置信息不会用于广告，也不会提供给第三方。",
        ja: "現在地の座標は、端末内で最寄り駅の検索と降車アラームの判断にのみ使用され、当社のサーバーやデータベースに送信・保存されることはなく、移動履歴も残しません。位置情報を広告に使用したり、第三者に提供したりすることもありません。",
      },
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
        en: "Tap Me → Delete all my data to permanently delete your anonymous account and every report, post, comment, vote and feedback message it made. Settings stored on the device are cleared too.",
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
        ko: "Supabase(데이터베이스·익명 인증), Vercel(웹 호스팅), Kakao(지도·장소 검색), 서울시 열린데이터광장(실시간 열차 도착 정보, 역 이름만 전송), 번역 API(번역 버튼을 누른 글만 전송), Google AdSense(웹사이트 광고)를 이용해요. 각 서비스는 해당 기능을 제공하는 데 필요한 범위에서만 정보를 처리해요.",
        en: "We use Supabase (database and anonymous sign-in), Vercel (hosting), Kakao (maps and place search), Seoul Open Data Plaza (live train arrivals; only the station name is sent), a translation API (only text you choose to translate) and Google AdSense (ads on the website). Each processes data only as needed for its function.",
        zh: "我们使用 Supabase（数据库和匿名登录）、Vercel（网站托管）、Kakao（地图和地点搜索）、首尔市开放数据广场（实时列车到站信息，仅发送车站名称）、翻译 API（仅发送您点击翻译的内容）以及 Google AdSense（网站广告）。各服务仅在提供相应功能所需的范围内处理信息。",
        ja: "Supabase（データベース・匿名認証）、Vercel（ウェブホスティング）、Kakao（地図・場所検索）、ソウル市オープンデータ広場（リアルタイム列車到着情報、駅名のみ送信）、翻訳 API（翻訳ボタンを押した内容のみ送信）、Google AdSense（ウェブサイトの広告）を利用しています。各サービスは該当機能の提供に必要な範囲でのみ情報を処理します。",
      },
    ],
  },
  {
    title: {
      ko: "6. 쿠키와 광고 (Google AdSense)",
      en: "6. Cookies and advertising (Google AdSense)",
      zh: "6. Cookie 与广告（Google AdSense）",
      ja: "6. Cookie と広告（Google AdSense）",
    },
    body: [
      {
        ko: "웹사이트(www.k-sub.com)에는 Google AdSense 광고가 표시돼요. Google을 비롯한 제3자 광고 사업자는 쿠키를 사용해 이용자가 이 사이트와 다른 웹사이트를 방문한 기록을 바탕으로 광고를 게재해요.",
        en: "The website (www.k-sub.com) shows ads from Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website and other websites.",
        zh: "网站（www.k-sub.com）会展示 Google AdSense 广告。包括 Google 在内的第三方广告商会使用 Cookie，根据您访问本网站及其他网站的记录投放广告。",
        ja: "ウェブサイト（www.k-sub.com）には Google AdSense の広告が表示されます。Google を含む第三者配信事業者は Cookie を使用して、このサイトや他のウェブサイトへの過去のアクセス情報に基づいて広告を配信します。",
      },
      {
        ko: "Google은 광고 쿠키를 사용해 이용자와 다른 사이트 방문 기록에 맞춘 광고를 보여 줄 수 있어요. 맞춤 광고는 Google 광고 설정(adssettings.google.com)에서 끌 수 있고, 제3자 광고 쿠키는 www.aboutads.info 에서 거부할 수 있어요. 자세한 내용은 policies.google.com/technologies/ads 를 참고해 주세요.",
        en: "Google's use of advertising cookies enables it and its partners to serve ads based on your visits to this and other sites. You can opt out of personalized advertising in Google Ads Settings (adssettings.google.com), and opt out of third-party vendors' cookies at www.aboutads.info. Learn more at policies.google.com/technologies/ads.",
        zh: "Google 通过广告 Cookie，可根据您访问本网站及其他网站的记录展示个性化广告。您可在 Google 广告设置（adssettings.google.com）中关闭个性化广告，也可在 www.aboutads.info 拒绝第三方广告 Cookie。详情请参阅 policies.google.com/technologies/ads。",
        ja: "Google は広告 Cookie を使用することで、このサイトや他のサイトへのアクセス情報に基づいた広告を表示できます。パーソナライズ広告は Google 広告設定（adssettings.google.com）で無効にでき、第三者配信事業者の Cookie は www.aboutads.info で無効にできます。詳しくは policies.google.com/technologies/ads をご覧ください。",
      },
      {
        ko: "브라우저 설정에서 쿠키를 차단하거나 삭제할 수 있어요. 쿠키를 차단해도 서비스는 이용할 수 있으며, 광고가 덜 관련성 있게 표시될 수 있어요. Android 앱에서는 광고를 표시하지 않아요.",
        en: "You can block or delete cookies in your browser settings. The service still works with cookies blocked, though ads may be less relevant. The Android app shows no ads.",
        zh: "您可以在浏览器设置中屏蔽或删除 Cookie。屏蔽 Cookie 后仍可使用本服务，但广告的相关性可能会降低。Android 应用不展示广告。",
        ja: "ブラウザの設定で Cookie をブロック・削除できます。Cookie をブロックしてもサービスは利用でき、広告の関連性が低くなる場合があります。Android アプリでは広告を表示しません。",
      },
    ],
  },
  {
    title: { ko: "7. 아동의 이용", en: "7. Children", zh: "7. 儿童使用", ja: "7. お子様の利用" },
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
    title: { ko: "8. 문의와 권리 행사", en: "8. Contact and your rights", zh: "8. 联系与权利行使", ja: "8. お問い合わせと権利の行使" },
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
    title: {
      ko: "4. 지하철 데이터 면책",
      en: "4. Subway data disclaimer",
      zh: "4. 地铁数据免责声明",
      ja: "4. 地下鉄データに関する免責",
    },
    body: [
      {
        ko: "K-SUB(지하철꿀정보)는 서울교통공사, 코레일 등 지하철 운영기관과 관련이 없는 독립 서비스예요. 역·노선·출구·시설·도착 정보는 공공데이터포털, 서울시 열린데이터광장, 운영기관 공개 자료와 이용자 제보를 바탕으로 해요.",
        en: "K-SUB (지하철꿀정보) is an independent service and is not affiliated with Seoul Metro, Korail or any other subway operator. Station, line, exit, facility and arrival data come from Korea's public data portals, operators' published information and rider reports.",
        zh: "K-SUB（지하철꿀정보）是独立服务，与首尔交通公社、韩国铁道公社（Korail）等地铁运营机构无关。车站、线路、出口、设施和到站信息基于公共数据门户、首尔市开放数据广场、运营机构公开资料及用户上报。",
        ja: "K-SUB（지하철꿀정보）はソウル交通公社、KORAIL などの地下鉄運営機関とは関係のない独立したサービスです。駅・路線・出口・施設・到着情報は、公共データポータル、ソウル市オープンデータ広場、運営機関の公開資料および利用者の情報に基づいています。",
      },
      {
        ko: "열차 도착 시간, 소요시간, 환승 경로, 첫차·막차, 출구·엘리베이터·화장실·물품보관함 정보는 참고용이며, 정확성·완전성·최신성을 보장하지 않아요. 공사, 운행 조정, 시설 고장, 위치 오차, 데이터 지연 등으로 실제와 다르거나 알림이 늦을 수 있어요.",
        en: "Arrival times, travel times, transfer routes, first and last trains, and exit, elevator, restroom and locker details are for reference only and are not guaranteed to be accurate, complete or current. Construction, service changes, facility outages, location errors or data delays can make them differ from reality or delay alerts.",
        zh: "列车到站时间、所需时间、换乘路线、首末班车以及出口、电梯、卫生间、储物柜信息仅供参考，不保证其准确性、完整性和时效性。施工、运行调整、设施故障、定位误差或数据延迟等可能导致信息与实际不符或提醒延迟。",
        ja: "列車の到着時刻、所要時間、乗り換え経路、始発・終電、出口・エレベーター・トイレ・コインロッカーの情報は参考用であり、正確性・完全性・最新性を保証するものではありません。工事、運行調整、施設の故障、位置情報の誤差、データの遅延などにより、実際と異なったりアラームが遅れたりすることがあります。",
      },
      {
        ko: "정보나 알림의 오류·지연으로 생긴 열차 놓침, 지연, 비용 등의 손해에 대해서는 운영자의 고의 또는 중대한 과실이 없는 한 책임지지 않아요. 중요한 이동은 역내 안내와 운영기관의 공식 정보를 함께 확인해 주세요.",
        en: "Except in cases of our intent or gross negligence, we are not liable for missed trains, delays, costs or other losses caused by inaccurate or late information or alerts. For important trips, also check station signs and the operators' official information.",
        zh: "除本服务存在故意或重大过失的情况外，对于因信息或提醒错误、延迟而导致的错过列车、延误、费用等损失，本服务不承担责任。重要行程请同时确认站内指引及运营机构的官方信息。",
        ja: "当方の故意または重大な過失がある場合を除き、情報やアラームの誤り・遅れにより生じた乗り遅れ、遅延、費用などの損害について責任を負いません。大切な移動の際は、駅構内の案内や運営機関の公式情報もあわせてご確認ください。",
      },
      {
        ko: "서비스는 무료로 제공되며, 기능은 사전 안내 후 변경되거나 중단될 수 있어요.",
        en: "The service is provided free of charge, and features may change or be discontinued after notice.",
        zh: "本服务免费提供，功能可能会在事先通知后变更或终止。",
        ja: "本サービスは無料で提供され、機能は事前の案内のうえ変更・終了することがあります。",
      },
    ],
  },
  {
    title: { ko: "5. 광고", en: "5. Advertising", zh: "5. 广告", ja: "5. 広告" },
    body: [
      {
        ko: "웹사이트에는 Google AdSense 광고가 표시될 수 있어요. 광고 내용과 광고주가 제공하는 상품·서비스는 광고주의 책임이며, 광고 쿠키에 관한 내용은 개인정보처리방침을 참고해 주세요.",
        en: "The website may show Google AdSense ads. Advertisers are responsible for their ads and the products or services they offer. See the Privacy Policy for how advertising cookies are used.",
        zh: "网站可能会展示 Google AdSense 广告。广告内容及广告主提供的商品或服务由广告主负责。有关广告 Cookie 的说明请参阅隐私政策。",
        ja: "ウェブサイトには Google AdSense の広告が表示される場合があります。広告の内容および広告主が提供する商品・サービスについては広告主が責任を負います。広告 Cookie についてはプライバシーポリシーをご覧ください。",
      },
    ],
  },
  {
    title: { ko: "6. 문의", en: "6. Contact", zh: "6. 联系我们", ja: "6. お問い合わせ" },
    body: [contact],
  },
];

export const CONTACT_SECTIONS: LegalSection[] = [
  {
    title: { ko: "이메일 문의", en: "Email us", zh: "邮件咨询", ja: "メールでのお問い合わせ" },
    body: [
      {
        ko: "서비스 이용 문의, 오류 신고, 제휴·광고 문의, 개인정보 관련 요청은 위 이메일로 보내 주세요. 보통 3영업일 안에 답장드려요.",
        en: "Send questions, bug reports, partnership or advertising inquiries and privacy requests to the email above. We usually reply within 3 business days.",
        zh: "使用咨询、错误反馈、合作及广告咨询、个人信息相关请求，请发送至上方邮箱。我们通常会在 3 个工作日内回复。",
        ja: "サービスのご利用に関するお問い合わせ、不具合の報告、提携・広告のお問い合わせ、個人情報に関するご依頼は上記のメールアドレスまでお送りください。通常 3 営業日以内に返信します。",
      },
      {
        ko: "한국어와 영어로 문의할 수 있어요.",
        en: "You can write to us in Korean or English.",
        zh: "可使用韩语或英语咨询。",
        ja: "韓国語または英語でお問い合わせいただけます。",
      },
    ],
  },
  {
    title: { ko: "정보 제보·피드백", en: "Report wrong info & feedback", zh: "信息上报与反馈", ja: "情報の報告・フィードバック" },
    body: [
      {
        ko: "출구 번호, 엘리베이터·화장실·물품보관함 위치, 환승 동선, 번역이 실제와 다르면 알려 주세요. 확인 후 빠르게 고칠게요.",
        en: "Tell us when an exit number, the location of an elevator, restroom or locker, a transfer route or a translation is wrong. We check and fix it quickly.",
        zh: "如出口编号、电梯/卫生间/储物柜位置、换乘路线或翻译与实际不符，请告诉我们。确认后会尽快修正。",
        ja: "出口番号、エレベーター・トイレ・コインロッカーの位置、乗り換え動線、翻訳が実際と異なる場合はお知らせください。確認のうえ速やかに修正します。",
      },
      {
        ko: "역 이름, 호선, 잘못된 내용, 가능하면 사진이나 화면 캡처를 함께 보내 주시면 더 빨리 반영할 수 있어요. 앱에서는 [메뉴 → 의견 보내기]로도 보낼 수 있어요.",
        en: "Include the station name, line, what is wrong and, if possible, a photo or screenshot so we can fix it faster. In the app you can also use Menu → Send feedback.",
        zh: "请附上车站名称、线路、错误内容，如有可能附上照片或截图，以便我们更快修正。在应用中也可通过「菜单 → 发送意见」提交。",
        ja: "駅名、路線、誤っている内容、可能であれば写真やスクリーンショットを添えていただくと、より早く反映できます。アプリでは「メニュー → ご意見を送る」からも送信できます。",
      },
    ],
  },
  {
    title: { ko: "데이터 삭제 요청", en: "Data deletion", zh: "数据删除", ja: "データの削除" },
    body: [
      {
        ko: "내 제보·글·댓글은 [마이 → 내 데이터 모두 삭제]로 바로 지울 수 있어요. 앱을 쓸 수 없다면 이메일 제목에 \"데이터 삭제 요청\"이라고 적어 보내 주세요.",
        en: "You can erase your reports, posts and comments right away with Me → Delete all my data. If you can't use the app, email us with the subject \"Data deletion request\".",
        zh: "您可以通过「我的 → 删除我的全部数据」立即删除自己的上报、帖子和评论。如无法使用应用，请发送邮件并在标题注明\"数据删除申请\"。",
        ja: "ご自身の情報・投稿・コメントは「マイ → 自分のデータをすべて削除」ですぐに削除できます。アプリを使用できない場合は、件名を「データ削除依頼」としてメールでお送りください。",
      },
    ],
  },
];
