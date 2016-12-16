$.expr[":"].contains = $.expr.createPseudo(function(arg) {
  return function( elem ) {
    return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
  };
});

Template7.registerHelper('stringify', function (context){
	var str = JSON.stringify(context);
	// Need to replace any single quotes in the data with the HTML char to avoid string being cut short
	return str.split("'").join('&#39;');
});
Template7.registerHelper('select_options',function(values, selected, options) {
  var optLines= "";
  if (values) {
    for (var idx in values) {
      var val = values[idx];
      optLines += "<option value='"+val.id+"'";
       if (selected && selected == val.id) {
         optLines += " selected='selected' ";
       }
      optLines += ">"+val.name+"</option>";
    }
     
  }
  return optLines;
});
Template7.registerHelper('default',function(string, defaultString, options) {
  if (string == null || string == undefined) {
    return defaultString;
  }
  return string;
});
Template7.registerHelper('index_of', function (arr, index) {
  // First we need to check is the passed arr argument is function
  if (typeof arr === 'function') arr = arr.call(this);


  return arr[index];
});          
Template7.registerHelper('lower', function (text, options){
  if (text == undefined) {
    return "";
  }
  var ret = text.toLowerCase();
  return ret;
});
Template7.registerHelper('upper', function (text, options){
  var ret = text.toUpperCase();
  return ret;
});
Template7.registerHelper('substr', function (str,start,len) {
  // First we need to check is the passed arr argument is function
  if (typeof arr === 'function') arr = arr.call(this);

  if (str == undefined) {
    return "";
  }
  if (len == undefined) {
    // default to end of string
   return str.substring(start,str.length);  
  } else {
    return str.substr(start,len);
  }
});          
Template7.registerHelper('relative_datetime', function (rawdate,format) {
  // First we need to check is the passed arr argument is function
  if (typeof arr === 'function') arr = arr.call(this);

  if (moment==undefined) {
    return "Moment.js not included!";
  }
  console.log(rawdate);
  var mom = moment(rawdate);
  return mom.fromNow();
});          

Template7.registerHelper('date_format', function (rawdate,format) {
  // First we need to check is the passed arr argument is function
  if (typeof arr === 'function') arr = arr.call(this);

  if (moment==undefined) {
    return "Moment.js not included!";
  }
  console.log(rawdate);
  var mom = moment(rawdate);
  return mom.format(format);
});          

Template7.registerHelper('sizeof', function (arr) {
  // First we need to check is the passed arr argument is function
  if (typeof arr === 'function') arr = arr.call(this);
  if (arr == undefined) {
    return 0;
  }
  return arr.length;
});          
