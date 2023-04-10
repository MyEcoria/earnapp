const { Wallet } = require('simple-nano-wallet-js');
const { wallet: walletLib} = require('multi-nano-web')

const axios = require("axios");
const wallet = require('../config/wallet.json');
const config = require('../config/general.json');

let seedXDG = wallet["seedXDG"];
let seedANA = wallet["seedANA"];
let seedXNO = wallet["seedXNO"];
let seedBAN = wallet["seedBAN"];

let accountXDG = wallet["accountXDG"];
let accountANA = wallet["accountANA"];
let accountXNO = wallet["accountXNO"];
let accountBAN = wallet["accountBAN"];

let headerAuth = { // custom header for authentification
    "nodes-api-key": config["nodes-api-key"]
}

// DogeNano Wallet
const walletXDG = new Wallet({
    RPC_URL: 'https://nodes.nanswap.com/XDG',
    WORK_URL: 'https://nodes.nanswap.com/XDG',
    WS_URL: `wss://nodes.nanswap.com/ws/?ticker=XDG&api=${config["nodes-api-key"]}`,
    seed: seedXDG,
    defaultRep: "xdg_1e4ecrhmcws6kwiegw8dsbq5jstq7gqj7fspjmgiu11q55s6xnsnp3t9jqxf",
    prefix: 'xdg_',
    decimal: 26,
    customHeaders: headerAuth,
    wsSubAll: false, 
})

// Banano Wallet
const walletBAN = new Wallet({
    RPC_URL: 'https://nodes.nanswap.com/BAN',
    WORK_URL: 'https://nodes.nanswap.com/BAN',
    WS_URL: `wss://nodes.nanswap.com/ws/?ticker=BAN&api=${config["nodes-api-key"]}`,
    seed: seedBAN,
    defaultRep: "ban_1banexkcfuieufzxksfrxqf6xy8e57ry1zdtq9yn7jntzhpwu4pg4hajojmq",
    prefix: 'ban_',
    decimal: 29,
    customHeaders: headerAuth,
    wsSubAll: false
})

// Nano Wallet
const walletXNO = new Wallet({
    RPC_URL: 'https://nodes.nanswap.com/XNO',
    WORK_URL: 'https://nodes.nanswap.com/XNO',
    WS_URL: `wss://nodes.nanswap.com/ws/?ticker=XNO&api=${config["nodes-api-key"]}`,
    seed: seedXNO,
    defaultRep: "nano_1banexkcfuieufzxksfrxqf6xy8e57ry1zdtq9yn7jntzhpwu4pg4hajojmq",
    prefix: 'nano_',
    decimal: 30,
    customHeaders: headerAuth,
    wsSubAll: false
})

// Ananos Wallet
const walletANA = new Wallet({
    RPC_URL: 'https://nodes.nanswap.com/ANA',
    WORK_URL: 'https://nodes.nanswap.com/ANA',
    WS_URL: `wss://nodes.nanswap.com/ws/?ticker=ANA&api=${config["nodes-api-key"]}`,
    seed: seedANA,
    defaultRep: "ana_1nanswapnscbjjr6nd8bjbyp7o3gby1r8m18rbmge3mj8y5bihh71sura9dx",
    prefix: 'ana_',
    decimal: 29,
    customHeaders: headerAuth,
    wsSubAll: false
})

async function sendXDG(amount, add) {

    let accounts = walletXDG.createAccounts(0);
    let hash = await walletXDG.send({
        source: accountXDG, // must be in wallet. 
        destination: add,
        amount: walletXDG.megaToRaw(amount),
    })
    return hash;
    
}

async function sendXNO(amount, add) {

    let accounts = walletXNO.createAccounts(0);
    let hash = await walletXNO.send({
        source: accountXNO, // must be in wallet. 
        destination: add,
        amount: walletXNO.megaToRaw(amount),
    })
    return hash;
    
}

async function sendANA(amount, add) {

    let accounts = walletANA.createAccounts(0);
    let hash = await walletANA.send({
        source: accountANA, // must be in wallet. 
        destination: add,
        amount: walletANA.megaToRaw(amount),
    })
    return hash;
    
}

async function sendBAN(amount, add) {

    let accounts = walletBAN.createAccounts(0);
    let hash = await walletBAN.send({
        source: accountBAN, // must be in wallet. 
        destination: add,
        amount: walletBAN.megaToRaw(amount),
    })
    return hash;
    
}

async function balance(coin, add) {
    console.log(coin + '\n' + add);
    const data = {
      action: "account_balance",
      account: add
    };

    const head = {
        headers: {
          "Content-Type": "application/json",
          "nodes-api-key": config["nodes-api-key"]
        }
    };

    const urlNode = "https://nodes.nanswap.com/" + coin;
  
    try {
      const response = await axios.post(urlNode, data, head);

      
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

async function receiveAna(account) {
    // receive all receivable blocks for an account
    const hashesReceive = await walletANA.receiveAll(account);
    return hashesReceive; 
}
  

module.exports = {
    sendXDG,
    sendANA,
    sendBAN,
    sendXNO,
    balance,
    receiveAna,
  };