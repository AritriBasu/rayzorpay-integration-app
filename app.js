const express=require('express');
const app=express();
const path=require('path');
const bodyParser = require('body-parser');
const Razorpay=require('razorpay');
const exphbs=require('express-handlebars');

require('dotenv').config()

app.use(express.static('public'));

//view engine setup
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended:true
}));
 
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
 });

app.get('/',function(req,res){
  res.render('index',{layout:'main-template'});
});

app.post('/donate', async (req, res) => {
  let options = {
      amount: 500*100,
      currency: 'INR',
      //receipt: shortid.generate(), //any unique id
      //payment_capture = 1 //optional
  }
  try {
      const response = await razorpay.orders.create(options)
      res.json({
          order_id: response.id,
          currency: response.currency,
          amount: response.amount
      })
  } catch (error) {
      console.log(error);
      res.status(400).send('Unable to create order');
  }
});

app.post('/payment-process',(req,res)=>{
  razorpay.payments.fetch(req.body.razorpay_payment_id).then((paymentDetails)=>{
    console.log(paymentDetails);
    if(paymentDetails.status=='authorized' || paymentDetails.status=='captured'){
    res.send("hello!");
   }
    else{
      res.send('oh no!');
    }
  });
});

app.listen(8080, () => console.log(`Server Started on ${process.env.PORT}`));