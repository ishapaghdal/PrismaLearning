import "dotenv/config";
import express from "express";

const app = express();
const PORT = process.env.PORT || 5000;

//middelware body parser
app.use(express.json()); // to accept the data in json format
app.use(express.urlencoded({extended: false})) // accept the url encoded data from the form 


app.get("/", (req, res) => {
  return res.send("Running");
});


app.listen(PORT, () => console.log(`server is running on ${PORT}`));
