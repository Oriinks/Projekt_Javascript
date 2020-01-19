const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Order = require('../models/order');
const Product = require('../models/product');
const Customer = require('../models/customer');


router.get('/', checkAuth, (req,res,next)=>{
    Order.find()
    .select('product customer date prize _id')
    .populate('product', 'name model')
    .populate('customer','name surname email')
    .exec()
    .then(docs =>{
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc=>{
                return{
                    _id: doc._id,
                    product: doc.product,
                    customer: doc.customer,
                    date: doc.date,
                    prize: doc.prize,
                    request:{
                        type:'GET',
                        url: 'http://localhost:3000/orders/' + doc._id
                    }
                }
            }),
            
        });
    })
    .catch(err =>{
        res.status(500).json(err);
    });
});

router.get('/:orderId', checkAuth, (req,res,next)=>{
    Order.findById(req.params.orderId)
    .select('product name model _id')
    .populate('product', 'name model')
    .select('customer name surname email')
    .populate('customer', 'name surname email')
    .exec()
    .then(order=>{
        if(!order){
            return res.status(404).json({message: 'Nie ma takiego zakupu'});
        }
        res.status(200).json({
            order: order,
            request:{
                type: 'GET',
                url: 'http://localhost:3000/orders/'
            }              
        });
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', checkAuth, (req,res,next)=>{
    const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        product: req.body.product,
        customer: req.body.customer,
        date: req.body.date,
        prize: req.body.prize
    });
    Customer.findById(req.body.customer).exec()
    .then(customer=>{
        if(!customer){
            return res.status(404).json({
                message: 'Klient nie został znaleziony'
            });
        }
        Product.findById(req.body.product)
            .then(product =>{
            if(!product){
                return res.status(404).json({
                    message: 'Nie znalezniono takiego produktu'
                });
            }
            Order.find({product: req.body.product}).exec()
            .then(exists=>{
                if(exists.length>=1){
                    return res.status(409).json({
                        message: 'Zamówienie jest zrealizowane'
                    });
                }
                order.save()
                .then(result =>{
                    console.log(result);
                    res.status(201).json({
                        message: 'Zamówienie przekazane do realizacji',
                        createdOrder:{
                            _id: result._id,
                            product: result.product,
                            customer: result.customer,
                            date: result.date,
                            prize: result.prize
                            },
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/orders/' + result._id
                            }
                        });
                    });   
                })
            })
        })
        .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});  



router.delete('/:orderId', checkAuth, (req,res,next)=>{
    Order.findById({_id: req.params.orderId})
    .exec()
    .then(result=>{
        if(!result){
            return res.status(404).json({
                message: 'Nie znaleziono zamówienia'
            });
        }
        Order.remove({_id: req.params.orderId})
        .exec()
        .then(result=>{
            res.status(200).json({
                message: 'Zamówienie zostało anulowane',
                request:{
                    type:'POST',
                    url: 'http://localhost:3000/orders/',
                    body: {productId: "ID", date: 'Date'}
                }
            })
        })
    })
    .catch(err=>{
        res.status(err).json({
            error: err
        });
    });
});



module.exports = router;