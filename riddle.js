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
  this.container = document.createElement("div");
  editor.container.appendChild(this.container);
}
