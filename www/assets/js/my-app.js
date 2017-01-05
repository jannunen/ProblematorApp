window.ver = "problemator_20161215";
window.tickSaved = false;

// Initialize app
var myApp = new Framework7({
  preprocess: function (content, url, next) {
    if (url == null) {
      next(content);
    } else {
     doPreprocess(content,url,next);
    }
  },
  modalTitle : "Problemator",
  swipeBackPage : true,
  pushState: true,
  template7Pages: false,
  precompileTemplates : false,
  init : false,
});

var api = {
  server : "https://www.problemator.fi",
  api : "/t/problematorapi/",
  version : "v02/",

};
var server = $.jStorage.get("server");
if (server != null && server == "beta") {
 api.server = "https://beta.problemator.fi";
}
window.api = api;
api.apicallbase = api.server+api.api+api.version;

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    //alert("Device is ready!");
    console.log("Device is ready!");
});




var loginCheck = function(data) {
  data = JSON.stringify(data);
  if (data && data.match(/Login.failed/i)) {
    // myApp.alert("Session expired");
    window.uid = null;
    $.jStorage.remove("loginok");
    $.jStorage.remove("uid");
    myApp.loginScreen();
  }  else {
    window.uid = $.jStorage.get("uid");
    $("#userid").val(window.uid);
  }
}
$.jsonp = function(url,_data,callback,options) {
  var _method = 'GET';
  if (options && options.method) {
    _method = options.method;
  }
  _data["api-auth-token"] = $.jStorage.get("api-auth-token");
 $.ajax({
   method : _method,
   url : url,
   jsonp : 'callback',
   dataType : 'jsonp',
   crossDomain : true,
   withCredentials : true,
   data : _data,
   complete : function(xhr,status) {
     console.log("back from jsonp with status "+status+", url: "+url);
     if (!url.match(/dologin/)) {
       loginCheck(xhr.responseJSON);
     }
     if (xhr.responseJSON['authenticationfailed'] != undefined ) {
        // Login failed, unset auth stuff and redirect to index
       $.jStorage.deleteKey("loginok");
       $.jStorage.deleteKey("uid");
       $.jStorage.deleteKey("api-auth-token");
       window.uid = null;
       $("#userid").val("");
       setTimeout(function() {
         document.location.href="index.html";
       },500);
       return; 

     }
     // Check if we have new jwt available. Save it if it exists...
     if (xhr.responseJSON['jwt']) {
       $.jStorage.set("api-auth-token",xhr.responseJSON['jwt']);
     }
     if (callback != undefined) {
       callback(xhr.responseJSON);
     }
   },
   error : function(data, status, thrown) {
     console.log("back from jsonp with ERROR "+thrown.message+", url: "+url);
   }
 });
} //jsonp



myApp.onPageInit("*",function(page) {
  var pagename = page.name;
  var matches = null;
  console.log("pageInit "+page.name);
  // These have to be added here before any actual check is made.
  // eg login page listeners have to be added before the login page
  // is actually shown =)
  if (page.name == null) {
     alert("Your page is missing a name! "+page.url);
  }
  addGlobalListeners();

  if (!$.jStorage.get("loginok")) {
    myApp.loginScreen();
    return true;
  }
  if (pagename=="index") {
    // Redirect to dashboard
    mainView.router.loadPage("static/dashboard.html");
  }
  // Add listeners to all pages used
  addIndexPageListeners(pagename);
  addGroupMemberListeners(pagename);
  addInviteMemberPageListeners(pagename);
  addSingleGroupPageListeners(pagename,page.url);
  addGroupPageListeners(pagename);
  addSingleProblemListeners(pagename);
  addProblemsPageListeners(pagename);
  addDashBoardListeners(pagename);
  addGymInfoPageListeners(pagename);
  addTickArchivePageListeners(pagename);
  addRankingPageListeners(pagename);
  addRegisterToCompPageListeners(pagename);
  addCompetitionPageListeners(pagename);
  addCompetitionsPageListeners(pagename);
  addSettingsPageListeners(pagename);
  addMoreStatsPageListeners(pagename);
  addSignupPageListeners(pagename);
  addForgotPageListeners(pagename);
});


/** WHen going BACK from page... */
myApp.onPageBack('*', function(page) {
  var pagename = page.name;
  var matches = null;

  if ((matches=pagename.match(/problem(\d+)/))) {
    var probid = matches[1];
    if (tickSaved != undefined && !tickSaved) {
      // Tick is not saved, save still the stuff as pretick, so user
      // can save amount of tries...
      saveTickFunction($("a.savetick"),'savepretick',function(back) {
        // ADd data ignore cache so that the page will be reloaded if user goes back...
        //$("a[data-problemid="+probid+"]").attr("data-ignore-cache","true");
      });
    }
  }
});

console.log("App init");
myApp.init(); // init app manually after you've attached all handlers

// Initialize templates. 
initializeTemplates(myApp);


