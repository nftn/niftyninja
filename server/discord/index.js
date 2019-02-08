const Discord = require('discord.js');

const commands = ['!trade', '!help']

const tradeUrl = 'http://localhost:3000/trade/'
const niftyNinjaChannelId = '543231000252252201'

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

  pmUser(author, msg) {
    author.send(msg)
  }

  postMessageToNiftyNinja(msg) {
    this.niftyNinjaChannel.send(msg)
  }

  announceOpenOrder(id, haveToken, wantToken) {
    this.niftyNinjaChannel.send(`${tradeUrl}${id} : ${haveToken} for ${wantToken}`)
  }

  async onMessage(msg) {
    const author = msg.author;
    const params = msg.content.trim().split(' ')
    if (params[0] !== '!trade') return;
    if (params.length !== 4) {
      return this.pmUser(author, 'You sent an invalid number of parameters for !trade.'
      +'\nCall it like this instead - "!trade <cryptokitty_id> for <cryptokitty_id>" (no angle brackets)\n'
      +'So if you wanted to trade CK 12424 for 88375, you would say "!trade 12424 for 88375"')
    }
    let haveToken = params[1];
    let wantToken = params[3];
    if (isNaN(haveToken) || isNaN(wantToken)) return this.pmUser(author, 'Only numbers are valid token ids!')
    haveToken = parseInt(haveToken);
    wantToken = parseInt(wantToken)
    // if (typeof haveToken !== 'number' || wantToken !== 'number') return this.pmUser(author, 'Only numbers are valid token ids!')
    console.log(haveToken, wantToken)
    const id = await this.createTrade(haveToken, wantToken)
    console.log(haveToken, wantToken, `${tradeUrl}${id}`)
    this.pmUser(author, `${tradeUrl}${id}`);
    
  }
}

module.exports = DiscordBot