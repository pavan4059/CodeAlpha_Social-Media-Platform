// Real-time external stream fetcher & caching engine for Pulse
// Utilizes zero-interrupt fallback caching (5 minute TTL)

const cache = {
  lastFetchTime: 0,
  items: [],
  ttl: 1000 * 60 * 5 // 5 minutes cache duration
};

// Generate dummy likes array of length count so post.likes.length works cleanly in frontend
const generateDummyLikes = (count) => {
  const c = Math.max(0, Math.min(count || 12, 250));
  const arr = [];
  for (let i = 0; i < c; i++) {
    arr.push(`ext_like_${i}`);
  }
  return arr;
};

// Fetch real-time tech articles from Dev.to API
async function fetchDevToStream() {
  try {
    const res = await fetch('https://dev.to/api/articles?per_page=5', {
      headers: { 'User-Agent': 'Pulse-Social-Sphere/1.0' }
    });
    if (!res.ok) throw new Error(`Dev.to API error (${res.status})`);
    
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
      _id: `ext_devto_${item.id}`,
      author: {
        _id: `ext_devto_user_${item.user?.id || '0'}`,
        username: item.user?.username || 'devto_creator',
        fullName: item.user?.name || 'Verified Dev.to Creator',
        avatarUrl: item.user?.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      },
      content: `${item.title}\n\n${item.description || item.summary || 'Click below to read this trending live technology article!'}\n\n#DevTo #${(item.tag_list || ['Tech', 'WebDev', 'Programming']).slice(0, 3).join(' #')}`,
      imageUrl: item.cover_image || item.social_image || null,
      source: 'Dev.to',
      externalLink: item.url || 'https://dev.to',
      likes: generateDummyLikes(item.public_reactions_count || 28),
      commentsCount: item.comments_count || 6,
      createdAt: new Date(item.published_at || item.created_at || Date.now())
    }));
  } catch (err) {
    console.warn('⚠️ Dev.to stream fetch warning:', err.message);
    return [];
  }
}

// Fetch real-time trending discussions from Hacker News JSON stream (reliable alternative to rate-limited Reddit Tech)
async function fetchHackerNewsStream() {
  try {
    const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!res.ok) throw new Error(`Hacker News error (${res.status})`);

    const ids = await res.json();
    const topIds = (Array.isArray(ids) ? ids : []).slice(0, 5);

    const items = await Promise.all(
      topIds.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()))
    );

    const posts = [];
    for (const p of items) {
      if (!p || !p.title) continue;

      posts.push({
        _id: `ext_hn_${p.id}`,
        author: {
          _id: `ext_hn_user_${p.by || 'anon'}`,
          username: p.by || 'hacker_news',
          fullName: 'Hacker News Topic',
          avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
        },
        content: `${p.title}\n\nLive trending developer discussion currently topping the charts on Hacker News with ${p.score || 50} community points.\n\n#HackerNews #Tech #Engineering #Trending`,
        imageUrl: null,
        source: 'HackerNews',
        externalLink: p.url || `https://news.ycombinator.com/item?id=${p.id}`,
        likes: generateDummyLikes(p.score || 55),
        commentsCount: p.descendants || 18,
        createdAt: new Date((p.time || (Date.now() / 1000)) * 1000)
      });
    }
    return posts;
  } catch (err) {
    console.warn('⚠️ Hacker News stream fetch warning:', err.message);
    return [];
  }
}

// Get combined live stream with 5-minute memory cache
async function getLiveStream() {
  const now = Date.now();
  if (now - cache.lastFetchTime < cache.ttl && cache.items.length > 0) {
    return cache.items;
  }

  try {
    const [devToItems, hnItems] = await Promise.all([
      fetchDevToStream(),
      fetchHackerNewsStream()
    ]);

    const combined = [...devToItems, ...hnItems];
    if (combined.length > 0) {
      cache.items = combined;
      cache.lastFetchTime = now;
      console.log(`📡 Refreshed real-time live stream cache: fetched ${combined.length} external items from Dev.to and Hacker News.`);
    }
    return cache.items;
  } catch (error) {
    console.error('❌ Error fetching live stream blend:', error.message);
    return cache.items || [];
  }
}

module.exports = {
  getLiveStream
};
