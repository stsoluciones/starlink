// app/tutoriales/page.jsx
export const revalidate = 1800; // 30 min

async function getVideos({ limit = 25, pageToken = '' } = {}) {
  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!key || !channelId) return { items: [], nextPageToken: null, prevPageToken: null };

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', key);
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', String(limit));
  url.searchParams.set('type', 'video');
  if (pageToken) url.searchParams.set('pageToken', pageToken);

  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return { items: [], nextPageToken: null, prevPageToken: null };

  const data = await res.json();
  const items = (data.items ?? [])
    .filter((v) => v?.id?.videoId)
    .map((v) => ({
      id: v.id.videoId,
      title: v.snippet.title,
      publishedAt: v.snippet.publishedAt,
      thumb: `https://i.ytimg.com/vi/${v.id.videoId}/hqdefault.jpg`,
    }));

  return {
    items,
    nextPageToken: data.nextPageToken ?? null,
    prevPageToken: data.prevPageToken ?? null,
  };
}

export async function generateMetadata() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://slsoluciones.com.ar';
  const title = 'Tutoriales – Últimos videos de YouTube';
  const description = 'Mirá los últimos videos del canal en YouTube.';
  const canonical = `${site}/tutoriales`;
  const socialImage = `${site}/og/og-sls-starlink-mini.jpg`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title, description, url: canonical, type: 'website',
      siteName: 'SLS Soluciones', locale: 'es_AR',
      images: [{ url: socialImage, width: 1200, height: 630, alt: 'SLS Soluciones – Tutoriales' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [socialImage] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  };
}

// Ajustá este import a tu ruta real:
// import YouTubeLite from '@/Tutoriales/YouTubeLite';
import YouTubeLite from '../../components/Tutoriales/Tutoriales';
import ClientLayout from '../ClientLayout';

// Paginador simple
function Pager({ prevToken, nextToken }) {
  const linkBase = '/tutoriales';
  const prevHref = prevToken ? `${linkBase}?pageToken=${encodeURIComponent(prevToken)}` : null;
  const nextHref = nextToken ? `${linkBase}?pageToken=${encodeURIComponent(nextToken)}` : null;

  if (!prevHref && !nextHref) return null;

  return (
    <nav className="mt-8 flex items-center justify-between">
      <a
        href={prevHref ?? '#'}
        aria-disabled={!prevHref}
        className={`rounded-xl border px-4 py-2 text-sm ${
          prevHref
            ? 'border-slate-300 text-slate-700 hover:border-primary/40 hover:text-primary transition'
            : 'pointer-events-none border-slate-200 text-slate-300'
        }`}
      >
        ← Anterior
      </a>
      <a
        href={nextHref ?? '#'}
        aria-disabled={!nextHref}
        className={`rounded-xl border px-4 py-2 text-sm ${
          nextHref
            ? 'border-slate-300 text-slate-700 hover:border-primary/40 hover:text-primary transition'
            : 'pointer-events-none border-slate-200 text-slate-300'
        }`}
      >
        Siguiente →
      </a>
    </nav>
  );
}

export default async function TutorialesPage({ searchParams }) {
  const pageToken = searchParams?.pageToken ?? '';
  const { items: videos, nextPageToken, prevPageToken } = await getVideos({ limit: 25, pageToken });
  const count = videos.length;

  const fmt = (iso) =>
    new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <ClientLayout className="flex flex-col " title="Tutoriales">
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-10 w-full min-h-screen">
        {/* Hero / Header */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-primary/5 to-primary-hover/10 p-6 md:p-8 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary">Tutoriales</h2>
              <h1 className="text-xl md:text-2xl font-bold">Accesorios para StarLink mini y tener una mejor experiencia</h1>
              <p className="mt-1 text-slate-600 max-w-2xl">Trucos, guías y pasos a paso para aprovechar mejor nuestros productos.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1 text-sm font-medium text-primary shadow-sm">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {count} video{count === 1 ? '' : 's'}
            </span>
          </div>
        </section>

        {count === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center bg-white">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" className="opacity-60">
                <path fill="currentColor" d="M10 16.5v-9l6 4.5z" />
                <path fill="currentColor" d="M21 3H3v18h18V3Zm-2 2v14H5V5h14Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No hay videos para mostrar</h3>
            <p className="mt-1 text-sm text-slate-600">Cuando haya novedades, las vas a ver acá automáticamente.</p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((v) => (
                <li
                  key={v.id}
                  className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg hover:border-primary/30"
                >
                  <div className="relative">
                    <YouTubeLite videoId={v.id} title={v.title} thumb={v.thumb} publishedAt={v.publishedAt} />
                    <span className="absolute left-3 top-3 select-none rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-black/5">
                      {fmt(v.publishedAt)}
                    </span>
                    <span className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-primary/0 transition group-hover:ring-2 group-hover:ring-primary/30" />
                  </div>
                  <div className="p-4">
                    <h3 title={v.title} className="line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900">
                      {v.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-70">
                        <path fill="currentColor" d="M12 8V4l8 8l-8 8v-4H4V8z" />
                      </svg>
                      YouTube • {fmt(v.publishedAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Paginador */}
            <Pager prevToken={prevPageToken} nextToken={nextPageToken} />
          </>
        )}
      </main>
    </ClientLayout>
  );
}
