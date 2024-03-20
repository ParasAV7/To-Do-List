const express = require("express");
const ejs = require("ejs")
const bodyParser = require("body-parser");
const today = require(__dirname+"/date.js");
const app = express();
const _ = require('lodash')
const mongoose = require("mongoose");

const mongoAtlasUrl = process.env.URL
mongoose.connect(mongoAtlasUrl);


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", 'ejs');

const taskSchema = new mongoose.Schema({
    Name:String,
    title:String,
    checked:Boolean
});

let topic = "";
const defaultItems = ["Welcome to our To-Do List","Press + to Add more","Select and Press X to delete the task"];
const Task = mongoose.model("Task",taskSchema);
const addItem = async (taskName,titleName) =>{
    try{
        let tmp = new Task({
            Name: taskName,
            title:titleName,
            checked:false
        })
        await tmp.save();
        console.log(tmp.Name+" Added to the "+ Task.title);        
    }
    catch(err){
        console.log(err);
    }
};
const findall = async(model,topic) => {
    try{
        let taskArr = await model.find({title:topic});
        return taskArr;
    }
    catch(err)
    {
        console.log(err);
    }
}
const updateCheck = async(model,checkedState,taskId) =>{
    await Task.updateOne({_id:taskId},{checked:checkedState});
}

const deleteItem = async(model,id) =>{
    try{
        await model.deleteOne({_id : id});
        console.log("Item deleted");

    }
    catch(err)
    {
        console.log(err);
    }
}
//Deleting default item 
const deleteDefault = async (model,name)=>{
    try{
        await model.deleteOne({Name:name});
    }
    catch(err){
        console.log(err);
    }
}


app.get("/", async function(request, respond){
    topic = 'Personal Note'
    let personalItems = await findall(Task,topic);
    if(personalItems.length == 0)
    {
        defaultItems.forEach(taskName => {
              addItem(taskName,topic);
        });
    }
    else{
            if(personalItems.length != 3){
        defaultItems.forEach(taskName => {
              deleteDefault(Task,taskName);
        });}
    }
    personalItems = await findall(Task,topic);
    respond.render("list",{topic:topic,newDay : today.getDate() , newItems : personalItems})
})

//Handling params
app.get("/:topicName",async (req,resp) => {
    let topicName = _.capitalize(req.params.topicName);
    let GeneralItems = await findall(Task,topicName);
    if(GeneralItems.length == 0)
    {
        defaultItems.forEach(taskName => {
              addItem(taskName,topicName);
        });
    }
    else{
            if(GeneralItems.length != 3){
        defaultItems.forEach(taskName => {
              deleteDefault(Task,taskName);
        });}
    }
    GeneralItems = await findall(Task,topicName);
    resp.render("list",{topic:topicName,newDay : today.getDate() , newItems : GeneralItems})
})



app.post("/insert",async function(req,resp){
    var taskName = req.body.task;
    let title = req.body.btn_add;

    await addItem(taskName,title);
    // console.log(req.originalUrl)
    resp.redirect("back");

    
});

//Handling chekbox
app.post("/check",async(req,resp)=>{
    try{
    let checkedState = req.body.checked;
    let taskId = req.body.taskId;
    console.log("Checkbox of "+taskId+" is updated to "+checkedState)
    await updateCheck(Task,checkedState,taskId);
    resp.redirect("back");
    }
    catch(err){
        console.log(err);
    }
    
})
//Deleting the posts:
app.post("/delete", async (req, resp) => {
    try {
        const deleteId = req.body.delete; // Make sure deleteId is 
        const task = await Task.findById(deleteId);

        if (task) {
            // Assuming task.checked is a boolean property
            if (task.checked) {
                await deleteItem(Task, deleteId);
                console.log("Item deleted successfully.");
                
            } 
            
        } 
                resp.redirect("back");
    } catch (err) {
        console.error("Error:", err);

    }
});
const port = process.env.PORT || 3000
app.listen(port,function(){
    console.log("Server is Running");
})
