const axios = require('axios');
const cheerio = require('cheerio');

// pakai env, fallback ke default
const BASE = process.env.BASE_URL || 'https://anichin.cafe';

const ua = { headers: { 'User-Agent': 'Mozilla/5.0' } };

async function fetchHTML(path) {
  const { data } = await axios.get(BASE + path, ua);
  return cheerio.load(data);
}

function parseCard($) {
  const res = [];
  $('.bs').each((_, el) => {
    const title = $(el).find('.tt').text().trim();
    const slug = $(el).find('a').attr('href')?.split('/').filter(Boolean).pop() || '';
    const poster = $(el).find('img').attr('src') || '';
    if (title) res.push({ title, slug, poster });
  });
  return res;
}

function parsePagination($) {
  const last = $('.pagination .page-numbers').not('.next').not('.prev').last().text() || '1';
  return parseInt(last, 10);
}

// handler utama untuk Vercel
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const url = new URL(req.url, http://${req.headers.host});
  const path = url.pathname;
  const query = Object.fromEntries(url.searchParams.entries());

  try {
    let out;

    if (path.startsWith('/api/genre/') && path !== '/api/genrelist') {
      const name = path.split('/')[3];
      const page = Number(query.page) || 1;
      const $ = await fetchHTML(/genres/${name}/page/${page});
      const data = parseCard($);
      const totalPages = parsePagination($);
      out = { data, page, totalPages };

    } else if (path.startsWith('/api/donghua/') && path !== '/api/donghua') {
      const slug = path.split('/')[3];
      const $ = await fetchHTML(/donghua/${slug});
      const title = $('h1.entry-title').text().trim();
      const poster = $('.thumb img').attr('src') || '';
      const episodes = [];
      $('.eplister li').each((_, el) => {
        const num = $(el).find('.epl-num').text().trim();
        const url = $(el).find('a').attr('href');
        if (num && url) episodes.unshift({ episode: num, url });
      });
      out = { title, slug, poster, episodes };

    } else if (path === '/api') {
      out = { message: 'Donghua API ready', docs: '/api/home' };

    } else if (path === '/api/home') {
      const $ = await fetchHTML('/');
      out = parseCard($);

    } else if (path === '/api/ongoing') {
      const $ = await fetchHTML('/ongoing');
      out = parseCard($);

    } else if (path === '/api/completed') {
      const $ = await fetchHTML('/completed');
      out = parseCard($);

    } else if (path === '/api/schedule') {
      const $ = await fetchHTML('/schedule');
      const days = {};
      let curDay = null;
      $('h3, a[href*="/episode"]').each((_, el) => {
        if (el.name === 'h3') {
          curDay = $(el).text().trim();
          days[curDay] = [];
        } else if (curDay && el.name === 'a') {
          const txt = $(el).text().split(' – ')[0].trim();
          const slug = $(el).attr('href')?.split('/').filter(Boolean).pop() || '';
          if (txt && slug) days[curDay].push({ title: txt, slug });
        }
      });
      out = days;

    } else if (path === '/api/genrelist') {
      out = { data: [], message: 'Kosong ngab kek hatiku' };

    } else if (path === '/api/movie') {
      out = { data: [], message: 'Kosong ngab kek hatiku' };

    } else if (path === '/api/batch') {
      out = { data: [], message: 'Kosong ngab kek hatiku' };

    } else if (path === '/api/donghua') {
      const page = Number(query.page) || 1;
      const $ = await fetchHTML(/page/${page});
      const data = parseCard($);
      const totalPages = parsePagination($);
      out = { data, page, totalPages };

    } else if (path.startsWith('/api/search')) {
      const page = Number(query.page) || 1;
      const keyword = encodeURIComponent(query.q || '');
      if (!keyword) throw new Error('q required');
      const $ = await fetchHTML(/page/${page}/?s=${keyword});
      const data = parseCard($);
      const totalPages = parsePagination($);
      out = { data, page, totalPages };

    } else {
      res.statusCode = 404;
      out = { error: 'Not found' };
    }

    res.end(JSON.stringify(out, null, 2));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }, null, 2));
  }
};
