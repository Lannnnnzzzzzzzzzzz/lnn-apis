import { fetchHTML, parseCard } from '../lib/scrape.js';

export default async function(req,res){
  try{
    const $ = await fetchHTML('/batch');
    const data = parseCard($);
    res.json(data);
  }catch(e){
    res.status(500).json({error:e.message});
  }
}
