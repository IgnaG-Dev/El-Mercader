import { useQuery } from '@tanstack/react-query'
import SEO from '../../components/ui/SEO'

interface RssItem {
  title: string
  pubDate: string
  link: string
  guid: string
  author: string
  thumbnail: string
  description: string
}

interface RssFeed {
  title: string
  description: string
  link: string
  image: string
}

interface Rss2JsonResponse {
  status: string
  feed: RssFeed
  items: RssItem[]
}

const SUBREDDIT = 'CatanARG'
const REDDIT_URL = `https://www.reddit.com/r/${SUBREDDIT}`
const RSS_API = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(`${REDDIT_URL}/.rss`)}&count=15`

async function fetchRedditRss(): Promise<Rss2JsonResponse> {
  const res = await fetch(RSS_API)
  if (!res.ok) throw new Error('fetch failed')
  const data: Rss2JsonResponse = await res.json()
  if (data.status !== 'ok') throw new Error('rss2json error')
  return data
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime()
  const s = Math.floor(ms / 1000)
  if (s < 3600) return `hace ${Math.floor(s / 60)}m`
  if (s < 86400) return `hace ${Math.floor(s / 3600)}h`
  return `hace ${Math.floor(s / 86400)}d`
}

const RedditIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
    <path d="M16.67 10a1.46 1.46 0 0 0-2.47-1 7.12 7.12 0 0 0-3.85-1.23l.65-3.08 2.13.45a1 1 0 1 0 .14-.52l-2.38-.5a.26.26 0 0 0-.31.2l-.73 3.44a7.14 7.14 0 0 0-3.89 1.23 1.46 1.46 0 1 0-1.61 2.39 2.87 2.87 0 0 0 0 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 0 0 0-.44 1.46 1.46 0 0 0 .57-1.38zM7.27 11a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm5.58 2.71a3.58 3.58 0 0 1-2.85.87 3.58 3.58 0 0 1-2.85-.87.19.19 0 0 1 .27-.27 3.2 3.2 0 0 0 2.58.74 3.2 3.2 0 0 0 2.58-.74.19.19 0 0 1 .27.27zm-.13-1.71a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" />
  </svg>
)

export default function CommunityPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reddit-rss', SUBREDDIT],
    queryFn: fetchRedditRss,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const posts = data?.items ?? []
  const feed = data?.feed

  return (
    <>
    <SEO
      title="Comunidad Catan Argentina — El Gremio de Mercaderes"
      description="Sumate a la comunidad de jugadores de Catan en Argentina. Novedades, estrategias, reseñas de expansiones, torneos y partidas. El foro más activo de Catan en español."
      url="/comunidad"
      structuredData={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Comunidad Catan Argentina — El Gremio',
        description: 'Comunidad activa de jugadores de Catan en Argentina. Novedades, estrategias y torneos.',
        url: 'https://elmercader.com.ar/comunidad',
        isPartOf: { '@type': 'WebSite', url: 'https://elmercader.com.ar' },
      }}
    />
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-headline text-headline-lg text-primary mb-4">La Comunidad del Gremio</h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-3">
          {feed?.description || 'Sumate a la comunidad de jugadores de Catan en Argentina. Publicaciones del subreddit r/CatanARG con las últimas noticias, estrategias y torneos.'}
        </p>
        <p className="text-sm text-on-surface-variant max-w-xl mx-auto">
          Encontrá reseñas de expansiones, consejos para principiantes, partidas online y presenciales en Buenos Aires, Córdoba, Rosario y todo el país.
        </p>
      </div>

      {/* Reddit banner */}
      <a
        href={REDDIT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 bg-[#FF4500] hover:bg-[#e03d00] transition-colors text-white rounded-xl px-6 py-4 mb-8 soft-lift"
      >
        <RedditIcon className="w-8 h-8 flex-shrink-0 fill-white" />
        <div className="flex-1">
          <div className="font-bold text-lg leading-tight">r/CatanARG en Reddit</div>
          <div className="text-sm opacity-90">Comunidad argentina de Catan — estrategias, partidas y más</div>
        </div>
        <span className="material-symbols-outlined opacity-80">open_in_new</span>
      </a>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Posts feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-headline text-headline-md text-on-surface">Posts de r/CatanARG</h2>
            <a
              href={REDDIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-label-sm text-primary hover:underline"
            >
              Ver todos
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
            </a>
          </div>

          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface-container rounded-xl p-6 border border-outline-variant/30 animate-pulse">
                  <div className="h-4 bg-outline-variant/40 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-outline-variant/30 rounded w-1/2 mb-4" />
                  <div className="h-3 bg-outline-variant/20 rounded w-1/4" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="bg-surface-container rounded-xl p-8 border border-outline-variant/30 text-center">
              <RedditIcon className="w-12 h-12 mx-auto mb-3 fill-[#FF4500] opacity-40" />
              <p className="text-body-md text-on-surface-variant mb-4">
                No se pudieron cargar los posts. Visitá el subreddit directamente.
              </p>
              <a
                href={REDDIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#FF4500] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#e03d00] transition-colors"
              >
                <RedditIcon className="w-5 h-5 fill-white" />
                Abrir r/CatanARG
              </a>
            </div>
          )}

          {!isLoading && !isError && posts.length === 0 && (
            <div className="bg-surface-container rounded-xl p-8 border border-outline-variant/30 text-center">
              <p className="text-body-md text-on-surface-variant mb-3">
                Todavía no hay posts en el subreddit. ¡Sé el primero en publicar!
              </p>
              <a
                href={REDDIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#FF4500] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#e03d00] transition-colors"
              >
                <RedditIcon className="w-5 h-5 fill-white" />
                Ir a r/CatanARG
              </a>
            </div>
          )}

          {posts.map((post) => {
            const preview = stripHtml(post.description).replace(/submitted by.*$/, '').trim()
            const author = post.author.replace('/u/', '')
            return (
              <a
                key={post.guid}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 bg-surface-container rounded-xl p-5 border border-outline-variant/30 soft-lift hover:border-primary/40 transition-colors"
              >
                {/* Reddit avatar */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#FF4500] flex items-center justify-center text-white font-bold text-sm">
                    {author[0]?.toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-bold text-label-bold text-on-surface">u/{author}</span>
                    <span className="text-label-sm text-on-surface-variant">· {timeAgo(post.pubDate)}</span>
                  </div>

                  <h3 className="font-bold text-body-lg text-on-surface mb-2 leading-snug">
                    {post.title}
                  </h3>

                  {preview && (
                    <p className="text-body-md text-on-surface-variant mb-3 line-clamp-2 text-sm">
                      {preview}
                    </p>
                  )}

                  {post.thumbnail && post.thumbnail.startsWith('http') && (
                    <img
                      src={post.thumbnail}
                      alt=""
                      className="rounded-lg mb-3 max-h-28 object-cover"
                    />
                  )}

                  <div className="flex items-center gap-1 text-primary text-label-sm">
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>open_in_new</span>
                    Ver en Reddit
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subreddit join card */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/30 text-center">
            <RedditIcon className="w-14 h-14 mx-auto mb-3 fill-[#FF4500]" />
            <h3 className="font-headline text-headline-sm text-on-surface mb-1">r/CatanARG</h3>
            <p className="text-label-sm text-on-surface-variant mb-5 leading-snug">
              {feed?.description || 'La comunidad argentina de Catan en Reddit'}
            </p>
            <a
              href={REDDIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              <RedditIcon className="w-5 h-5 fill-white" />
              Unirse a la comunidad
            </a>
          </div>

          {/* Rules/info card */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/30">
            <h3 className="font-headline text-headline-sm text-primary mb-4">¿Nuevo en la comunidad?</h3>
            <div className="space-y-3">
              {[
                { icon: 'forum', text: 'Compartí estrategias y tips de juego' },
                { icon: 'groups', text: 'Organizá partidas con otros jugadores' },
                { icon: 'star', text: 'Publicá reseñas de expansiones' },
                { icon: 'shopping_bag', text: 'Conseguí juegos y expansiones aquí en la tienda' },
              ].map(({ icon, text }) => (
                <div key={icon} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary flex-shrink-0" style={{ fontSize: '18px' }}>{icon}</span>
                  <span className="text-label-sm text-on-surface-variant leading-snug">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
