const axios = require('axios');

async function getPriceInNano(amount) {
  const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=nano&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false`);
  const price = response.data["nano"].usd;
  const priceInNano = parseFloat((amount / price).toFixed(5));
  
  return priceInNano;
}

async function getPriceInBanano(amount) {
  const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=banano&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false`);
  const price = response.data["banano"].usd;
  const priceInBanano = parseFloat((amount / price).toFixed(5));
    
  return priceInBanano;
}

async function getPriceInDogenano(amount) {
  const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=nano&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false`);
  const price = response.data["nano"].usd;
  const priceInNano = (amount / price);
    
  const nanswapResponse = await axios.get(`https://data.nanswap.com/get-markets`);
  const nanswapData = nanswapResponse.data;
  const anaXnoData = nanswapData.find(item => item.key === "XDG/XNO");
  const priceInDogenano = parseFloat((priceInNano / anaXnoData.midPrice).toFixed(5));
    
  return priceInDogenano;
}

async function getPriceInAnanos(amount) {
  const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=nano&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false`);
  const price = response.data["nano"].usd;
  const priceInNano = (amount / price);
      
  const nanswapResponse = await axios.get(`https://data.nanswap.com/get-markets`);
  const nanswapData = nanswapResponse.data;
  const anaXnoData = nanswapData.find(item => item.key === "ANA/XNO");
  const priceInAnanos = parseFloat((priceInNano / anaXnoData.midPrice).toFixed(5));
      
  return priceInAnanos;
}
  
  

module.exports = {
  getPriceInNano,
  getPriceInBanano,
  getPriceInDogenano,
  getPriceInAnanos,
};

