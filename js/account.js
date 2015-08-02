var ref = new Firebase('https://dexto.firebaseio.com/');

var user = 'loggedOut'
var token = localStorage.getItem('token');
if(token == null){
  token = "No Token"
}

ref.authWithCustomToken(token, function(error, result) {
  if (error) {
    console.log("No pre-existing token found");
  } else {
    console.log("Pre-existing token found");
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
            ref.child('users').child(accountId).set({
                events:{
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
            if(JSON.stringify(error).indexOf("EMAIL") > -1){
                $("#inputEmail").focus();
                $(".login-btn").text("The specified email address is invalid.");
                $(".login-btn").removeClass("btn-primary").addClass("btn-material-red-600");
            }else{
                $("#inputPassword").focus();
                $(".login-btn").text("The specified password is incorrect.");
                $(".login-btn").removeClass("btn-primary").addClass("btn-material-red-600");
            }
        } else {
            console.log("Authenticated successfully with payload:", authData);
            token = authData.token;
            localStorage.setItem('token', token);
            var len = authData.uid.length
            user = parseInt(authData.uid.substring(12, len));
        }
    });
}

function logout(){
    ref.unauth();
    localStorage.removeItem('token');
    user = 'loggedOut'
}

//checks any changes in user authentication
ref.onAuth(function(){
    if(ref.getAuth() == null){
        $(".auth-status-title").text("Logged Out");
        $(".auth-status-color").removeClass("panel-success").addClass("panel-danger");
        $(".auth-status").css({"cursor": "pointer"});
        $(".navbar-login").text("Login");
    }else{
        $(".auth-status-title").text("Logged In");
        $(".auth-status-color").removeClass("panel-danger").addClass("panel-success");
        $(".auth-status").css({"cursor": "auto"});
        $(".navbar-login").text("Logout");
        $(".navbar-login").attr("href", "");
        $(".navbar-login").click(function(){
            logout();
        });
        if(window.location.href.includes("login")){
            window.location.href = "index.html";
        }
    }
});

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

setTimeout(accountAuthStatus, 500);

$(".auth-status").click(function(){
    if(user == "loggedOut"){
        window.location.href="login.html"
    }
});

$(".login-form").submit(function(e) {
    e.preventDefault();
    var username = $("#inputEmail").val();
    var password = $("#inputPassword").val();
    login(username, password);
});

$(".alert").hide();

$(".signup-form").submit(function(e) {
    e.preventDefault();
    var username = $("#signEmail").val();
    var password = $("#signPassword").val();
    var repPass = $("#repSignPassword").val()
    var email = $("#signEmail").val();
    if(checkIfEmailInString(email)){
        if(password == repPass){
            if(password.length >= 6){
                $(".alert").hide();
                createUser(username, password);
                login(username, password);
            }else{
                $(".login-error").text("Your password must have 6 or more characters!");
                $(".alert").show();
            }
        }else{
            $(".login-error").text("Passwords do not match!");
            $(".alert").show();
        }
    }else{
        $(".login-error").text("That is not a valid email address!");
        $(".alert").show();
    }
});
