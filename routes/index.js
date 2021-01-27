const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../util/auth.js");
const User = require("../models/user.model");
const axios = require('axios');

router.get("/", function (req, res, next) {
  res.json({ message: "Hi" });
});

router.get("/auth", async (req, res, next) => {
  const params = new URLSearchParams();
  params.append("code", req.query.code);
  params.append("client_id", process.env.CLIENT_ID);
  params.append("client_secret", process.env.CLIENT_SECRET);
  params.append("redirect_uri", process.env.REDIRECT_URI);
  params.append("grant_type", "authorization_code");
  
  try{
    const result = await axios.post("https://oauth2.googleapis.com/token", params, {headers: {"Content-Type": "application/x-www-form-urlencoded"}});
    const jwtTokenFromGoogle = result.data.id_token;
    const userData = jwt.decode(jwtTokenFromGoogle);
    
    const {given_name, picture, email} = userData;
    User.findOne({ email })
    .then((result) => {
      if (result) {
        const accessToken = jwt.sign(
          { name: given_name, email: email },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );
        return res
          .status(200)
          .json({
            message: "OK",
            task: "signedIn",
            token: accessToken,
            email,
            given_name,
            picture
          });
      } else {
        const user = new User({ email, given_name });
        user
          .save()
          .then(() => {
            const accessToken = jwt.sign(
              {
                name: given_name,
                email: email,
              },
              process.env.JWT_SECRET,
              { expiresIn: "30d" }
            );
            res
              .status(200)
              .json({ message: "OK", task: "signedUp", token: accessToken, given_name, email, picture });
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
  }catch(err){
    console.log(err);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
  
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

router.get("/user-settings", auth, (req, res, next) => {
  User.findOne({email: req.email}, "-done -name")
    .then(result => {
      res.status(200).json({
        message: "OK",
        result
      })
    })
    .catch(err => {
      res.status(500).json({
        message: "something went wrong!"
      })
    })
})
router.put("/user-settings", auth, (req, res, next) => {
  const {item, value} = req.body;
  const obj = new Object();
  obj[item] = value;
  User.findOneAndUpdate({email: req.email}, {
      ...obj 
    }, {multi: true}
  )
  .then((result) => {
    res.status(200).json({
      message: "OK"
    })
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json({
      message: "Something went wrong!"
    })
  })
})

module.exports = router;
