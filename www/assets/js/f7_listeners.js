var indexhtmlLoaded = false;
var singleProblemListenersInitialized = false;
var problemsPageListenersInitialized = false;
var dashBoardListenersInitialized = false;
var loginPageListenersInitialized = false;
var indexPageListenersInitialized = false;
var groupPageListenersInitialized = false;
var singleGroupPageListenersInitialized = false;
var groupMemberPageListenersInitialized = false;
var inviteMemberPageListenersInitialized = false;
var globalListenersAdded = false;
var gymInfoPageListenersInitialized = false;
var singleGroupPageListenerInitialized = false;
var tickArchivePageListenerInitialized = false;
var rankingPageListenersInitialized = false;
var competitionPageListenersInitialized = false; // Singular
var competitionsPageListenersInitialized = false; // Plural =)
var settingsPageListenersInitialized = false;
var registerToCompListenersInitialized = false;
var moreStatsPageListenersInitialized = false;
var signupPageListenersInitialized = false;
var forgotPageListenersInitialized = false;

var pieBoulder = pieSport = null;
var randomColorGenerator = function () { 
  return '#' + (Math.random().toString(16) + '0000000').slice(2, 8); 
};
 
String.prototype.pad = function(len,char) {
 if (char == undefined) {
  char = " ";
  }
  var padAmount = len - this.length;
  var padStr = "";
  if (padAmount > 0) {
     
     for (var i=0;i<padAmount;i++) {
      padStr += char;
     }
  }
  return padStr+this.toString();
}
Date.prototype.getWeek = function() {
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}
// Pre-set checkin and checkout if they are not set
var presetCheckinCheckout = function() {
  var session = calculateTrainingSession();
  if (session.start != null) {
    $("#checkin").val(session.start.format("HH:mm"));
  }
  if (session.end != null) {
    $("#checkout").val(session.end.format("HH:mm"));
  }

};
var calculateTrainingSession = function() {
  var date = $(".sharetodayticks").data("date");
  var sessionDate = moment(date);
  var sessionStart = null;
  var sessionEnd = null;
  $("#tickContainer .item-title").each(function() {
    var tmp = moment(date);
    var timestr = $(this).text();
    var firstMatch = timestr.match(/(\d+:\d+)/);
    if (firstMatch) {
      var hoursmins = firstMatch[1].split(/:/);
      tmp.hour(hoursmins[0]);
      tmp.minute(hoursmins[1]);
    if (sessionStart == null || tmp.isBefore(sessionStart)) {
      sessionStart = tmp;
    }
    if (sessionEnd == null || tmp.isAfter(sessionEnd)) {
      sessionEnd = tmp;
    }
      }
  });

  return { start : sessionStart, end : sessionEnd };
}

var doPreprocess = function(content,url,next) {
  var host = window.location.host;
  var pos = -1;
  if (url.match(/index.html/)) {
    next(content);
  }
  if ((pos=url.indexOf(host))>0) {
    var remainder = url.substr(pos+host.length);
    if (remainder == "" || remainder=="/") {
      var compiledTemplate = Template7.compile(content);
      if (next != null && next != undefined) {
	next(compiledTemplate());
      } else {
	return compiledTemplate();
      }
    }
  }

  var matches = null;
  if (url == null) {
    if (next != null) {
      next(content);
    }
    return;
  }
  /* 
   * If a single group is being fetched, go ahead, find the group data 
   * via API, compile the template and since it is an AJAX call,
   * one has to call next() to advance in the processing 
   */
  if ((matches=url.match(/group.html.*?(\d+)/i))) {
    var groupid = matches[1];
    var url = window.api.apicallbase + "group/";
    $.jsonp(url, {id : groupid}, function (data){ 
      if (data==null) {
	myApp.alert("The group does not exist anymore!",function() {
	  document.location.href="index.html";
	});
	return true;
      }
      var compiledTemplate = Template7.compile(content);
      var dataJSON = {group : data};
      next(compiledTemplate(dataJSON));
    });
  } else if ((matches=url.match(/signup.html/))) {
    myApp.hidePreloader();
    myApp.closeModal();
    // ADd timeout, so modal has time to close
    setTimeout(function() {
      var compiledTemplate = Template7.compile(content);
      var html = compiledTemplate();
      next(html);
    },100);
  } else if ((matches=url.match(/forgot.html/))) {
    myApp.hidePreloader();
    myApp.closeModal();
    // ADd timeout, so modal has time to close
    setTimeout(function() {
      var compiledTemplate = Template7.compile(content);
      var html = compiledTemplate();
      next(html);
    },100);
  } else if ((matches=url.match(/dashboard.html/))) {
    var newgymid = undefined;
    var apiurl = window.api.apicallbase+"dashinfo/?id="+$.jStorage.get("uid");
    // Check if new gym id is given here
    if ((matches=url.match(/dashboard.html.*?(\d+)/))) {
      newgymid = matches[1];
      apiurl += "&newgymid="+newgymid;
      // Cookie for location must be set, because it's changed
      $.jStorage.set("nativeproblematorlocation",newgymid);
      document.location.href="index.html";
    }

    var initDash = function(content,next,data) {
      myApp.closeModal(".login-screen");
      myApp.hidePreloader();
      $.jStorage.set("dashboard",data);
      $.jStorage.set("climbinfo",data.climbinfo);
      $.jStorage.set("climber",data.climber);
      $.jStorage.set("mysettings",data.mysettings);
      $.jStorage.set("locinfo",data.locinfo);
      $.jStorage.set("grades",data.grades);
      $.jStorage.set("locations",data.locations);
      data.server = $.jStorage.get("server");
      var compiledTemplate = Template7.compile(content);
      var html = compiledTemplate(data);
      next(html);
    }

    var gymid =  $.jStorage.get("nativeproblematorlocation");

    // dashinfo should be called and realoaded
    $.jsonp(apiurl,{problematorlocation : gymid},function(data) {
      initDash(content,next,data);
    });
  } else if ((matches=url.match(/settings.html/))) {
    $.jsonp(window.api.apicallbase+"settings",{},function(settings) {
      data = {};
      data.settings = settings;
      data.climber = $.jStorage.get("climber");
      data.genders = {"a" : "I rather not disclose","m" : "Male","f" : "Female"};
      data.locations = $.jStorage.get("locations");
      data.problematorlocation = $.jStorage.get("nativeproblematorlocation");
      data.locinfo = $.jStorage.get("locinfo");
      data.server = $.jStorage.get("server");
      var compiledTemplate = Template7.compile(content);
      next(compiledTemplate(data));
    });
  } else if ((matches=url.match(/morestats.html/))) {
    var generateYears = function() {
      var now = moment().format("YYYY");
      var past = now-5;
      var years = {};
      var start = past;
      for (start=past; past <= now; past++) {
	years[past]=past;
      }
      return years;
    }
    // $.jsonp(window.api.apicallbase+"morestats",{},function(data) {
    var data = {};
    data.years = generateYears();
    data.curyear=moment().format("YYYY");
    var compiledTemplate = Template7.compile(content);
    next(compiledTemplate(data));
    //});
  } else if ((matches=url.match(/compresults.html.*?(\d+)/))) {
    var compid = matches[1];
    $.jsonp(window.api.apicallbase+"compresults/?comp_id="+compid,{},function(data) {
      // Data is actually contents of the tabs stuffed into JSON
      var compiledTemplate = Template7.compile(content);
      var html = compiledTemplate({result_tabs : data.message});
      next(html);
    });
  } else if ((matches=url.match(/pointsperroute.html.*?(\d+)/))) {
    var compid = matches[1];
    $.jsonp(window.api.apicallbase+"pointsperroute/?comp_id="+compid,{},function(data) {
      var compiledTemplate = Template7.compile(content);
      next(compiledTemplate(data));
    });
  } else if ((matches=url.match(/gyminfo.html/))) {

    $.jsonp(window.api.apicallbase+"gyminfo/?id="+$.jStorage.get("nativeproblematorlocation"),{},function(data) {
      var compiledTemplate = Template7.compile(content);
      data.locations = $.jStorage.get("locations");

      data.ascentsingyms = $.jStorage.get("climbinfo").ascentsingyms;
      data.ascentsingyms.boulder = data.ascentsingyms.boulder[data.locinfo.id];
      data.ascentsingyms.sport = data.ascentsingyms.sport[data.locinfo.id];
      next(compiledTemplate(data));
    });
  } else if ((matches=url.match(/competition.html.*?(\d+)/))) {
    // Load problems page data and compile the template
    //
    var compid = matches[1];
    var url = window.api.apicallbase + "competition/?compid="+compid;
    $.jsonp(url, {}, function (data){ 
      loginCheck(data);
      if (data.error) {
	myApp.alert(data.msg);
	mainView.router.back();
	return true;
      }
      data.hostname = window.location.host;
      var compiledTemplate = Template7.compile(content);
      next(compiledTemplate(data));
    });
  } else if ((matches=url.match(/ranking.html/))) {
    var url = window.api.apicallbase + "ranking/";
    $.jsonp(url, {compid : compid}, function (data){ 
      var compiledTemplate = Template7.compile(content);
      var set = $.jStorage.get("mysettings");
      if (set.rankinglocation == null) {
	set.rankinglocation = "0";
      }
      var pass = { 
	rankings : data,
	locations : $.jStorage.get("locations"),
	rankinglocation : set.rankinglocation,
	problematorlocation : $.jStorage.get("nativeproblematorlocation"),
      }
      next(compiledTemplate(pass));
    });
  } else if ((matches=url.match(/registertocomp.html.*?(\d+)/))) {
    var compid = matches[1];
    var url = window.api.apicallbase + "registertocomp/";
    $.jsonp(url, {compid : compid}, function (data){ 
      loginCheck(data);
      var compiledTemplate = Template7.compile(content);
      next(compiledTemplate(data));
    });
  } else if ((matches=url.match(/tickarchive.html/))) {
    // Load problems page data and compile the template
    //
    var url = window.api.apicallbase + "tickarchive";
    var mom = moment();
    var date = mom.format("YYYY-MM-DD");
    $.jsonp(url, {date : date}, function (data){ 
      // Compile ticks for today, and put them into content
      var ctpl = window.myApp.templates.tickarchive_list;
      var html = ctpl(data);
      var compiledTemplate = Template7.compile(content);
      next(compiledTemplate({ticksToday : html}));
    });
  } else if ((matches=url.match(/circuits.html/))) {
    // Load problems page data and compile the template
    //
    var url = window.api.apicallbase + "circuits";
    var gymid = $.jStorage.get("nativeproblematorlocation");
    $.jsonp(url, {gymid : gymid}, function (data){ 
      var compiledTemplate = Template7.compile(content);
      next(compiledTemplate(data));
    });
  } else if ((matches=url.match(/circuit.html.*?(\d+)/))) {
    var circuitid = matches[1];
    var url = window.api.apicallbase + "circuit?id="+circuitid;
    $.jsonp(url, {}, function (data){ 
      var compiledTemplate = Template7.compile(content);
      next(compiledTemplate(data));
    });
  } else if ((matches=url.match(/newproblems.html/))) {
    // Load problems page data and compile the template
    //
    var url = window.api.apicallbase + "newproblems/";
    $.jsonp(url, {}, function (data){ 
      var compiledTemplate = Template7.compile(content);
      next(compiledTemplate({newproblems : data}));
    });
  } else if ((matches=url.match(/problems.html/))) {
    // Load problems page data and compile the template
    //
    var url = window.api.apicallbase + "problems/";
    $.jsonp(url, {}, function (data){ 
      var compiledTemplate = Template7.compile(content);
      next(compiledTemplate({walls : data}));
    });
  } else if ((matches=url.match(/competitions.html/))) {
    var url = window.api.apicallbase + "mycompetitions/";
    $.jsonp(url, {}, function (data){ 
      var compiledTemplate = Template7.compile(content);
      next(compiledTemplate(data));
    });
  } else if ((matches=url.match(/invite_member.html.*?(\d+)/))) {
    var groupid = matches[1];
    var url = window.api.apicallbase + "group/";
    $.jsonp(url, {id : groupid}, function (data){ 
      var compiledTemplate = Template7.compile(content);
      next(compiledTemplate({"group" : data}));
    });
  } else if ((matches=url.match(/groups.html/))) {
    // List groups 
    var url = window.api.apicallbase + "groups/";
    $.jsonp(url, {}, function (data){
      if (!$.jStorage.get("loginok")) {
	return false;
      }
      var compiledTemplate = Template7.compile(content);
      var html = compiledTemplate(data);
      next(html);
    });
  } else if ((matches=url.match(/list_group_members.html.*?(\d+)/))) {
    // List group members
    var groupid = matches[1];
    var url = window.api.apicallbase + "list_group_members/";
    $.jsonp(url, {id : groupid}, function (data){ 
      var compiledTemplate = Template7.compile(content);
      var html = compiledTemplate({"group" : data});
      next(html);
    });

  } else if ((matches=url.match(/problem.html.*?(\d+)/))) {
    // List group members
    var pid = matches[1];
    var url = window.api.apicallbase + "problem";
    window.tickSaved = false;
    $.jsonp(url, {id : pid}, function (data){ 
      if (!$.jStorage.get("loginok")) {
	return false;
      }
      var compiledTemplate = Template7.compile(content);
      data.grades = $.jStorage.get("grades");
      var html = compiledTemplate(data);
      next(html);
    });

  } else {
    if (content ==  null || content == "") {
      return "";
    }
    var template = Template7.compile(content);
    var resultContent = template();
    if (next != undefined && next != null) {
      next(resultContent);
    } else {
      return resultContent; 
    }
  }

} // End of preprocess

var addGlobalListeners = function() {
  if (!globalListenersAdded) {

    var strength = {
      0: "Worst",
      1: "Bad",
      2: "Weak",
      3: "Good",
      4: "Strong"
    }
    $(document).on("keyup",".signup_password",function() {
      var meter = document.getElementById('password-strength-meter');
      var text = document.getElementById('password-strength-text');
      var val = $(this).val();
      var result = zxcvbn(val);

      // Update the password strength meter
      meter.value = result.score;

      // Update the text indicator
      if (val !== "") {
        text.innerHTML = "<span class='text-w'>Your password is <strong>" + strength[result.score] + "</strong></span><br />" + "<span class='password-feedback'>" + result.feedback.warning + " " + result.feedback.suggestions + "</span><br /><span class='text-w'>This password would be cracked in "+result.crack_times_display.offline_slow_hashing_1e4_per_second+"</span>"; 
      } else {
        text.innerHTML = "";
      }
    });
    $(document).on("click",".showtop10",function(e) {
      var time = $(this).data("timespan");
      var routetype = $(this).data("routetype");
      var active = $(this).data("active");
      var uid = $(this).data("uid");
      var url = window.api.apicallbase + "mytop10";
      $.jsonp(url,{timespan : time,routetype : routetype,active : active,uid: uid},function(data) {
        
        var tpl = `<div class="popup">
          <div class="content-block">
          <p><a href="#" class="text-w close-popup">Close</a></p>
          <h2>Top 10 ascents</h2>
          <div class="list-block">
            <ul>

          {{#each top10.problems}}
            <li >
                <a data-problemid="{{problemid}}" href="static/problem.html?id={{problemid}}" class="item-link item-content {{#js_compare "this.visible==0"}}strikethrough{{/js_compare}}" >
                  <div class="item-media" style="width : 30px;">
                    <h5 tag="{{tagshort}}" problemid="{{problemid}}" class="probtitle  grade">{{gradename}}</h5>
                  </div>
                  <div class="item-inner">
                    <div class="item-title">
                      <span  class="fa fa-square" style="color : {{code}};"></span>
                      <span class="body-text-w">{{tagshort}}</span> 
                      {{#js_compare "this.visible==1"}}
                      <small>| {{addedrelative}}</small>
                      {{else}}
                      <small>| <span style="color : red;">REMOVED</span></small>
                      {{/js_compare}}
                      {{score}}
                      | <small class="text-g">{{routetype}}</small>
                    </div>
                    <div class="item-after">
                      <span class="body-text-w likes">
                        <span data-count="{{c_like}}" class="fa fa-thumbs-up"></span> {{c_like}}
                        <span data-count="{{c_love}}" class="fa fa-heart"></span> {{c_love}}
                      </span>
                      <span class="fa fa-chevron-right"></span>
                    </div>

                  </div> <!--- item-inner -->
                </a>
            </li>

          {{/each}}
          <li>
                  <div class="item-inner">
                    <div class="item-title">
              Total {{top10.totalscore}}
              </div>
              </div>
          </li>
          </ul>
          </div>
          <p><a href="#" class="text-w close-popup">Close</a></p>
          </div>
          </div>`;
        ctpl = Template7.compile(tpl);
        var html = ctpl(data);
        myApp.popup(html);
      });
    });
    $(document).on("click",".toggle",function(e) {
      var target = $(this).data("target");
      $(target).toggle();
      return false;
    });
    // Untick from single problem
    $(document).on("click",".untick",function(e) {
      var tickid = $(this).attr("data-id");
      var from = $(this).attr("data-from");
      var self = this;
      $(this).attr("disabled","disabled");
      var gymid = $("#location").val();
      var pid = $(this).data("pid");
      myApp.confirm('Really untick this problem?', function () {
	var url = window.api.apicallbase + "untick"; 
	$.jsonp(url,{"tickid" : tickid,'pid' : pid},function(back) {
	  $(self).removeAttr("disabled");
	  if (from == "manageticks") {
	    // IF coming from manage ticks from a single problem view.
	    myApp.closeModal();
	    mainView.router.refreshPage();
	  }
	});
      },function() {
	$(self).removeAttr("disabled");
      });
      return false;
    });
    $$(document).on("ptr:refresh",'.pull-to-refresh-content',function(e) {
      var pagename = $(e.target.parentNode).attr("data-page");
      if ("dash"==pagename) {
	mainView.router.refreshPage();
      } else if ("problems-page"==pagename) {
	mainView.router.refreshPage();
      }
    });


    $(document).on("submit","#frm_signup",function() {
      var formData = myApp.formToJSON($(this));
      var url = window.api.apicallbase + "dosignup";
      $.jsonp(url,formData,function(back) {
	myApp.alert(back.message);
      });
    });

    $(document).on("submit","#frm_forgot",function() {
      var formData = myApp.formToJSON($(this));
      var url = window.api.apicallbase + "forgot";
      $.jsonp(url,formData,function(back) {
	myApp.alert(back.message);
      });
    });

    $(document).on("click","#facebook-login",function() {
      console.log("Trying facebook login");
      facebookConnectPlugin.login(["public_profile"],function(userData) {

	var fbuid = userData.authResponse.userID;
	var accessToken = userData.authResponse.accessToken;
	// Authenticate to Problemator API with facebook, should return api-auth-token if ok
	var url = window.api.apicallbase + "fblogin";
	var loc = $.jStorage.get("nativeproblematorlocation");
	$.jsonp(url,{fbuid : fbuid, access_token : accessToken,loc : loc},function(back) {

	  $.jStorage.deleteKey("api-auth-token");
	  $.jStorage.set("api-auth-token",back.JWT);
	  $.jStorage.set("loginok",true);
	  $.jStorage.set("uid",back.uid);
	  window.uid = back.uid;

	  myApp.closeModal();

	  // If here, go ahead and load index 
	  // (dashboard.html should call api and have the new api-auth-key in use)
	  document.location.href="index.html";
	});
      },function(error) {
	alert("from login "+JSON.stringify(error));
      });
      return false;
    });

    $(document).on("click",".compadhoc",function() {
      var compid = $(this).data("compid");
      var url = window.api.apicallbase +"adhocregistrate/?compid="+compid;
      $.jsonp(url,{},function() {
	myApp.alert("All set. Now you can go ahead and click get 'open competition' button");
      });
      myApp.closeModal();
      return false;
    });
    $(document).on("click",".opencompetitionpage",function() {
      // First check if user has registered to the competition, if is, open the comp page.
      var compid = $(this).data("compid");
      var url = window.api.apicallbase +  "checkregistration/?compid="+compid;
      $.jsonp(url,{},function(back) {
	if (back.error) {
	  // USer has not registered. Open a modal dialog enabling the registration
	  if (back.message.match(/haven.*?paid for the comp/i)) {
	    myApp.alert(data.message);
	  } else {
	    mainView.router.loadPage("static/registertocomp.html?compid="+compid);
	  }
	} else {
	  // Go ahead and load the comp page.
	  var url2 = "static/competition.html?compid=" + compid;
	  mainView.router.loadPage(url2);
	}
      });
      return false;
    });

    $(document).on("click",".changelocation_picker",function() {
      invokeLocationChangeActionSheet();
    });
    $$(document).on("click",".btn_logout",function() {
      $.jsonp(window.api.apicallbase+"logout",{},function() {
	$.jStorage.deleteKey("lastLoaded_dashboardcharts"); 
	$.jStorage.deleteKey("lastLoaded_globalrankingprogressdata");
	$.jStorage.deleteKey("lastLoaded_runningprogressdata");
	$.jStorage.deleteKey("lastLoaded_gradebarsdata");
	$.jStorage.deleteKey("loginok");
	$.jStorage.deleteKey("uid");
	$.jStorage.deleteKey("api-auth-token");
	window.uid = null;
	$("#userid").val("");
	setTimeout(function() {
	  document.location.href="index.html";
	},500);
      });
    });
    // Confirm terminate account
    $$(document).on("click",".opt-out",function() {
      myApp.confirm("This action cannot be undone! All your data will be lost.","Are you sure?",function() {
	var url = window.api.apicallbase + "terminate_account";
	$.jsonp(url).done(function(back) {
	  myApp.alert(back);
	  setTimeout(function() {
	    document.location.href="/index.html";
	  },5000);
	});
      });
    });
    $$(document).on('click','.loginbutton', function (e) {
      if ($("#problematorlocation").val()=="") {
	myApp.alert("Please select a gym","Gym not selected");
	return false;
      }
      var username = $(this).parents("form").find('input[name="username"]').val();
      var password = $(this).parents("form").find('input[name="password"]').val();
      //var loc = $(this).parents("form").find("#problematorlocation").val();
      // Handle username and password
      console.log("Loggin in with "+username+" and password "+password);
      var url = window.api.apicallbase + "dologin?native=true"; 
      var opt = {"username": username,"password":password, "authenticate" : true};
      if ($.jStorage.get("nativeproblematorlocation")) {
	opt.problematorlocation = $.jStorage.get("nativeproblematorlocation");
      }
      $.jsonp(url,opt,function(data) {
	try {
	  console.log(JSON.stringify(data));
	  if (data && !data.error) {

	    $.jStorage.set("loginok",true);
	    $.jStorage.set("uid",data.uid);

	    // Save the auth token and start using that
	    $.jStorage.deleteKey("api-auth-token");
	    console.log("New token "+data.JWT);
	    $.jStorage.set("api-auth-token",data.JWT);

	    window.uid = data.uid;
	    // Initialize index page.
	    myApp.closeModal();
	    document.location.href="index.html";
	  } else {
	    // Possibly login failed
	    //
	    myApp.alert(data.message);
	  }
	} catch(e) {
	  myApp.alert(data);
	}
      });
      return false;
    });

    globalListenersAdded = true;
  }
}

var initPieChartsForGymInfo = function() {
}

var invokeLocationChangeActionSheet = function() {
  var selectGym = function(id) {
    myApp.alert("Please wait, changing the gym");
    console.log("new gym "+id);
    // Change the gym (gets the updated jwt at the same time...)
    var url = window.api.apicallbase + "changegym"; 
    $.jsonp(url,{id : id},function(back) {
      mainView.router.loadPage("static/dashboard.html?newgymid="+id); 
    });


    return false;
  }
  var gymid = $.jStorage.get("nativeproblematorlocation");
  var buttons = [];
  var locs = $.jStorage.get("locations");
  buttons.push({
    text : "Choose a location",
    label : true
  });

  var btn = null;
  var loc = null;
  for (var idx in locs) {
    loc =  locs[idx];
    btn = {
      text : loc.name,
      color : "white",
      bold : (loc.id==gymid) ,
      onClick : $.proxy(selectGym,null,loc.id),
    };
    if (loc.id==gymid) {
      btn.color = "yellow";
    }
    buttons.push(btn);
  }

  buttons.push({
    text : "Close"
  });
  myApp.actions(buttons);
}

var addRankingPageListeners = function(pagename) {
  if ("ranking-page"==pagename && !rankingPageListenersInitialized) {
    $(document).on("change","#ranking_location",function() {
      // Change ranking gym
      $elem = myApp.alert(  'This calculation might take some while, have patience! =)', 'Calculating ranks...');

      var gymid = $("#ranking_location option:selected").map(function() { return $(this).val(); }).get().join(",");
      var boulderdone = false;
      var sportdone = false;
      //console.log("Gymid "+gymid);
      var url = window.api.apicallbase + "ranking"; 
      $.jsonp(url,{gymid : gymid},function(data) {
	var ctpl = window.myApp.templates.rankings;
	var html = ctpl(data.boulder);
	$("#list_ranking_boulder").empty().append(html);

	ctpl = window.myApp.templates.rankings;
	html = ctpl(data.sport);
	$("#list_ranking_sport").empty().append(html);
      });
      return false;
    });

    rankingPageListenersInitialized  = true;
  }
}

var addTickArchivePageListeners = function(pagename) {
  if ("tickarchive-page"==pagename) {
    // Initialize every time we get to this page
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August' , 'September' , 'October', 'November', 'December'];
    var url = window.api.apicallbase + "tickarchive_tickdates"; 
    $.jsonp(url,{},function(datesWithTicks) {
      var evts = [];
      for (var idx in datesWithTicks) {
	var dstr = datesWithTicks[idx];
	var mom = moment(dstr);
	evts.push(mom.toDate());
      }
      var calendarInline = myApp.calendar({
	container: '#calendar-inline-container',
	value: [new Date()],
	weekHeader: true,
	events : evts,

	onDayClick : function(p,dayContainer,year,month,day) {
	  // Find events for clicked day.
	  month = parseInt(month) + 1;
	  var date = year.toString()+"-"+month.toString().pad(2,"0")+"-"+day.pad(2,"0");
	  var url = window.api.apicallbase + "tickarchive";	 
	  $("#tickContainer").empty().append('<div class="text-w"><span class="fa fa-spinner "></span>  Loading...</div>');
	  $.jsonp(url,{date : date},function(back) {
	    var ctpl = window.myApp.templates.tickarchive_list;
	    back.tstamp = date;
	    var html = ctpl(back);
	    $("#tickContainer").empty().append(html);
	    presetCheckinCheckout();
	  });
	},
	onOpen: function (p) {

	  var amt = $("div[data-year="+p.currentYear+"][data-month="+p.currentMonth+"] .picker-calendar-day-has-events").not(".picker-calendar-day-next").length;
	  $("#traindays").html(amt);
	  $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
	  $$('.calendar-custom-toolbar .left .link').on('click', function () {
	    calendarInline.prevMonth();
	  });
	  $$('.calendar-custom-toolbar .right .link').on('click', function () {
	    calendarInline.nextMonth();
	  });

	},
	onMonthYearChangeStart: function (p,year,month) {
	  var amt = $("div[data-year="+year+"][data-month="+month+"] .picker-calendar-day-has-events").not(".picker-calendar-day-next").length;
	  $("#traindays").html(amt);
	  $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
	}
      });
    });//jsonp

    if (!tickArchivePageListenerInitialized) {

      $(document).on("click",".savetrainingsession",function(e) {
	var formData = myApp.formToJSON($(".form_trainingsession"));
	var url = window.api.apicallbase + "savetrainingsession";	 
	// Get the active training day
	formData.added =  $(".sharetodayticks").data("date");
	var date = moment(formData.added); 
        var arr = formData.checkin.split(/:/);
	date.hour(arr[0]);
	date.minute(arr[1]);
	formData.checkin = date.format("YYYY-MM-DD HH:mm:00");

        arr = formData.checkout.split(/:/);
	date.hour(arr[0]);
	date.minute(arr[1]);
	formData.checkout = date.format("YYYY-MM-DD HH:mm:00");
	$.jsonp(url,formData,function(data) {
	  myApp.addNotification({message : data.message});
	  debugger;
	});
      });
      $(document).on("click",".feeling",function(e) {
	$(".input_feeling").val($(this).data("feeling"));
      });
      $(document).on("click",".hourpicker",function(e) {
	e.stopPropagation();
	var _input = $(this).data("target");
	var hours =  [];
	var mins = [];
	for (var i=0; i < 24; i++) {
	  if (i < 10) {
	    i = "0"+i;
	  }
	  hours.push(i);
	}
	for (var i=0; i < 60; i++) {
	  if (i < 10) {
	    i = "0"+i;
	  }
	  mins.push(i);
	}
	var today = new Date();
	var hourPicker = myApp.picker({
	  input:_input,
	  rotateEffect: true,
	  value : [ (today.getHours() < 10 ? '0' + today.getHours() : today.getHours()), (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())],
	  formatValue: function (p, values, displayValues) {
	   return values[0] + ':' + values[1];
	  },
	  /*
	  onChange: function (p, values, displayValues) {
	     this.value[0] = values[0];
	     this.value[1] = values[1];
	    //return values[0] + ':' + values[1];
	  },
	  */
	  cols: [
	    {
	      textAlign: 'left',
	      values: hours
	    },
	    // Divider
	    {
	      divider: true,
	      content: ':'
	    },
	    {
	      values: mins
	    },
	  ]
	});       
	hourPicker.open();

      });
      $(document).on("click",".sharetodayticks",function(e) {
	e.preventDefault();
	var session = calculateTrainingSession();
	var diff = 0;
	if (session.start != null && session.end != null) {
	  diff = session.end.diff(session.start,'minutes');
	}
	var sessionDate = session.start;
	window.sevens = 0;

	this.createGradeString = function(source) {
	  var grades = [];
	  var string = "";
	  $("#tickContainer .item-media").map(function() {
	    var grade = $(this).text().trim();
	    if (grades[grade]==undefined) {
	      grades[grade] = 0;
	    }
	    if (grade.substring(0,1)=="7") {
	    window.sevens++;
	    }
	    grades[grade]++;
	  });
	  var keys = Object.keys(grades),
	    i, len = keys.length;

	  keys.sort();
	  keys.reverse();

	  for (i = 0; i < len; i++) {
	    k = keys[i];
	    string += k + " x"+grades[k]+", ";
	  }
	  string = string.trim();
	  string = string.substr(0,string.length-1);
	  return string;

	};
	var uid = $.jStorage.get("uid");
	var date = $(this).data("date");
	gradeString = this.createGradeString($(this));
	if (""==gradeString) {
	  alert("Nothing climbed, nothing to share...");
	  return;
	}
	if ($.jStorage.get("showed_sharetodayticks")==null) {
	 alert("Share window might not work on first try (especially on Android), please try clicking the share button a couple times.");
	 $.jStorage.set("showed_sharetodayticks",moment());
	}
	var targeturl = window.api.server + "/t/problemator/profile/"+uid+"/training_log/#"+date;
	var _caption = "Training session ("+diff+" minutes) on "+sessionDate.format("DD.MM.YYYY") + " "+ gradeString;
	console.log(_caption);
	var picture = null;

	var dlgData = {
	  method: "share",
	  href : targeturl,
	  caption : _caption,
	}
	if (window.sevens >=  7) {
	 dlgData.picture = window.api.server + "/assets/images/feedimages/danny"+Math.floor(Math.random()*12)+".jpg";
	}
	// Make training session public (because it's shared)
	var url = window.api.apicallbase + "savetrainingsession";	 
	$.jsonp(url,{date : date,ispublic : 1});

	setTimeout(function() {
	  facebookConnectPlugin.showDialog(dlgData, function onShareSuccess (result) {
	    console.log("Posted. ", result);
	  }, function onShareFail(results) {
	    console.log(result);
	  });
	},100);
	return false;
      });

      // These should be initialized only once
      $(document).on("click",".swipeuntick",function(el) {
	$(this).attr("disabled","disabled");
	var tickid = $(this).attr("data-tickid");
	var url = window.api.apicallbase + "untick";	 
	$.jsonp(url,{"tickid" : tickid},function(back) {
	});
      });

      tickArchivePageListenerInitialized = true;
    }
    presetCheckinCheckout();
  }
}
var addGymInfoPageListeners = function(pagename) {

  if ("gyminfo-page"==pagename) {

    // For gym info donut
    if (pieBoulder == null && $("#pie-gym-boulder").length) {
      console.log("Initializing pie charts for gym info");
      var done = $("#pie-gym-boulder").data("done");
      var all = $("#pie-gym-boulder").data("all");
      pieBoulder = Morris.Donut({
	element: 'pie-gym-boulder',
	labelColor : "#636159",
	data: [
	  {label: "Done", value: done},
	  {label: "Total", value: all}
	],
	colors : ["#decc00","#636159"]
      }); // Morris
    }

    if (pieSport == null && $("#pie-gym-sport").length) {
      var done = $("#pie-gym-sport").data("done");
      var all = $("#pie-gym-sport").data("all");
      pieSport = Morris.Donut({
	element: 'pie-gym-sport',
	labelColor : "#636159",
	data: [
	  {label: "Done", value: done},
	  {label: "Total", value: all}
	],
	colors : ["#decc00","#636159"]

      }); // Morris
    }

    if (!gymInfoPageListenersInitialized) {
      $(document).on("click",".openfloorplan",function() {
	var gymid = $.jStorage.get("nativeproblematorlocation");
	var myPhotoBrowser = myApp.photoBrowser({
	  backLinkText : '',
	  toolbar : false,
	  zoom: true,
	  photos: [window.api.server+'/problemator/assets/images/floorplans/floorplan_'+gymid+'.png']
	});   
	myPhotoBrowser.open(); // open photo browser
	return false;
      });
      gymInfoPageListenersInitialized = true;
    }
  }
}

var initializeRankingProgressChart = function(load) {

  if (load == undefined) {
    load = true;
  }
  var loadChart = function(_data) {
    window.rankingProgressChart = Morris.Line({
      element: 'ranking_progress',
      data: _data,
      xkey: 'y',
      hideHover : 'always',
      pointSize : 0,
      xLabelAngle : 45,
      xLabelMargin: 1,
      xLabels : 'month',
      lineColors : ['#decc00','#fff'],
      lineWidth : "2px",
      smooth : true,
      yLabelFormat : function(y) {
	return -y;
      },

      ykeys: ['a','b'],

      labels: ['BOULDER','SPORT']
    });
  } //loadChart()

  if (load) {
    var url = window.api.apicallbase + "globalrankingprogress?jsonp=true";
    $.jsonp(url,{uid:window.uid},function(_data) {
      $.jStorage.set("lastLoaded_dashboardcharts",moment()); 
      $.jStorage.set("lastLoaded_globalrankingprogress",moment());
      $.jStorage.set("lastLoaded_globalrankingprogressdata",_data);
      loadChart(_data);
    });
  } else {
    loadChart($.jStorage.get("lastLoaded_globalrankingprogressdata"));
  }
} // initializeChart

var initializeRunningProgressChart = function(load) {
  if (load == undefined) {
    load = true;
  }
  var loadChart = function(_data) {
    window.runningLineChart = Morris.Line({
      element: 'running6mo',
      data: _data,
      xkey: 'y',
      hideHover : 'always',
      pointSize : 0,
      yLabelFormat : function (x) { 
	// ROund to nearest 500
	var near = Math.round(x/500)*500;
	near = window.ggrades[near];
	if (near==undefined) {
	  return "";
	}
	return near;
      },
      lineColors : ['#decc00','#fff'],
      lineWidth : "2px",
      smooth : true,

      xLabelAngle : 45,
      xLabelMargin: 1,
      xLabels : 'month',
      /*
      xLabelFormat : function(x) {
	var objDate = new Date(x);
	var locale = "en-us";
	var short = objDate.toLocaleString(locale, { month: "short" });
	var m = objDate.getMonth()+1;
	var w = objDate.getWeek();
	return w+"";
      //return short.toUpperCase();

      },
      */
      ykeys: ['a','b'],

      labels: ['BOULDER','SPORT']
    });
  } //loadChart()

  if (load) {
    var url = window.api.apicallbase+"json_running6mo_both/";
    $.jsonp(url,{uid : window.uid},function(_data) {
      $.jStorage.set("lastLoaded_dashboardcharts",moment()); 
      $.jStorage.set("lastLoaded_runningprogress",moment());
      $.jStorage.set("lastLoaded_runningprogressdata",_data);
      loadChart(_data);
    });
  } else {
    loadChart($.jStorage.get("lastLoaded_runningprogressdata"));
  }

} // initializeRunningProgressChart

var initializeGradeBarsChart = function(load) {
  var loadChart = function(data) {
    window.runningBarChart = Morris.Bar({
      element : 'running6mobars',
      data : data,
      'gridTextSize' : 8,
      xLabelMargin: 0,

      xkey : 'y',
      hideHover : 'false',
      stacked : true,
      ykeys : ['a','b'],
      labels : ['BOULDER','SPORT'],
      barColors : ['#decc00','#fff'],
    });
  } // loadChart

  if (load) {
    var barurl = window.api.apicallbase+"json_running6mogradebars_both/";
    $.jsonp(barurl,{uid : window.uid},function(_data) {
      $.jStorage.set("lastLoaded_dashboardcharts",moment()); 
      $.jStorage.set("lastLoaded_gradebars",moment());
      $.jStorage.set("lastLoaded_gradebarsdata",_data);
      loadChart(_data);
    });
  } else {
    loadChart($.jStorage.get("lastLoaded_gradebarsdata"));
  }
} // var initializeGradeBarsChart

var initializeDashBoardCharts = function(load) {

  var gradesArr = $.jStorage.get("grades");
  var grades = [];
  var grade;
  for (var idx in gradesArr) {
    grade = gradesArr[idx];
    grades[grade.score*10]=grade.name;
  }
  window.ggrades = grades; //ggrades is not a typo.

  // Load dashboard graphs only once a day (maybe add some invalidating later)
  var lastLoaded = $.jStorage.get("lastLoaded_dashboardcharts"); 
  if (lastLoaded == null) {
    // Assume day before, so the variable gets set and data gets loaded
    lastLoaded = moment().subtract(1,'days');;
  }
  var doLoad =  moment(lastLoaded).isBefore(moment(),'day');
  // Or if they are already initialized, just redraw
  initializeRankingProgressChart(doLoad);
  initializeRunningProgressChart(doLoad);
  initializeGradeBarsChart(doLoad);

}
var addDashBoardListeners = function(pagename) {

  if ("dash"==pagename) {

    // Do every time. Check that some gym is selected.
    var gymid = $.jStorage.get("nativeproblematorlocation");
    if (isNaN(parseInt(gymid))) {
      invokeLocationChangeActionSheet();
    }

    if (!dashBoardListenersInitialized) {

      initializeDashBoardCharts(); 


      myApp.hidePreloader();
      if ($.jStorage.get("whatsnew"+ver)==undefined) {
	$.jStorage.set("whatsnew"+ver,true,{ expires: 7650 });
	myApp.alert("1. Competitions, check upcoming/ongoing competitions on the dashboard.<br />2. Circuits. Complete them!<br />3. Native version from Google Play and App Store!","What's new?");
      }  

      dashBoardListenersInitialized = true;
    } else {
      // Just redraw the charts
      console.log("Trying to REDRAW charts!");
      setTimeout(function() {
	initializeRankingProgressChart(false);
	initializeRunningProgressChart(false);
	initializeGradeBarsChart(false);
      },200);
    }

  } // if pagename
}

var addLoginPageListeners = function(pagename) {
  if (pagename == "login-page" && !loginPageListenersInitialized) {
    loginPageListenersInitialized = true;
  }
}
var addIndexPageListeners = function(pagename,page) {
  // Usually stuff you want to put here, should be placed to global listeners
  // for clarity sake
  if ("index"==pagename && !indexPageListenersInitialized) {
    indexPageListenersInitialized = true;
  }
}


var addProblemsPageListeners = function(pagename) {

  if ("problems-page"==pagename) {
    if (!problemsPageListenersInitialized) {
      $(document).on("click",".swipetick",function(el) {
	$(this).attr("disabled","disabled");
	var self = this;
	var gymid = $("#location").val();
	var tag = $(this).attr("data-tag");
	var pid = $(this).data("pid");
	var parentli = $(el.target).parents("li");
	var url = window.api.apicallbase+"savetick";
	$.jsonp(url,{"problemid" : pid,gymid : gymid},function(back) {
	  myApp.swipeoutClose(parentli); 
	  $("h5[tag="+tag+"]").removeClass("white").addClass("text-y");
	  $("#swipe"+pid+" .item-after").prepend('<span class="fa fa-check problemator-link"></span>');
	  $("#swipe"+pid+" .item-after .fa-close").remove();
	  $(self).removeAttr("disabled");
	});

      });
      $(document).on("click",".see_wallimage",function() {
	var url = $(this).data("href");
	var myPhotoBrowserPage = myApp.photoBrowser({
	  photos : [ url ],
	  type: 'standalone',
	  theme : 'dark',
	  zoom : true,
	  swipeToClose : true,
	  backLinkText: 'Back'
	});
	myPhotoBrowserPage.open();
	return false;
      });

      if ($.jStorage.get("problemlisthelpshown"+ver)==null) {
	// Show problem help
	var problemlistHelp = [
	  {
	    id: 'slide0',
	    picture: '<div class="tutorialicon"><img src="assets/images/help/problemlisthelp1.png" /></div>',
	    text: 'Swipe problem to quick tick a problem (Userful for fast re-ticking). Works only with mobile phone. <a href="#" class="text-y" onclick="helpScreen.next();">Next slide</a>'
	  },
	  {
	    id: 'slide1',
	    picture: '<div class="tutorialicon"><img src="assets/images/help/problemlisthelp2.png" /></div>',
	    text: 'Use Problem tags to quick tick problems. You can tick several at once by separating tags with a comma (,) <a href="#" class="text-y" onclick="helpScreen.next();">Next slide</a>'
	  },
	  {
	    id: 'slide2',
	    picture: '<div class="tutorialicon"><img src="assets/images/help/problemlisthelp3.png" /></div>',
	    text: 'Click a problem to go to the Problem Details -page. There you can rate, grade, tick and give feedback. <a href="#" class="text-y" onclick="helpScreen.next();">Next slide</a>'
	  },
	  {
	    id: 'slide3',
	    picture: '<div class="tutorialicon"><img src="assets/images/help/problemlisthelp4.png" /></div>',
	    text: 'It looks like this. Happy cranking! <a href="#" class="text-y" onclick="helpScreen.close();">Got it!</a>'
	  },
	];
	var options = {
	  'bgcolor': '#30312e',
	  'fontcolor': '#fff'
	}
	$.jStorage.set("problemlisthelpshown"+ver,true);
	window.helpScreen = myApp.welcomescreen(problemlistHelp, options);
      }
      $(document).on("click","#quicktick",function() {
	$(this).attr("disabled","disabled");
	var self = this;
	var gymid = $.jStorage.get("nativeproblematorlocation");

	var probs = $("#quickproblems").val();
	var url = window.api.apicallbase + "saveticks/";
	$.jsonp(url,{"ticks" : probs,gymid : gymid},function(back) {
	  loginCheck(back);
	  myApp.alert(back.message);
	  mainView.router.refreshPage();
	  $(self).removeAttr("disabled");
	});
      });

      problemsPageListenersInitialized = true;
    }

  }
}

window.spinner = 0;
window.compEnded = false;

window.setupTimeLeftTimer = function() {
  // Find the competition end time, and setup timer
  var updateTime = function() {
    var end = $("span.timeleft").data("ends");
    var endTime = moment(end);
    var now = moment();
    var duration = moment.duration(endTime.diff(now));
    var hours = Math.floor(duration.asHours());
    var minutes = Math.floor(duration.minutes());
    if (hours > 0 || now.isAfter(endTime)) {
      if (minutes < 10) {
	minutes = "0"+minutes;
      }
      if (hours < 10) {
	hours = "0"+hours;
      }
      /*
      var chars = "|/-\\|/-\\";
      */
      var chars = " :";
      var spinIndex = window.spinner++ % chars.length;
      var sep = chars[spinIndex];
      $("span.timeleft").html(hours+sep+minutes+" <small class='normal'>left in the competition</small>");
    } else {
      $("span.timeleft").text("Time is up!");
      // Disable all buttons
      //$("button").attr("disabled","disabled");
      window.compEnded = true;
    }
    setTimeout(updateTime,1000);
  }
  setTimeout(updateTime,1000);
}
window.updateDoneAmount = function() {
  var all = $(".comp_problem_list").find("button.donestatus").length;
  var done = $(".comp_problem_list").find("button.done").length;
  $("span.done").html(done+"<small class='ofall normal'>/"+all+"</small>");
}
var addCompetitionPageListeners = function(pagename) {
  if ("competition-page"==pagename) {
    console.log("Adding competition-page listeners");
    // On every comp page listeners should be placed here.
    var end = $("span.timeleft").data("ends");
    var endMom = moment(end);
    var start = $("span.timeleft").data("starts");
    var startMom = moment(start);
    debugger;
    if (moment().isBefore(startMom)) {
      // Remove also the buttons
      $("span.timeleft").text("Competition starts "+moment().to(startMom)+" @"+startMom.format("DD.MM.YYYY HH:mm"));
      $(".item-title button").attr("disabled","disabled");
      $(".item-after button").attr("disabled","disabled");
      window.compEnded = true;
    } else if (moment().isAfter(endMom)) {
      $("span.timeleft").text("Competition has ended");
      $(".item-title button").attr("disabled","disabled");
      $(".item-after button").attr("disabled","disabled");
      window.compEnded = true;
    } else {
      window.setupTimeLeftTimer();
      window.updateDoneAmount();
    }

    // Only once initialized should be here
    if (!competitionPageListenersInitialized) {

      console.log("Adding competition page listeners");


      $(document).on("click",".trieschange",function() {
	var val = -1;
	if ($(this).hasClass("triesplus")) {
	  val = 1;
	}
	var problemid = $(this).siblings("input.tries").data("pid");
	var curval = parseInt($(this).siblings("input.tries").val());
	var newval = curval + val;
	var min = $(this).siblings("input.tries").attr("min") || 1;
	var max = $(this).siblings("input.tries").attr("max") || 10;
	if (newval < min) {
	  newval = min;
	}
	if (newval > max) {
	  newval = max;
	}
	$(this).siblings("input.tries").val(newval);
	// If not done, save to pretick.
	$(this).attr("disabled","disabled");
	var self = $(this);
	if ($(this).parent().parent().parent().find("button.donestatus").hasClass("notdone")) {
	  var self = $(this);
	  var url = window.api.apicallbase + "comp_savepretick/";
	  $.jsonp(url,{compid : $("#compid").val(), problemid : problemid, tries : newval},function(back) {
	    self.removeAttr("disabled");
	    if (back.error) {
	      myApp.alert(back.error);
	      return false;
	    }
	  });
	} else {
	  var self = $(this);
	  // Update try amount in real tick
	  var url = window.api.apicallbase + "comp_savetick/";
	  $.jsonp(url,{compid : $("#compid").val(), problemid : problemid, tries : newval},function(back) {
	    self.removeAttr("disabled");
	    if (back.error) {
	      myApp.alert(back.error);
	      return false;
	    }
	  });
	}
      });

      $(document).on("click",".done, .notdone",function() {
	console.log("clicking done/notdone for problem");
	var tries = $(this).parent().parent().find("input.tries").val();
	var problemid = $(this).parent().parent().find("input.tries").data("pid");
	var self = $(this);
	self.attr("disabled","disabled");
	if ($(this).hasClass("notdone")) {
	  var url = window.api.apicallbase + "comp_savetick/";
	  $.jsonp(url,{compid : $("#compid").val(), problemid : problemid, tries : tries},function(back) {
	    console.log("Saved comp tick");
	    if (back.error) {
	      myApp.alert(back.message);
	      return false;
	    }
	    // Change classes accordingly
	    self.removeClass("notdone");
	    self.removeClass("color-gray");
	    self.addClass("done");
	    self.addClass("color-yellow");
	    self.text("DONE");
	    self.removeAttr("disabled");
	    updateDoneAmount();
	  });
	} else {
	  var url = window.api.apicallbase + "comp_removetick/";
	  $.jsonp(url,{compid : $("#compid").val(), problemid : problemid, tries : tries},function(back) {
	    if (back.error) {
	      myApp.alert(back.error);
	      return false;
	    }
	    // Change classes accordingly
	    self.removeClass("done");
	    self.removeClass("color-yellow");
	    self.addClass("notdone");
	    self.addClass("color-gray");
	    self.text("NOT DONE");
	    self.removeAttr("disabled");
	    updateDoneAmount();
	  });
	}
      });


      competitionPageListenersInitialized = true;
    }
  }
}

var addCompetitionsPageListeners = function(pagename) {
  if ("competitions"==pagename) {
    // Only once initialized should be here
    if (!competitionsPageListenersInitialized) {

      console.log("Adding competitiong page listeners");


      $$(document).on("keyup",".search_competitions",function(e) {
	var val = $(this).val();
	val = val.trim();
	if (val != "" && val.length > 1) {
	  $(".searching").html('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>');
	  // Do a search
	  var url = window.api.apicallbase+"search_competitions";
	  $.jsonp(url,{text : val},function(back) {
	    var ctpl = myApp.templates.search_competitions_hit_item;
	    var html = ctpl({groups : back});    
	    $(".search_results").empty().append(html);

	  });
	}
      });
       competitionsPageListenersInitialized = true;
    }
  }
}

var addGroupPageListeners = function(pagename) {
  if (!groupPageListenersInitialized && "grouplist"==pagename) {
    $$(document).on("click",".accept-invitation",function() {
      var invid = $$(this).data("invid");
      var url = window.api.apicallbase + "acceptinvitation";
      $.jsonp(url,{invid: invid},function(back) {
	myApp.closeModal();
	mainView.router.refreshPage();
      });
      return false;

    });
    $$(document).on("click",".decline-invitation",function() {
      var invid = $$(this).data("invid");
      var url = window.api.apicallbase + "declineinvitation";
      $.jsonp(url,{invid: invid},function(back) {
	myApp.closeModal();
	mainView.router.refreshPage();
      });
      return false;

    });

    $$(document).on("click",".invitation-accept-decline",function()  {
      var invid = $$(this).data("invid");
      var gid = $$(this).data("gid");
      var clickedLink = this;
      var popoverHTML = '<div class="popover invitation-popup">'+
	'<div class="popover-inner">'+
	'<div class="list-block">'+
	'<ul>'+
	'<li><a href="/t/problematormobile/group/'+gid+'" class="item-link list-button accept-invitation" >Open group</a></li>'+
	'<li><a href="#" class="item-link list-button accept-invitation" data-invid="'+invid+'">Accept invitation</a></li>'+
	'<li><a href="#" class="item-link list-button decline-invitation" data-invid="'+invid+'">Decline invitation</a></li>'+
	'<li><a href="#" class="item-link list-button close-popover">Close</a></li>'+
	'</ul>'+
	'</div>'+
	'</div>'+
	'</div>'
      myApp.popover(popoverHTML, clickedLink);
      $$(".invitation-popup").on("opened",function() {
      });
    });
    $$(document).on("click","#creategroup",function() {
      var gname = $("#newgroup").val();
      //var uid = $("#userid").val();
      var url = window.api.apicallbase + "addgroup";
      $.jsonp(url,{name : gname},function(back) {
	if (!back.error) {
	  //  inform about group creation
	  myApp.alert(back.message);
	  mainView.router.refreshPage();
	} else {
	  myApp.alert(back.message);
	}
      });

    });
    $$(document).on("keyup",".search_groups",function(e) {
      var val = $(this).val();
      val = val.trim();
      if (val != "" && val.length > 1) {
	$(".searching").html('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>');
	// Do a search
	var url = window.api.apicallbase+"search_groups";
	$.jsonp(url,{text : val},function(back) {
	  var ctpl = myApp.templates.single_group_search_item;
	  var html = ctpl({groups : back});    
	  $(".search_results").empty().append(html);

	});
      }
    });

    groupPageListenersInitialized = true;
  }
}
var addGroupMemberListeners = function(pagename) {
  if ("list_group_members"==pagename) { 
    if (!groupMemberPageListenersInitialized) {
      $$(document).on("click",".remove_user_from_group",function() {
	var self = $(this);
	var li = $(this).parents("li");
	myApp.confirm("Are you sure?",function() {
	  var url = window.api.apicallbase + "remove_user_from_group";
	  var gid = self.data("gid");
	  var uid = self.data("userid");
	  $.jsonp(url,{gid : gid,uid : uid},function(back) {
	    myApp.alert(back.message);
	    if (!back.error) {
	      // Remove from the list
	      mainView.router.refreshPage();
	    }
	  });
	});
      });
      $$(document).on("keyup",".filter_members",function(e) {
	// 
	var val = $(this).val();
	if (e.which == 27) {
	  $(this).val("");
	  return;
	}
	if (val != "") {
	  $(this).parents(".single_group").find(".groupmembers div.username:not(:contains('"+val+"'))").parents("li").slideUp();
	} else {
	  $(this).parents(".single_group").find(".groupmembers li").show();
	}
      });
      groupMemberPageListenersInitialized = true;
    }
  }
}
var addMoreStatsPageListeners= function(pagename,url) {
  if ("morestats-page"==pagename) { 
    var year = $("#morestatsyear").val();
    var getGradePie = function() {
      var url = window.api.apicallbase + "gradespread";
      $.jsonp(url,{year : year},function(back) {
	var dataset = {data : [], backgroundColor : []};
	var data = {
	  labels : back.labels,
	  datasets : [dataset]
	};
	;
	var i = 0;
	back.data.forEach(function(item) {
	  dataset.data.push(item);
	  dataset.backgroundColor.push(randomColorGenerator());
	});
	var options = {};

	var myPieChart = new Chart($("#gradepie"),{
	  type : 'pie',
	  data : data,
	  options : options}
	);
      });
    }
    getGradePie();

    if (!moreStatsPageListenersInitialized) {
      moreStatsPageListenersInitialized  = true;
    }
  }
}

var addSettingsPageListeners = function(pagename,url) {
  if ("settings-page"==pagename) { 
    if (!settingsPageListenersInitialized) {
      $(document).on("click","#btn_savesettings",function() {
	var self = $(this);
	self.attr("disabled","disabled");
	var url = window.api.apicallbase + "savesettings";
	var formData = myApp.formToJSON($("#frmsettings"));
	server = formData.server;
	$.jStorage.set("server",server);
	if (formData.showinranking && formData.showinranking.length==1) {
	  formData.showinranking =1;
	}
	if (formData.publicascents && formData.publicascents.length==1) {
	  formData.publicascents =1;
	}

	$.jsonp(url,formData,function(back) {
	  self.removeAttr("disabled");

	  myApp.alert(back.message);
	});
	return false;
      });
      settingsPageListenersInitialized  = true;
    }
  }
}
var addSingleGroupPageListeners = function(pagename,url) {
  if ("singlegroup"==pagename && !singleGroupPageListenerInitialized) { 
    console.log("ADDED SINGLEGROUPAGELISTENERS");

    $$(document).on("click",".join_group",function() {
      var gid = $(this).data("gid");
      var url = window.api.apicallbase + "join_group";
      myApp.confirm("Are you sure you want to join this group?",function() {
	$.jsonp(url,{gid : gid},function(back) {
	  myApp.closeModal();
	  myApp.alert(back.message);
	  mainView.router.refreshPage();

	});  
      });
    });

    $$(document).on("click",".leave_group",function() {
      var gid = $(this).data("gid");
      var url = window.api.apicallbase + "leave_group";
      myApp.confirm("Are you sure you want to leave this group?",function() {
	$.jsonp(url,{gid : gid},function(back) {
	  myApp.closeModal();
	  myApp.alert(back.message,"Problemator",function() {
	    mainView.router.back({
	      url : "static/groups.html",
	      ignoreCache : true,
	      force : true
	    })
	  });
	  mainView.router.refreshPage();

	});  
      });
    });

    $$(document).on("click",".groupmenu-open",function() {
      var isme = $(this).data("me") != "";
      var gid = $(this).data("gid");
      var isadmin = $(this).data("isadmin")=="1";
      var iscreator = $(this).data("iscreator")=="1";

      var clickedLink = this;
      var popoverHTML = '<div class="popover groupmenu-popup">'+
	'<div class="popover-inner">'+
	'<div class="list-block">'+
	'<ul>';
      popoverHTML += '<li><a href="static/list_group_members.html?group='+gid+'" class="item-link list-button  close-popover" >Show members</a></li>';
      if (isadmin) {
	popoverHTML += '<li><a href="#" class="item-link list-button  open-groupsettings close-popover" >Edit group</a></li>';
      }
      if (iscreator) {
	popoverHTML += '<li><a href="#" class="item-link list-button  delete_group close-popover" data-gid="'+gid+'">Delete group</a></li>';
      }

      '</ul>'+
	'</div>'+
	'</div>'+
	'</div>'
      myApp.popover(popoverHTML, clickedLink);

      var addGroupMenuPopoverListeners = function() {
	$$(".groupmenu-popup").on("opened",function() {
	  addGroupMenuPopoverListeners();
	});
      }
    });

    $$(document).on("click",".delete_group",function() {
      var gid = $(this).data("gid");
      myApp.confirm("ALL the members, rankings etc. will be deleted.<br /><br />This action cannot be undone.","Are you sure?",function(back) {
	var url = window.api.apicallbase +"delete_group";
	$.jsonp(url,{gid : gid},function(back) {
	  if (!back.error) {
	    mainView.router.refreshPreviousPage();
	    myApp.alert(back.message,function() {
	      mainView.router.refreshPreviousPage();
	      mainView.router.back();
	    });
	  } else {
	    myApp.alert(back.message);
	  }
	});
      },function() {

      });
    });

    $$(document).on("click",".open-groupsettings",function() {
      // Populate settings first
      var desc = $(".groupdesc").text();
      var name = $(".groupname").text();
      var public = $(".public").data("public") == "1";
      var groupid = $(".public").data("groupid");

      $(".popup-groupsettings").find(".fld_name").val(name);
      $(".popup-groupsettings").find(".fld_groupdesc").val(desc);
      $(".popup-groupsettings").find(".fld_public").prop("checked",public);
      $(".popup-groupsettings").find(".fld_groupid").val(groupid);
      myApp.popup('.popup-groupsettings');

    });

    $$(document).on("submit",".frm_groupsettings",function(e) {
      var data = myApp.formToJSON(this);
      var url = window.api.apicallbase + "save_groupsettings";
      $.jsonp(url,data,function(back) {
	myApp.alert(back.message);
	mainView.router.refreshPage();
	mainView.router.refreshPreviousPage();
      });
      return false;
    });
    singleGroupPageListenerInitialized = true;
  }
}


var addInviteMemberPageListeners = function(pagename) {
  if ("invite_group_member"==pagename) { 
    if (!inviteMemberPageListenersInitialized) {
      $$(document).on("click",".send_invitations",function() {
	var emails = $(".invited_email").length;
	if (emails == 0) {
	  myApp.alert("Add email(s) to invite first.");
	  return;
	} else {
	  emails = $(".invited_email").map(function() {
	    return $(this).find(".item-title").text().trim();
	  }).get().join(",");
	  var url = window.api.apicallbase + "send_invitations";
	  var msg = $(".invite_msg").val();
	  var add_admin = $(".add_admin_rights").is(":checked") ? "1" : "0";
	  var groupid = $("#groupid").val();
	  $.jsonp(url,{groupid: groupid, emails : emails,msg : msg, add_admin : add_admin},function(back) {
	    myApp.alert(back.message,"Problemator");
	    if (!back.error) {
	      // Go back 
	      mainView.router.back();
	    }
	  });
	}
      });

      // What to do when plus is clicked and email is added to the list
      $$(document).on("click",".add_invite_email",function() {
	// Validate email and add to emails list.
	var email =  $(this).parent(".item-after").siblings(".item-input").find("input.invite_email").val(); 
	if (email == undefined || !email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
	  myApp.alert("Not a valid email.","Error");
	} else {
	  // Make sure that the placeholder is gone
	  $(".no_emails_yet").remove();

	  // Append to list
	  var html = $(myApp.templates.single_invited_email());
	  $(html).find(".item-title").text(email);
	  $(".invited_emails_list").append(html.html());

	  // And empty the input field.
	  $(this).parent(".item-after").siblings(".item-input").find("input.invite_email").val(""); 

	  // Listener for removing an email from list
	  //
	  $$(".remove_invite_email").on("click",function() {
	    $(this).parents("li").remove();
	  });
	}
      });
      inviteMemberPageListenersInitialized  = true;
    }
  }
};

var addSingleProblemListeners = function(pagename) {

  if ((matches=pagename.match(/problem(\d+)/))) {
    if ($.jStorage.get("problemhelpshown"+ver)==null) {
      // Show problem help
      var problemsHelp = [
	{
	  id: 'slide0',
	  picture: '<div class="tutorialicon"><img src="assets/images/help/savetickhelp1.png" /></div>',
	  text: 'You can change <strong>tick date</strong> by clicking the date above the "SAVE TICK"-button. <a href="#" class="text-y" onclick="problemHelpScreen.next();">Next slide</a>'
	},
	{
	  id: 'slide1',
	  picture: '<div class="tutorialicon"><img src="assets/images/help/savetickhelp2.png" /></div>',
	  text: 'You can manage (=view and delete ) your ticks (after ticking) by clicking MANAGE x TICKS... below the "SAVE TICK"-button <a href="#" class="text-y" onclick="problemHelpScreen.next();">Next slide</a>'
	},
	{
	  id: 'slide2',
	  picture: '<div class="tutorialicon"><img src="assets/images/help/savetickhelp3.png" /></div>',
	  text: 'You can save your <strong>tries</strong> by clicking the spinner up/down and going back. Your tries will be automatically saved! <a href="#" class="text-y" onclick="problemHelpScreen.next();">Next slide</a>'
	},
	{
	  id: 'slide3',
	  picture: '<div class="tutorialicon"><img src="assets/images/help/savetickhelp4.png" /></div>',
	  text: 'Give feedback! Show your like, love and dislike of the problems. Report dirty/dangerous problems and send open feedback to routesetter. <a href="#" class="text-y" onclick="problemHelpScreen.close();">Got it!</a>'
	},
      ];
      var options = {
	'bgcolor': '#30312e',
	'fontcolor': '#fff'
      }
      $.jStorage.set("problemhelpshown"+ver,true);
      window.problemHelpScreen = myApp.welcomescreen(problemsHelp, options);
    }
    // This has to be loaded every time a problem page is loaded.
    var calendarDefault = myApp.calendar({
      input: '#tickdate',
      dateFormat: 'dd.mm.yyyy',
      closeByOutsideClick : true,
      closeOnSelect : true,
    });
    // And this only once
    if (pagename.match(/problem(\d+)/) && !singleProblemListenersInitialized) {

      console.log("SINGLE PROBLEM LISTENERS ADDED ONCE");

      $(document).on("click",".rating_ok",function() {
	var pid = $(this).data("pid");
	var val = $(this).val();
	var title = $(this).attr("title");
	myApp.confirm('Are you sure you want to '+title+'?', function () {
	  var url = window.api.apicallbase + "saveopinion/?opinion="+val;
	  $.jsonp(url,{"opinion" : val, "targetid":pid},function(back) {
	    myApp.alert(back.message);
	  });
	});
      });

      $(document).on("click",".savetick",function() {
	// First, disable this button...
	window.tickSaved = true; // Save global tickSaved state
	var self = $(this);
	$(this).attr("disabled","disabled");
	var pid = $(this).data("id");

	saveTickFunction(this,"savetick",function(back,opt) {
	  self.removeAttr("disabled");
	  if (back.error) {
	    myApp.alert(back.message);
	  }
	  mainView.router.refreshPage();
	  mainView.router.refreshPreviousPage();
	});
	return false;
      });
      // SHow global ascents
      $(document).on("click",".show_global_ascents",function(e) {
	var clickedLink = this;
	var pid = $(this).data("id");
	var url = window.api.apicallbase + "global_ascents/?pid="+pid;
	$.jsonp(url,{pid : pid},function(back) {
	  var ctpl = myApp.templates.global_ascents_popover;
	  var html = ctpl(back);    
	  myApp.popover(html, clickedLink);

	});
      });
      $(document).on("click",".spinnerminus",function() {
	var cur = parseInt($(this).siblings("input").val());
	cur--;
	if (cur <= 0) {
	  cur = 1;
	}
	$(this).siblings("input").val(cur);
      });
      $(document).on("click",".spinnerplus",function() {
	console.log("spinner plus");
	var cur = parseInt($(this).siblings("input").val());
	cur++;
	$(this).siblings("input").val(cur);
      });

      $$(document).on("click",".mark_dangerous",function() {
	// Ask reason and send straight.
	var pid = $(this).data("pid");
	myApp.prompt('What makes the problem dangerous?','Send feedback', function (value) {
	  var url = window.api.apicallbase + "savefeedback/?msgtype=dangerous";
	  $.jsonp(url,{"text" : value, "pid":pid},function(back) {
	    myApp.alert(back,"Message");
	  });
	});
      });
      $$(document).on("click",".mark_dirty",function() {
	// Ask reason and send straight.
	var pid = $(this).data("pid");
	myApp.prompt('Describe dirtyness, if you can. It makes our life easier.','Send feedback', function (value) {
	  var url = window.api.apicallbase + "savefeedback/?msgtype=dirty";
	  $.jsonp(url,{"text" : value, "pid":pid},function(back) {
	    myApp.alert(back);
	  });
	});
      });
      $$(document).on("click",'.prompt-feedback', function () {
	var pid = $(this).data("pid");
	myApp.prompt('You can enter your feedback about the problem, what problems you would like to have or something in general','Send feedback', function (value) {
	  var url = window.api.apicallbase + "savefeedback/?msgtype=message";
	  $.jsonp(url,{"text" : value, "pid":pid},function(back) {
	    myApp.alert(back);
	  });
	});
      });
      $(document).on('click','.open_betavideos_actionsheet', function () {
	var _pid = $(this).attr("pid");
	$.jsonp(window.api.apicallbase+"betavideos/",{pid : _pid},function(betavideos) {
	  var buttons = [
	    {
	      text: 'Choose a betavideo',
	      label: true
	    },
	  ];
	  // ADd videos
	  for (var idx in betavideos) {
	    var v = betavideos[idx];
	    var txt = '<a href="'+v.video_url+'" class="external">'+v.video_url+'</a>';
	    if (v.userid == $("#userid").val()) {
	      txt += '&nbsp; <a class="del_betavideo" href="#" data-vid="'+v.id+'" data-href="#">del</a>';
	    }

	    buttons.push({
	      text : txt,
	      label : true,
	    }); 
	  }

	  // Add cancel
	  buttons.push({
	    text: 'Cancel',
	    color: 'yellow'
	  });

	  myApp.actions(buttons);
	});
	return false;
      }); 

      $(document).on("click",".add_video",function() {
	var pid = $(this).attr("pid");
	myApp.prompt('Paste video url here. Note that you can link video starting from a certain point.<br /><br /><strong>Vimeo:</strong> Click share, click Link and add timecode if needed.<br /><br /><strong>Youtube:</strong> Right click and "Copy video at URL" or "Copy video URL at current time"','Add a betavideo', function (value) {
	  var url = window.api.apicallbase + "savebetavideo/";
	  $.jsonp(url,{"url" : value, "pid":pid},function(back) {
	    myApp.alert(back.message);
	    if (!JSON.stringify(back).match(/error/i)) {
	      mainView.router.refreshPage();
	    }
	  });
	});
	return false;
      });

      $(document).on('click','.del_betavideo', function () {
	var url = window.api.apicallbase +"delbetavideo/";
	var vid = $(this).data("vid");
	$.jsonp(url,{vid : vid},function(back) {
	  // Close the action sheet also
	  myApp.closeModal();
	  myApp.alert(back);
	  mainView.router.refreshPage();
	}); 
	return false;
      });

      //
      //
      // Untick from single problem
      $(document).on("click",".manageticks",function(e) {
	var self = this;
	var pid = $(this).data("pid");
	var url = window.api.apicallbase + "userticks/"; 
	$.jsonp(url,{pid : pid},function(ticks) {

	  var buttons = [
	    {
	      text: 'Tick(s) for the problem',
	      label: true
	    },
	  ];
	  // ADd ticks
	  var now = moment();
	  for (var idx in ticks) {
	    var t = ticks[idx];
	    var mt = moment(t.tstamp);
	    var txt = "<span class='text-w'>";
	    if (t.routetype == 'sport') {
	      txt += ascent_types[t.ascent_type] + " ";
	    }
	    //txt += mt.from(now)+" with "+t.tries+" tries ";
	    txt += mt.format("DD.MM.YYYY")+" with "+t.tries+" tries ";
	    txt += '&nbsp; </span><a data-from="manageticks" class="untick" data-id="'+t.id+'" pid="'+t.problemid+'" href="#" ><span class="fa fa-times"></span></a>';

	    buttons.push({
	      text : txt,
	      label : true,
	    });
	  }

	  // Add cancel
	  buttons.push({
	    text: 'Cancel',
	    color: 'yellow'
	  });

	  myApp.actions(buttons);
	});
	return false;

      });



      singleProblemListenersInitialized = true;
    }
  }

}
var saveTickFunction = function(self,action, callback) {
  var pid = $(self).attr("data-id");
  var grade_opinion = $(self).parents(".page-problem").find(".grade_opinion").val();
  var ascent_type = $(self).parents(".page-problem").find(".ascent_type").val();
  var like = $(self).parents(".page-problem").find("input[name=rating]:checked").val();
  var tickdate = $(self).parents(".page-problem").find(".tickdate").val();
  var tries = $(self).parents(".page-problem").find(".tries").val();
  if (action == undefined) {
    action = "savetick";
  }
  var url = window.api.apicallbase+action+"/";
  var data = {
    "problemid": pid,
    "grade_opinion" : grade_opinion,
    "userid" : $("#userid").val(),
    "tries" : tries,
    "ascent_type" : ascent_type,
    "tickdate" : tickdate,
  };

  $.jsonp(url,data,function(back) {
    if (callback != undefined) {
      callback(back,data);
    }
  });
};

var addRegisterToCompPageListeners = function(pagename) {
  if ("registertocomp-page"==pagename && !registerToCompListenersInitialized) {
    $(document).on("click",".joincomp",function() {
      var self = $(this);
      self.attr("disabled","disabled");

      var formData = myApp.formToJSON($(this).parents("form"));
      // Check that serie is selected
      if ($(".regcategory:checked").length ==0) {
	myApp.alert("Please choose a category first!");
	return false;
      }
      var url = window.api.apicallbase + "joincomp";
      $.jsonp(url,formData,function(back) {
	self.removeAttr("disabled");
	mainView.router.refreshPreviousPage();

	myApp.alert(back.message,function() {
	  if (!back.error) {
	    mainView.router.back();
	  }
	});
      });
    });
    $(document).on("click",".regcategory",function() {
      var opt = $(this);
      var price = opt.data("price");
      var maxparticipants = opt.data("maxparticipants");
      var info = opt.data("info");
      var data = {
	price : price,
	info : info,
	maxparticipants: maxparticipants
      };
      var ctpl = myApp.templates.regcatinfo;
      var html = ctpl(data);
      $("#catinfo").empty().html(html);
    });

    registerToCompListenersInitialized = false;
  }
}
var addForgotPageListeners = function(pagename) {
  if ("forgot-page"==pagename) {
    myApp.hidePreloader();
    myApp.closeModal();
    if (!forgotPageListenersInitialized) {
      forgotPageListenersInitialized = true;
    }
  }
}
var addSignupPageListeners = function(pagename) {

  if ("signup-page"==pagename) {
    myApp.hidePreloader();
    myApp.closeModal();
    if (!signupPageListenersInitialized) {
      signupPageListenersInitialized = true;
    }
  }
}

/**
 * Initialize templates.
 *
 * Templates are initialized here for many reasons instead of having them in index.html
 *
 * For once: They should not be precompiled, but for some reason f7 tries to precompile them
 * and it ends up in JS error and the app fails. So that's why they are here.
 *
 * Second: They are compiled here once and they are then faster to use, because they are
 * not recompiled in preprocess (or somewhere else) when they are used again.
 */
var initializeTemplates = function(myApp) {
  // Register partial for ranking single list item
  Template7.registerPartial('ranking_li','<li data-gender="{{gender}}"> <div class="item-content"> <div class="item-media"> <h5 class="rankingnumber">{{rank}}.</h5> </div> <div class="item-inner"> <div class="item-title body-text-w"> {{#js_compare "this.showinranking==0"}} Secret nuggett {{else}} {{etunimi}} {{sukunimi}} {{/js_compare}} </div> <div class="item-after"> <span class="body-text-g">{{rankpoints}}<br />&asymp;<small>{{yourgrade}}</small></span> </div> </div> </div> </li>');


  // Template for problem global ascents popover
  var t1 = '<div class="popover ascents popover-about"> <div class="popover-angle"></div> <div class="popover-inner"> <div class="content-block"> <h1>Problem ascents <small>{{count}} time(s)</h1> <br /> <p class="body-text-w">Public ascent list</p><br /> <ul > {{#each ascents}} <li>@{{date_format tstamp "DD.MM.YYYY"}} <span class="text-w">{{etunimi}} {{sukunimi}}</span> {{#js_compare "this.a_like > 0"}}<span class="text-w">+{{a_like}} <span class="fa fa-thumbs-up"></span></span>{{/js_compare}}</li> {{else}} No public ascents, yet.  {{/each}} </ul><br /> <span class="text-y">Want to include your own ascents? Go to <a class="text-w" href="#settings">settings</a> page and make your ascents public now!</span> </div> </div> </div> ';
  var ctpl = Template7.compile(t1);
  myApp.templates.global_ascents_popover = ctpl;

  // Template for single invited email
  t1 = '<div> <li class="invited_email"> <div class="item-inner"> <div class="item-title">email address</div> <div class="item-after"><span class="fa fa-minus-square remove_invite_email"></span></div> </div> </li> </div>';
  var ctpl = Template7.compile(t1);
  myApp.templates.single_invited_email = ctpl;

  // Template from single search result item 
  t1 = '{{#if groups}} {{#each groups}} <li> <a href="static/group.html?id={{id}}" data-group="{{id}}" class="item-content item-link"> <div class="item-inner"> <div class="item-title-row"> <div class="item-title text-w">{{name}}</div> <div class="item-after"><span class="fa fa-users"></span>{{usercount}}</div> </div> </div> </a> </li> {{else}} <li> <div class="item-content"> <div class="item-inner"> <div class="item-title text-w">No search results...</div> </div> </div> </li> {{/each}} {{/if}}';
  var ctpl = Template7.compile(t1);
  myApp.templates.single_group_search_item = ctpl;

  // Template for tickarchive ticks in a day
  t1 = `
  <button type="button" class="facebook-button body-text-w button sharetodayticks" data-date="{{date_format tstamp "YYYY-MM-DD"}}">Share day\'s ticks</button>

  <div class="content-block">
  <div class="row ">
   <div class="col-100">
  <button type="button" class="button color-yellow toggle fullwidth" data-target=".trainingsession">Climbing session log details (click to expand) <span class="fa fa-caret-down"></span>
  </div>
   </div> <!-- //row-->
   </div><!-- //content-block-->
  <form method="POST" class="form_trainingsession">
  {{#with session}}
  <div class="trainingsession" style="display : none;">
  <div class="content-block" >
  <div class="row ">
   <div class="col-25">
    <span class="checkin text-center"><span class="fa fa-clock-o"></span> in: 
   </div>
   <div class="col-25">
    <input class="checktime" type="text" name="checkin" id="checkin" value="{{date_format checkin "HH:mm"}}" /></span>
   </div>
   <div class="col-25">
<span class="checkout text-center"><span class="fa fa-clock-o"></span> out: 
   </div>
   <div class="col-25">
    <input class="checktime" type="text" name="checkout" id="checkout" value="{{date_format checkout "HH:mm"}}" /></span>
   </div>
  </div>
  <div class="row ">
   <div class="col-50">
    <button type="button" data-target="#checkin" class="hourpicker problemator-button body-text-w button ">Check-in <span class="fa fa-clock-o"></span></button>
   </div>
   <div class="col-50">
    <button type="button"  data-target="#checkout" class="hourpicker problemator-button body-text-w button ">Check-out <span class="fa fa-clock-o"></span></button>
    </div>
  </div>

  <div class="row ">
   <div class="col-30">
    <span class="checkin text-center">Feeling: </span>
   </div>
   <div class="col-70">
    <span class="text-center"><input type="text" class="feeling input_feeling" name="feeling" placeholder="Not set" value="{{feeling}}" /></span>
   </div>
 </div>
  <div class="row ">
   <div class="col-20">
    <button type="button" data-feeling="1" class="problemator-button body-text-w button feeling"><img src="assets/images/smileys/smile1.png" /></button>
   </div>
   <div class="col-20">
    <button type="button" data-feeling="2" class="problemator-button body-text-w button feeling"><img src="assets/images/smileys/smile2.png" /></button>
   </div>
   <div class="col-20">
    <button type="button" data-feeling="3" class="problemator-button body-text-w button feeling"><img src="assets/images/smileys/smile3.png" /></button>
   </div>
   <div class="col-20">
    <button type="button" data-feeling="4" class="problemator-button body-text-w button feeling"><img src="assets/images/smileys/smile4.png" /></button>
   </div>
   <div class="col-20">
    <button type="button" data-feeling="5" class="problemator-button body-text-w button feeling"><img src="assets/images/smileys/smile5.png" /></button>
   </div>
   </div> <!-- // row -->
  <!-- public notes -->
  <div class="row ">
   <div class="col-50">
    <span class="checkin text-center">Public notes: </span>
   </div>
   </div>
  <div class="row ">
   <div class="col-100">
    <textarea id="publicnotes" name="publicnotes">{{publicnotes}}</textarea>
   </div>
 </div><!-- // row -->
 <!-- //publicnotes -->
  <!-- private notes -->
  <div class="row ">
   <div class="col-50">
    <span class="checkin text-center">Private notes: </span>
   </div>
   </div>
  <div class="row ">
   <div class="col-100">
    <textarea name="privatenotes">{{privatenotes}}</textarea>
   </div>
 </div><!-- // row -->
 <!-- //privatenotes -->
  <div class="row ">
   <div class="col-10">
      <input id="ispublic" type="checkbox" name="ispublic" {{#js_compare "this.ispublic==1"}}checked="checked"{{/js_compare}}  value="1" />
   </div>
   <div class="col-90">
      Show in public profile?
   </div>
   </div>
  <div class="row ">
   <div class="col-100">
   <button type="button" class="savetrainingsession problemator-button button">Save training session</button>
   </div>
   </div> <!-- // row-->
  </div><!-- content-block-->
  </div><!-- trainingsession-->
  {{/with}}
  </form>
  <div class="content-block-title">{{sizeof ticksinday}} tick(s)</div> <ul> {{#if ticksinday}}{{#each ticksinday}} <li class="swipeout"> <div class="swipeout-content"> <a data-problemid="{{problemid}}" href="static/problem.html?id={{problemid}}" class="item-link item-content" > <div class="item-media"> <h5>{{gradename}}</h5> </div> <div class="item-inner"> <div class="item-title"> <span  class="fa fa-square" style="color : {{code}};"></span> <span class="body-text-w">{{substr tag 7}}</span> <span class="body-text">| {{date_format tstamp "HH:mm"}} {{#js_compare "this.routetype==\'sport\'"}}| {{ascent_type_text}}{{else}}| boulder{{/js_compare}}| {{default tries "N/A"}} {{#js_compare "this.tries==1"}}try{{else}}tries{{/js_compare}}</span> </div> <div class="item-after"> <small>{{idx}}</small> <span class="fa fa-chevron-right text-w"></span> </div> </div><!--- end of item-inner --> </a> </div><!-- end of swipeout-content--> <div class="swipeout-actions-right"> <a href="#" data-tag="{{tagshort}}" data-tickid="{{tickid}}" class="swipeuntick swipeout-delete action1">Untick</a> </div> </li> {{else}}<li>No ticks for today</li>{{/each}}{{/if}}</ul></form>`;
  var ctpl = Template7.compile(t1);
  myApp.templates.tickarchive_list = ctpl;

  t1 = ' {{#each this}} <strong>{{@key}}</strong> <div class="list-block"> <div class="list-block-label"> <span>Your ranking is {{default this.rank.rank "unranked"}}. with {{default rank.rankpoints 0}} points</span><br /> {{#js_compare "this.rank.reachnext>0"}} <small>You\'ll need {{rank.reachnext}} points  (={{rank.whatgrade}}) to gain a rank!</small> {{/js_compare}} </div> <div class="list-block-label">Top 10 | {{@key}}</div> <ul> {{#each list}} {{> "ranking_li"}} {{else}} <li>No ranking rows for given ranking</li> {{/each}} </ul> </div><!-- //list-block --> {{/each}}';
  var ctpl = Template7.compile(t1);
  myApp.templates.rankings = ctpl;

  t1 ='{{#if groups}} {{#each groups}} <li> <a href="#" data-compid="{{id}}" class="opencompetitionpage item-content item-link"> <div class="item-inner"> <div class="item-title-row"> <div class="item-title text-w">{{name}}</div> <div class="item-after"><span class="fa fa-users"></span>{{usercount}}</div> </div> </div> </a> </li> {{else}} <li> <div class="item-content"> <div class="item-inner"> <div class="item-title text-w">No search results...</div> </div> </div> </li> {{/each}} {{/if}}';
  var ctpl = Template7.compile(t1);
  myApp.templates.search_competitions_hit_item = ctpl;

  // reg cat info
  t1 = '<br /><br /> <div class="row"> <div class="col-40"> <strong class="text-w">Price</strong> </div> <div class="col-60"> {{price}} </div> </div> <div class="row"> <div class="col-40"> <strong class="text-w">Max participants</strong> </div> <div class="col-60"> {{#js_compare "this.maxparticipants==0"}}Not limited{{else}}{{maxparticipants}}{{/js_compare}} </div> </div> <div class="row"> <div class="col-40"> <strong class="text-w">Info</strong> </div> <div class="col-60"> {{#if info}}{{info}}{{else}}No special info{{/if}} </div> </div>';
  var ctpl = Template7.compile(t1);
  myApp.templates.regcatinfo = ctpl;

}
