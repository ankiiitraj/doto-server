const express = require("express");
const router = express.Router();
const auth = require("../util/auth.js");
const User = require("../models/user.model");

const getEmails = () => {
  const promise = new Promise((resolve, reject) => {
    User.find({})
      .then((result) => {
        const userMap = [];
        result.forEach(element => {
          userMap.push({
            email: element.email,
            name: element.name
          })
        });
        resolve(userMap);
      })
      .catch(err => {
        console.log(err);
        reject(new Error('DB error'));
      })
  })

  return promise;
}

router.get("/get", auth, (req, res, next) => {
  if(req.email !== process.env.THE_EMAIL){
    res.json({
      message: "not authorized"
    })
  }else{
    getEmails().then((result) => {
      res.json({
        result
      })
    })
    .catch(() =>{
      res.json({
        err: "err"
      })
    })
  }
})

module.exports = router;
