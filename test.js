const test = require('./modules/wallet.js');

async function receiveAnaAsync() {
  const receive = await test.receiveAna("ana_1yaspft1ocpwuya9fd96nregjwsti1rft9pgpo9mxfzi57py6kzna9ok1omo");
  console.log(receive);
}

receiveAnaAsync();
