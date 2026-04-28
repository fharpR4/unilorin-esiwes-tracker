import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="University of Ilorin E-SIWES Progress Tracker — Digital SIWES Logbook" />
        <meta name="theme-color" content="#1a3a5c" />
        <meta name="application-name" content="UniIlorin E-SIWES" />
      </Head>
      <body className="antialiased">
        {/* Prevent theme flash on load — must run before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('esiwes-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}