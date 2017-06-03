var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var express = require('express');

var Dishes = require('../models/dishes-1');
var Verify = require('./verify');

var dishRouter = express.Router();
dishRouter.use(bodyParser.json());

dishRouter.route('/')
.all(Verify.verifyOrdinaryUser)
.get(function(req, res, next){
    // Dishes.find({}, function(err, dishes){
    //   if(err) throw err; //Let app.js error handler handle if error occurs
    //   res.json(dishes); //Converts array to JSON
    //   //headers will be automatically generated e.g. 200 ok
    // });

    //Retrieve dishes, populate the dishes' comments.postedBy and execute it
    Dishes.find({}).populate('comments.postedBy').exec(function(err, dishes){
          if(err) throw err;
          res.json(dishes);
        });
})
.post(function(req, res, next){
    Dishes.create(req.body, function(err, dish){
      if(err) throw err;

      console.log("Dish created!");
      var id = dish._id;
      var dishName = dish.name;
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Added dish: "' + dishName + ' with id: ' + id);
    });
})
.delete(Verify.verifyAdmin, function(req, res, next){
    Dishes.remove({}, function(err, resp){
      if(err) throw err;
      res.json(resp);
    });
});

//Express router for dishId in URI
dishRouter.route('/:dishId')
.get(Verify.verifyOrdinaryUser, function(req, res, next){
    // Dishes.findById(req.params.dishId, function(err, dish){
    //   if(err) throw err;
    //   res.json(dish);
    // });

    //Retrieve dish by id, populate the dish
    //comments.postedBy and execute it
    Dishes.findById(req.params.dishId)
    .populate('comments.postedBy')
    .exec(function(err, dish){
          if(err) throw err;
          res.json(dish);
        });
})
.put(Verify.verifyOrdinaryUser, function(req, res, next){
    Dishes.findByIdAndUpdate(req.params.dishId,
      {
        $set: req.body //{'name' : 'Salty'}
      }, {
        new: true //Callback below will return updated, not old value
      }, function(err, dish){
        if(err) throw err;
        res.json(dish);
      });
})
.delete(Verify.verifyOrdinaryUser, function(req, res, next){
    Dishes.remove(req.params.dishId, function(err, resp){
      if(err) throw err;
      res.json(resp);
    });
});


//Router for dishid/comments
dishRouter.route('/:dishId/comments')
.all(Verify.verifyOrdinaryUser)
.get(function(req, res, next){
    // Dishes.findById(req.params.dishId, function(err, dish){
    //   if(err) throw err;
    //   res.json(dish.comments);
    // });

    //Retrieve dishes, populate the dishes' comments.postedBy and execute it
    Dishes.findById(req.params.dishId)
    .populate('comments.postedBy')
    .exec(function(err, dish){
          if(err) throw err;
          res.json(dish.comments);
        });
})
.post(function(req, res, next){
    Dishes.findById(req.params.dishId, function(err, dish){
      if(err) throw err;

      //Records userid
      //Sets posted by userid to the userid
      //decoded added from verify jwt
      req.body.postedBy = req.decoded._doc._id;
      dish.comments.push(req.body);

      dish.save(function(err, dish){
        if(err) throw err;
        console.log("Updated comments");
        res.json(dish.comments);
      });
    });
})
.delete(Verify.verifyAdmin, function(req, res, next){
  //Goal = remove all comments of a dish
  Dishes.findById(req.params.dishId, function(err, dish){
    if(err) throw err;
      console.log("CLength: ", dish.comments.length);

      // for(var i = (dish.comments.length - 1); i > 0; i--){
      //   dish.comments.id(dish.comments[i]._id).remove();
      //   //console.log("Removed: ", dish.comments.id(dish.comments[i]._id));
      // }

      for(var i = 0; i<dish.comments.length; i++){
        dish.comments.id(dish.comments[i]._id).remove();
      }

    dish.save(function(err, result){
      if(err) throw err;

      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Deleted all comments!');
    });
  });
});


//Router for dishid/comments/commentid
dishRouter.route('/:dishId/comments/:commentId')
.all(Verify.verifyOrdinaryUser)
.get(function(req, res, next){
    // Dishes.findById(req.params.dishId, function(err, dish){
    //   if(err) throw err;
    //
    //   res.json(dish.comments.id(req.params.commentId));
    // });

    //Retrieve dishes, populate the dishes'
    //comments.postedBy and execute it
    Dishes.findById(req.params.dishId)
    .populate('comments.postedBy')
    .exec(function(err, dish){
          if(err) throw err;
          res.json(dish.comments.id(req.params.commentId));
        });


})
.put(function(req, res, next){
    Dishes.findById(req.params.dishId, function(err, dish){
      if(err) throw err;

      dish.comments.id(req.params.commentId).remove();

      //Records userid
      //Sets posted by userid to the userid
      //decoded added from verify jwt
      req.body.postedBy = req.decoded._doc._id;

      dish.comments.push(req.body);

      dish.save(function(err, dish){
        if(err) throw err;
        console.log("Updated comments!");
        console.log(dish);
        res.json(dish);
      });
    });
})
.delete(function(req, res, next){

    Dishes.findById(req.params.dishId, function(err, dish){
      if(dish.comments.id(req.params.commentId).postedBy
        != req.decoded._doc._id) {
          var err = new Error('You are not authorized to perform this operation');
          err.status(403);
          return next(err);
      }

      dish.comments.id(req.params.commentId).remove();

      dish.save(function(err, resp){
        if(err) throw err;
        res.json(resp);
      });
    });
});

module.exports = dishRouter;
