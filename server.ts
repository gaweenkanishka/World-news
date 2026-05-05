import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import Parser from "rss-parser";

dotenv.config();

const parser = new Parser();

// GNews API Token
const GNEWS_API_KEY = process.env.VITE_GNEWS_API_KEY || "6f7b0f8c57eaa6ec5254c8942844ec6d";

const RSS_FEEDS = [
  { name: "BBC News", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
  { name: "Reuters", url: "https://www.reutersagency.com/feed/?best-topics=world-news&post_type=best" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { name: "The Guardian", url: "https://www.theguardian.com/world/rss" }
];

const COUNTRY_MAP: Record<string, string> = {
  "Canada": "ca",
  "Italy": "it",
  "Mexico": "mx",
  "UK": "gb",
  "US": "us",
  "World": "" 
};

const CATEGORY_MAP: Record<string, string> = {
  "Tech": "technology",
  "Business": "business",
  "General": "general",
  "World": "world",
  "Science": "science",
  "Health": "health",
  "Sports": "sports",
  "Entertainment": "entertainment"
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // In-memory cache
  const cache: Record<string, { data: any, timestamp: number }> = {};
  const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  async function fetchRSS() {
    try {
      const results = await Promise.all(RSS_FEEDS.map(async (feed) => {
        try {
          const res = await parser.parseURL(feed.url);
          return res.items.slice(0, 10).map(item => ({
            id: item.guid || item.link || '',
            title: item.title || '',
            link: item.link || '',
            pubDate: item.isoDate || item.pubDate || '',
            contentSnippet: (item.contentSnippet || item.description || "").replace(/<[^>]*>?/gm, ''),
            source: feed.name,
            sourceUrl: item.link || feed.url,
            image: "", 
            region: "World",
            topic: "General"
          }));
        } catch (e) {
          return [];
        }
      }));
      return results.flat().sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    } catch (e) {
      return [];
    }
  }

  app.get("/api/news", async (req, res) => {
    const { region, topic, trending } = req.query;
    const cacheKey = `${region}-${topic}-${trending}`;

    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
      return res.json(cache[cacheKey].data);
    }

    try {
      let url = "";
      if (trending === 'true') {
        const trendingQuery = encodeURIComponent("war OR oil OR tech launch OR climate OR finance");
        url = `https://gnews.io/api/v4/search?q=${trendingQuery}&lang=en&max=20&token=${GNEWS_API_KEY}`;
      } else {
        const countryCode = COUNTRY_MAP[String(region)] || "";
        const category = CATEGORY_MAP[String(topic)] || "general";
        url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=20&token=${GNEWS_API_KEY}${countryCode ? `&country=${countryCode}` : ""}`;
      }

      console.log(`[Fetching GNews] ${url}`);
      const response = await fetch(url);
      const gnewsData = await response.json();

      let finalNews = [];

      if (gnewsData.articles) {
        finalNews = gnewsData.articles.map((item: any) => ({
          id: item.url,
          title: item.title,
          link: item.url,
          pubDate: item.publishedAt,
          contentSnippet: item.description || item.content,
          source: item.source.name,
          sourceUrl: item.source.url,
          image: item.image,
          region: trending === 'true' ? "Trending" : (region || "World"),
          topic: trending === 'true' ? "Global Peaks" : (topic || "General"),
        }));
      } else {
        console.warn("[GNews Quota/Error] Falling back to RSS");
        finalNews = await fetchRSS();
      }

      cache[cacheKey] = { data: finalNews, timestamp: Date.now() };
      res.json(finalNews);
    } catch (error) {
      console.error("News Fetch Error:", error);
      const fallback = await fetchRSS();
      res.json(fallback);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
