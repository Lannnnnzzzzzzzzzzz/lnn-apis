import { fetchHTML } from '../lib/scrape.js';

export default async function(req,res){
  try{
    const $ = await fetchHTML('/genre');
    const list = [];
    $('.tagcloud a').each((_,el)=>{
      const name = $(el).text().trim();
      const slug = $(el).attr('href')?.split('/').filter(Boolean).pop() || '';
      if(name) list.push({name, slug});
    });
    res.json(list);
  }catch(e){
    res.status(500).json({error:e.message});
  }
}
