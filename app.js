const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const { MongoClient, ServerApiVersion } = require('mongodb');
const _ = require('lodash');

mongoose.connect("mongodb+srv://adi:2001@cluster0.ozlgteg.mongodb.net/todolist?retryWrites=true&w=majority")

const todoSchema = {
    name: "String"
};

const Item = mongoose.model("Item", todoSchema);

const item1 = new Item({
    name: "Welcome to your todolist"
});

const item2 = new Item({
    name: "Click + to add items"
});

const item3 = new Item({
    name: "--> check the checkbox to delete"
});

var defaultitems = [item1, item2, item3];

const listSchema = {
    name: "String",
    litems: [todoSchema]
};

const List = mongoose.model("List", listSchema);


const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"))
app.set('view engine', 'ejs');
mongoose.set('strictQuery', true);



app.get("/", function(req, res){
    // const item = [];
    Item.find({}, function(err, results){
        if(results.length === 0){
            Item.insertMany(defaultitems, function(err){
                if(err)
                    console.log(err);
                else
                    console.log("Successfully inserted");
            });
            res.redirect("/");
        }
        else{
            res.render('list', {listTitle: "Today", newListItem: results});
        }
    })

})

app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today")
    {
        item.save();
        res.redirect("/");
    }
    else
    {
        List.findOne({name: listName}, function(err, foundlist){
            foundlist.litems.push(item);
            foundlist.save();
            res.redirect("/"+listName);
        })
    }

    

})

app.get("/:result", function(req, res){

    const listname = _.capitalize(req.params.result);

    List.findOne({name: listname}, function(err, foundlist){
        if(!err)
        {
            if(!foundlist)
            {
                const listitem = new List({
                    name: listname,
                    litems: defaultitems
                });
                listitem.save();
                res.redirect("/"+listname);
            }
            else
            {
                res.render('list', {listTitle: foundlist.name, newListItem: foundlist.litems});
                // res.redirect("/listname");
            }
        }
    });

    // res.render('list', {listTitle: "Work", newListItem: workList});
})

app.post("/delete", function(req, res){
    const delitem = req.body.checkbox;
    const lName = req.body.lName;
    // console.log(delitem);

    if(lName === "Today")
    {
        Item.deleteOne({_id: ""+delitem}, function(err){
            if(err)
            console.log(err);
            else
            res.redirect("/");
        });
    }
    else
    {
        List.findOneAndUpdate({name: lName}, {$pull: {litems: {_id: delitem}}}, function(err, foundlist){
            if(!err){
                res.redirect("/"+lName);
            }
        })
    }
    
})


app.listen(3000, function(){
    console.log("server started on port 3000");
})