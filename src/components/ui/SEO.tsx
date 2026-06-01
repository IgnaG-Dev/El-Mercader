import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'El Mercader — Tienda Catan Argentina'
const SITE_URL = 'https://elmercader.com.ar'
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`

interface Props {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'product'
  price?: number
  noindex?: boolean
  structuredData?: object | object[]
}

export default function SEO({
  title,
  description = 'La tienda de Catan más completa de Argentina. Juego base, todas las expansiones y accesorios exclusivos. Envíos a todo el país. Pago con Mercado Pago.',
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  price,
  noindex = false,
  structuredData,
}: Props) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const canonicalUrl = url ? `${SITE_URL}${url}` : SITE_URL

  return (
    <Helmet>
      <html lang="es" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type === 'product' ? 'product' : 'website'} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="es_AR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Product price */}
      {type === 'product' && price !== undefined && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content="ARS" />
        </>
      )}

      {/* JSON-LD structured data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}
