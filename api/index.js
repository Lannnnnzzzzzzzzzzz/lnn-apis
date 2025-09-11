import axios from "axios";
import * as cheerio from "cheerio";

const BASE = "https://anichin.cafe";
const ua = { headers: { "User-Agent": "Mozilla/5.0" } };

async function fetchHTML(path) {
  const { data } = await axios.get(BASE + path, ua);
  return cheerio.load(data);
}

function parseCard($) {
  const res = [];
  $(".bs").each((_, el) => {
    const title = $(el).find(".tt").text().trim();
    const slug =
      $(el).find("a").attr("href")?.split("/").filter(Boolean).pop() || "";
    const poster = $(el).find("img").attr("src") || "";
    if (title) res.push({ title, slug, poster });
  });
  return res;
}

function parsePagination($) {
  const last =
    $(".pagination .page-numbers")
      .not(".next")
      .not(".prev")
      .last()
      .text() || "1";
  return parseInt(last, 10);
}

function wrap(data) {
  return { success: true, data };
}

export default async function handler(req, res) {
  // --- Fix CORS ---
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://donghua-streaming.vercel.app/"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  const path = url.pathname;
  const query = Object.fromEntries(url.searchParams.entries());

  try {
    let out;

    // --- API routes ---
    if (path === "/api") {
      out = { message: "Donghua API ready", docs: "/api/home" };

    } else if (path === "/api/home") {
      out = wrap(parseCard(await fetchHTML("/")));

    } else if (path === "/api/ongoing") {
      out = wrap(parseCard(await fetchHTML("/ongoing")));

    } else if (path === "/api/completed") {
      out = wrap(parseCard(await fetchHTML("/completed")));

    } else if (path === "/api/donghua") {
      const page = Number(query.page) || 1;
      const $ = await fetchHTML(`/page/${page}`);
      out = wrap({
        list: parseCard($),
        page,
        totalPages: parsePagination($),
      });

    } else if (path.startsWith("/api/donghua/")) {
      const slug = path.split("/")[3];
      const $ = await fetchHTML(`/donghua/${slug}`);
      const episodes = [];
      $(".eplister li").each((_, el) => {
        const num = $(el).find(".epl-num").text().trim();
        const url = $(el).find("a").attr("href");
        if (num && url) episodes.unshift({ episode: num, url });
      });
      out = wrap({
        title: $("h1.entry-title").text().trim(),
        slug,
        poster: $(".thumb img").attr("src") || "",
        episodes,
      });

    } else if (path.startsWith("/api/genre/")) {
      const name = path.split("/")[3];
      const page = Number(query.page) || 1;
      const $ = await fetchHTML(`/genres/${name}/page/${page}`);
      out = wrap({
        list: parseCard($),
        page,
        totalPages: parsePagination($),
      });

    } else if (path === "/api/search") {
      const page = Number(query.page) || 1;
      const keyword = encodeURIComponent(query.q || "");
      if (!keyword) throw new Error("q required");
      const $ = await fetchHTML(`/page/${page}/?s=${keyword}`);
      out = wrap({
        list: parseCard($),
        page,
        totalPages: parsePagination($),
      });

    } else if (path === "/api/schedule") {
      const $ = await fetchHTML("/schedule");
      const days = {};
      let curDay = null;
      $("h3, a[href*='/episode']").each((_, el) => {
        if (el.name === "h3") {
          curDay = $(el).text().trim();
          days[curDay] = [];
        } else if (curDay && el.name === "a") {
          const txt = $(el).text().split(" – ")[0].trim();
          const slug =
            $(el).attr("href")?.split("/").filter(Boolean).pop() || "";
          if (txt && slug) days[curDay].push({ title: txt, slug });
        }
      });
      out = wrap(days);

    } else if (
      ["/api/movie", "/api/batch", "/api/genrelist"].includes(path)
    ) {
      out = wrap({ message: "Kosong ngab kek hatiku" });

    } else {
      res.statusCode = 404;
      out = { error: "Not found" };
    }

    res.status(200).json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
