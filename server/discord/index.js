const Discord = require('discord.js');
const { getKitties, kittyInfo } = require('../lib/cryptoKittyApi')

// const commands = ['!trade', '!help']

const prod = process.env.NODE_ENV == 'prod'

const rootUrl = prod ? 'http://niftyninja.io' : 'localhost:3000'

const tradeUrl = `${rootUrl}/trade/`
const niftyNinjaChannelId = /*'543874817284374538'*/ '543231000252252201'

class DiscordBot {
  constructor(createTrade) {
    this.client = new Discord.Client();
    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user.tag}!`)
      this.niftyNinjaChannel = this.client.channels.get(niftyNinjaChannelId)
    });
    this.client.on('message', msg => this.onMessage(msg))
    this.createTrade = createTrade;
  }

  login() {
    this.client.login('NTM5NDAzNDQyNTQwNTExMjM1.Dz5AAQ.EKSIIghOg2pRMaRLyBfO4tuSYZ0');
  }

  async pmUser(author, msg) {
    try {await author.send(msg)} catch(e) {}
  }

  postMessageToNiftyNinja(msg) {
    try {return this.niftyNinjaChannel.send(msg)} catch(e) {}
  }

  announceOpenOrder(id, haveToken, wantToken) {
    try{
    const msg = `Kitties ${haveToken} : ${wantToken} ready to be filled at ${tradeUrl}${id}`;
    this.niftyNinjaChannel.send(msg)
    } catch(e) {}
  }

  async handleTradeRequest(author, params) {
    try {
    if (params.length !== 4) {
      return this.pmUser(author, 'You sent an invalid number of parameters for !trade.'
      +'\nCall it like this instead - "!trade <cryptokitty_id> for <cryptokitty_id>" (no angle brackets)\n'
      +'So if you wanted to trade CK 12424 for 88375, you would say "!trade 12424 for 88375"')
    }
    let haveToken = params[1];
    let wantToken = params[3];
    if (isNaN(haveToken) || isNaN(wantToken)) return this.postMessageToNiftyNinja(`${author} Only numbers are valid token ids!`)
    haveToken = parseInt(haveToken);
    wantToken = parseInt(wantToken)
    // if (typeof haveToken !== 'number' || wantToken !== 'number') return this.pmUser(author, 'Only numbers are valid token ids!')
    console.log(haveToken, wantToken)
    const id = await this.createTrade(haveToken, wantToken)
    console.log(haveToken, wantToken, `${tradeUrl}${id}`)
    this.postMessageToNiftyNinja(`${author} I've created a trade order for you to exchange your ${haveToken} for someone else's ${wantToken}!\n`
    + `To approve this trade, go to ${tradeUrl}${id} and click "Unlock"`);
    } catch(e) {}
  }

  async printHelpMessage(author) {
    const helpMsg = [
      `To see kitties by ETH address:`,
      `!list address`,
      `Example: !list 0x7d916a15c4f7f26f00734e95d92dd7a790949542`,
      `(Note: it is recomended to run this command in private chat to bot)\n`,
      `To post your kitty's mugshot and relevant criminal history in #kitty-exchange:`,
      `!mugshot kitty_id`,
      `Example: !mugshot 1229358\n`,
      `To trade your kitty, 1 for 1:`,
      `!trade kitty_id_a for kitty_id_b`,
      `Example: !trade 1350144 for 1335940`,
      `Note: when typing in the trade command, your own kitty ID always comes first.`,
//      `That's all so far, but my developers are working hard to make me a more powerful bot. Happy trading!`,
    ].join('\n')
    try {author.send(helpMsg)} catch(e) {}
  }

  async handleEnumRequest(author, params) {
    try{
    if (params.length !== 2) {
      return this.pmUser(author, 'That is not a valid address')
    }
    const address = params[1]
    const kitties = await getKitties(address)
    this.pmUser(author, `Tokens owned by ${address}:\n` + kitties.map(kitty => kitty.id).join(' '))
    } catch(e) {}
  }

  async handleInfoRequest(author, params) {
    try{
    if (params.length !== 2) {
      return this.pmUser(author, 'That is not a valid token')
    }
    const tokenId = params[1]
    const kitty = await kittyInfo(tokenId)
    const {name, imgUrl, generation, 
      birthTime, 
      is_fancy, fancy_type, cooldown, cooldownIndex, 
      isReady, is_gestating, address} = kitty;
    console.log(kitty)
    if (!kitty) return this.postMessageToNiftyNinja(`I couldn't find a kitty #${tokenId}`)
    // this.postMessageToNiftyNinja(`Info for kitty #${tokenId}\n${name}`)
    await this.postMessageToNiftyNinja({ file: imgUrl })
    const message = [
      name,
      `Kitty #${tokenId}`,
      `<https://www.cryptokitties.co/kitty/${tokenId}>`
    ].join('\n')
    this.postMessageToNiftyNinja(message)
    } catch(e) {}
    /*const message = [
      `Owned by ${address}`,
      `Born on ${birthTime}`,
      `Generation ${generation}`,
      is_fancy ? `Fancy Type: ${fancy_type}` : `Not fancy`,
      `Cooldown: ${cooldown}`,
      isReady ? "Ready" : "Not ready",
      is_gestating ? "Gestating" : "Not gestating"
    ].join('\n')*/
    //this.pmUser(author, msg)
  }

  async onMessage(msg) {
    try {
    const author = msg.author;
    const params = msg.content.trim().split(' ')
    switch(params[0]) {
      case '!trade':
        return this.handleTradeRequest(author, params)
      case '!list':
        return this.handleEnumRequest(author, params)
      case '!mugshot':
        return this.handleInfoRequest(author, params)
      case '!help':
        return this.printHelpMessage(author)
      default:
        break;
    }
    } catch(e) {}
  }
}

module.exports = DiscordBot
