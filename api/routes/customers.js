const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Customer = require('../models/customer');

router.get('/', checkAuth, (req, res, next)=>{
    Customer.find()
    .select('name surname email _id')
    .exec()
    .then(docs =>{
        const response = {
            count: docs.length,
            customers: docs.map(doc =>{
                return{
                    name: doc.name,
                    surname: doc.surname,
                    email: doc.email,
                    _id: doc._id,
                    url:{
                        request:{
                            type:'GET',
                            url: 'http://localhost:3000/customers/'+doc._id
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

router.post('/', checkAuth, (req, res, next)=>{
    const customer = new Customer({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email
    });
    Customer.find({email: req.body.email}).exec()
    .then(exists=>{
        if(exists.length>=1){
            return res.status(409).json({
                message: 'E-mail już istnieje'
            });
        }
        customer.save()
            .then(result=>{
                console.log(result);
                res.status(201).json({
                    message: "Utworzono nowego klienta",
                    createdCustomer: {
                        name: result.name,
                        surname: result.surname,
                        email: result.email,
                        _id: result._id,
                        request:{
                            type:'GET',
                            url: 'http://localhost:3000/customers/'+result._id
                        }
                    }
                });
            })    
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
        })
    });
router.get('/:customerId', checkAuth, (req, res, next) => {
    const id = req.params.customerId;
    Customer.findById(id)
    .exec()
    .then(doc =>{
        console.log("From database", doc);
        if(doc){
            res.status(200).json({
                customer: doc,
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/customers/'
                }
            });
        }else {
            res.status(404).json({message: 'Nie ma takiego numeru ID'});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.patch('/:customerId', checkAuth, (req, res, next) => {
    const id = req.params.customerId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Customer.update({_id: id}, {$set: updateOps}).exec()
    .then(result =>{
        res.status(200).json({
            message: 'Zaktualizowano klienta',
            request:{
                type: 'GET',
                url: 'http://localhost:3000/customers/' + id
            }
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.delete('/:customerId',  checkAuth, (req, res, next) => {
    const id = req.params.customerId;
    Customer.remove({_id: id}).exec()
    .then(result =>{
        res.status(200).json({
            message:'Usunięto klienta',
            request:{
                type: 'POST',
                url: 'http://localhost:3000/customers/',
                body: {name: 'String', surname:'String', email: 'String'}
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});


module.exports = router;