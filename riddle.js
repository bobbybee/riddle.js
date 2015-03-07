// Riddle constructor
// Riddle objects represent the entire editor
// parameters:
// DOMElement container - container for the editor

function Riddle(container) {
  this.container = container;
}

// Page constructor
// GUI element for a page in a document
// parameters:
// Riddle editor - Riddle object for the editor itself

function Page(editor) {
  this.editor = editor;

  // a container-within-a-container hack is used to maintain sizing with CSS, not JS
  this.containerContainer = document.createElement("div");
  this.containerContainer.className = "riddle-page";

  // the actual container creation
  this.container = document.createElement("div");
  this.container.className = "riddle-content";
  this.container.innerHTML = "\u200B"; // this is a no width character which fixes a cursor location bug

  // contenteditable creates a very crude text editor in modern browsers. sweet, huh?
  this.container.setAttribute("contenteditable", "true");

  // setup events for smooth editing

  var that = this;

  this.container.addEventListener("keydown", function(event) {
    that.onKeydown(event);
  });

  this.container.addEventListener("keypress", function(event) {
    that.onKeypress(event);
  });

  this.containerContainer.appendChild(this.container);

  editor.container.appendChild(this.containerContainer);
}

Page.prototype.onKeydown = function(event) {
  // keyCode is deprecated TODO: proper polyfill?
  var char = event.keyCode;

  var flag = true;

  if(char == 66 && event.ctrlKey) { // ctrl-b
    document.execCommand("bold", null, null);
  }

  else if(char == 73 && event.ctrlKey) { // ctrl-i
    document.execCommand("italic", false, null);
  }

  else if(char == 85 && event.ctrlKey) { // ctrl-u
    document.execCommand("underline", false, null);
  }

  else if(char == 8 || char == 127) { // delete / backspace
    document.execCommand("delete", false, null);
  }

  else if(char == 10 || char == 13) { // line feed / carriage return (enter / return key)
    document.execCommand("insertText", false, "\n\u200B");
  }

  else flag = false;

  if(flag) event.preventDefault();
}

Page.prototype.onKeypress = function(e) {
  document.execCommand("insertText", false, e.char || String.fromCharCode(e.charCode));

  e.preventDefault();
}
