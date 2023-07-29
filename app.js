//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("loadsh");



const app = express();


const http = require("http").Server(app);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000
};

mongoose.connect("mongodb+srv://durjoy10:test123@todolist.34mjyoi.mongodb.net/todolistDB", mongooseOptions);



// mongoose.connect("mongodb+srv://durjoy:todolist@todolist.34mjyoi.mongodb.net/?retryWrites=true&w=majority/todolistDB", {useNewUrlParser: true});


const itemsSchema= {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to Your todolist"

});

const item2 =new Item({
  name: "Hit the + button to add a new item"

});

const item3 =new Item({
  name: "<-- Hit this to delete an item"

});


const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {



  Item.find({}).then(function(foundItems){

    if (foundItems.length === 0){

      Item.insertMany(defaultItems).then(function(){
        console.log("successfully saved to DB");
      }).catch(function(err){
        console.log(err);
        
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then((foundList) => {
    if(!foundList){
      const list = new List ({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/" + customListName);
    }  else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

    }
  }).then(() => {
 
  }).catch(function(err){

    console.log("Error", err);
  });

});




app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}).then(function( foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  
});


app.post("/delete", async function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  try {
    if (listName === "Today") {
      await Item.findByIdAndRemove(checkedItemId);
      console.log("Removed");
      res.redirect("/");
    } else {
      await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } });
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.error("Error:", err);
    // Handle the error here and send an appropriate response to the client
  }
});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started successfully");
});





