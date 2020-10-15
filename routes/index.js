const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../util/auth.js");
const mongoose = require("mongoose");
const User = require("../models/user.model");

router.get("/", function (req, res, next) {
  res.json({ message: "Hi" });
});

router.post("/auth", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((result) => {
      if (result) {
        const accessToken = jwt.sign(
          { name: req.body.name, email: req.body.email },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );
        res
          .status(200)
          .json({
            message: "OK",
            task: "signedIn",
            token: accessToken,
            result: result,
          });
        return;
      } else {
        const user = new User({ email: req.body.email, name: req.body.name });
        user
          .save()
          .then(() => {
            const accessToken = jwt.sign(
              {
                name: req.body.name,
                email: req.body.email,
              },
              process.env.JWT_SECRET,
              { expiresIn: "30d" }
            );
            res
              .status(200)
              .json({ message: "OK", task: "signedUp", token: accessToken });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              message: "Something went wrong",
            });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Something went wrong",
      });
      return;
    });
});

router.get("/done", auth, (req, res, next) => {
  const { email } = req;
  User.findOne({ email: email })
    .then((result) => {
      res.status(200).json({
        result: result,
        message: "OK",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Something went wrong",
      });
    });
});

router.put('/done', auth, (req, res, next) =>{
  const {email} = req, {id, ty} = req.body;
  if(ty === 'add'){
    User.findOneAndUpdate({
      email: email,
      done: {
          "$not": {
              "$elemMatch":{
                id
              } 
          }
        }
      }, {
      $addToSet: {
          done: id
      }
    })
      .then(result => {
        res.status(200).json({message: "OK"});
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({message: "some went wrong!"})
      })
  }else{
    User.update({email: email}, {
      $pull: {
          done: id
      }
    }, { multi: true })
      .then(result => {
        res.status(200).json({message: "OK"});
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({message: "some went wrong!"})
      })
  }
  
});

module.exports = router;
