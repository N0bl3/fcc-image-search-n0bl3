const express = require('express');
const request = require('request');
const app = express();

const latest = [];
app.get('/', (req, res) => {
  res.redirect('/imagesearch/hello?offset=1');
});
app.get('/imagesearch/:query', (req, res) => {
  const offset = Number(req.query.offset) <= 0 ? Number(req.query.offset) : 1;
  request(`https://www.googleapis.com/customsearch/v1?key=${process.env.API_KEY}&cx=${process.env.CX}&q=${req.params.query}&safe=high&num=10&searchType=image&start=${offset}`,
    (error, response) => {
      if (!error) {
        const body = JSON.parse(response.body);
        const items = [];

        latest.unshift({
          term: req.params.query,
          when: Date.now(),
        });

        while (latest.length > 10) {
          latest.pop();
        }


        body.items.forEach((item) => {
          items.push({
            link: item.link,
            snippet: item.snippet,
            context: item.image.contextLink,
            thumbnail: item.image.thumbnailLink,
          });
        });
        res.send(items);
      }else {
        console.log(error);
        res.sendStatus(500);
      }
    });
});

app.get('/latest', (req, res) => {
  res.send(latest);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server starting on port : ${process.env.PORT || 3000}`);
});

