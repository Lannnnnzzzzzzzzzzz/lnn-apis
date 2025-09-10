import axios from 'axios';
import * as cheerio from 'cheerio';
const BASE    = 'https://anichin.cafe';

const ua = {headers:{'User-Agent':'Mozilla/5.0'}};

async function fetchHTML(path){
  const url = BASE + path;
  const {data} = await axios.get(url, ua);
  return cheerio.load(data);
}

function parseCard($){
  const res = [];
  $('.bs').each((_,el)=>{
    const title = $(el).find('.tt').text().trim();
    const slug  = $(el).find('a').attr('href')?.split('/').filter(Boolean).pop() || '';
    const poster= $(el).find('img').attr('src') || '';
    const score = $(el).find('.sb').text().trim();
    const ep    = $(el).find('.epx').text().replace('Episode','').trim();
    if(title) res.push({title, slug, poster, score, episode:ep});
  });
  return res;
}

function parsePagination($){
  const total = $('.pagination .page-numbers').not('.next').not('.prev').last().text() || '1';
  return parseInt(total,10);
}

export { fetchHTML, parseCard, parsePagination };
