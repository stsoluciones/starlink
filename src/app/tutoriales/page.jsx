// app/tutoriales/page.jsx
export const revalidate = 1800; // 30 min

async function getVideos(limit = 10) {
  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!key || !channelId) return [];

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', key);
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', String(limit));
  url.searchParams.set('type', 'video'); // solo videos

  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return [];

  const { items = [] } = await res.json();
  return items
    .filter((v) => v?.id?.videoId)
    .map((v) => ({
      id: v.id.videoId,
      title: v.snippet.title,
      publishedAt: v.snippet.publishedAt,
      thumb: `https://i.ytimg.com/vi/${v.id.videoId}/hqdefault.jpg`,
    }));
}

export async function generateMetadata() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://slsoluciones.com.ar';
  const title = 'Tutoriales – Últimos videos de YouTube';
  const description =
    'Mirá los últimos videos del canal en YouTube.';

  return {
    title,
    description,
    alternates: { canonical: `${site}/tutoriales` },
    openGraph: {
      title,
      description,
      url: `${site}/tutoriales`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// Ajustá el import según tu estructura de carpetas:
// - Si el archivo está en /Tutoriales/YouTubeLite.jsx y usás alias "@":
//   import YouTubeLite from '@/Tutoriales/YouTubeLite';
// - Si lo tenés en /components/Tutoriales/YouTubeLite.jsx:
//   import YouTubeLite from '@/components/Tutoriales/YouTubeLite';
import YouTubeLite from '@/Tutoriales/YouTubeLite';

export default async function TutorialesPage() {
  const videos = await getVideos(10);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Últimos videos</h1>

      {videos.length === 0 ? (
        <p className="text-slate-600">No hay videos para mostrar:</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <YouTubeLite
              key={v.id}
              videoId={v.id}
              title={v.title}
              thumb={v.thumb}
            />
          ))}
        </div>
      )}
    </main>
  );
}
