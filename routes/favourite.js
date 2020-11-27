const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favourites = require('../models/favourite');


const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());


favouriteRouter.route('/')
//sending the preflight request
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200);})
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favourites.find({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favourites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourites);
    })
    .catch((err) => {
        next(err);
    })
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favourites.findOne({user:req.user._id})
    .then((favourites) => {
        console.log(favourites)
        if(favourites != null){
            if(favourites.dishes == []){
                favourites.dishes.push(req.body);
                favourites.save()
                .then((favourites) => {
                    Favourites.findById(favourites._id)
                    .populate('favourites.user')
                    .populate('favouties.dishes')
                    .then((favourites) => {
                        res.statusCode  = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourites);
                    })
                })
                .catch((err) => next(err))
            } else {
                for(var i = 0; i < req.body.length ; i++ ){
                    favourites.dishes.push(req.body[i]._id)
                }
                favourites.save()
                .then((favourites) => {
                    Favourites.findById(favourites._id)
                    .populate('favourites.user')
                    .populate('favouties.dishes')
                    .then((favourites) => {
                        res.statusCode  = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourites);
                    })
                })
            }
        } else {
            Favourites.create({user: req.user._id, dishes:req.body})
            .then((favourites) => {
                console.log('Favourites Added', favourites);
                res.statusCode  = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourites);
            }, (err) => next(err))
            .catch((err) => next(err))
        }
    })
})
.put( cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;
    res.end('PUT option not supported on /favourites');
})
.delete( cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    Favourites.findOneAndRemove({user: req.user._id})
    .then((resp) => {
        res.statusCode  = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    })
    .catch((err) => next(err));
});



favouriteRouter.route('/:dishId')
//sending the preflight request
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200);})
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET option not supported on /favourites/:dishId')
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favourites.findOne({user: req.user._id})
    .then((favourites) => {
        if(favourites.dishes.indexOf(req.params.dishId) == -1){
            favourites.dishes.push(req.params.dishId)
            favourites.save()
            .then((favourites) => {
                Favourites.findById(favourites._id)
                .populate('favourites.user')
                .populate('favouties.dishes')
                .then((favourites) => {
                    res.statusCode  = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourites);
                })
            })
        } else {
            res.statusCode  = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favourites);
        }
    })
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;
    res.end('PUT option not supported on /favourites/dishId');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    Favourites.findOne({user: req.user._id})
    .then((favourites) => {
        if(favourites.dishes.indexOf(req.params.dishId) != -1){
            favourites.dishes.remove(req.params.dishId)
            favourites.save()
            .then((favourites) =>{
                res.statusCode  = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourites);
            }, (err) => next(err))
        } else {
            res.statusCode  = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favourites);
        }
    })
});



module.exports = favouriteRouter;