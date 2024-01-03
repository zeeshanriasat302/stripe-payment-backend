const cors = require("cors");
const express = require("express");
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require("uuid");

const app = express();

//middleware
app.use(express.json());
app.use(cors());

//route
app.get("/", (req, res) => {
  res.send("it works on my web");
});

app.post("/payment", (req, res) => {
  const { product, token } = req.body;

  console.log("Product: ", product);
  console.log("Price: ", product.price);

  const idempotencyKey = uuidv4();

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: `purchase of ${product.name}}`,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempotencyKey }
      );
    })
    .then((result) => res.status(200).json(result));
});
//server
app.listen(5000, () => {
  console.log("server is listening at port 5000");
});
