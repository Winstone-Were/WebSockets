let socket = new WebSocket("ws://localhost:5000");
let ChatArea = $(".messages");
console.log(ChatArea);

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

    function login(){
        // Function called to login a user
        var name = $("#usr-name").val();
        var pwrd = $("#pwrd").val();
        send("log_in",{name,pwrd});
    };

    $(".log-in-button").click(login);
    $("#pwrd").on('change', login);

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
        var Text = $("textarea").val();
        $("textarea").val(""); // This clears the Textbox
        if(!Text) return; // Ensures the user can't send empty messages

        let message = { name: Message_Name, group :Message_Group,Text };
        send("message", message);
        addMessage("ME", Text);
    });

    
    socket.onopen = ()=>{
        console.log("connection to server succeded");
    };

    function sendMessage(Text){
        console.log(Text);
        var MessageObj = {Text,Message_Name, group:Message_Group};
        send("message",MessageObj);
    };

    socket.onmessage = HandleMessageEvent;

    function send(type,data){
        let TempObj = {type};
        for(const [key,value] of Object.entries(data)){
            TempObj[key] = value;
        }
        socket.send(JSON.stringify(TempObj));
    };

    function addMessage(sender, content) {
        let container = document.createElement("div");
        container.classList.add("message");

        let senderElem = document.createElement("p");
        senderElem.textContent = sender + ": ";
        senderElem.className = "sender";
        if(sender == "ME") senderElem.classList.add("me");
        container.append(senderElem);
        let contentElem = document.createElement("p");
        contentElem.textContent = content;
        contentElem.className = "content";
        container.append(contentElem);

        ChatArea.append(container);
    }

    function HandleMessageEvent(evt){
        let msgobj = JSON.parse(evt.data);
        let CrudeMessage = msgobj;
        switch (CrudeMessage.type) {
            case "user-added":
                alert(`${CrudeMessage.name} has joined the room`);
                break;
            case "message":
                console.log(`Received a message: "${CrudeMessage.Text}" from @${CrudeMessage.name}`);
                addMessage(CrudeMessage.name, CrudeMessage.Text);
                break;
            case "acknowledge-connect":
                let name = CrudeMessage.name;
                let group = CrudeMessage.Group;

                alert(`You've joined ${group} as ${name}`);

                Message_Name = name;
                Message_Group = group;
                break;
            case "err":
                alert(CrudeMessage.err);
                break;
            case "login-accept":
                var usr_groups = CrudeMessage.data.groups;
                Message_Name = CrudeMessage.data.name;
                send("get_groups",{name:Message_Name});
                $(".log-in").fadeOut();
                $("#app").fadeIn();
                break;
            case "recomend-sign_up":
                alert("NO SUCH ACCOUNT FOUND, SIGNUP");
                $(".log-in").fadeOut();
                $(".sign-up").fadeIn();
                break;
            case "sign-up":
                let usr_data = CrudeMessage.data
                Message_Name = usr_data.name;
                send("get_groups",{name:Message_Name});
                break;
            case "active-groups":
                console.log(CrudeMessage.groups);
                create_groupButtons(CrudeMessage.groups);
                break;
            default:
                console.log(`Anonymous type message received: ${CrudeMessage.type}`)
        }
    };
    
    function create_groupButtons(obj){
        for(let name of obj){
            var btn = document.createElement("button");
            btn.classList.add("group");
            btn.innerText = String(name);
            btn.addEventListener("click",()=>{
                setActiveGroup(name);
            })
            //var btn = $('<button class="grp_button"></button>').text(String(name));
            $(".groups").append(btn);
        }
    }

    function setActiveGroup(name) { 
        Message_Group = name;
        $("#send_message").removeAttr("disabled");
        send("first-connect",{name:Message_Name,group:Message_Group});
     }