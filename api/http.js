const express = require('express');
const app = express();
const earnappAPI = require('../modules/earnapp.js');
const change = require('../modules/change.js');
const bodyParser = require('body-parser');
const db = require('../modules/db.js');
const wallet = require('../modules/wallet.js');

app.use(bodyParser.json());

const config = require('../config/general.json');

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
                uuid = response["uuid"];
                earnappAPI.devices()
                    .then((response) => {
                        const obj = response.find(item => item.uuid === uuid);
                        withdraw = obj["earned_total"] - totalPaid;
                        obj.notPaid = withdraw;
                        delete obj.ips;
                        const coinMap = {
                            "nano_": { getPrice: change.getPriceInNano, coin: "xno" },
                            "ban_": { getPrice: change.getPriceInBanano, coin: "ban" },
                            "xdg_": { getPrice: change.getPriceInDogenano, coin: "xdg" },
                            "ana_": { getPrice: change.getPriceInAnanos, coin: "ana" }
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
                                                obj.notPaidCrypto = response;
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
                res.send('{"status": "Address not found"}');
            }
            
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération de la liste des appareils:', error);
        });
    } else {
        res.send('{"status": "Invalid Address"}');
    }
  
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
                                                        res.json(hash);
                                                        console.log(response);
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
                                res.send('{"status": "Minimum is 0.0001$"}');
                            }
                          
                    })
                    .catch((error) => {
                    console.error('Erreur lors de la récupération de la liste des appareils:', error);
                    });

            } else {
                res.send('{"status": "Address not found"}');
            }
            
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération de la liste des appareils:', error);
        });

    } else {
        res.send('{"status": "Invalid Address"}');
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
                        earnappAPI.add(body["uuid"])
                            .then((response) => {
                                if (response["status"]) {
                                    if(response["status"] == "ok") {
                                        db.addUser(body["uuid"], body["add"]);
                                        res.send('{"status": "You are now registered"}');
                                    }
                                } else {
                                    if (response["error"]) {
                                        res.send('{"status": "' + response["error"] + '"}');
                                    }
                                } 
                            })
                            .catch((error) => {
                            console.error('Erreur lors de la récupération de la liste des appareils:', error);
                            });
                    } else {
                        res.send('{"status": "Invalid Address"}');
                    }
                } else {
                    res.send('{"status": "Too Short"}');
                }
            }
        } else {
            res.send('{"status": "Invalid Uuid"}');
        }
    } else {
        res.send('{"status": "where is the uuid?"}');
    }
   }
});
  

// Lancer le serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`API disponible sur http://localhost:${port}`);
});
