const router = require("express").Router();

router.get("/", async (req, res) => {
  const rehabCentreDetails = await req.mongoClient
    .collection("organisations")
    .find({})
    .toArray();

  res.render("index", {
    rehabCentreDetails: rehabCentreDetails,
  });
});

module.exports = router;
