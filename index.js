const config = require("config");
const mongoose = require("mongoose");

const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
// Bu modül, Joi modülüne yeni bir metot (fonksiyon) ekliyor aslında.

const genres = require("./routes/genres");
const customers = require("./routes/customers");
const movies = require("./routes/movies");
const rentals = require("./routes/rentals");
const users = require("./routes/users");
const auth = require("./routes/auth");

const error = require("./middleware/error");

const express = require("express");
const app = express();

/**
 * Programı çalıştırmadan önce aşağıdaki kısım terminale girilmelidir
 * $env:vidly_jwtPrivateKey="mySecureKey"
 *
 * Mongodb'yi çalışırken durdurmak için yönetici olarak cmd penceresi açılır ve şu komut yazılır:
 * "net stop MongoDB" (eğer çalışan hizmet penceresi açıksa birkaç kere ctrl + c yapılabilir)
 * Tekrar başlatmak için: mongod ("net start MongoDB" işe yarıyor mu bilmiyorum)
 */

if (!config.get("jwtPrivateKey")) {
  console.log("FATAL ERROR: jwtPrivateKey is not defined!");
  process.exit(1);
  // 0 ile çıkma demek hata yok, 0 hariç bir değer, "hata" ile çıkma demek. (genelde 1 kullanılıyor)
}

//const connectDatabase = async () => {
async function connectDatabase() {
  try {
    await mongoose.connect("mongodb://localhost/vidly");
    console.log("→ Successfully connected to the database... ✅");
  } catch (err) {
    // mongodb driver hata üretene kadar belli bir süre geçecek
    console.log("→ Couldn't connect to the database! ❌");
    console.error(err);
  }
}

connectDatabase();

// mongoose
//   .connect("mongodb://localhost/vidly")
//   .then(() => {
//     console.log("Connected to the database...");
//   })
//   .catch((err) => {
//     // mongodb driver hata üretene kadar belli bir süre geçecek
//     console.error("Couldn't connect to the database!", err);
//   });

// Aşağıdaki tanımlamalar MIDDLEWARE fonksiyonlarıdır...
app.use(express.json());
app.use("/api/genres", genres); //ilgili istekleri genres router'ına yönlendirir
app.use("/api/customers", customers);
app.use("/api/movies", movies);
app.use("/api/rentals", rentals);
app.use("/api/users", users);
app.use("/api/auth", auth);

// Error handling middleware fonksiyonu
app.use(error); // fonksiyonu referans geçiyoruz çağırmıyoruz ( error() değil !!! )

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`→ Listening on port ${port}...`));
