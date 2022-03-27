module.exports = function (err, req, res, next) {
  // Burada hatayı kaydetmemiz de lazım. Sonra cevap dönmeliyiz.
  res.status(500).send("Internal server error"); // Internal server error
};
