const Discord = require('discord.js');
const xrpl = require('xrpl');

require('dotenv').config();

const client = new Discord.Client({ intents: ["GUILDS"] });

//******************* REPLACE THESE VARIABLES *********************/
const TOKEN_CURRENCY_NAME = 'AFA'; //Name of currency
const TOKEN_CURRENCY = 'AFA'; //40 character 160 bit hex currency code
const TOKEN_ISSUER = 'ratAFAXeeKaVuAxuWB9W1LuXD5m7Aqf2BH'; //Token Issuer
const AVATAR_URL = 'https://secure.gravatar.com/avatar/C270F8CB93F1E0D895AB0DD40AE50F1F?d=mm&s=173'; //Avatar URL
const UPDATE_FREQUENCY = 240; //Update Frequency in seconds
//*************************************************************** */

var token = {
  Bid: 0,
  Ask: 0,
  UpdatePrice: async function () {
      try{
            const client = new xrpl.Client('wss://xrplcluster.com');  
            await client.connect();
            const reqAsk = {
                "command": "book_offers",
                "taker_gets": {
                "currency": TOKEN_CURRENCY,
                "issuer": TOKEN_ISSUER
                },
                "taker_pays": {
                "currency": "XRP"
                },
                "limit": 1
            }

            const reqBid = {
                "command": "book_offers",
                "taker_gets": {
                    "currency": "XRP"
                },
                "taker_pays": {
                "currency": TOKEN_CURRENCY,
                "issuer": TOKEN_ISSUER
                },
                "limit": 1
            }

            const responseAsk = await client.request(reqAsk);
            const responseBid = await client.request(reqBid);
            var ask = responseAsk.result.offers;
            var bid = responseBid.result.offers;
            token.Ask = parseFloat(ask[0].quality / 1000000).toFixed(2);
            token.Bid = parseFloat((1 / (bid[0].quality * 1000000))).toFixed(2);
        
            client.disconnect();
    } catch
    {
        token.Ask = 0;
        token.Bid = 0;
    }
  }
}

const priceUpdate = async () => {
  token.UpdatePrice()
  const server = await client.guilds.fetch(process.env.DISCORD_SERVER_ID)
  const bot = await server.members.fetch(client.user.id)
  bot.setNickname(TOKEN_CURRENCY_NAME + ` PRICE TRACKER`)
  client.user.setActivity(`Bid: ${token.Bid}  Ask: ${token.Ask}`);
}

client.on('ready', () => {
  console.log(`${client.user.tag} has logged in!`)
  client.user.setAvatar(AVATAR_URL)
  myinterval = setInterval(function(){
    priceUpdate()
  }, UPDATE_FREQUENCY * 1000)
})

client.login(process.env.DISCORD_BOT_TOKEN)
