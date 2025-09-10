import { fetchHTML } from '../lib/scrape.js';

export default async function(req,res){
  try{
    const $ = await fetchHTML('/schedule');
    const days = {};
    $('.kg').each((_,el)=>{
      const day = $(el).find('h3').text().trim();
      const list= [];
      $(el).find('.bs').each((_,c)=>{
        const title = $(c).find('.tt').text().trim();
        const slug = $(c).find('a').attr('href')?.split('/').filter(Boolean).pop() || '';
        list.push({title, slug});
      });
      if(day) days[day] = list;
    });
    res.json(days);
  }catch(e){
    res.status(500).json({error:e.message});
  }
}
