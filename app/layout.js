import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'MediCompara MX',
  description: 'Tu medicina gringa al mejor precio en México',
  manifest: '/manifest.json',
  themeColor: '#059669',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MediCompara',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyC2mZ0erVodeFMqlIBK9N72EwLIuyEj3Ys&libraries=places"
          async
          defer
        />
      </head>
      <body className="bg-stone-50 text-gray-900 min-h-screen">
        {children}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered'))
                .catch(err => console.log('SW registration failed'));
            }
          `}
        </Script>
      </body>
    </html>
  )
}
