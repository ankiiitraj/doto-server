const express = require("express");
const router = express.Router();
const User = require("../models/user.model");

router.get("/", function (req, res, next) {
  User.find({}, {name: 1, _id: 0, done: 2})
    .then(result => {
      result = result.filter(elem => elem.done.length > 0);
      result.sort((a, b) => b.done.length - a.done.length);
      res.json({
          result: result
      })
  }).catch(err => {
      console.log(err);
      res.json({
          message: "Something went wrong"
      })
  })
});


module.exports = router;
