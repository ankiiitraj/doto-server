const express = require("express");
const router = express.Router();
const User = require("../models/user.model");

router.get("/", function (req, res, next) {
  User.find({}, {name: 1, _id: 0, done: 2, inLeaderboard: 3, username: 4, email: 5})
    .then(result => {
      result = result.filter(elem => elem.done.length > 0);
      result.sort((a, b) => b.done.length - a.done.length);
      const requiredResult = [];
      for(let i = 0; i < result.length; ++i){
        requiredResult.push({
          username: result[i].username || result[i].email.split("@")[0],
          name: result[i].name,
          done: result[i].done,
          inLeaderboard: result[i].inLeaderboard,
          _id: result[i]._id
        })
      }
      res.json({
          result: requiredResult
      })
  }).catch(err => {
      console.log(err);
      res.json({
          message: "Something went wrong"
      })
  })
});

router.get("/count", function (req, res, next) {
  User.count()
    .then(result => {
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
