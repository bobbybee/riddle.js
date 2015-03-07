// containerContainer is a DOM element in which the Riddle editor is contained

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

  var flag = true; // this flag will determine whether the default behaviour of the event should run

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

  else if(char == 80 && event.ctrlKey && !!window.chrome) { // ctrl-p (print) under chrome. Firefox has a seperate printing implementation
    this.tabDump("text/html", true);
  }

  else if(char == 83 && event.ctrlKey) { // ctrl-s (save). we need an elegant solution to this
    this.tabDump("application/force-download", false);
  }

  else if(char == 79 && event.ctrlKey) { // ctrl-o (open). we need an elegant solution to this
    var button = document.createElement("input");
    button.setAttribute("type", "file");

    button.addEventListener("change", function(e) {
      var file = e.target.files[0];

      var reader = new FileReader();
      reader.onload = (function(t_file) {
        return function(e) {
          riddle.container.innerHTML = e.target.result;
        }
      })(file);

      reader.readAsText(file);
    });

    button.click();
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

Riddle.prototype.tabDump = function(mimeType, autoPrint) {
  // for printing, we only print the container element
  // to do this, we serialize the editor as HTML,
  // open it in a new tab with a data URI
  // and append a print onload command

  var page = this.container.innerHTML;
  page = page.replace(/\u200B/g, ""); // remove markers

  page = '<!-- Authored with Riddle - libre HTML5 editor !-->' +
         '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>' +
         (autoPrint ? "<script>onload=function(){print()}</script></head><body>" : '') +
         page +
         "</body></html>";

  var dataURI = "data:"+mimeType+", " + encodeURIComponent(page);

  var newWindow = window.open(dataURI, "_blank", "menubar=0,toolbar=0,location=0,personalbar=0,status=0");
  newWindow.focus();
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
