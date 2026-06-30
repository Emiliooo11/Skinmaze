import { notFound } from 'next/navigation';

const VALID_LANGS = ['lv', 'lt', 'et'];

export function generateStaticParams() {
  return VALID_LANGS.map(lang => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!VALID_LANGS.includes(lang)) notFound();
  return <>{children}</>;
}
