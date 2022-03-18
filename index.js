const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { response } = require("express");

const app = express();
const PORT = process.env.port || 5000;

// list of newspapers
const newspapers = [
  {
    name: "guardian",
    address: "https://www.theguardian.com/environment/climate-crisis",
    base: "",
  },
  {
    name: "thetimes",
    address: "https://www.thetimes.co.uk/environment/climate-change",
    base: "",
  },
];
const articles = [];

// routing begins

// this gets articles from all papers
newspapers.forEach((newspaper) => {
  axios.get(newspaper.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('a:contains("climate")', html).each(function () {
      const title = $(this).text();
      const url = $(this).attr("href");

      articles.push({
        title,
        url: newspaper.base + url,
        source: newspaper.name,
      });
    });
  });
});

//home route
app.get("/", (req, res) => {
  res.send("Welcome to our climate change web scraper API");
});

//news route for all papers
app.get("/news", (req, res) => {
  res.json(articles);
});

//article per nespaper
app.get("/news/:newspaperId", async (req, res) => {
  const newspaperId = req.params.newspaperId;

  //filter for newspaper address
  const newspaperAdd = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].address;

  //filter for newspaper base
  const newspaperBase = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].base;

  axios
    .get(newspaperAdd)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      const specificArticle = [];

      $('a:contains("climate")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr("href");

        specificArticle.push({
          title,
          url: newspaperBase + url,
          source: newspaperId,
        });
      });
      res.json(specificArticle);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log("server is running"));
