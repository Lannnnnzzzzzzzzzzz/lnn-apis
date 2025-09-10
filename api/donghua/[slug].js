import { fetchHTML } from '../../../lib/scrape.js';

export default async function(req,res){
  try{
    const { slug } = req.query;
    const $ = await fetchHTML(`/donghua/${slug}`);

    const title    = $('h1.entry-title').text().trim();
    const poster   = $('.thumb img').attr('src') || '';
    const synopsis = $('.entry-content p').first().text().trim();
    const score    = $('.rating strong').text().trim();
    const genres   = [];
    $('.genxed a').each((_,g)=> genres.push($(g).text().trim()));

    const episodes = [];
    $('.eplister li').each((_,el)=>{
      const num = $(el).find('.epl-num').text().trim();
      const url = $(el).find('a').attr('href');
      if(num && url) episodes.unshift({episode:num, url}); // terbaru di atas
    });

    res.json({title, slug, poster, synopsis, score, genres, episodes});
  }catch(e){
    res.status(500).json({error:e.message});
  }
}
