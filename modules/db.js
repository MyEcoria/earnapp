const mongoose = require('mongoose');

const config = require('../config/general.json');

mongoose.connect(config["mongodb"], { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  uuid: String,
  address: String,
  totalPaid: Number,
  discord: Number
});

const User = mongoose.model('User', userSchema);

async function addUser(uuid, address, discord) {
  const newUser = new User({
    uuid,
    address,
    discord,
    totalPaid: 0,
    withdraw: 0
  });
  await newUser.save();
}

async function defDiscord(uuid, discord) {
  try {
    console.log(discord);
    // Recherchez l'utilisateur dans la base de données
    const user = await User.findOne({ uuid });
    
    // Vérifiez si l'utilisateur existe
    if (!user) {
      console.log(`Aucun utilisateur n'a été trouvé avec l'UUID ${uuid}`);
      return;
    }
    
    // Mettez à jour la propriété discord de l'utilisateur
    user.discord = discord;
    await user.save();

    console.log(`Le compte avec l'UUID ${uuid} a été mis à jour avec le nouveau discord : ${discord}`);
    
  } catch (err) {
    console.error(`Une erreur est survenue lors de la mise à jour du compte avec l'UUID ${uuid} : ${err}`);
  }
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
  if (user) {
    return user.toJSON();
  }
  return null;
} 

async function getUserByAddress(address) {
    const user = await User.findOne({ address });
    if (user) {
      return user.toJSON();
    }
    return null;
} 

async function getUserByDiscord(discord) {
  const user = await User.findOne({ discord });
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
    getUserByAddress,
    defDiscord,
    getUserByDiscord
  };
