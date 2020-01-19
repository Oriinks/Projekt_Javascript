const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const History = require('../models/history');
const Order = require('../models/order');


router.get('/', checkAuth, (req, res, next)=>{
    History.find()
    .select('product customer dateOrder prize _id')
    .populate('product', 'name model')
    .populate('customer', 'name surname email')
    .exec()
    .then(docs =>{
        const response = {
            count: docs.length,
            history: docs.map(doc =>{
                return{
                product: doc.product,
                customer: doc.customer,
                    dateOrder: doc.dateOrder,
                    prize: doc.prize,
                    _id: doc._id,
                    url:{
                        request:{
                            type:'GET',
                            url: 'http://localhost:3000/histories/'+doc._id
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


router.get('/:historyId', checkAuth, (req,res,next)=>{
    History.findById(req.params.historyId)
    .select('product name model _id')
    .populate('product', 'name model')
    .select('customer name surname email')
    .populate('customer', 'name surname email')
    .select('history dateOrder prize')
    .populate('history', 'dateOrder prize')
    .exec()
    .then(order=>{
        if(!order){
            return res.status(404).json({message: 'Zamówienie nie istnieje'});
        }
        res.status(200).json({
            order: order,
            request:{
                type: 'GET',
                url: 'http://localhost:3000/histories/'
            }              
        });
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
});

router.delete('/r/:orderId', checkAuth, (req,res,next)=>{
    Order.findById({_id: req.params.orderId})
    .exec()
    .then(result=>{
        if(!result){
            return res.status(404).json({
                message: 'Zamówienie nie istnieje'
            });
        }

        const history = new History({
            _id: mongoose.Types.ObjectId(),
            product: result.product,
            customer: result.customer,
            dateOrder: result.date,
            prize: result.prize
        });
        history.save();
        Order.remove({_id: req.params.orderId})
        .exec()
        .then(result=>{
            res.status(200).json({
                message: 'Dokonano zwrotu zamówienia',
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

router.delete('/:historyId', checkAuth, (req,res,next)=>{
    History.findById({_id: req.params.historyId})
    .exec()
    .then(result=>{
        if(!result){
            return res.status(404).json({
                message: 'Nie ma takiego zamówienia w historii'
            });
        }
        History.remove({_id: req.params.historyId})
        .exec()
        .then(result=>{
            res.status(200).json({
                message: 'Usunięto zamówienie z historii zamówień',
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