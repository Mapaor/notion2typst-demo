import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca">
      <head>
        <title>WikiBlog N2O</title>
        <meta name="description" content="Web per exportar una pàgina de Notion a Typst, per poder generar documents PDF pesonalitzables amb Typst.app o editors similars." />
        <meta property="og:title" content="Notion a Typst" />
        <meta property="og:description" content="Web per exportar una pàgina de Notion a Typst, per poder generar documents PDF pesonalitzables amb Typst.app o editors similars." />
        {/* <meta property="og:image" content="/ms-icon-310x310.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" /> */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
        <link rel="canonical" href="https://n2t-wikiblog.vercel.app" />
        <meta property="og:url" content="https://n2t-wikiblog.vercel.app" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
