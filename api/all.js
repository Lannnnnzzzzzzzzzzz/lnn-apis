import { fetchHTML, parseCard, parsePagination } from '../lib/scrape.js';

export default async function(req,res){
  try{
    const page = Number(req.query.page) || 1;
    const $ = await fetchHTML(`/donghua/page/${page}`);
    const data = parseCard($);
    const totalPages = parsePagination($);
    res.json({data, page, totalPages});
  }catch(e){
    res.status(500).json({error:e.message});
  }
}
