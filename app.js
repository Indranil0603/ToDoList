//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set("strictQuery",false);
mongoose.connect("mongodb+srv://admin-indranil:Test123@cluster0.iddbafo.mongodb.net/toDoListDB",{ useNewUrlParser: true }, function (err) { 
    if (err) throw err;  });

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

// const day = date.getDate();
  Item.find({},function(err, foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Successfully saved default items to DB.");
          }
        })
        res.redirect("/");
    }
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  });

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName == "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name: listName },function(err ,foundList){
      if(!err){
        if(foundList){
          
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+listName);
        }
      }
    });
  }
  
});

app.post("/delete",function(req, res){
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Today"){

    Item.findByIdAndRemove(id, function(err){
      if(!err){
        console.log("We deleted the item ");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull :{items:{_id: id}}},function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
  
  
  
})

app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
         res.render("list",{listTitle: foundList.name, newListItems: foundList.items});

       }
      }
   });
  

  
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
