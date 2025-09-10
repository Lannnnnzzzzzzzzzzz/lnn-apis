import { fetchHTML, parseCard, parsePagination } from '../lib/scrape.js';

export default async function(req,res){
  try{
    const q    = encodeURIComponent(req.query.q || '');
    const page = Number(req.query.page) || 1;
    if(!q) return res.status(400).json({error:'q required'});
    const $ = await fetchHTML(`/page/${page}/?s=${q}`);
    const data = parseCard($);
    const totalPages = parsePagination($);
    res.json({data, page, totalPages});
  }catch(e){
    res.status(500).json({error:e.message});
  }
}
