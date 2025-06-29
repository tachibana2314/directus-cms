import React, { ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  keywords,
  ogImage,
}) => {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Directus Blog';
  const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Directusで作成された記事ブログ';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const pageTitle = title ? `${title} | ${siteName}` : siteName;
  const pageDescription = description || siteDescription;
  const keywordsContent = keywords ? keywords.join(', ') : '';
  const ogImageUrl = ogImage || `${siteUrl}/images/og-image.jpg`;
  
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {keywordsContent && <meta name="keywords" content={keywordsContent} />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* OGP タグ */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter カード */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Layout;