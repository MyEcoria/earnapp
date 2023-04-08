const mongoose = require('mongoose');

const config = require('../config/general.json');

mongoose.connect(config["mongodb"], { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  uuid: String,
  address: String,
  totalPaid: Number
});

const User = mongoose.model('User', userSchema);

async function addUser(uuid, address) {
  const newUser = new User({
    uuid,
    address,
    totalPaid: 0,
    withdraw: 0
  });
  await newUser.save();
}

async function defMoney(uuid, amount) {
  const user = await User.findOne({ uuid });
  if (user) {
    user.totalPaid += amount;
    await user.save();
  }
}

async function remMoney(uuid, amount) {
  const user = await User.findOne({ uuid });
  if (user) {
    user.totalPaid -= amount;
    await user.save();
  }
}

async function getUser(uuid) {
  const user = await User.findOne({ uuid });
  data = JSON.stringify(user);
  data = JSON.parse(data)
  return data;
}


async function getUserByAddress(address) {
    const user = await User.findOne({ address });
    if (user) {
      return user.toJSON();
    }
    return null;
}
  
  module.exports = {
    addUser,
    defMoney,
    remMoney,
    getUser,
    getUserByAddress
  };
