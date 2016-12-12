var   addProblemsPageListeners = function(pagename) {
  if ("problems-page"==pagename) {
     
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
      /*
      if (e.which == 27) {
         $(this).val("");
         return;
      }
      */
      if (val != "" && val.length > 1) {
        $(".searching").html('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>');
        // Do a search
        var url = window.api.apicallbase+"search_groups";
        $.getJSON(url,{text : val},function(back) {
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
        $$.post(url,{gid : gid,uid : uid},function(back) {
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
                    $$.post(url,{gid : gid},function(back) {
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
       $$.post(url,data,function(back) {
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
      $$.post(url,{gid : gid},function(back) {
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
      $$.post(url,{gid : gid},function(back) {
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
          $.post(url,{groupid: groupid, emails : emails,msg : msg, add_admin : add_admin}).done(function(back) {
            var dataJSON =  JSON.parse(back);
            myApp.alert(dataJSON.msg,"Message");
            // Go back 
            mainView.router.back();
          });
       }
    });
  }
};

