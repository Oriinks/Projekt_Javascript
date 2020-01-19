//Sklep komputerowy
const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//Tworzenie elementów w bazie
const ProductRoutes = require('./api/routes/products');
const CustomerRoutes = require('./api/routes/customers');
const OrderRoutes = require('./api/routes/orders');
const HistoryRoutes = require('./api/routes/histories');
const UserRoutes = require('./api/routes/user');



/////////////////////////////////////////////////////////////////
mongoose.connect("mongodb+srv://javasc:"+ process.env.MONGO_ATLAS_PW +"@projekt-hlyht.gcp.mongodb.net/test?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true });
app.use("/uploads", express.static("uploads"));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Mehtods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/products', ProductRoutes);
app.use('/orders', OrderRoutes);
app.use('/user', UserRoutes);
app.use('/customers', CustomerRoutes);
app.use('/histories', HistoryRoutes);

// osbsługa nieznanego routu
app.use((req, res, next)=> {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});
app.use((error, req, res, next)=> {
    res.status(error.status || 500).json({error: error.message});
});

module.exports = app;
