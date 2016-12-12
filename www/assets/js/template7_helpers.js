Template7.registerHelper('index_of', function (arr, index) {
  // First we need to check is the passed arr argument is function
  if (typeof arr === 'function') arr = arr.call(this);


  return arr[index];
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

  return arr.length;
});          
