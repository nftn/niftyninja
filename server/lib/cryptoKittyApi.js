
const fetch = require('node-fetch');

const token = 'rQDbvjc6Laxbnh8DTJlSGPkv8Jy2DOQX5go7l6TXXy4'

const getKitties = (address) => {
  return fetch(`https://public.api.cryptokitties.co/v1/kitties?owner_wallet_address=${address}`, {
    headers: { 'x-api-token': token }
  }).then(res => res.json())
  .then(data => data.kitties.map(kitty => ({id: kitty.id, name: kitty.name, })))
}

const kittyInfo = (tokenId) => {
  return fetch(`https://public.api.cryptokitties.co/v1/kitties/${tokenId}`, {
    headers: { 'x-api-token': token }
  }).then(res => res.json())
  .then(kitty => {
    const {id, name, image_url_png, generation, created_at, is_fancy, fancy_type, status: { cooldown, cooldown_index, is_ready, is_gestating }, owner: {address}} = kitty;
    cooldownIndex = cooldown_index;
    birthTime = new Date(created_at).toDateString()
    isReady = is_ready

    return {id, name, imgUrl: image_url_png.replace('https', 'http'), generation, 
      birthTime, 
      is_fancy, fancy_type, cooldown, cooldownIndex, 
      isReady, is_gestating, address}
  })
} 

module.exports = { getKitties, kittyInfo }
