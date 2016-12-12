var singleProblemListenersInitialized = false;
var problemsPageListenersInitialized = false;
var dashBoardListenersInitialized = false;
var loginPageListenersInitialized = false;
var indexPageListenersInitialized = false;
var groupPageListenersInitialized = false;
var singleGroupPageListenersInitialized = false;
var groupMemberPageListenersInitialized = false;
var inviteMemberPageListenersInitialized = false;

var indexController= {
  initializeIndexPage : function() { 
    // Data is set in my-app preprocess -function
    mainView.router.load({
      url: 'static/dashboard.html',
      ignoreCache : true,
      reload : true
    });
  }
}
var addDashBoardListeners = function(pagename) {
  if ("dash"==pagename && !dashBoardListenersInitialized) {
    debugger;
    myApp.hidePreloader();
    if (Cookies.get("whatsnew"+ver)==undefined) {
      Cookies.set("whatsnew"+ver,true,{ expires: 7650 });
      myApp.alert("1. Groups! You can add groups and invite your friends to groups and have a fun and friendly competition!.<br />2. It's easier to manage your ticks. Just click 'Manage Ticks' from a problem page.<br />3. You can change your tick date when saving a tick.<br />4. Ranking progress on dashboard. If you want to see how you progress (or regress) in your ranks :)","What's new?");
    }  
    if (!chartsInitialized) {
      chartsInitialized = true;

      var gradesArr = $.jStorage.get("grades");
      var grades = [];
      var grade;
      for (var idx in gradesArr) {
        grade = gradesArr[idx];
        grades[grade.score*10]=grade.name;
      }
      window.ggrades = grades;


      var url = window.api.apicallbase + "globalrankingprogress?jsonp=true";
      $.jsonp(url,{uid:window.uid},function(_data) {
        dashboardLineChart = Morris.Line({
          element: 'ranking_progress',
          data: _data,
          xkey: 'y',
          hideHover : 'always',
          pointSize : 0,
          lineColors : ['#decc00','#bfb6a8'],
          lineWidth : "2px",
          smooth : true,
          yLabelFormat : function(y) {
            return -y;
          },

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
      var url = window.api.apicallbase+"json_running6mo_both/";
      $.jsonp(url,{uid : window.uid},function(_data) {

        dashboardLineChart = Morris.Line({
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

      var barurl = window.api.apicallbase+"json_running6mogradebars_both/";
      if ($("#running6mobars").length) {
        $.jsonp(barurl,{uid : window.uid},function(back) {
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
    dashBoardListenersInitialized = true;
  } // if pagename
}

var addDashBoardListeners = function(pagename) {
  if ("dash"==pagename && !dashBoardListenersInitialized) {
    debugger;
    myApp.hidePreloader();
    if (Cookies.get("whatsnew"+ver)==undefined) {
      Cookies.set("whatsnew"+ver,true,{ expires: 7650 });
      myApp.alert("1. Groups! You can add groups and invite your friends to groups and have a fun and friendly competition!.<br />2. It's easier to manage your ticks. Just click 'Manage Ticks' from a problem page.<br />3. You can change your tick date when saving a tick.<br />4. Ranking progress on dashboard. If you want to see how you progress (or regress) in your ranks :)","What's new?");
    }  
    if (!chartsInitialized) {
      chartsInitialized = true;

      var gradesArr = $.jStorage.get("grades");
      var grades = [];
      var grade;
      for (var idx in gradesArr) {
        grade = gradesArr[idx];
        grades[grade.score*10]=grade.name;
      }
      window.ggrades = grades;


      var url = window.api.apicallbase + "globalrankingprogress?jsonp=true";
      $.jsonp(url,{uid:window.uid},function(_data) {
        dashboardLineChart = Morris.Line({
          element: 'ranking_progress',
          data: _data,
          xkey: 'y',
          hideHover : 'always',
          pointSize : 0,
          lineColors : ['#decc00','#bfb6a8'],
          lineWidth : "2px",
          smooth : true,
          yLabelFormat : function(y) {
            return -y;
          },

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
      var url = window.api.apicallbase+"json_running6mo_both/";
      $.jsonp(url,{uid : window.uid},function(_data) {

        dashboardLineChart = Morris.Line({
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

      var barurl = window.api.apicallbase+"json_running6mogradebars_both/";
      if ($("#running6mobars").length) {
        $.jsonp(barurl,{uid : window.uid},function(back) {
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
    dashBoardListenersInitialized = true;
  } // if pagename
}
var addLoginPageListeners = function(pagename) {
  if (!loginPageListenersInitialized) {
    $$('.loginbutton').on('click', function (e) {
      if ($("#problematorlocation").val()=="") {
        myApp.alert("Please select a gym","Gym not selected");
        return false;
      }
      var username = $(this).parents("form").find('input[name="username"]').val();
      var password = $(this).parents("form").find('input[name="password"]').val();
      var loc = $(this).parents("form").find("#problematorlocation").val();
      // Handle username and password
      var url = window.api.apicallbase + "dologin?native=true"; 
      $.jsonp(url,{"username": username,"password":password,"problematorlocation" : loc, "authenticate" : true},function(data) {
        try {
          debugger;
          if (data && data.loc) {
            // Set api-auth-token also
            $.ajaxSetup({
              headers : {'api-auth-token' : data.token}
            });
            $$.ajaxSetup({
              headers : {'api-auth-token' : data.token}
            });
              
            Cookies.set("nativeproblematorlocation",data.loc);
            Cookies.set("loginok",true);
            Cookies.set("uid",data.uid);
            window.uid = data.uid;
            // Initialize index page.
            myApp.closeModal();
            myApp.showPreloader('Hang on, initializing app.');
            indexController.initializeIndexPage();
          } else {
            myApp.alert(data.message);
          }
        } catch(e) {
          myApp.alert(data);
        }
      });
    });
    loginPageListenersInitialized = true;
  }
}
var addIndexPageListeners = function(pagename,page) {
  if ("index"==pagename && !indexPageListenersInitialized) {
    $$(".btn_logout").on("click",function() {
      debugger;
      Cookies.remove("loginok");
      Cookies.remove("uid");
      window.uid = null;
      $("#userid").val("");
      myApp.closePanel();
      myApp.loginScreen();

    });
    // Confirm terminate account
    $$(".opt-out").on("click",function() {
      myApp.confirm("This action cannot be undone! All your data will be lost.","Are you sure?",function() {
        var url = window.api.apicallbase + "terminate_account";
        $.get(url).done(function(back) {
          myApp.alert(back);
          setTimeout(function() {
            document.location.href="/index.html";
          },5000);
        });
      });
    });
    indexPageListenersInitialized = true;
  }

}




var   addProblemsPageListeners = function(pagename) {

  if ("problems-page"==pagename) {
    if (!problemsPageListenersInitialized) {
      problemsPageListenersInitialized = true;
    }

  }
}


var addCompetitionsPageListeners = function(pagename) {
  if ("competitions"==pagename) {
    $$(".search_competitions").on("keyup",function(e) {
      var val = $(this).val();
      val = val.trim();
      if (val != "" && val.length > 1) {
        $(".searching").html('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>');
        // Do a search
        var url = window.api.apicallbase+"search_competitions";
        $.getJSON(url,{text : val},function(back) {
          var tpl = $("script#search_competitions_hit_item").html();
          var ctpl = Template7.compile(tpl);
          var html = ctpl({groups : back});    
          $(".search_results").empty().append(html);
           
        });
      }
    });

  }
}

var addGroupPageListeners = function(pagename) {
  if ("grouplist"==pagename) {
    $$(".search_groups").on("keyup",function(e) {
      var val = $(this).val();
      val = val.trim();
      if (val != "" && val.length > 1) {
        $(".searching").html('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>');
        // Do a search
        var url = window.api.apicallbase+"search_groups";
        debugger;
        $.jsonp(url,{text : val},function(back) {
          var tpl = $("script#search_groups_hit_item").html();
          var ctpl = Template7.compile(tpl);
          var html = ctpl({groups : back});    
          $(".search_results").empty().append(html);
           
        });
      }
    });
     
  }
}
var addGroupMemberListeners = function(pagename) {
  if ("list_group_members"==pagename) { 
    $$(".remove_user_from_group").on("click",function() {
      var self = $(this);
      var li = $(this).parents("li");
      myApp.confirm("Are you sure?",function() {
        var url = window.api.apicallbase + "remove_user_from_group";
        var gid = self.data("gid");
        var uid = self.data("userid");
        $.jsonp(url,{gid : gid,uid : uid},function(back) {
          myApp.alert(back);
          if (back.match(/removed from/i)) {
            // Remove from the list
            mainView.router.refreshPage();
          }
        });
      });
    });
    $$(".filter_members").on("keyup",function(e) {
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
  }
}
var addSingleGroupPageListeners = function(pagename,url) {
  if ("singlegroup"==pagename) { 
    addGroupLeaveJoinListeners();
    $$(".groupmenu-open").on("click",function() {
      var isme = $(this).data("me") != "";
      var gid = $(this).data("gid");
      var isadmin = $(this).data("isadmin")=="1";
      var iscreator = $(this).data("iscreator")=="1";

      var clickedLink = this;
       var popoverHTML = '<div class="popover groupmenu-popup">'+
                  '<div class="popover-inner">'+
                  '<div class="list-block">'+
                  '<ul>';
                  popoverHTML += '<li><a href="/list_group_members.html?group='+gid+'" class="item-link list-button  close-popover" >Show members</a></li>';
       if (isadmin) {
                  popoverHTML += '<li><a href="#" class="item-link list-button  open-groupsettings close-popover" >Edit group</a></li>';
       }
       if (iscreator) {
                  popoverHTML += '<li><a href="#" class="item-link list-button  delete_group close-popover" data-gid="'+gid+'">Delete group</a></li>';
       }

        if (isme) {
                  popoverHTML += '<li><a href="#" class="item-link list-button leave_group close-popover"  data-gid="'+gid+'">Leave group</a></li>';
        } else {
                  popoverHTML += '<li><a href="#" class="item-link list-button join_group close-popover" data-gid="'+gid+'">Join group</a></li>';
        }
                    popoverHTML += '<li><a href="#" class="item-link list-button close-popover">Close menu</a></li>'+
                  '</ul>'+
                  '</div>'+
                  '</div>'+
                  '</div>'
              myApp.popover(popoverHTML, clickedLink);
              var addGroupMenuPopoverListeners = function() {
                addGroupLeaveJoinListeners();
                $$(".delete_group").on("click",function() {
                  var gid = $(this).data("gid");
                  myApp.confirm("ALL the members, rankings etc. will be deleted.<br /><br />This action cannot be undone.","Are you sure?",function(back) {
                    var url = window.api.apicallbase +"delete_group";
                    $.jsonp(url,{gid : gid},function(back) {
                      myApp.alert(back,"Message",function() {
                        mainView.router.back();
                      });
                      mainView.router.refreshPreviousPage();
                    });
                  },function() {
                     
                  });
                });
                $$(".open-groupsettings").on("click",function() {
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

              };
              $$(".groupmenu-popup").on("opened",function() {
                  addGroupMenuPopoverListeners();
                });
    });
    
    
    $$(".frm_groupsettings").on("submit",function(e) {
       var data = myApp.formToJSON(this);
       var url = window.api.apicallbase + "save_groupsettings";
       $.jsonp(url,data,function(back) {
         myApp.alert(back,"Message");
         mainView.router.refreshPage();
       });
       return false;
    });
  }
}


var addGroupLeaveJoinListeners = function() {
  $$(".join_group").on("click",function() {
    var gid = $(this).data("gid");
    var url = window.api.apicallbase + "join_group";
    myApp.confirm("Are you sure you want to join this group?",function() {
      $.jsonp(url,{gid : gid},function(back) {
        myApp.closeModal();
        myApp.alert(back,"Message");
        mainView.router.refreshPage();

      });  
    });
  });
  $$(".leave_group").on("click",function() {
    var gid = $(this).data("gid");
    var url = window.api.apicallbase + "leave_group";
    myApp.confirm("Are you sure you want to leave this group?",function() {
      $.jsonp(url,{gid : gid},function(back) {
        myApp.closeModal();
        myApp.alert(back,"Message",function() {
          mainView.router.back();
        });
        mainView.router.refreshPage();
        mainView.router.refreshPreviousPage();

      });  
    });
  });
}
var addInviteMemberPageListeners = function(pagename) {
  if ("invite_group_member"==pagename) { 
    // What to do when plus is clicked and email is added to the list
    $$(".add_invite_email").on('click',function() {
      // Validate email and add to emails list.
      var email =  $(this).parent(".item-after").siblings(".item-input").find("input.invite_email").val(); 
      if (email == undefined || !email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
        myApp.alert("Not a valid email.","Error");
      } else {
        // Make sure that the placeholder is gone
        $(".no_emails_yet").remove();

        // Append to list
        var html =$( $("script#single_invited_email").html());
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

    $$(".send_invitations").on("click",function() {
       var emails = $(".invited_email").length;
       if (emails == 0) {
         myApp.alert("Add email(s) to invite first.","Notification");
         return;
       } else {
         emails = $(".invited_email").map(function() {
           return $(this).find(".item-title").text().trim();
         }).get().join(",");
          var url = window.api.apicallbase + "send_invitations";
          var msg = $(".invite_msg").val();
          var add_admin = $(".add_admin_rights").is(":checked") ? "1" : "0";
          var groupid = $("#groupid").val();
          $.jsonjsonp(url,{groupid: groupid, emails : emails,msg : msg, add_admin : add_admin}).done(function(back) {
            var dataJSON =  JSON.parse(back);
            myApp.alert(dataJSON.msg,"Message");
            // Go back 
            mainView.router.back();
          });
       }
    });
  }
};

var addSingleProblemListeners = function(pagename) {

  // If matches single problem
  if ((matches=pagename.match(/problem(\d+)/)) && !singleProblemListenersInitialized) {
    // Add listeners for dirty, dangerous and message.
    var probid = matches[1];
    (function(pid) {
      // SHow global ascents
      $(document).on("click",".show_global_ascents",function(e) {
	var clickedLink = this;
	var pid = $(this).data("id");
	var url = window.api.apicallbase + "global_ascents/?pid="+pid;
	$.jsonp(url,{pid : pid},function(back) {
	  var tpl = $("script#global_ascents_popover").html();
	  var ctpl = Template7.compile(tpl);
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
        var cur = parseInt($(this).siblings("input").val());
        cur++;
        $(this).siblings("input").val(cur);
      });

      $(document).on("click","#btn_savesettings",function() {
        $("#frmsettings").ajaxSubmit(function(back) {
          myApp.alert(back, 'Info');

        });
        return false;
      });
      $$(".mark_dangerous").on("click",function() {
        // Ask reason and send straight.
        myApp.prompt('What makes the problem dangerous?','Send feedback', function (value) {
          var url = window.api.apicallbase + "savefeedback/?msgtype=dangerous";
          $.jsonp(url,{"text" : value, "problemid":pid},function(back) {
            myApp.alert(back,"Message");
          });
        });

      });
      $$(".mark_dirty").on("click",function() {
        // Ask reason and send straight.
        myApp.prompt('Describe dirtyness, if you can. It makes our life easier.','Send feedback', function (value) {
          var url = window.api.apicallbase + "savefeedback/?msgtype=dirty";
          $.jsonp(url,{"text" : value, "problemid":pid},function(back) {
            myApp.alert(back,"Message");
          });
        });
      });
      $$('.prompt-feedback').on('click', function () {
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
              txt += '&nbsp; <a class="del_betavideo" href="#" data-href="#">del</a>';
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
        $.jsonp(url,{},function(back) {
          myApp.alert(back);
          // Close the action sheet also
          myApp.closeModal();
          mainView.router.refreshPage();
        }); 
        return false;
      });

    })(probid);


    var saveTickFunction = function(self,action, callback) {
      var pid = $(self).attr("data-id");

      var grade_opinion = $(self).parents(".page-problem").find(".grade_opinion").val();
      var ascent_type = $(self).parents(".page-problem").find(".ascent_type").val();
      var like = $(self).parents(".page-problem").find("input[name=rating]:checked").val();
      var tickdate = $(self).parents(".page-problem").find(".tickdate").val();
      var tries = $(self).parents(".page-problem").find(".tries").val();
      var dislike = 0;
      var love = 0;
      if (like == 0) {
        dislike = 1;
      }
      if (like == 2) {
        love = 1;
        like = 0;
      }
      if (like == undefined) {
        like = 0;
      }
      if (action == undefined) {
        action = "savetick";
      }
      var url = "/t/problematormobile/"+action+"/";
      var data = {
        "a_like" : like,
        "a_love" : love,
        "a_dislike": dislike,
        "problemid": pid,
        "grade_opinion" : grade_opinion,
        "userid" : $("#userid").val(),
        "tries" : tries,
        "ascent_type" : ascent_type,
        "tickdate" : tickdate,
      };

      $.get(url,data,function(back) {
        if (callback != undefined) {
          var likeContainer = $("#swipe"+pid+" .item-after .likes");
          if (data.a_like> 0) {
            // Update data-count
            var curCount = likeContainer.find("span.fa-thumbs-up").data("count");
            curCount = parseInt(curCount);
            if (isNaN(curCount)) {
              curCount = 0;
            }
            curCount += data.a_like;
            likeContainer.find("span.fa-thumbs-up").data("count",curCount);
            likeContainer.find("span.fa-thumbs-up").text(curCount);
          } 
          if (data.a_love > 0) {
            // Update data-count
            var curCount = likeContainer.find("span.fa-heart").data("count");
            curCount = parseInt(curCount);
            if (isNaN(curCount)) {
              curCount = 0;
            }
            curCount += data.a_love;
            likeContainer.find("span.fa-heart").data("count",curCount);
            likeContainer.find("span.fa-heart").text(curCount);
          }
          callback(back,data);
        }
      });
    };
    singleProblemListenersInitialized = true;
  }

}


