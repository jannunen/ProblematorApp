window.ver = "problemator_20161215";
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
  server : "https://beta.problemator.fi",
  api : "/t/problematorapi/",
  version : "v02/",

};
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
    window.uid =          $.jStorage.get("uid");
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

myApp.init(); // init app manually after you've attached all handlers
initializeTemplates(myApp);


