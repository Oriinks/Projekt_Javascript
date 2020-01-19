const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

const User = require('../models/user');

router.get('/', checkAuth, (req, res, next)=>{
    User.find()
    .select('email _id')
    .exec()
    .then(docs =>{
        const response = {
            count: docs.length,
            users: docs.map(doc =>{
                return{
                    email: doc.email,
                    _id: doc._id,
                    url:{
                        request:{
                            type:'DELETE',
                            url: 'http://localhost:3000/user/'+doc._id
                        }
                    }
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

router.post('/signup', (req, res, next)=>{
    User.find({email: req.body.email}).exec()
    .then(user=>{
        if(user.length>=1){
            return res.status(409).json({
                message: 'E-mail już istnieje'
            });
        } else{
            bcrypt.hash(req.body.password, 10, (err, hash)=>{
                if(err){
                    return res.status(500).json({
                        error: err
                    });
                }else{
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    user.save()
                    .then(result=>{
                        console.log(result);
                        res.status(201).json({
                            message: 'Utworzono użytkownika',
                            request:{
                                type:'POST',
                                url: 'http://localhost:3000/user/login',
                                body: {email: "email", password:"password"}
                            }
                        });
                    })
                    .catch(err=>{
                        console.log(err),
                        res.status(500).json({
                            error:err
                        });
                    });
                }
            })
        }
    })
});

router.post('/login', (req, res, next)=>{
    User.find({email: req.body.email}).exec()
    .then(user =>{
        if(user.length<1){
            return res.status(401).json({
                message: 'Autoryzacja: niepowodzenie'
            });
        } else{
            bcrypt.compare(req.body.password, user[0].password, (err, result)=>{
                if(err){
                    return res.status(401).json({
                        message: 'Autoryzacja: niepowodzenie'
                    })
                }
                if(result){
                    const token = jwt.sign({
                        email:user[0].email,
                        userId: user[0]._id
                    }, 
                    process.env.JWT_KEY, 
                    {
                        expiresIn: "10h"
                    });
                    return res.status(200).json({
                        message: 'Autoryzacja: powodzenie',
                        token: token
                    })
                }
                return res.status(401).json({
                    message: 'Autoryzacja: niepowodzenie'
                })
            });
        }
    })
    .catch(err=>{
        console.log(err),
        res.status(500).json({
            error:err
        });
    });
});

router.delete('/:userId',  checkAuth, (req, res, next)=>{
    User.remove({_id: req.params.userId}).exec()
    .then(result =>{
        res.status(200).json({
            message: 'Usunięto użytkownika'
        });
    })
    .catch(err=>{
        console.log(err),
        res.status(500).json({
            error:err
        });
    });
});

module.exports = router;