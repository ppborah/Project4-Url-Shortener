const express = require("express");
const bodyParser = require("body-parser");
const route = require("./routes/route");
const mongoose = require("mongoose");
const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose
  .connect(
    "mongodb+srv://Group94:YPJkeO76Lrtdsedp@cluster0.m4zcz.mongodb.net/group94Database?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then((result) => console.log("MongoDb is connected / Group94Database"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
