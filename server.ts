import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const seoDataPath = path.join(process.cwd(), 'seo-data.json');

  // Read / Initialize SEO data
  function getSeoData() {
    if (fs.existsSync(seoDataPath)) {
      try {
        return JSON.parse(fs.readFileSync(seoDataPath, 'utf8'));
      } catch(e) { return {}; }
    }
    return {
      domain: '',
      robotsTxt: 'User-agent: *\nAllow: /',
      sitemapXml: '',
      rssXml: ''
    };
  }

  function setSeoData(data: any) {
    fs.writeFileSync(seoDataPath, JSON.stringify(data, null, 2));
  }

  // API endpoints
  app.get("/api/seo", (req, res) => {
    res.json(getSeoData());
  });

  app.post("/api/seo", (req, res) => {
    setSeoData(req.body);
    res.json({ success: true });
  });

  // Serve the actual files
  app.get("/robots.txt", (req, res) => {
    const data = getSeoData();
    res.type('text/plain');
    res.send(data.robotsTxt || 'User-agent: *\nAllow: /');
  });

  app.get("/sitemap.xml", (req, res) => {
    const data = getSeoData();
    res.type('application/xml');
    if (data.sitemapXml) {
       res.send(data.sitemapXml);
    } else {
       res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`);
    }
  });

  app.get("/rss.xml", (req, res) => {
    const data = getSeoData();
    res.type('application/xml');
    if (data.rssXml) {
       res.send(data.rssXml);
    } else {
       res.send(`<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0">\n<channel>\n</channel>\n</rss>`);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
