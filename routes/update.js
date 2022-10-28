const router = require("express").Router();

const { checkIfLoggedIn } = require("../middlewares");
const { ObjectId } = require("mongodb");

router.get("/", checkIfLoggedIn, async (req, res) => {
  if (req.session) {
    const orgId = req.session.user.org_id;

    const org = await req.mongoClient
      .collection("organisations")
      .findOne({ _id: ObjectId(orgId) });

    res.render("update", {
      orgName: org,
    });
  } else {
    req.flash(
      "error_messages",
      "Fatal error. Please contact the system administrator."
    );
    res.redirect("/");
  }
});

router.post("/", async (req, res) => {
  if (req.session) {
    const orgId = req.session.user.org_id;
    const { _csrf, ...rehabCentreData } = req.body;
    rehabCentreData["last_updated"] = new Date();

    try {
      await req.mongoClient
        .collection("organisations")
        .updateOne(
          { _id: ObjectId(orgId) },
          { $set: rehabCentreData },
          { upsert: true }
        );

      req.flash(
        "success_messages",
        "Rehab Centre details successfully updated!"
      );
      res.redirect("/");
    } catch (e) {
      console.log(e);
    }
  }
});

module.exports = router;
