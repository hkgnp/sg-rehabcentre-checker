const router = require("express").Router();
const crypto = require("crypto");

const { checkIfSuperUser } = require("../middlewares");
const { ObjectId } = require("mongodb");

router.get("/", checkIfSuperUser, async (req, res) => {
  if (req.session) {
    const allOrgs = await req.mongoClient
      .collection("organisations")
      .find({})
      .toArray();

    res.render("admin-update", {
      allOrgs: allOrgs,
    });
  }
});

router.post("/", checkIfSuperUser, async (req, res) => {
  if (req.session) {
    try {
      for (let i = 0; i < process.env.NO_OF_SERVICES; i++) {
        await req.mongoClient.collection("organisations").updateOne(
          { order: i },
          {
            $set: {
              female_capacity: req.body["female_capacity" + i.toString()],
              female_pending: req.body["female_pending" + i.toString()],
              female_available: req.body["female_available" + i.toString()],
              male_capacity: req.body["male_capacity" + i.toString()],
              male_pending: req.body["male_pending" + i.toString()],
              male_available: req.body["male_available" + i.toString()],
              special_prog_female_capacity:
                req.body["special_prog_female_capacity" + i.toString()],
              special_prog_female_pending:
                req.body["special_prog_female_pending" + i.toString()],
              special_prog_female_available:
                req.body["special_prog_female_available" + i.toString()],
              special_prog_male_capacity:
                req.body["special_prog_male_capacity" + i.toString()],
              special_prog_male_pending:
                req.body["special_prog_male_pending" + i.toString()],
              special_prog_male_available:
                req.body["special_prog_male_available" + i.toString()],
              special_remarks: req.body["special_remarks" + i.toString()],
              last_updated: new Date(),
            },
          },
          { upsert: true }
        );
      }

      req.flash(
        "success_messages",
        "All rehab centre details successfully updated!"
      );
      res.redirect("/");
    } catch (e) {
      console.log(e);
      req.flash(
        "error_messages",
        "There was an error updating and your changes may not have been saved. Please contact the administrator."
      );
    }
  }
});

module.exports = router;
