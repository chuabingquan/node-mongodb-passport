//Deals with JWT
var User = require('../models/user');
//used to create, sign, and verify token
var jwt = require('jsonwebtoken');
var config = require('../config');

//Generate token for user
exports.getToken = function(user){
    console.log("Generating token...");
    return jwt.sign(user, config.secretKey, {
      expiresIn: 3600
    });
};

//Verify ordinary user
exports.verifyOrdinaryUser = function(req, res, next){
  //Check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token ||
    req.headers['x-access-token'];

    //Decode token
    if(token){
      //Verify secretKey and check express
      jwt.verify(token, config.secretKey, function(err, decoded){
        if(err) {
          //Invalid token
          var err = new Error('You are not authenticated');
          err.status = 401;
          return next(err);
        }
        else {
          req.decoded = decoded;
          next();
        }
      });
    }
    else {
        //No token
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

//Verify admin
exports.verifyAdmin = function(req, res, next){
  //Check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token ||
    req.headers['x-access-token'];

    //Decode token
    if(token){
      //Verify secretKey and check express
      jwt.verify(token, config.secretKey, function(err, decoded){
        if(err) {
          //Invalid token
          var err = new Error('You are not authenticated');
          err.status = 401;
          return next(err);
        }
        else {
          req.decoded = decoded;
          var adminCheck = req.decoded._doc.admin;
          console.log(adminCheck);

          if(adminCheck){
            next();
          }
          else {
            var err = new Error('You are not authenticated');
            err.status = 403;
            return next(err);
          }
          // User.findOne({_id: userId}, function(err, user){
          //   if(err) throw err;
          //
          //   if(user.admin == true){
          //     next();
          //   }
          //
          //   else {
          //     var err = new Error('You are not authenticated');
          //     err.status = 403;
          //     return next(err);
          //   }
          // });
        }
      });
    }
    else {
        //No token
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};
