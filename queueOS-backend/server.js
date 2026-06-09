require("dotenv").config();
const app=require("./src/app");
const DBconnect=require("./src/config/db")
const port=process.env.port;

DBconnect().then(()=>
{
    app.listen(port,()=>
    {
        console.log(`SERVER running on ${port}`);
    });

});