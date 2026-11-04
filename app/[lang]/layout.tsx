import { notFound } from "next/navigation";
import Footer from "../_components/Footer";
import { GUIDE_LANGUAGES, GUIDE_LOCALES, isGuideLocale } from "../_lib/guideLocale";
import LocaleSync from "./_guide/LocaleSync";
import { GuideHeader } from "./_guide/parts";

export function generateStaticParams() {
  return GUIDE_LOCALES.map((lang) => ({ lang }));
}

export default async function GuideLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isGuideLocale(lang)) notFound();
  const htmlLang = GUIDE_LANGUAGES[lang].htmlLang;
  return (
    <div lang={htmlLang} className="flex min-h-dvh flex-1 flex-col bg-app text-ink">
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(htmlLang)}` }} />
      <LocaleSync locale={lang} />
      <GuideHeader locale={lang} />
      <main className="mx-auto w-full max-w-[760px] flex-1 px-4 pb-12 pt-5">{children}</main>
      <Footer locale={lang} />
    </div>
  );
}
