
let socket = new WebSocket("ws://localhost:5000");

$(document).ready(function(){
    $("#app").fadeOut();
    $(".log-in").fadeIn();
})
        let Message_Name;
        let Message_Group;  

    $("#send_new_group").click(()=>{
        var group_name = $("#group_name").val();
        var name = $("#initiator_name").val();
        send("make_group",{ group_name, name });
    });

    $("#join_group").click(function(){
        var group_name = $("#join_group_name").val();
        var user_name = $("#user_name").val();
        send("first-connect",{name:user_name, group:group_name});
        console.log('workin');
    });

    $(".log-in-button").click(function(){
        var name = $("#usr-name").val();
        var pwrd = $("#pwrd").val();
        send("log_in",{name,pwrd});
    });

    $("#to_sign-in").click(function (e) { 
        $(".log-in").fadeOut();
        $(".sign-up").fadeIn();    
    });

    $("#to_log-in").click(function () { 
        $(".sign-up").fadeOut();
        $(".log-in").fadeIn(); 
    });

    $(".sign-up-button").click(function (e) { 
        var name = $("#up-usr-name").val();
        var pwrd = $("#up-pwrd").val();
        var id = $("#usr-id").val();
        send("sign-up",{name,pwrd,id,groups:[]});
    });

    $("#send_message").click(function(){

    });

    
    socket.onopen = ()=>{
        JoinButton.addEventListener("click",()=>{
        let TempObj = {name:Name.value,group:Group.value};
        send("first-connect",TempObj);
        });
        SendButton.addEventListener("click",()=>{
            sendMessage(MessageText.value);
        });
    }

    function sendMessage(Text){
        console.log(Text);
        var MessageObj = {Text,Message_Name, group:Message_Group};
        send("message",MessageObj);
    }

    socket.onmessage = (ev)=>{
        HandleMessage(JSON.parse(ev.data));
    }

    function writeMessage(text){
        var MessageHolder = document.createElement("p");
        MessageHolder.innerHTML = text;
        ChatArea.appendChild(MessageHolder);
    }

    function send(type,data){
        let TempObj = {type};
        for(const [key,value] of Object.entries(data)){
            TempObj[key] = value;
        }
        socket.send(JSON.stringify(TempObj));
    }



    function HandleMessage(msgobj){
        let CrudeMessage = msgobj;
        if(CrudeMessage.type == "user-added"){
            alert(`${CrudeMessage.name} has joined the room`);
            
        }
        if(CrudeMessage.type == "message"){
            console.log(CrudeMessage);
        writeMessage(CrudeMessage.Text);
        }
        if(CrudeMessage.type == "acknowledge-connect"){
            let name = CrudeMessage.name;
            let group = CrudeMessage.Group;

            alert(`You've joined ${group} as ${name}`);

            Message_Name = name;
            Message_Group = group;
        }
        if(CrudeMessage.type == "err"){
            alert(CrudeMessage.err);
        }
        if(CrudeMessage.type == "login-accept"){
            var usr_groups = CrudeMessage.data.groups;
            Message_Name = CrudeMessage.data.name;
            send("get_groups",{name:Message_Name});
            $(".log-in").fadeOut();
            $("#app").fadeIn();
        }
        if(CrudeMessage.type == "recomend-sign_up"){
            alert("NO SUCH ACCOUNT FOUND, SIGNUP");
            $(".log-in").fadeOut();
            $(".sign-up").fadeIn();
        }
        if(CrudeMessage.type == "sign-up"){
            let usr_data = CrudeMessage.data
            Message_Name = usr_data.name;
            send("get_groups",{name:Message_Name});
        }
        if(CrudeMessage.type == "active-groups"){
            create_groupButtons(CrudeMessage.ActiveGroupMembers);
        }
    }


    function create_groupButtons(obj){
        for(let [key,value] in obj){
            var btn = $('<button class="grp_button"></button>').text(String(key));
            $(".groups").append(btn);
        }
    }