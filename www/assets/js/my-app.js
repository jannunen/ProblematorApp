
var chartsInitialized = false;
var dashboardLineChart = null;
var dashboardBarChart = null;
var pieSport = null;
var pieBoulder = null;
var data_opinions = []; // For problem page Morris chart.
var tickSaved = false;
var api = {
  server : "https://"+window.location.hostname,
  api : "/t/problematorapi/",
  version : "v01/",

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
     if ((matches=url.match(/problematormobile\/group\/(\d+)/i))) {
       var groupid = matches[1];
       var url = window.api.apicallbase + "group/";
       $.post(url, {id : groupid}, function (data){ 
         var compiledTemplate = Template7.compile(content);
         var dataJSON = {group : JSON.parse(data)};
         next(compiledTemplate(dataJSON));
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
       $.post(url, {}, function (data){ 
         var compiledTemplate = Template7.compile(content);
         var dataJSON = JSON.parse(data);
         next(compiledTemplate(dataJSON));
       });
     } else if ((matches=url.match(/circuit.html.*?(\d+)/))) {
       var circuitid = matches[1];
       var url = window.api.apicallbase + "circuit?id="+circuitid;
       $.post(url, {}, function (data){ 
         var compiledTemplate = Template7.compile(content);
         var dataJSON = JSON.parse(data);
         next(compiledTemplate(dataJSON));
       });
     } else if ((matches=url.match(/problems.html/))) {
       // Load problems page data and compile the template
       //
       var url = window.api.apicallbase + "problems/";
       $.post(url, {}, function (data){ 
         var compiledTemplate = Template7.compile(content);
         var dataJSON = {walls : JSON.parse(data)};
         next(compiledTemplate(dataJSON));
       });
     } else if ((matches=url.match(/competitions.html/))) {
       var url = window.api.apicallbase + "mycompetitions/";
       $.post(url, {}, function (data){ 
         var compiledTemplate = Template7.compile(content);
         var dataJSON = JSON.parse(data);
         next(compiledTemplate(dataJSON));
       });
     } else if ((matches=url.match(/invite_member.html.*?(\d+)/))) {
       var groupid = matches[1];
       var url = window.api.apicallbase + "group/";
       $.post(url, {id : groupid}, function (data){ 
         var compiledTemplate = Template7.compile(content);
         var dataJSON = {group : JSON.parse(data)};
         next(compiledTemplate(dataJSON));
       });
     } else if ((matches=url.match(/list_group_members.html.*?(\d+)/))) {
       // List group members
       var groupid = matches[1];
       var url = window.api.apicallbase + "list_group_members/";
       $.post(url, {id : groupid}, function (data){ 
         var compiledTemplate = Template7.compile(content);
         var dataJSON = {"group" : JSON.parse(data)};
         var html = compiledTemplate(dataJSON);
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
  precompileTemplates: true,
  // Enabled pages rendering using Template7
  swipeBackPage: true,
  pushState: true,
  template7Pages: true,
  init: false //Disable App's automatica initialization
});

// Export selectors engine
var $$ = Dom7;

// Add main View
var mainView = myApp.addView('.view-main', {
  // Disable dynamic Navbar
  dynamicNavbar: false,
  domCache : true,

});
$$("#frm_forgot").on("submitted",function(e) {
  var xhr = e.detail.xhr; // actual XHR object
  var data = e.detail.data; 
  myApp.alert(data, 'Info');
});


$$("#frm_signup").on("submitted",function(e) {
  var xhr = e.detail.xhr; // actual XHR object
  var data = e.detail.data; 
  myApp.alert(data, 'Info');
});
$$("#frmsettings").on("submitted",function(e) {
  var xhr = e.detail.xhr; // actual XHR object
  var data = e.detail.data; 
  myApp.alert(data, 'Info');
});


$$("#check-user").on("beforeSubmit",function(e) {
  // Nokia's Lumia phones don't really care about html5's required="required" -attribute, so 
  // the selected gym has to be checked manually.
  if ($("#problematorlocation").val()=="") {
    myApp.alert("Please select a gym","Gym not selected");
    var xhr = e.detail.xhr; 
    xhr.abort();
    return false;
  }
});

$$("#check-user").on("submitted",function(e) {

  var xhr = e.detail.xhr; // actual XHR object
  var data = e.detail.data; 
  if (data.match(/^\d+$/)) {
    document.location.href="/t/problematormobile/index/"+data+"/";
  } else {
    myApp.alert(data, 'Info');
  }
});


myApp.onPageReinit('gyminfo', function(page) {
  //initPieChartsForGymInfo();
});
myApp.onPageBeforeInit('gyminfo', function(page) {
  initPieChartsForGymInfo();
});


var initPieChartsForGymInfo = function() {

  // For gym info donut
  if (pieBoulder == null && $("#pie-gym-boulder").length) {
    pieBoulder = Morris.Donut({
      element: 'pie-gym-boulder',
      labelColor : "#636159",
      data: [
        {label: "Done", value: boulderdone},
        {label: "Total", value: boulderall}
      ],
      colors : ["#decc00","#636159"]
    }); // Morris
  }

  if (pieSport == null && $("#pie-gym-sport").length) {
    pieSport = Morris.Donut({
      element: 'pie-gym-sport',
      labelColor : "#636159",
      data: [
        {label: "Done", value: sportdone},
        {label: "Total", value: sportall}
      ],
      colors : ["#decc00","#636159"]

    }); // Morris
  }

  pieSport.redraw();
  pieBoulder.redraw();

}
myApp.onPageInit("competition-page",function(page) {
  $(document).ready(function() {
    window.setupTimeLeftTimer();
    window.updateDoneAmount();
  });
});
myApp.onPageInit("*",function(page) {
  var pagename = page.name;
  var matches = null;
  addGroupMemberListeners(pagename);
  addInviteMemberPageListeners(pagename);
  addSingleGroupPageListeners(pagename,page.url);
  addGroupPageListeners(pagename);
  addProblemsPageListeners(pagename);
  addCompetitionsPageListeners(pagename);
  
});
  // If page name is group/x, then load data

myApp.onPageBeforeAnimation('*', function (page) {
  var pagename = page.name;
  var matches = null;

});

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
/*
 * Page init function for groups page
 */
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

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
  // Do something here for "about" page

});

var loadGradeDist = function(page) {
  if (page.name == null) {
    return;
  }
  /** Loads the grade distribution for selected problem page **/
  var pagename = page.name;
  var matches = null;
  // If matches single problem
  if ((matches=pagename.match(/problem(\d+)/))) {
    // Add listeners for dirty, dangerous and message.
    var probid = matches[1];
    (function(pid) {

      $$(".mark_dangerous").on("click",function() {
        // Ask reason and send straight.
        myApp.prompt('What makes the problem dangerous?','Send feedback', function (value) {
          var url = "/t/problematormobile/savefeedback/?msgtype=dangerous";
          $.post(url,{"text" : value, "problemid":pid},function(back) {
            myApp.alert(back,"Message");
          });
        });

      }); 
      $$(".mark_dirty").on("click",function() {
        // Ask reason and send straight.
        myApp.prompt('Describe dirtyness, if you can. It makes our life easier.','Send feedback', function (value) {
          var url = "/t/problematormobile/savefeedback/?msgtype=dirty";
          $.post(url,{"text" : value, "problemid":pid},function(back) {
            myApp.alert(back,"Message");
          });
        });
      }); 
    })(probid);
    var calendarDefault = myApp.calendar({
          input: '#tickdate',
          dateFormat: 'dd.mm.yyyy',
          closeByOutsideClick : true,
          closeOnSelect : true,
    });  
    tickSaved = false;
    var probid = matches[1];
    (function(pid) {
    $$('.prompt-feedback').on('click', function () {
      myApp.prompt('You can enter your feedback about the problem, what problems you would like to have or something in general','Send feedback', function (value) {
        var url = "/t/problematormobile/savefeedback/?msgtype=message";
        $.post(url,{"text" : value, "problemid":pid},function(back) {
          myApp.alert(back,"All is golden");
        });
      });
    })
    })(probid);
    var url = "/t/problematormobile/gradedist/?id="+probid;
    $.getJSON(url,{},function(data_opinions) {

      Morris.Bar({
        element: 'opinions'+probid,
        hideHover : 'always',
        'gridTextSize' : 10,
        xLabelMargin: 2,
        axes : true,
        grid : false,
        barColors : ['#decc00'],
        data: data_opinions,
        xkey: 'y',
        ykeys: ['a'],
        labels: ['Grade opinions']
      });
    });
  }
}

myApp.onPageBeforeInit('*',function(page) {
  loadGradeDist(page);
});

//And now we initialize app
myApp.init();
$$(".popup-problem").on("open",function(tgt) {
  var tdiv = $(tgt.target);
  var pid = $(tdiv).attr("data-id");
  var grade = $(tdiv).attr("data-grade");

  // Instantiate grade rating picker
  var pickerDevice = myApp.picker({
    input: '#problemstars_'+pid,
    cols: [
      {
        textAlign: 'center',
        values: ['Nothing Special', 'Climbs a-ok', 'Better than average', 'Very good, unique, excellent', 'One of the best problems ever!']
      }
    ],
    onOpen : function (picker) {
      var col0 = picker.cols[0].values;
      picker.setValue(['Climbs a-ok']);
    }
  });


  // Instantiate grade opinion picker.
  var pickerDevice = myApp.picker({
    input: '#grade_opinion['+pid+']',
    cols: [
      {
        textAlign: 'center',
        values: ['4', '4+', '5', '5+', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+','7b','7b+','7c','7c+','8a','8a+','8b','8b+','8c','8c+','9a','9a+','9b','9b+','9c']
      }
    ],
    onOpen : function (picker) {
      var col0 = picker.cols[0].values;
      picker.setValue([grade]);
    }
  });
});



