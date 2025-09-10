// api/index.js
import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    // Contoh scraping ke site dummy
    const { data } = await axios.get("https://example.com");
    const $ = cheerio.load(data);

    const title = $("title").text();

    res.status(200).json({
      success: true,
      message: "API jalan sukses 🎉",
      siteTitle: title,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
