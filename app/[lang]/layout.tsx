import { notFound } from "next/navigation";
import { isLocale, LANGUAGES, LOCALES } from "../_lib/i18n";
import { GuideFooter, GuideHeader } from "./_guide/parts";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function GuideLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const htmlLang = LANGUAGES[lang].htmlLang;
  return (
    <div lang={htmlLang} className="flex min-h-dvh flex-1 flex-col bg-app text-ink">
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(htmlLang)}` }} />
      <GuideHeader locale={lang} />
      <main className="mx-auto w-full max-w-[760px] flex-1 px-4 pb-12 pt-5">{children}</main>
      <GuideFooter locale={lang} />
    </div>
  );
}
