const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Product = require('../models/product');

router.get('/', (req, res, next)=>{
    Product.find()
    .select('name model _id')
    .exec()
    .then(docs =>{
        const response = {
            count: docs.length,
            products: docs.map(doc =>{
                return{
                    name: doc.name,
                    model: doc.model,
                    _id: doc._id,
                    url:{
                        request:{
                            type:'GET',
                            url: 'http://localhost:3000/products/'+doc._id
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
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        model: req.body.model
    });
    product.save()
    .then(result=>{
        console.log(result);
        res.status(201).json({
            message: "Utworzono Nowy Produkt",
            createdProduct: {
                name: result.name,
                model: result.model,
                _id: result._id,
                request:{
                    type:'GET',
                    url: 'http://localhost:3000/products/'+result._id
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
});
router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .exec()
    .then(doc =>{
        console.log("From database", doc);
        if(doc){
            res.status(200).json({
                product: doc,
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/products/'
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
router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id: id}, {$set: updateOps}).exec()
    .then(result =>{
        res.status(200).json({
            message: 'Zaktualizowano produkt',
            request:{
                type: 'GET',
                url: 'http://localhost:3000/products/' + id
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

router.delete('/:productId',  checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id}).exec()
    .then(result =>{
        res.status(200).json({
            message:'Usunięto produkt',
            request:{
                type: 'POST',
                url: 'http://localhost:3000/products/',
                body: {name: 'String', model:'String'}
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