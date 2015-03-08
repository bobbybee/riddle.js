// containerContainer is a DOM element in which the Riddle editor is contained

function Riddle(containerContainer) {
  window.riddle = this;
  var that = this;

  this.containerContainer = containerContainer;

  // generate toolbar
  this.toolbar = document.createElement("div");
  this.toolbar.className = "riddle-toolbar";
  this.toolbarLeft = 0;

  this.generateDropdown(
    ["monospace", "Times", "Arial", "Verdana"],
    function(element, name) {
      element.style.fontFamiy = name;
    },
    function(font) {
      document.execCommand("fontName", false, font);
    },
    0
  );

  setTimeout(function() {
    that.generateDropdown(
      [1, 2, 3, 4, 5, 6, 7],
      function(element, name) {},
      function(fontSize) {
        document.execCommand("fontSize", null, fontSize);
      },
      10
    );
  }, 0);


  this.containerContainer.appendChild(this.toolbar);

  // the actual container creation
  this.container = document.createElement("div");
  this.container.className = "riddle-content";
  this.container.innerHTML = "\u200B"; // this is a no width character which fixes a cursor location bug

  // contenteditable creates a very crude text editor in modern browsers. sweet, huh?
  this.container.setAttribute("contenteditable", "true");

  // setup events for smooth editing

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
  var c = event.keyCode;

  var flag = true; // this flag will determine whether the default behaviour of the event should run

  if(c == 66 && event.ctrlKey) { // ctrl-b (bold)
    document.execCommand("bold", null, null);
  }

  else if(c == 73 && event.ctrlKey) { // ctrl-i (italics)
    document.execCommand("italic", false, null);
  }

  else if(c == 85 && event.ctrlKey) { // ctrl-u (underline)
    document.execCommand("underline", false, null);
  }

  else if(c == 65 && event.ctrlKey) { // ctrl-a (select all)
    document.execCommand("selectAll", false, null);
  }

  else if(c == 80 && event.ctrlKey && !!window.chrome) { // ctrl-p (print) under chrome. Firefox has a seperate printing implementation
    this.tabDump("text/html", true);
  }

  else if(c == 83 && event.ctrlKey) { // ctrl-s (save). we need an elegant solution to this
    this.tabDump("application/force-download", false);
  }

  else if(c == 79 && event.ctrlKey) { // ctrl-o (open). we need an elegant solution to this
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

  else if(c == 8 || c == 127) { // delete / backspace
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

  else if(c == 10 || c == 13) { // line feed / carriage return (enter / return key)
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

  page = "<!-- Authored with Riddle - libre HTML5 editor !-->" +
         '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>' +
         (autoPrint ? "<script>onload=function(){print()}</script></head><body>" : '') +
         page +
         "</body></html>";

  var dataURI = "data:"+mimeType+", " + encodeURIComponent(page);

  var newWindow = window.open(dataURI, "_blank", "menubar=0,toolbar=0,location=0,personalbar=0,status=0");
  newWindow.focus();
}

Riddle.prototype.generateDropdown = function(options, stylizeOption, handler, callback) {
  var that = this;

  var dropdownContainer = document.createElement("div");
  dropdownContainer.className = "riddle-dropdown-container";
  dropdownContainer.style.left = this.toolbarLeft + "px";

  var dropdown = document.createElement("div");
  dropdown.className = "riddle-dropdown";

  var mainOption = document.createElement("div");
  mainOption.className = "riddle-menu-mainoption";
  dropdown.appendChild(mainOption);

  var optionsEl = [];

  options.forEach(function(option) {
    // generate option for this font on the menu
    var op = document.createElement("div");
    op.innerHTML = option;

    // give users a preview
    op.style.display = "none";
    op.className = "riddle-menu-option";
    stylizeOption(op, option);

    // add event
    op.addEventListener("click", function(e) {
      mainOption.innerHTML = op.innerHTML;
      stylizeOption(mainOption, option);

      optionsEl.forEach(function(op) {
        op.style.display = "none";
      })

      handler(option);
    });

    op.addEventListener("mousedown", function(e) {
      e.preventDefault();
    });

    // add to the fontBar
    dropdown.appendChild(op);
    optionsEl.push(op);

  })

  stylizeOption(mainOption, options[0]);

  mainOption.style.marginBottom = "3px";
  mainOption.innerHTML = options[0];

  mainOption.addEventListener("click", function(e) {
    optionsEl.forEach(function(op) {
      if(op.style.display == "block") {
        op.style.display = "none";
      } else {
        op.style.display = "block";
      }
    })
  });

  mainOption.addEventListener("mousedown", function(e) {
    e.preventDefault(); // keeps focus
  })

  dropdownContainer.appendChild(dropdown);
  this.toolbar.appendChild(dropdownContainer);

  setTimeout(function() {
    that.toolbarLeft += mainOption.offsetWidth + 10;
  }, 0);

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
