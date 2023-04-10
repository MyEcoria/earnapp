const express = require('express');
const app = express();
const earnappAPI = require('../modules/earnapp.js');
const change = require('../modules/change.js');
const bodyParser = require('body-parser');
const db = require('../modules/db.js');
const wallet = require('../modules/wallet.js');

app.use(bodyParser.json());

const config = require('../config/general.json');
const nodes = require('../config/wallet.json');

const port = config["apiPort"];

// Ajouter une route pour récupérer une liste d'utilisateurs
app.get('/admin/devices', (req, res) => {

  earnappAPI.devices()
    .then((response) => {
        res.json(response);
    })
    .catch((error) => {
      console.error('Erreur lors de la récupération de la liste des appareils:', error);
    });

});

app.get('/admin/user', (req, res) => {

    earnappAPI.user()
      .then((response) => {
          res.json(response);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération de la liste des appareils:', error);
      });
  
  });

app.get('/admin/money', (req, res) => {

    earnappAPI.money()
      .then((response) => {
          res.json(response);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération de la liste des appareils:', error);
      });
  
  });

  app.get('/user/:user', (req, res) => {

    const user = req.params.user;
    
    if (user.substring(0, 5) =="nano_" || user.substring(0, 4) =="ana_" || user.substring(0, 4) =="xdg_" || user.substring(0, 5) =="ban_") {
        db.getUserByAddress(user)
        .then((response) => {
            if (response != null) {
                totalPaid = response["totalPaid"];
                discord = response["discord"]
                uuid = response["uuid"];
                earnappAPI.devices()
                    .then((response) => {
                        const obj = response.find(item => item.uuid === uuid);
                        withdraw = obj["earned_total"] - totalPaid;
                        obj.notPaid = withdraw;
                        delete obj.ips;
                        const coinMap = {
                            "nano_": { getPrice: change.getPriceInNano, coin: "XNO" },
                            "ban_": { getPrice: change.getPriceInBanano, coin: "BAN" },
                            "xdg_": { getPrice: change.getPriceInDogenano, coin: "XDG" },
                            "ana_": { getPrice: change.getPriceInAnanos, coin: "ANA" }
                          };
                          
                          const prefix = Object.keys(coinMap).find((prefix) => user.startsWith(prefix));
                          const { getPrice, coin } = coinMap[prefix];
                          
                          if (prefix) {
                            getPrice(obj.rate)
                              .then((response) => {
                                obj.rateCrypto = response;
                                obj.coin = coin;
                                getPrice(obj.earned_total)
                                    .then((response) => {
                                        obj.earned_crypto = response;
                                        getPrice(obj.notPaid)
                                            .then((response) => {
                                                obj.discord = discord;
                                                obj.notPaidCrypto = response;
                                                obj.code = 200;
                                                res.send(obj);
                                            })
                                            .catch((error) => {
                                                console.error('Erreur lors de la récupération de la liste des appareils:', error);
                                            });
                                    })
                                    .catch((error) => {
                                        console.error('Erreur lors de la récupération de la liste des appareils:', error);
                                    });
                              })
                              .catch((error) => {
                                console.error('Erreur lors de la récupération de la liste des appareils:', error);
                              });
                          }
                          
                    })
                    .catch((error) => {
                    console.error('Erreur lors de la récupération de la liste des appareils:', error);
                    });

            } else {
                res.send('{"status": "Address not found", "code": 500 }');
            }
            
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération de la liste des appareils:', error);
        });
    } else {
        res.send('{"status": "Invalid Address", "code": 501 }');
    }
  
  });

  app.get('/discord/:user', (req, res) => {

    const idDiscord = req.params.user;
    db.getUserByDiscord(idDiscord)
        .then((response) => {
            if (response) {
                res.send(response);
            } else {
                res.send('{"status": "Discord not found", "code": 55 }');
            }
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération de la liste des appareils:', error);
        });

  });


  app.get('/withdraw/:user', (req, res) => {

    const user = req.params.user;

    if (user.substring(0, 5) =="nano_" || user.substring(0, 4) =="ana_" || user.substring(0, 4) =="xdg_" || user.substring(0, 5) =="ban_") {

        db.getUserByAddress(user)
        .then((response) => {
            if (response != null) {
                totalPaid = response["totalPaid"];
                uuid = response["uuid"];
                earnappAPI.devices()
                    .then((response) => {
                        const obj = response.find(item => item.uuid === uuid);
                        withdraw = obj["earned_total"] - totalPaid;
                        console.log(withdraw);

                        if (withdraw > 0.0001) {
                                obj.notPaid = withdraw;
                                delete obj.ips;

                                var coinMap = {
                                    "nano_": { getPrice: change.getPriceInNano, coin: "xno" },
                                    "ban_": { getPrice: change.getPriceInBanano, coin: "ban" },
                                    "xdg_": { getPrice: change.getPriceInDogenano, coin: "xdg" },
                                    "ana_": { getPrice: change.getPriceInAnanos, coin: "ana" }
                                };
                                
                                var prefix = Object.keys(coinMap).find((prefix) => user.startsWith(prefix));
                                var { getPrice, coin } = coinMap[prefix];
                                
                                if (prefix) {
                                    getPrice(withdraw)
                                    .then((response) => {
                                        const send = response;
                                        const coinMap = {
                                            "nano_": { getPrice: wallet.sendXNO, coin: "xno" },
                                            "ban_": { getPrice: wallet.sendBAN, coin: "ban" },
                                            "xdg_": { getPrice: wallet.sendXDG, coin: "xdg" },
                                            "ana_": { getPrice: wallet.sendANA, coin: "ana" }
                                        };
                                        var prefix = Object.keys(coinMap).find((prefix) => user.startsWith(prefix));
                                        var { getPrice, coin } = coinMap[prefix];
                                        getPrice(send, user)
                                            .then((response) => {
                                                var hash = response;
                                                db.defMoney(uuid, withdraw)
                                                    .then((response) => {
                                                        hash.code = 200;
                                                        res.json(hash);
                                                    })
                                                    .catch((error) => {
                                                        console.error('Erreur lors de la récupération de la liste des appareils:', error);
                                                    });
                                            })
                                            .catch((error) => {
                                                console.error('Erreur lors de la récupération de la liste des appareils:', error);
                                            });
                                    })
                                    .catch((error) => {
                                        console.error('Erreur lors de la récupération de la liste des appareils:', error);
                                    });
                                }
                            } else {
                                res.send('{"status": "Minimum is 0.0001$", "code": 300 }');
                            }
                          
                    })
                    .catch((error) => {
                    console.error('Erreur lors de la récupération de la liste des appareils:', error);
                    });

            } else {
                res.send('{"status": "Address not found", "code": 301 }');
            }
            
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération de la liste des appareils:', error);
        });

    } else {
        res.send('{"status": "Invalid Address", "code": 302 }');
    }


  });

app.post('/', (req, res) => {
   body = req.body;
   if (body["action"] == "register") {
    if (body["uuid"]) {
        if (body["uuid"].substring(0, 4) == "sdk-") {
            if (body["add"]) {
                if (body["add"].length < 70 && body["add"].length > 60) {
                    if (body["add"].substring(0, 5) =="nano_" || body["add"].substring(0, 4) =="ana_" || body["add"].substring(0, 4) =="xdg_" || body["add"].substring(0, 5) =="ban_") {
                        db.getUserByAddress(body["add"])
                            .then((response) => {
                                if (response) {
                                    res.send('{"status": "Address found", "code": 54 }');
                                } else {
                                    db.getUser(body["uuid"])
                                        .then((response) => {
                                            if (response) {
                                                res.send('{"status": "UUID found", "code": 53 }');
                                            } else {
                                                earnappAPI.add(body["uuid"])
                                                    .then((response) => {
                                                        if (response["status"]) {
                                                            if(response["status"] == "ok") {
                                                                if (body["discord"]) {
                                                                    db.addUser(body["uuid"], body["add"], body["discord"]);
                                                                    console.log("111");
                                                                    res.send('{"status": "You are now registered", "code": 200 }');
                                                                } else {
                                                                    db.addUser(body["uuid"], body["add"], 0);
                                                                    console.log("222");
                                                                    res.send('{"status": "You are now registered", "code": 200 }');
                                                                }
                                                                
                                                                
                                                            }
                                                        } else {
                                                            if (response["error"]) {
                                                                if (response["error"] == "This device was already linked") {
                                                                    res.send('{"status": "' + response["error"] + '", "code": 30 }');
                                                                } else if (response["error"] == "The device is not found") {
                                                                    res.send('{"status": "' + response["error"] + '", "code": 31 }');
                                                                } else {
                                                                    res.send('{"status": "' + response["error"] + '"}');
                                                                }
                                                            
                                                            }
                                                        } 
                                                    })
                                                    .catch((error) => {
                                                    console.error('Erreur lors de la récupération de la liste des appareils:', error);
                                                    });
                                            }
                                        })
                                        .catch((error) => {
                                            console.error('Erreur lors de la récupération de la liste des appareils:', error);
                                        });
                                }
                            })
                            .catch((error) => {
                                console.error('Erreur lors de la récupération de la liste des appareils:', error);
                            });
                    } else {
                        res.send('{"status": "Invalid Address", "code": 100}');
                    }
                } else {
                    res.send('{"status": "Too Short", "code": 105}');
                }
            }
        } else {
            res.send('{"status": "Invalid Uuid", "code": 201}');
        }
    } else {
        res.send('{"status": "where is the uuid?"}');
    }
   }

   if (body["action"] == "discord") {
    if (body["uuid"]) {
        if (body["uuid"].substring(0, 4) == "sdk-") {
            if (body["discord"]) {
                db.getUser(body["uuid"])
                    .then((response) => {
                        if (response["discord"] != 0) {
                            res.send('{"status": "Account alr link", "code": 494 }')
                        } else {
                            db.defDiscord(body["uuid"], body["discord"])
                                .then((response) => {
                                    res.send('{"status": "ok", "code": 493 }')
                                })
                                .catch((error) => {
                                    res.send('{"status": "Error", "code": 44 }')
                                });
                        }
                    })
                    .catch((error) => {
                        console.error('Erreur lors de la récupération de la liste des appareils:', error);
                        res.send('{"status": "UUID not fount", "code": 492 }')
                    });
                
                }
                
            }
        }
    }

});

app.get('/balances', async (req, res) => {
    try {
      const promises = [
        wallet.balance("XNO", nodes["accountXNO"]),
        wallet.balance("BAN", nodes["accountBAN"]),
        wallet.balance("ANA", nodes["accountANA"]),
        wallet.balance("XDG", nodes["accountXDG"])
      ];
      
      const results = await Promise.all(promises);
      const nanor = results[0]["balance"];
      const bananor = results[1]["balance"];
      const ananosr = results[2]["balance"];
      const dogenanor = results[3]["balance"];
  
      const resultat = '{"nano": ' + nanor + ', "banano": ' + bananor + ', "ananos": ' + ananosr + ', "dogenano": ' + dogenanor + '}';
      res.send(resultat);
    } catch (error) {
      console.error(error);
      res.status(500).send("Erreur lors de la récupération des soldes");
    }
  });
  
  

// Lancer le serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`API disponible sur http://localhost:${port}`);
});
