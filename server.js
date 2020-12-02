const DataBase = require("./Database/index");
const bodyParser = require("body-parser");
const JWT = require("jsonwebtoken");
const express = require("express");

const WebSocket = require("ws");

const app = express();
const server = require('http').createServer(app);


app.use(bodyParser.urlencoded());
app.use(express.urlencoded({extended: false}));

let ActiveGroupMembers = {
    Plg:[],
    Amg:[]
}


var wss = new WebSocket.Server( {server} );

wss.on("connection",(ws)=>{
    ws.on("message",(data)=>{ 
        HandleMessage(data,ws);
     });
});


function HandleMessage(jsonObj,ws){
    let ReceivedMessage = JSON.parse(jsonObj);
    let MessageType = ReceivedMessage.type;
    let SenderName  = ReceivedMessage.name;
    let Group = ReceivedMessage.group;
    let TempObj =  { SenderName,ws };

    if(MessageType == "first-connect"){

        chechIfExists(TempObj,Group)
            .then(()=>{
                    ActiveGroupMembers[Group].push(TempObj);
                    ws.send(JSON.stringify({type:"acknowledge-connect", name:SenderName, Group}));
                    console.log(`${SenderName} connected`);
                    groupSend(Group,TempObj,{type:"user-added",name:SenderName, Group});
                    console.log(ActiveGroupMembers);
            })
            .catch((err)=>{
                ws.send(JSON.stringify({type:"reject-connect", err}));
            });;
    
    }

    if(MessageType == "message"){
        let Text = ReceivedMessage.Text;
        console.log(ReceivedMessage);
        groupSend(Group,TempObj,{type:"message",name:SenderName, Text});
    }

    if(MessageType == "make_group"){
        let name = ReceivedMessage.group_name;
        ActiveGroupMembers[name] = [];
        ActiveGroupMembers[name].push(TempObj);
        console.log(ActiveGroupMembers);
    }

    if(MessageType == "log_in"){
        var password = ReceivedMessage.pwrd;
        DataBase.getUser(SenderName).then(data=>{
            if(data.password == password){
                ws.send(JSON.stringify({type:"login-accept",data}));
            }else{
                ws.send(JSON.stringify({type:"err",err:"wrong-password"}))
            }
        }).catch(err=> ws.send(JSON.stringify({type:"recomend-sign_up",err})));
    }

    if(MessageType == "sign-up"){
        var password = ReceivedMessage.pwrd;
        console.log(password);
        var id = ReceivedMessage.id;
        var name = ReceivedMessage.name;
        let usr_obj = {name,password,id,groups:[]};
        DataBase.addUser(usr_obj).then(data=>{
            DataBase.writeToDb(data).then(()=>{
                ws.send(JSON.stringify({type:"sign-up",data}));
            });
        }).catch(err=> ws.send(JSON.stringify({type:"err", err})));
    }

    if(MessageType == "get_groups"){
        console.log(ReceivedMessage);
        ws.send(JSON.stringify({type:"active-groups",ActiveGroupMembers}));
    }
}

function groupSend(group,initiator,data){
    /*var workingGroup = ActiveGroupMembers[group];
    for(let socket of workingGroup){
        if( socket.ws != initiator.ws && socket.ws.readyState === WebSocket.OPEN){
            socket.ws.send(JSON.stringify(data));
        }
    }*/

    loadArrayUsers(group).then(arr=>{
        for(let user of arr){
            if( user.ws != initiator.ws && user.ws.readyState === WebSocket.OPEN ){
                user.ws.send(JSON.stringify(data));
            }
        }
    })

}

function chechIfExists(obj,group){
    var prm = new Promise((resolve,reject)=>{
        let name = obj.SenderName;
        returnNamesArray(group).then(arr=>{
            if(arr.includes(name)){
                reject("User Exists");
            }else{
                resolve("Safe");
            }
        })
    });
    return prm;
}

function returnNamesArray(group){
    var prm = new Promise((resolve,reject)=>{
        var array = [];
        for(var data of ActiveGroupMembers[group]){
            array.push(data.SenderName);
        }
        resolve(array);
    });
    return prm;
}

function loadArrayUsers(groupName){
    var prm = new Promise((resolve,reject)=>{
        var array = ActiveGroupMembers[groupName];
        resolve(array);
    });
    return prm;;
}

server.listen('5000',()=>{ console.log('Listening on port 5000') });


