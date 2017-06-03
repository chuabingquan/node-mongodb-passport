var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify = require('./verify'); //Encapsulates everything related to JWT

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find({}, function(err, users){
    if (err) throw err;
    res.json(users);
  });
});

router.post('/register', function(req, res){
  User.register(new User({ username: req.body.username }),
    req.body.password, function(err, user){
      if(err) {
        return res.status(500).json({err: err});
      }

      if(req.body.firstname){
        user.firstname = req.body.firstname;
      }

      if(req.body.lastname){
        user.lastname = req.body.lastname;
      }

      user.save(function(err, user){
          //Confirm user is created
          passport.authenticate('local')(req, res, function(){
            return res.status(200).json({status: 'Registration Successful!'
          });
        });
      });
  });
});

router.post('/login', function(req, res, next){
  //Authenticate user
  passport.authenticate('local', function(err, user, info){
    if(err){
      return next(err);
    }
    if(!user){
      return res.status(401).json({
        err: info
      });
    }

    //Passport makes two methods available on req, login and logout
    //Tries to login the supplied user
    req.logIn(user, function(err){
      if(err) {
        console.log("req.login failed");
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }

      console.log('User in users: ', user);

      //Generate token for user
      var token = Verify.getToken(user);
      console.log("Login token is: ", token);
      //Send token back to client
      //Client handles token, sends back token for
      //every request incoming to server
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    });
  })(req, res, next);
});

router.get('/logout', function(req, res){
  //Logout supplied by passport for req, and invalidates token
  req.logout();
  res.status(200).json({
    status: 'You have logged out successfully.'
  });
});

module.exports = router;
