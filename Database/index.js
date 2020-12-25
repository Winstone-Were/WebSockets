const { reject } = 
("async");
const fs = require("fs");
const { resolve } = require("path");

class DataBase {
    constructor(){
        fs.readFile('./Database/database.json',(err,data)=>{
            if(err) return err;
            else return(JSON.parse(data));
        })
    }

    initiateDB(){
        var prm = new Promise((resolve,reject)=>{
            fs.readFile('./Database/database.json',(err,data)=>{
                if(err) reject(err);
                else resolve(data);
            })
        })
        return prm;
    }

    check(obj){
        var prm = new Promise((resolve,reject)=>{
           let id = obj.id;
           let temp = [];
           this.initiateDB().then(data=>{
               for(let datum of JSON.parse(data)){
                   temp.push(datum.id);
               } if(temp.includes(id)){
                   reject('Similar IDs');
               }else(resolve(obj));
           })
        });
        return prm;
    }

    addUser(obj){
        
        var prm = new Promise((resolve,reject)=>{
            this.initiateDB().catch(err=> reject(err))
                             .then(data=>{
                                if(JSON.parse(data).length == 0){
                                    resolve(obj);
                                }else {
                                    this.check(obj).catch(err=>reject(err))
                                                .then(data=>resolve(data));
                                }
                             })
        })
        return prm;
    }

    writeToDb(obj){
        this.initiateDB().catch(err=>console.log(err))
            .then(data=>{
                var tmp = [];
                tmp = JSON.parse(data);
                tmp.push(obj);
                fs.writeFile('./Database/database.json',JSON.stringify(tmp),(err)=>{
                    if(err) console.log(err);
                    else console.log("success");
                })
            })
    }

    getUser(username){
        var prm = new Promise((resolve,reject)=>{
            let temp = [];
            let ids = [];
            this.initiateDB().then(data=>{
                for(let datum of JSON.parse(data)){
                    temp.push(datum);
                };

                for(let dat of JSON.parse(data)){
                    ids.push(dat.id);
                }

                for(let user of temp){
                    let id = user.id;

                    while(id == username){
                        resolve(user);
                        break;
                    }
                }

                if(!ids.includes(username)){
                    reject("No such user");
                }

            });
        });
        return prm;
    }

    deleteUser(username){
        var prm = new Promise((resolve,reject)=>{
            let Temp = [];
            let indx;
            let Temp_Two = [];
            this.initiateDB().catch(err => reject(err))
                .then(data=> Temp = JSON.parse(data));
            this.getUser(username).then(data=>{
                for(let usr of Temp){
                    if(usr.id == username){
                        indx = Temp.indexOf(usr);
                    }
                }
                Temp[indx] = false;
                for(let usr of Temp){
                    if(usr != false){
                        Temp_Two.push(usr);
                    }
                };
                resolve(Temp_Two);
            });
        });
        return prm;
    }
    writeArrayToDb(arr){
        fs.writeFile('./Database/database.json',JSON.stringify(arr),(err)=>{
            if(err) console.log(err);
            else console.log("success");
        })
    }
    makeEntry(value,type,userID){
        let prm = new Promise((resolve,reject)=>{
            let Temp = [];
            this.initiateDB().then(data=>{
                let TempVal;
                Temp = JSON.parse(data);
                
                for(let usr of Temp){
                    if(usr.id == userID){
                        if(type == Array) TempVal = [];
                        if(type == String) TempVal = "";
                        if(type == Number) TempVal = 0;
                        usr[value] = TempVal;
                        resolve(Temp);
                    }else{
                        reject("User ID ERR");
                    }
                }

            });
        });
        return prm;
    };
}

const ChatDataBase = new DataBase();

module.exports = ChatDataBase;