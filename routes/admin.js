const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer')
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

const transport = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.THE_EMAIL,
    pass: process.env.THE_PASSWORD
  }
};

const transporter = nodemailer.createTransport(transport);

transporter.verify((error, success) => {
  if (error) {
    console.error(error)
  } else {
    console.log('users ready to mail myself')
  }
});

const sendEmail = async (userMap, req) => {
  const recipients = [];
  userMap.map(elem => {
    recipients.push(elem.email)
  })
  let count = 0, sent = 0;
  for(const i in userMap){
    try{
      const mail = {
        from: process.env.THE_EMAIL,
        to: userMap[i].email,
        subject: req.body.subject,
        html: `
          <p><strong>Hello ${userMap[i].name},</strong></p>
          ${req.body.html}
        `
      }
      sent++;
      process.stdout.write(`${sent} `);
      const mailSent = await transporter.sendMail(mail);
      count++;
      if(sent === userMap.length){
        console.log(`${count} emails sent out of ${userMap.length}`)
      }
    }catch(e){
      console.log(e);
      sent++;
      if(sent === userMap.length -1){
        console.log(`${count} emails sent out of ${userMap.length}`)
      }
    }
  }
  // for(let i = 0; i < userMap.length; ++i){
  //   const mail = {
  //     from: process.env.THE_EMAIL,
  //     to: userMap[i].email,
  //     subject: req.body.subject,
  //     html: `
  //       <p><strong>Hello ${userMap[i].name},</strong></p><p>We're here with a weekly leaderboard update. <p>This week</p> </p><ol><li>Tushar tops the lesaderboard with 48 problem solved!</li><li>Subham just behind Tushar with 46 problems solved!</li><li>Raghav at Third place with 40 problems solved!</li></ol><p>We're working on cool features. So stay tuned and keep practicing at DoTo.</p><p><em><strong>See you on the leaderboard.</strong></em></p><p>Visit: <a href="dotodsa.netlify.app/" target="_blank" rel="noopener">dotodsa.netlify.app/</a></p><p>Best,</p><p>DoTo Team</p>
  //     `
  //   }
  //   transporter.sendMail(mail, (err, info) => {
  //     sent++;
  //     if(!err){
  //       count++;
  //       if(sent === userMap.length){
  //         console.log(`${count} emails sent out of ${userMap.length}`)
  //       }
  //     }else{
  //       if(sent === userMap.length -1){
  //         console.log(`${count} emails sent out of ${userMap.length}`)
  //       }
  //     }
  //   });
  // }
}

router.post('/send', auth, (req, res, next) => {
  if(req.email === process.env.THE_EMAIL){
    getEmails()
      .then(result => {
        if(process.env.NODE_ENV === 'dev'){
          sendEmail(
            [{email:'antiqueroy@outlook.com', name: 'Antique'}, {email:'ankitatiiitr@outlook.com', name: 'Antique'}, {email:'imantiqueroy@gmail.com', name: 'Antique'}, {email:'ankitraj.btech.cs18@iiitranchi.ac.in', name: 'AnkitRaj'}, {email:'ankitatiiitr@gmail.com', name: 'Ankit'}], req);
        }else{
          sendEmail(result, req);
        }
        res.json({
          message: 'Mail fetched! Sending mails.'
        })
      })
      .catch(err => {
        console.log(err, 'fetching mails failed!');
        res.json({
          message: "Something went wrong! fetching mails failed!"
        })
      })
  }else{
    res.status(500).json({
      message: 'Not authorized'
    })
  }
})

module.exports = router;
