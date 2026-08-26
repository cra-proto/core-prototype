"use strict";

window.addEventListener("load", () => {
  const trees = document.querySelectorAll('[role="tree"]');
  for (let i = 0; i < trees.length; i++) {
    const t = new Tree(trees[i]);
    t.init();
  }
});

class Tree {
  constructor(node) {
    if (typeof node !== "object") return;
    this.domNode = node;
    this.treeitems = [];
    this.firstChars = [];
    this.firstTreeitem = null;
    this.lastTreeitem = null;
    this.selectedItem = null;
  }

  init() {
    const findTreeitems = (node, tree, group) => {
      let elem = node.firstElementChild;
      let ti = group;
      while (elem) {
        if (elem.tagName.toLowerCase() === "li") {
          ti = new Treeitem(elem, tree, group);
          ti.init();
          tree.treeitems.push(ti);
          tree.firstChars.push(ti.label.substring(0, 1).toLowerCase());
        }
        if (elem.firstElementChild) {
          findTreeitems(elem, tree, ti);
        }
        elem = elem.nextElementSibling;
      }
    };

    if (!this.domNode.getAttribute("role")) {
      this.domNode.setAttribute("role", "tree");
    }
    findTreeitems(this.domNode, this, false);
    this.updateVisibleTreeitems();
    if (this.firstTreeitem) {
      this.firstTreeitem.domNode.tabIndex = 0;
    }
  }

  setSelectedToItem(treeitem) {
    if (this.selectedItem) {
      this.selectedItem.domNode.setAttribute("aria-selected", "false");
    }
    treeitem.domNode.setAttribute("aria-selected", "true");
    this.selectedItem = treeitem;
  }

  setFocusToItem(treeitem) {
    for (let i = 0; i < this.treeitems.length; i++) {
      const ti = this.treeitems[i];
      if (ti === treeitem) {
        ti.domNode.tabIndex = 0;
        ti.domNode.focus();
      } else {
        ti.domNode.tabIndex = -1;
      }
    }
  }

  setFocusToNextItem(currentItem) {
    let nextItem = false;
    for (let i = this.treeitems.length - 1; i >= 0; i--) {
      const ti = this.treeitems[i];
      if (ti === currentItem) break;
      if (ti.isVisible) nextItem = ti;
    }
    if (nextItem) this.setFocusToItem(nextItem);
  }

  setFocusToPreviousItem(currentItem) {
    let prevItem = false;
    for (let i = 0; i < this.treeitems.length; i++) {
      const ti = this.treeitems[i];
      if (ti === currentItem) break;
      if (ti.isVisible) prevItem = ti;
    }
    if (prevItem) this.setFocusToItem(prevItem);
  }

  setFocusToParentItem(currentItem) {
    if (currentItem.groupTreeitem) {
      this.setFocusToItem(currentItem.groupTreeitem);
    }
  }

  setFocusToFirstItem() {
    if (this.firstTreeitem) this.setFocusToItem(this.firstTreeitem);
  }

  setFocusToLastItem() {
    if (this.lastTreeitem) this.setFocusToItem(this.lastTreeitem);
  }

  expandTreeitem(currentItem) {
    if (currentItem.isExpandable) {
      currentItem.domNode.setAttribute("aria-expanded", "true");
      this.updateVisibleTreeitems();
    }
  }

  expandAllSiblingItems(currentItem) {
    for (let i = 0; i < this.treeitems.length; i++) {
      const ti = this.treeitems[i];
      if (ti.groupTreeitem === currentItem.groupTreeitem && ti.isExpandable) {
        this.expandTreeitem(ti);
      }
    }
  }

  collapseTreeitem(currentItem) {
    let groupTreeitem = false;
    if (currentItem.isExpanded()) {
      groupTreeitem = currentItem;
    } else {
      groupTreeitem = currentItem.groupTreeitem;
    }
    if (groupTreeitem) {
      groupTreeitem.domNode.setAttribute("aria-expanded", "false");
      this.updateVisibleTreeitems();
      this.setFocusToItem(groupTreeitem);
    }
  }

  expandAll() {
    for (let i = 0; i < this.treeitems.length; i++) {
      const ti = this.treeitems[i];
      if (ti.isExpandable) {
        ti.domNode.setAttribute("aria-expanded", "true");
      }
    }
    this.updateVisibleTreeitems();
  }

  collapseAll() {
    for (let i = 0; i < this.treeitems.length; i++) {
      const ti = this.treeitems[i];
      if (ti.isExpandable) {
        ti.domNode.setAttribute("aria-expanded", "false");
      }
    }
    this.updateVisibleTreeitems();
    this.setFocusToFirstItem();
  }

  updateVisibleTreeitems() {
    // FIXED: Correctly targeted the first index element here
    if (this.treeitems.length > 0) {
      this.firstTreeitem = this.treeitems[0];
    }
    for (let i = 0; i < this.treeitems.length; i++) {
      const ti = this.treeitems[i];
      let parent = ti.domNode.parentNode;
      ti.isVisible = true;
      while (parent && parent !== this.domNode) {
        if (parent.getAttribute("aria-expanded") === "false") {
          ti.isVisible = false;
          break; 
        }
        parent = parent.parentNode;
      }
      if (ti.isVisible) {
        this.lastTreeitem = ti;
      }
    }
  }

  setFocusByFirstCharacter(currentItem, char) {
    char = char.toLowerCase();
    let start = this.treeitems.indexOf(currentItem) + 1;
    if (start === this.treeitems.length) start = 0;
    
    let index = this.getIndexFirstChars(start, char);
    if (index === -1) index = this.getIndexFirstChars(0, char);
    if (index > -1) this.setFocusToItem(this.treeitems[index]);
  }

  getIndexFirstChars(startIndex, char) {
    for (let i = startIndex; i < this.firstChars.length; i++) {
      if (this.treeitems[i].isVisible && char === this.firstChars[i]) {
        return i;
      }
    }
    return -1;
  }
}

class Treeitem {
  constructor(node, treeObj, group) {
    if (typeof node !== "object") return;
    node.tabIndex = -1;
    this.tree = treeObj;
    this.groupTreeitem = group;
    this.domNode = node;
    this.label = node.textContent.trim();
    
    if (node.getAttribute("aria-label")) {
      this.label = node.getAttribute("aria-label").trim();
    }
    
    this.isExpandable = false;
    this.isVisible = false;
    this.inGroup = !!group;

    let elem = node.firstElementChild;
    while (elem) {
      if (elem.tagName.toLowerCase() === "ul") {
        elem.setAttribute("role", "group");
        this.isExpandable = true;
        break;
      }
      elem = elem.nextElementSibling;
    }
  }

  init() {
    this.domNode.tabIndex = -1;
    if (!this.domNode.getAttribute("role")) {
      this.domNode.setAttribute("role", "treeitem");
    }
    this.domNode.addEventListener("keydown", this.handleKeydown.bind(this));
    this.domNode.addEventListener("click", this.handleClick.bind(this));
    this.domNode.addEventListener("focus", this.handleFocus.bind(this));
    this.domNode.addEventListener("blur", this.handleBlur.bind(this));
    
    if (!this.isExpandable) {
      this.domNode.addEventListener("mouseover", this.handleMouseOver.bind(this));
      this.domNode.addEventListener("mouseout", this.handleMouseOut.bind(this));
    }
  }

  isExpanded() {
    return this.isExpandable && this.domNode.getAttribute("aria-expanded") === "true";
  }

  handleKeydown(event) {
    let flag = false;
    const char = event.key;

    const isPrintableCharacter = (str) => str.length === 1 && str.match(/\S/);

    const printableCharacter = (item) => {
      if (char === "*") {
        item.tree.expandAllSiblingItems(item);
        flag = true;
      } else if (isPrintableCharacter(char)) {
        item.tree.setFocusByFirstCharacter(item, char);
        flag = true;
      }
    };

    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.shiftKey) { 
      if (isPrintableCharacter(char)) printableCharacter(this);
    } else {
      switch (event.key) { 
        case "Enter":
        case " ":
          if (!this.isExpandable) this.tree.setFocusToItem(this);
          this.tree.setSelectedToItem(this);
          flag = true;
          break;
        case "ArrowUp":
          this.tree.setFocusToPreviousItem(this);
          flag = true;
          break;
        case "ArrowDown":
          this.tree.setFocusToNextItem(this);
          flag = true;
          break;
        case "ArrowRight":
          if (this.isExpandable) {
            if (this.isExpanded()) {
              this.tree.setFocusToNextItem(this);
            } else {
              this.tree.expandTreeitem(this);
            }
          }
          flag = true;
          break;
        case "ArrowLeft":
          if (this.isExpandable && this.isExpanded()) {
            this.tree.collapseTreeitem(this);
            flag = true;
          } else if (this.inGroup) {
            this.tree.setFocusToParentItem(this);
            flag = true;
          }
          break;
        case "Home":
          this.tree.setFocusToFirstItem();
          flag = true;
          break;
        case "End":
          this.tree.setFocusToLastItem();
          flag = true;
          break;
        default:
          if (isPrintableCharacter(char)) {
            printableCharacter(this);
          }
          break;
      }
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  handleClick(event) {
    if (this.isExpandable) {
      if (this.isExpanded()) {
        this.tree.collapseTreeitem(this);
      } else {
        this.tree.expandTreeitem(this);
      }
      event.stopPropagation();
    } else {
      this.tree.setFocusToItem(this);
    }
    this.tree.setSelectedToItem(this);
  }

  handleFocus() {
    let node = this.domNode;
    if (this.isExpandable && node.firstElementChild) {
      node = node.firstElementChild;
    }
    node.classList.add("focus");
  }

  handleBlur() {
    let node = this.domNode;
    if (this.isExpandable && node.firstElementChild) {
      node = node.firstElementChild;
    }
    node.classList.remove("focus");
  }

  handleMouseOver(event) {
    event.currentTarget.classList.add("hover");
  }

  handleMouseOut(event) {
    event.currentTarget.classList.remove("hover");
  }
}
