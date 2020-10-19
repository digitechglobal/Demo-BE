require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./api/users/user.router");

const cors = require('cors'); //support lỗi N'Access Control Allow Origin'
app.use(cors());//support lỗi N'Access Control Allow Origin'
//app.use("/api/users", cors(), userRouter);//support lỗi N'Access Control Allow Origin'

app.use(express.json());

app.use("/api/users", userRouter);

//swagger
app.use(express.static('public/dist'));
app.get('/', (req, res) => {
  res.sendFile('/index.html');
})//

app.listen(process.env.APP_PORT, () => {
    console.log(`Example app listening at http://localhost:${process.env.APP_PORT}`);
  })
