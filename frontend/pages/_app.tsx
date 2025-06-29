import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';

export default function App({ Component, pageProps }: AppProps) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Directus Blog';
  const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Directusで作成された記事ブログ';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <>
      <DefaultSeo
        titleTemplate={`%s | ${siteName}`}
        defaultTitle={siteName}
        description={siteDescription}
        canonical={siteUrl}
        openGraph={{
          type: 'website',
          locale: 'ja_JP',
          url: siteUrl,
          siteName: siteName,
          images: [
            {
              url: `${siteUrl}/images/og-image.jpg`,
              width: 1200,
              height: 630,
              alt: siteName,
            },
          ],
        }}
        twitter={{
          handle: '@handle',
          site: '@site',
          cardType: 'summary_large_image',
        }}
        additionalLinkTags={[
          {
            rel: 'icon',
            href: '/favicon.ico',
          },
        ]}
      />
      <Component {...pageProps} />
    </>
  );
}