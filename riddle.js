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

  // contenteditable creates a very crude text editor in modern browsers. sweet, huh?
  this.container.setAttribute("contenteditable", "true");

  // all content is within a span; create the intial span
  this.container.appendChild(document.createElement('span'));

  // setup events for smooth editing

  var that = this;

  this.container.addEventListener("keypress", function(event) {
    that.onKeypress(event);
  })

  this.containerContainer.appendChild(this.container);

  editor.container.appendChild(this.containerContainer);
}

Page.prototype.onKeypress = function(event) {
  // event.char isn't implemented at the time of writing, but charCode is deprecated.
  var char = event.char || String.fromCharCode(event.charCode);

  if(char == 'b' && event.ctrlKey) {
    document.execCommand('bold', false, null);
  }

  if(char == 'i' && event.ctrlKey) {
    document.execCommand('italic', false, null);
  }

  if(char == 'u' && event.ctrlKey) {
    document.execCommand("underline", false, null);
  }
}
