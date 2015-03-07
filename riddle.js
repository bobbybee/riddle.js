// Riddle constructor
// Riddle objects represent the entire editor
// parameters:
// DOMElement containerContainer - container for the editor

function Riddle(containerContainer) {
  window.riddle = this;

  this.containerContainer = containerContainer;

  // the actual container creation
  this.container = document.createElement("div");
  this.container.className = "riddle-content";
  this.container.innerHTML = "\u200B"; // this is a no width character which fixes a cursor location bug

  // contenteditable creates a very crude text editor in modern browsers. sweet, huh?
  this.container.setAttribute("contenteditable", "true");

  // setup events for smooth editing

  var that = this;

  this.container.addEventListener("keydown", function(event) {
    return that.onKeydown(event);
  });

  this.container.addEventListener("keypress", function(event) {
    that.onKeypress(event);
  });

  this.containerContainer.appendChild(this.container);
}

Riddle.prototype.onKeydown = function(event) {
  // keyCode is deprecated TODO: proper polyfill?
  var char = event.keyCode;

  var flag = true;

  if(char == 66 && event.ctrlKey) { // ctrl-b (bold)
    document.execCommand("bold", null, null);
  }

  else if(char == 73 && event.ctrlKey) { // ctrl-i (italics)
    document.execCommand("italic", false, null);
  }

  else if(char == 85 && event.ctrlKey) { // ctrl-u (underline)
    document.execCommand("underline", false, null);
  }

  else if(char == 65 && event.ctrlKey) { // ctrl-a (select all)
    document.execCommand("selectAll", false, null);
  }

  /*else if( (char == 67 || char == 86 || char == 88) && event.ctrlKey) { // ctrl-c (copy to clipboard) or ctrl-v (paste) or ctrl-x (cut)
    // silently ignore clipboard related actions
    // let the browser handle them for us
    flag = false;
  }*/

  else if(char == 80 && event.ctrlKey && !!window.chrome) { // ctrl-p (print) under chrome. Firefox has a seperate printing implementation
    // for printing, we only print the container element
    // to do this, we serialize the editor as HTML,
    // open it in a new tab with a data URI
    // and append a print onload command

    var page = this.container.innerHTML;
    page = page.replace(/\u200B/g, ""); // remove markers

    page = '<!-- Printed by Riddle - libre HTML5 editor !-->' +
           '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>' +
           "<script>onload=function(){print()}</script></head><body>" +
           page +
           "</body></html>";

    var dataURI = "data:text/html, " + encodeURIComponent(page);

    var newWindow = window.open(dataURI, "_blank", "menubar=0,toolbar=0,location=0,personalbar=0,status=0");
    newWindow.focus();
  }

  else if(char == 8 || char == 127) { // delete / backspace
    // find what character is being deleted

    var range = window.getSelection().getRangeAt(0);
    var txt = range.startContainer;
    if(txt.innerHTML) txt = txt.innerHTML;
    if(txt.data) txt = txt.data;

    var deletedCharacter = txt[range.startOffset - 2];

    if(deletedCharacter == '\u200B') {
      document.execCommand("delete", false, null);
    }

    document.execCommand("delete", false, null);
  }

  else if(char == 10 || char == 13) { // line feed / carriage return (enter / return key)
    document.execCommand("insertHTML", false, "<br/>&#8203;");
  }

  else flag = false;

  if(flag) {
    event.preventDefault();
    return false;
  }

  return true;
}

Riddle.prototype.onKeypress = function(e) {
  if(e.charCode != 0 && !e.ctrlKey) {
    document.execCommand("insertText", false, e.char || String.fromCharCode(e.charCode));
    e.preventDefault();
  }
}

// implement printing for FF

if(!window.chrome) {
  window.onbeforeprint = function(e) {
    riddle.cachedPage = document.body.innerHTML;
    document.body.innerHTML = riddle.container.innerHTML;
  }

  window.onafterprint = function(e) {
    document.body.innerHTML = riddle.cachedPage;
  }
}
