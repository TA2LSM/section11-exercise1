const { Genre, validate } = require("../models/genre");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const asyncMiddleware = require("../middleware/async");

// Get All Genres
// router.get("/", async (req, res) => {
//   /**
//    * await Genre.find().sort("name"); ifadesi aslında şununla aynı:
//    * Genre.find().sort("name").then()
//    * Burada catch() kısmı yok. hata oluşursa ne olacağı ile ilgili işlem yapılmamış.
//    * Promise ile işlem yaparken her zaman try-catch bloğu kullanmak lazım.
//    */
//   try {
//     const genres = await Genre.find().sort("name");
//     res.status(200).send(genres); // ok
//   } catch (ex) {
//     // Burada hatayı kaydetmemiz de lazım. Sonra cevap dönmeliyiz.
//     res.status(500).send("Internal server error"); // Internal server error
//   }
// });

// Error handling için yukarıdaki fonksiyonu aşağıdaki şekle çevirmek gerekiyor.
// router.get("/", async (req, res, next) => {
//   try {
//     const genres = await Genre.find().sort("name");
//     res.status(200).send(genres); // ok
//   } catch (ex) {
//     next(ex);
//   }
// });

// Yukarıdaki şekilde yazılırsa her route handler'da try-catch bloklarını kullanmamız gerekecek.
// kod kalabalıklaşacak ve takibi zorlaşacak. Bu nedenle yukarıdaki fonksiyonu aşağıdaki şekle
// çevirmek gerekiyor.
// function asyncMiddleware(handler) {
//   return async (req, res, next) => {
//     try {
//       await handler(req, res);
//     } catch (ex) {
//       next(ex);
//     }
//   };
// }
// <<< AÇIKLAMALAR >>>
// (1) Yukarıda asenkron çalışan middleware tanımladık. parametre olarak handler fonksiyonunun
// referansını alıyor. (pointer) Burada "handler" fonksiyonu aşağıdaki route handler'da
// "async (req, res) => {...}" kısmı olduğu için yukarıdaki "handler" fonksiyonu "await" edilmeli.
// Bu nedenle aşağıda bu kısım asyncMiddleware(...) içine parametre olarak geçildi. (referans oalrak)
// (2) Aynı zamanda yukarıda "handler()" fonksiyonuna parametre girdisi olarak "req" ve "res" verilmesi lazım.
// Çünkü bunları alıp işleyecek.
// (3) Yukarıdaki "return async (req, res, next) => {...}" kısmı express'e geçilen standart route handler
// fonksiyonudur. Aşağıda normalde fonksiyon referansı geçilen yerde biz fonksiyonu çağırdık yani çalıştırdık.
// (asyncMiddleware(...) ile) Bu nedenle bu fonksiyonun express'e uygun bir değer dönmesi için yukarıda
// "return" kısmını kullanmamız gerekiyordu.
// (4) Ek olarak yukarıda aslında "async function asyncMiddleware(handler) {...}" yazmamız gerekiyordu. Çünkü
// "handler()"ın "await" edilebilmesi için "async" fonksiyon içinde kullanılması gerekiyor. Ama "return" kısmını
// zaten "async" olarak ekleyince ona gerek kalmadı.
// (5) Kısacası yukarıdaki "async middleware" fonksiyonu başka bir "async middleware" fonksiyonu dönüyor ve hiçbir
// yerde bir "promise" beklemiyor.

// <<< Her yerede kullanmak için yukarıdaki kod parçası middleware/async.js'e taşındı >>>

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const genres = await Genre.find().sort("name");
    res.status(200).send(genres); // ok
  })
);

// Aşağıdaki fonksiyonda ilk parametre route, ikincisi optional olarak middleware
// üçüncisi ise gerçek fonksiyondur. Burada biz auth middleware'ini ekledik. Bu middleware
// asıl fonksiyondan ÖNCE işletilecek.
// Create Genre
router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    // mantık aşağıdaki gibi ama bunu bir middleware fonksiyonuna
    // atamak daha mantıklı olur
    // const token = req.header("x-auth-token");
    // if(!valid) res.status(401).send("Unauthorized access!");

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = new Genre({ name: req.body.name });
    await genre.save(); //result db'e kaydedilen dökümandır. id bilgisini geri dönelim...

    res.status(200).send(genre);
  })
);

// Update Genre
router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true } //update edilmiş veriyi geri döndür...
  );

  if (!genre) return res.status(404).send("The genre with the given ID was not found.");
  res.send(genre);
});

// Önce "auth" sonra "admin" middleware'i çalışacak
// Delete Genre by ID
router.delete("/:id", [auth, admin], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);

  if (!genre) return res.status(404).send("The genre with the given ID was not found.");
  res.send(genre);
});

// Find Genre by ID
router.get("/:id", async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) return res.status(404).send("The genre with the given ID was not found.");
  res.send(genre);
});

module.exports = router;
