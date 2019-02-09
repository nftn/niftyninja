/* imports */
const express = require('express'),
  bodyParser = require('body-parser'),
  shortid = require('shortid'),
  { XMLHttpRequest } = require('xmlhttprequest'),
  fs = require('fs'),
  cors = require('cors'),
  { getKittyCat } = require('./cat-getter'),
  zero = require('./lib/zero'),
  DiscordBot = require('./discord'),
  {success, failure} = require('./lib/httplib');

const path = require('path')
/* setup */
const trades = fs.existsSync('./kitties.json') ? JSON.parse(fs.readFileSync('./kitties.json')) : {}

const createTrade = async (haveToken, wantToken) => {
  const id = shortid.generate();
  const haveCat = await getKittyCat(haveToken)
  const wantCat = await getKittyCat(wantToken)
  trades[id] = { have: haveCat, want: wantCat }
  console.log(trades[id])
  console.log('created pre-trade ', id)
  fs.writeFileSync('./kitties.json', JSON.stringify(trades))
  return id;
}

const discord = new DiscordBot(createTrade)
discord.login();

var rawBodyHandler = function (req, res, buf, encoding) {
  if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
      console.log('Raw body: ' + req.rawBody);
  }
}

const app = express();

app.use(cors({ allowedHeaders: 'Content-Type, Cache-Control' }));
app.options('*', cors());
app.use( bodyParser.urlencoded({ extended: false }) )
app.use(bodyParser.json({ verify: rawBodyHandler }));
/*
app.post('/api/trade/pre', async (req, res) => {
  try {
    const { have, want } = req.body;
    const id = shortid.generate();
    const haveCat = await getKittyCat(have)
    const wantCat = await getKittyCat(want)
    trades[id] = { have: haveCat, want: wantCat }
    console.log(trades[id])
    console.log('created pre-trade ', id)
    res.send(success({ id }))
    fs.writeFileSync('./kitties.json', JSON.stringify(trades))
  } catch ({message}) {
    res.send(failure({ message }))
  }
});
*/
app.get('/api/trade/:id', (req, res) => {
  try {
    const trade = trades[req.params.id]
    if (!trade) throw new Error("trade id does not exist")
    else res.send(success(trade))
    console.log('trade info request ', req.params.id, trade)
  } catch ({message}) {
    res.send(failure({ message }))
  }
})

app.post('/api/trade/setorder', (req, res) => {
  try {
    const { order, id } = req.body;
    const trade = trades[id]
    if (!trade) throw new Error("trade id does not exist")
    else {
      console.log('trade put request ', id, trade)
      if (!trade.order) trades[id] = { ...trade, order }
    }
    discord.announceOpenOrder(id, trade.have.id, trade.want.id)
    fs.writeFileSync('./kitties.json', JSON.stringify(trades))
  } catch ({message}) {
    res.send(failure({ message }))
  }
})

app.post('/api/trade/fillorder', (req, res) => {
  try {
    const { txReceipt, id } = req.body;
    const trade = trades[id]
    if (!trade) throw new Error("trade id does not exist")
    else {
      console.log('trade put request ', id, trade)
      trades[id] = { ...trade, txReceipt }
    }
    fs.writeFileSync('./kitties.json', JSON.stringify(trades))
    res.send(success('great job!'))
  } catch ({message}) {
    res.send(failure({ message }))
  }
})

app.use(express.static(path.join(__dirname, '../client/build')))

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')))
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')))

app.listen(80, () => {
  console.log('Example app listening on port 80!')
});
