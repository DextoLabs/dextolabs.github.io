var ref = new Firebase('https://dexto.firebaseio.com/');

var user = 'loggedOut'
var token = localStorage.getItem('dextoToken');
if(token == null){
  token = "No Token"
}

ref.authWithCustomToken(token, function(error, result) {
  if (error) {
    console.log("No pre-existing token found");
  } else {
    console.log("Pre-existing token found");
    user = result.uid;
    configureUserOnDashboard();
  }
});

function createUser(email, password){
    var newEmail = replacePeriods(email)
    ref.createUser({
        email    : email,
        password : password
    }, function(error, userData) {
        if (error) {
            console.error("Error creating user:", error);
        } else {
            console.log("Successfully created user account with uid:", userData.uid);
            login(email, password);
            ref.child('user').child(userData.uid).set({
                event:{
                    empty: "empty",
                },
                email: email,
            })
        }
    });
}


function replacePeriods(email){
    return email.replace(/\./g,'*')
}

function login(email, password){
    ref.authWithPassword({
        email    : email,
        password : password
    }, function authHandler(error, authData) {
        if (error) {
            console.error("Login Failed!", error);
            if(JSON.stringify(error).includes("EMAIL")){
                $(".email-group").addClass("has-error");
                $("#inputEmail").val("").focus();
                $(".login-btn").text("The specified email address is invalid");
                $(".password-group").removeClass("has-error");
            }else{
                $(".pass-group").addClass("has-error");
                $("#inputPassword").val("").focus();
                $(".login-btn").text("The specified password is incorrect");
                $(".email-group").removeClass("has-error");
            }
        } else {
            console.log("Authenticated successfully with payload:", authData);
            token = authData.token;
            localStorage.setItem('dextoToken', token);
            user = authData.uid;
        }
    });
}

function logout(){
    ref.unauth();
    localStorage.removeItem('dextoToken');
    user = 'loggedOut'
}

//checks any changes in user authentication
function checkAuthChanges(){
    ref.onAuth(function(){
        if(ref.getAuth() == null){
            if(window.location.href.includes("dashboard")) {
                window.location.href = "login";
            }
        }else{
            if(window.location.href.includes("login") || window.location.href.includes("signup")){
                window.location.href = "dashboard";
            }
        }
    });
}

function deleteUser(email, password){
    ref.removeUser({
        email: email,
        password: password
    }, function(error) {
        if (error) {
            switch (error.code) {
                case "INVALID_USER":
                    console.error("The specified user account does not exist.");
                    break;
                case "INVALID_PASSWORD":
                    console.error("The specified user account password is incorrect.");
                    break;
                default:
                    console.error("Error removing user:", error);
            }
        } else {
            ref.child("users").child(replacePeriods(email)).remove();
            console.log("User account deleted successfully!");
        }
    });
}

function checkIfEmailInString(text) {
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    return re.test(text);
}

function accountAuthStatus(){
    $(".auth-status").animate({
        bottom: "0%"
    },500);
}


function configureUserOnDashboard(){
    var userRef = ref.child("user/" + user + "/email");
    userRef.once("value", function(snapshot){
        $(".user").text(snapshot.val());
    });
}

setTimeout(accountAuthStatus, 500);
setTimeout(checkAuthChanges, 3000);


$(".auth-status").click(function(){
    if(user == "loggedOut"){
        window.location.href="login.html";
    }
});

$(".login-form").submit(function(e) {
    e.preventDefault();
    var username = $("#inputEmail").val();
    var password = $("#inputPassword").val();
    login(username, password);
});

$(".signup-form").submit(function(e) {
    e.preventDefault();
    var username = $("#signEmail").val();
    var password = $("#signPassword").val();
    var repPass = $("#repSignPassword").val()
    var email = $("#signEmail").val();
    if(checkIfEmailInString(email)){
        if(password == repPass){
            if(password.length >= 6){
                createUser(username, password);

            }else{
                $(".signup-btn").text("The specified email address is not valid");
                $(".pass-group").addClass("has-error");
                $("#signPassword").val("").focus();
                $(".signup-btn").text("Passwords must have 6 or more characters");
                $(".email-group").removeClass("has-error");
            }
        }else{
            $(".signup-btn").text("The specified email address is not valid");
            $(".pass-group").addClass("has-error");
            $("#repSignPassword").val("").focus();
            $(".signup-btn").text("Passwords do not match");
            $(".email-group").removeClass("has-error");
        }
    }else{
        $(".signup-btn").text("The specified email address is not valid");
        $(".email-group").addClass("has-error");
        $("#signEmail").val("").focus();
        $(".signup-btn").text("The specified email address is invalid");
        $(".password-group").removeClass("has-error");
    }
});
