var chartsInitialized = false;
var dashboardLineChart = null;
var dashboardBarChart = null;
var pieSport = null;
var pieBoulder = null;
var data_opinions = []; // For problem page Morris chart.
var tickSaved = false;
window.initialized = false;
Template7.registerHelper('stringify', function (context){
	var str = JSON.stringify(context);
	// Need to replace any single quotes in the data with the HTML char to avoid string being cut short
	return str.split("'").join('&#39;');
});

var api = {
  server : "http://beta.problemator.fi",
  api : "/t/problematorapi/",
  version : "v02/",

};
window.api = api;
api.apicallbase = api.server+api.api+api.version;

$.expr[":"].contains = $.expr.createPseudo(function(arg) {
  return function( elem ) {
    return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
  };
});
var loginCheck = function(data) {
  data = JSON.stringify(data);
  if (data && data.match(/Login.failed/i)) {
    myApp.alert("Session expired");
    //mainView.router.load("#index");
    window.uid = null;
    Cookies.remove("loginok");
    myApp.loginScreen();
  }  else {
    window.uid =          Cookies.get("uid");
    $("#userid").val(window.uid);
  }
}
// Initialize your app
var myApp = new Framework7({
  animateNavBackIcon: true,
  // Enable templates auto precompilation
   preprocess: function (content, url, next) {
     var host = window.location.host;

     var pos = -1;
     if ((pos=url.indexOf(host))>0) {
       var remainder = url.substr(pos+host.length);
       if (remainder == "" || remainder=="/") {
         var compiledTemplate = Template7.compile(content);
         return (compiledTemplate({location : $.jStorage.get("locations")}));
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
         if (!Cookies.get("loginok")) {
           return false;
         }
         var compiledTemplate = Template7.compile(content);
         var dataJSON = {group : data};
         next(compiledTemplate(dataJSON));
       });
     } else if ((matches=url.match(/dashboard.html/))) {
       $.jsonp(window.api.apicallbase+"dashinfo/?id="+Cookies.get("uid"),{},function(data) {
         if (!Cookies.get("loginok")) {
           return false;
         }
         loginCheck(data);
         myApp.hidePreloader();
	 $.jStorage.set("climbinfo",data.climbinfo);
         $.jStorage.set("grades",data.grades);
         $.jStorage.set("locations",data.locations);
         var compiledTemplate = Template7.compile(content);
         var html = compiledTemplate(data);
         next(html);
       });
     } else if ((matches=url.match(/gyminfo.html/))) {
       $.jsonp(window.api.apicallbase+"gyminfo/?id="+Cookies.get("nativeproblematorlocation"),{},function(data) {
         var compiledTemplate = Template7.compile(content);
         data.locations = $.jStorage.get("locations");
	 debugger;
	 data.ascentsingyms = $.jStorage.get("climbinfo").ascentsingyms;
         next(compiledTemplate(data));
       });
     } else if ((matches=url.match(/competition.html.*?(\d+)/))) {
       // Load problems page data and compile the template
       //
       var compid = matches[1];
       var url = window.api.apicallbase + "competition/?compid="+compid+"&jsonp=false";
       $.post(url, {}, function (data){ 
         loginCheck(data);
         var dataObj = JSON.parse(data);
         if (dataObj.success) {
         } else {
           myApp.alert(dataObj.msg);
           mainView.router.back();
           return true;
         }
         var compiledTemplate = Template7.compile(content);
         next(compiledTemplate(dataObj));
       });
     } else if ((matches=url.match(/registertocomp.html.*?(\d+)/))) {
       var compid = matches[1];
       var url = window.api.apicallbase + "registertocomp/";
       $.post(url, {compid : compid}, function (data){ 
         loginCheck(data);
         var compiledTemplate = Template7.compile(content);
         var dataJSON = JSON.parse(data);
         next(compiledTemplate(dataJSON));
       });
     } else if ((matches=url.match(/circuits.html/))) {
       // Load problems page data and compile the template
       //
       var url = window.api.apicallbase + "circuits";
       var gymid = Cookies.get("nativeproblematorlocation");
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
         //var dataJSON = {group : JSON.parse(data)};
         next(compiledTemplate({"group" : data}));
       });
     } else if ((matches=url.match(/groups.html/))) {
       // List group members
       var url = window.api.apicallbase + "groups/";
       $.jsonp(url, {}, function (data){
         if (!Cookies.get("loginok")) {
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
       $.jsonp(url, {id : pid}, function (data){ 
         if (!Cookies.get("loginok")) {
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
       return resultContent; 
     }
   },
  //precompileTemplates: true,
  modalTitle : "Problemator",
  pushState: true,
  template7Pages: true,
  init: false //Disable App's automatica initialization
});

// Export selectors engine
var $$ = Dom7;

// Add main View
var mainView = myApp.addView('.view-main', {
  // Disable dynamic Navbar
  dynamicNavbar: true,
});
myApp.onPageBeforeInit('gyminfo', function(page) {
  initPieChartsForGymInfo();
});

$$(document).on('pageInit', function (e) {
	// Check if login ok and go for dashboard init if is.
	//
	if (!window.initialized) {
		// If first initializing, add listeners to listen sidebar menu items
		addIndexPageListeners("index");
		if (Cookies.get("loginok")) {
			myApp.closeModal(".login-screen");
			var uid = Cookies.get("uid");
			$("#userid").val(uid);
			window.uid = uid;
		  // Go here only if the page is empty or it is dashboard...
		  var uri = e.target.baseURI;
		  if (uri.match(/\d+\.\d+.\d+\.\d+.*?\//) || uri.match(/localho.*\//) || uri.match(/dashboard/i)) {
		    indexController.initializeIndexPage();
		  }
		} else {
			addLoginPageListeners();
			myApp.loginScreen();
		}
		window.initialized = true;
	} 
});
myApp.init(); // init app manually after you've attached all handlers
myApp.onPageInit("*",function(page) {
  var pagename = page.name;
  var matches = null;

  if (!Cookies.get("loginok")) {
    return false;
  }
  console.log("Initi: "+pagename);
  addGroupMemberListeners(pagename);
  addInviteMemberPageListeners(pagename);
  addSingleGroupPageListeners(pagename,page.url);
  addGroupPageListeners(pagename);
  addSingleProblemListeners(pagename);
  addProblemsPageListeners(pagename);
  addDashBoardListeners(pagename);
  addCompetitionsPageListeners(pagename);

});


document.addEventListener("deviceready", function(){
	console.log("Device is ready... :)");
},true);


myApp.onPageInit("competition-page",function(page) {
  $(document).ready(function() {
    window.setupTimeLeftTimer();
    window.updateDoneAmount();
  });
});

/*
myApp.onPageBack('*', function(page) {
  var pagename = page.name;
  var matches = null;

  if ((matches=pagename.match(/problem(\d+)/))) {
    if (tickSaved != undefined && !tickSaved) {
      var probid = matches[1];
      // Tick is not saved, save still the stuff as pretick, so user
      // can save amount of tries...
      saveTickFunction($("a.savetick"),'savepretick',function(back) {
        // ADd data ignore cache so that the page will be reloaded if user goes back...
        $("a[data-problemid="+probid+"]").attr("data-ignore-cache","true");
      }); 
    }
  }
});

myApp.onPageInit('tickarchive',function(page) {
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August' , 'September' , 'October', 'November', 'December'];
  $.getJSON("/t/problematormobile/_dates_with_ticks/",{uid : $("#userid").val() },function(datesWithTicks) {
    var evts = [];
    for (var idx in datesWithTicks) {
      var dstr = datesWithTicks[idx];
      dstr += "";
      var m = dstr.split("-");
      var month = parseInt(m[1])-1;
      evts.push(new Date(m[0],month,m[2]));
    }
    var calendarInline = myApp.calendar({
      container: '#calendar-inline-container',
      value: [new Date()],
      weekHeader: true,
      events : evts,

      onDayClick : function(p,dayContainer,year,month,day) {
        // Find events for clicked day.
        month = parseInt(month) + 1;
        var date = year+"-"+month+"-"+day;
        var url = "/t/problematormobile/_tickarchive/";
        $("#tickContainer").load(url,{date : date},function(back) {

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
  });//getJSON

});
*/
/*
 * Page init function for groups page
 */
/*
myApp.onPageInit('grouplist', function(page) {
  // Fetch group list
  var reloadMyGroups = function() {
    $.getJSON(window.api.apicallbase+"mygroups", function(groups) {
      var tpl = $("script#template_mygroup_item").html();
      var ctpl = Template7.compile(tpl);
      var html = ctpl(groups);    
      $("#mygrouplist").empty().append(html);

      $$(".load_single_group").on("click",function() {
        var gid = $$(this).attr("data-group");
        var url = window.api.apicallbase + "group/"+gid;
        $$.getJSON(url, function (data){
          var tpl = $("script#template_single_group").html();
          var ctpl = Template7.compile(tpl);
          var html = ctpl({group : data});    
          mainView.router.loadContent(html);

        });


      });
    });
  }
  var reloadPendingInvitations = function() {
    $.getJSON(window.api.apicallbase+"mypendinginvitations", function(invitations) {
      var tpl = $("script#template_mypendinginvitation_item").html();
      var ctpl = Template7.compile(tpl);
      var html = ctpl({invitations : invitations});    
      $("#mypendinginvitationslist").empty().append(html);
      addInvitationListeners();
    });
  }
  var addInvitationPopoverListeners = function() {
    $$(".accept-invitation").on("click",function() {
      var invid = $$(this).data("invid");
      var url = window.api.apicallbase + "acceptinvitation";
      $.post(url,{invid: invid}).done(function(back) {
        myApp.closeModal();
        reloadPendingInvitations();
        reloadMyGroups();
      });

    });
    $$(".decline-invitation").on("click",function() {
      var invid = $$(this).data("invid");
      var url = window.api.apicallbase + "declineinvitation";
      $.post(url,{invid: invid}).done(function(back) {
        myApp.closeModal();
        reloadPendingInvitations();
      });

    });

  }
  var addInvitationListeners = function() {
    $$(".invitation-accept-decline").on("click",function()  {
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
        addInvitationPopoverListeners();
      });
    });
     
  }
  reloadMyGroups();
  reloadPendingInvitations();
  $$("#creategroup").on("click",function() {
     var gname = $("#newgroup").val();
     //var uid = $("#userid").val();
     var url = window.api.apicallbase + "addgroup";
     $.post(url,{name : gname}).then(function(back) {
       try {
       back = eval("("+back+")");
       } catch(e) {
          back = {error : true, msg : e};
       }
       if (!back.error) {
         //  inform about group creation
         myApp.alert(back.msg,"Message");
         reloadMyGroups();
       } else {
         myApp.alert(back.msg,"Message");
       }
     });

  });
});

myApp.onPageInit('index', function (page) {
  // Confirm terminate account
  $$(".opt-out").on("click",function() {
     myApp.confirm("This action cannot be undone! All your data will be lost.","Are you sure?",function() {
       var url = window.api.apicallbase + "terminate_account";
        $.get(url).done(function(back) {
           myApp.alert(back);
           setTimeout(function() {
             document.location.href="/t/problematormobile/login";
           },5000);
        });
     });
  });
  // ASk user to select a gym, if not selected...
  var curloc = $("#curloc").text();
  if (""==curloc) {
    myApp.alert("Please go to <a href='#gyminfo'>Gym Info</a> and select a gym","Gym not selected");
    mainView.router.loadPage("#gyminfo");
  }
  $(document).ready(function() {
    // give the EU statement...
    var ver = $("#ver").val();
    if (Cookies.get("whatsnew"+ver)==undefined) {
      Cookies.set("whatsnew"+ver,true,{ expires: 7650 });
      myApp.alert("1. Groups! You can add groups and invite your friends to groups and have a fun and friendly competition!.<br />2. It's easier to manage your ticks. Just click 'Manage Ticks' from a problem page.<br />3. You can change your tick date when saving a tick.<br />4. Ranking progress on dashboard. If you want to see how you progress (or regress) in your ranks :)","What's new?");
    }  
    if (Cookies.get("eucookie")==undefined) {
      myApp.addNotification({
        title: 'This app uses cookies',
        message: 'Our app uses cookies so that it works. By using the app you accept the use of cookies.',
        onClose: function () {
          Cookies.set("eucookie",true,{ expires: 7650 });
        }
      });
    }
  });


  if (!chartsInitialized) {
    chartsInitialized = true;
    //				$('.sparkpie').sparkline('html', { type: 'pie', height: '1.0em' });

    var grades = [];
    grades["0"] = "0";
    grades["500"] = "1";
    grades["1000"] = "2";
    grades["1500"] = "3+";
    grades["2000"] = "4";
    grades["2500"] = "4+";
    grades["3000"] = "5";
    grades["3500"] = "5+";
    grades["4000"] = "6a";
    grades["4500"] = "6a+";
    grades["5000"] = "6b";
    grades["5500"] = "6b+";
    grades["6000"] = "6c";
    grades["6500"] = "6c+";
    grades["7000"] = "7a";
    grades["7500"] = "7a+";
    grades["8000"] = "7b";
    grades["8500"] = "7b+";
    grades["9000"] = "7c";
    grades["9500"] = "7c+";
    grades["10000"] = "8a";
    grades["10500"] = "8a+";
    grades["11000"] = "8b";
    grades["11500"] = "8b+";
    grades["12000"] = "8c";
    grades["12500"] = "8c+";
    grades["13000"] = "9a";

    var url = window.api.apicallbase + "globalrankingprogress";
    $.getJSON(url,{},function(_data) {
      dashboardLineChart = Morris.Line({
        element: 'ranking_progress',
        data: _data,
        xkey: 'y',
        hideHover : 'always',
        pointSize : 0,
        lineColors : ['#decc00','#bfb6a8'],
        lineWidth : "2px",
        smooth : true,

        xLabelFormat : function(x) {
          var objDate = new Date(x);
          var locale = "en-us";
          var short = objDate.toLocaleString(locale, { month: "short" });
          return short.toUpperCase();

        },
        ykeys: ['a','b'],

        labels: ['BOULDER','SPORT']
      });
    });
    var url = "/t/problematormobile/json_running6mo_both/?userid="+$("#userid").val();
    $.get(url,{},function(_data) {

      dashboardLineChart = Morris.Line({
        element: 'running6mo',
        data: _data,
        xkey: 'y',
        hideHover : 'always',
        pointSize : 0,
        yLabelFormat : function (x) { 
          // ROund to nearest 500
          var near = Math.round(x/500)*500;
          return grades[near];
        },
        lineColors : ['#decc00','#bfb6a8'],
        lineWidth : "2px",
        smooth : true,

        xLabelFormat : function(x) {
          var objDate = new Date(x);
          var locale = "en-us";
          var short = objDate.toLocaleString(locale, { month: "short" });
          return short.toUpperCase();

        },
        ykeys: ['a','b'],

        labels: ['BOULDER','SPORT']
      });
    }); // get

    var barurl = "/t/problematormobile/json_running6mogradebars_both/";
    if ($("#running6mobars").length) {
      $.get(barurl,{},function(back) {
        dashboardBarChart = Morris.Bar({
          element : 'running6mobars',
          data : back,
          'gridTextSize' : 8,
          xLabelMargin: 0,

          xkey : 'y',
          hideHover : 'false',
          stacked : true,
          ykeys : ['a','b'],
          labels : ['BOULDER','SPORT'],
          barColors : ['#decc00','#bfb6a8'],
        });
      });
    }

  }	

});

*/

var loginCheck = function(data) {
  data = JSON.stringify(data);
  if (data && data.match(/Login.failed/i)) {
    myApp.alert("Session expired");
    //mainView.router.load("#index");
    window.uid = null;
    Cookies.remove("loginok");
    myApp.loginScreen();
  }  else {
    window.uid =          Cookies.get("uid");
    $("#userid").val(window.uid);
  }
}
$.jsonp = function(url,_data,callback,options) {
  var _method = 'GET';
  if (options && options.method) {
    _method = options.method;
  }
 $.ajax({
   method : _method,
        url : url,
        jsonp : 'callback',
        dataType : 'jsonp',
        data : _data,
        withCredentials : true,
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
}
