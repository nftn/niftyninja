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
  {success, failure} = require('./lib/httplib'),
  { kittyInfo, getKitties } = require('./lib/cryptoKittyApi'),
  https = require('https');

const http = require('http')
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);

const privateKey = fs.readFileSync('./privkey.pem', 'utf8')
const certificate = fs.readFileSync('./cert.pem', 'utf8')

const credentials = {key: privateKey, cert: certificate}

const path = require('path')
/* setup */
const trades = fs.existsSync('./kitties.json') ? JSON.parse(fs.readFileSync('./kitties.json')) : []

const createTrade = async (haveToken, wantToken) => {
  const id = trades.length + 1000;
  const haveCat = await kittyInfo(haveToken)
  const wantCat = await kittyInfo(wantToken)
  trades.push({ have: haveCat, want: wantCat })
  // console.log(trades[id])
  // console.log('created pre-trade ', id)
  fs.writeFileSync('./kitties.json', JSON.stringify(trades))
  return id;
}

const prod = process.env.NODE_ENV == 'prod'

const getTrade = id => trades[id-1000]

const updateTrade = (id, value) => trades[id-1000] = value

const discord = new DiscordBot(createTrade)
discord.login();

var rawBodyHandler = function (req, res, buf, encoding) {
  if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
      console.log('Raw body: ' + req.rawBody);
  }
}

const app = express();

//app.use(express.static(path.join(__dirname, '../client/build')))
//app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')))

app.use(cors({ allowedHeaders: 'Content-Type, Cache-Control' }));
app.options('*', cors());
// app.use( bodyParser.urlencoded({ extended: false }) )
app.use(bodyParser.json({ verify: rawBodyHandler }));
/*
app.post('/trade/pre', async (req, res) => {
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
    const trade = getTrade(req.params.id)
    if (!trade) throw new Error("trade id does not exist")
    else res.send(success(trade))
    console.log('trade info request ', req.params.id, trade)
  } catch ({message}) {
    res.send(failure({ message }))
  }
})

app.get('/api/kittyinfo/:id', async (req, res) => {
  try {
        const id = req.params.id
	const kitty = await kittyInfo(id)
        const {name, imgUrl, generation,
        birthTime,
        is_fancy, fancy_type, cooldown, cooldownIndex,
        isReady, is_gestating, address} = kitty;
        res.send(success({kitty}))
  
  } catch ({message}) {
        res.send(failure({message}))
  }
})

app.get('/api/kittybyaddress/:address', async (req, res) => {
  try {
    const address = req.params.address
    const kitties = await getKitties(address)
    res.send(success({kitties}))
  } catch({message}) {
    res.send(failure({message})) 
  }
})

app.post('/api/trade/setorder', (req, res) => {
  try {
    const { order, id } = req.body;
    const trade = getTrade(id)
    if (!trade) throw new Error("trade id does not exist")
    else {
      console.log('trade put request ', id, trade)
      if (!trade.order) updateTrade(id, { ...trade, order })
    }
    discord.announceOpenOrder(id, trade.have.id, trade.want.id)
    fs.writeFileSync('./kitties.json', JSON.stringify(trades))
    res.send(success())
  } catch ({message}) {
    res.send(failure({ message }))
  }
})

app.post('/api/trade/fillorder', (req, res) => {
  try {
    const { txReceipt, id } = req.body;
    const trade = getTrade(id)
    if (!trade) throw new Error("trade id does not exist")
    else {
      console.log('trade put request ', id, trade)
      updateTrade(id, { ...trade, txReceipt })
    }
    fs.writeFileSync('./kitties.json', JSON.stringify(trades))
    res.send(success())
  } catch ({message}) {
    res.send(failure({ message }))
  }
})

app.use(express.static(path.join(__dirname, '../client/build')))

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')))
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')))

const port = prod ? 443 : 8000 // 80

const server = https.createServer(credentials, app)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});
