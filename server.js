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

    switch (MessageType) {
        case "first-connect":
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
            });
            break;
        case "message":
            let Text = ReceivedMessage.Text;
            console.log(ReceivedMessage);
            groupSend(Group,TempObj,{type:"message",name:SenderName, Text});
            break;
        case "make_group":
            let name = ReceivedMessage.group_name;
            ActiveGroupMembers[name] = [];
            ActiveGroupMembers[name].push(TempObj);
            console.log(ActiveGroupMembers);    
            break;
        case "log_in":
            var password = ReceivedMessage.pwrd;
            DataBase.getUser(SenderName).then(data=>{
                if(data.password == password){
                    ws.send(JSON.stringify({type:"login-accept",data}));
                    add_to_Groups(SenderName,TempObj);
                }else{
                    ws.send(JSON.stringify({type:"err",err:"wrong-password"}))
                }
            }).catch(err=> ws.send(JSON.stringify({type:"recomend-sign_up",err})));    
            break;
        case "sign-up":
            var password = ReceivedMessage.pwrd;
            console.log(password);
            var id = ReceivedMessage.id;
            var receiverName = ReceivedMessage.name;
            let usr_obj = {receiverName,password,id,groups:[]};
            DataBase.addUser(usr_obj).then(data=>{
                DataBase.writeToDb(data).then(()=>{
                    ws.send(JSON.stringify({type:"sign-up",data}));
                });
            }).catch(err=> ws.send(JSON.stringify({type:"err", err})));
            break;
        case "get_groups":
            console.log(ReceivedMessage);
            ws.send(JSON.stringify({type:"active-groups",groups:Object.keys(ActiveGroupMembers)}));
            break;
        default:
            break;
    };
}

function groupSend(group,initiator,data){
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
    var prm = new Promise((resolve, _)=>{
        var array = ActiveGroupMembers[groupName];
        console.log(array);
        resolve(array);
    });
    return prm;
}

server.listen('5000',()=>{ console.log('Listening on port 5000') });


function add_to_Groups(usr_nm,usr_obj){
    DataBase.getUser(usr_nm).then(data=>{
        var arr = data.groups;
        for(var group of arr){
            ActiveGroupMembers[group].push(usr_obj);
        }
    });
};