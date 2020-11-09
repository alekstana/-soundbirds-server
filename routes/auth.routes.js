const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs');

const UserModel = require('../models/User.model');

const { isLoggedIn } = require('../helpers/auth-helper'); // middleware to check if user is loggedIn




router.post('/signup', (req, res) => {
    const {name, email, password } = req.body;
    console.log(name, email, password);
 
    if (!name || !email || !password) {
        res.status(500)
          .json({
            errorMessage: 'Please enter username, email and password'
          });
        return;  
    }

    const myRegex = new RegExp(/^[a-z0-9](?!.*?[^\na-z0-9]{2})[^\s@]+@[^\s@]+\.[^\s@]+[a-z0-9]$/);
    if (!myRegex.test(email)) {
        res.status(500)
          .json({
            errorMessage: 'Email format not correct'
        });
        return;  
    }

    // const myPassRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/);
    // if (!myPassRegex.test(password)) {
    //   res.status(500)
    //       .json({
    //         errorMessage: 'Password needs to have 8 characters, a number and an Uppercase alphabet'
    //       });
    //     return;  
    // }

    bcrypt.genSalt(12)
      .then((salt) => {
        console.log('Salt: ', salt);
        bcrypt.hash(password, salt)
          .then((passwordHash) => {
            UserModel.create({email, name, password: passwordHash})
              .then((user) => {
                user.password = "***";
                req.session.loggedInUser = user;
                console.log(req.session)
                res.status(200).json(user);
              })
              .catch((err) => {
                if (err.code === 11000) {
                  res.status(500)
                  .json({
                    errorMessage: 'username or email entered already exists!'
                  });
                  return;  
                } 
                else {
                  res.status(500)
                  .json({
                    errorMessage: 'Something went wrong! Go to sleep!'
                  });
                  return; 
                }
              })
          });  
  });

});
 
router.post('/signin', (req, res) => {
    const {email, password } = req.body;
    if ( !email || !password ) {
        res.status(500).json({
            error: 'Please enter email and password',
       })
      return;  
    }
    const myRegex = new RegExp(/^[a-z0-9](?!.*?[^\na-z0-9]{2})[^\s@]+@[^\s@]+\.[^\s@]+[a-z0-9]$/);
    if (!myRegex.test(email)) {
        res.status(500).json({
            error: 'Email format not correct',
        })
        return;  
    }

    console.log(req.body)
  
    // Find if the user exists in the database 
    UserModel.findOne({email})
      .then((userData) => {

          bcrypt.compare(password, userData.password)
            .then((doesItMatch) => {
                if (doesItMatch) {
                  userData.password = "***";
                  req.session.loggedInUser = userData;
                  console.log('Signin', req.session)
                  res.status(200).json(userData)
                }
  
                else {
                    res.status(500).json({
                        error: 'Passwords don\'t match',
                    })
                  return; 
                }
            })
            .catch((error) => {
                console.log(error)
                res.status(500).json({
                    error: 'Email format not correct',
                })
              return; 
            });
      })

      .catch((err) => {
        console.log(err)
        res.status(500).json({
            error: 'Email format not correct',
            message: err
        })
        return;  
      });
  
});


router.get('/user', (req, res) => {
  let user = req.session.loggedInUser
   res.status(200).json(user)
})

router.post('/logout', (req, res) => {
  req.session.destroy();
  res
  .status(200).json({}) //  No Content
})




module.exports = router;