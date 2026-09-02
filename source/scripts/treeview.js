"use strict";

(function () {
    function initializeAllTrees() {
        var trees = document.querySelectorAll("[role=\"tree\"]");
        var i = 0;
        while (i < trees.length) {
            var treeNode = trees[i];
            if (!treeNode.getAttribute("data-tree-initialized")) {
                treeNode.setAttribute("data-tree-initialized", "true");
                var t = createTree(treeNode);
                initTree(t);
                treeNode._treeInstance = t;
            }
            i = i + 1;
        }
    }

    function initializeTreeButtons() {
        var expandBtn = document.getElementById("btn-expand-all");
        var collapseBtn = document.getElementById("btn-collapse-all");

        if (expandBtn && !expandBtn.getAttribute("data-btn-initialized")) {
            expandBtn.setAttribute("data-btn-initialized", "true");
            expandBtn.addEventListener("click", function () {
                triggerGlobalExpansion(true);
            });
        }

        if (collapseBtn && !collapseBtn.getAttribute("data-btn-initialized")) {
            collapseBtn.setAttribute("data-btn-initialized", "true");
            collapseBtn.addEventListener("click", function () {
                triggerGlobalExpansion(false);
            });
        }
    }

    function checkQueryStringTriggers() {
        var urlParams = new URLSearchParams(window.location.search);
        var treeParam = urlParams.get("tree");
        var actionParam = urlParams.get("action");

        if (treeParam === "expand" || actionParam === "expandall") {
            triggerGlobalExpansion(true);
        }
        if (treeParam === "collapse" || actionParam === "collapseall") {
            triggerGlobalExpansion(false);
        }
    }

    function triggerGlobalExpansion(shouldExpand) {
        var trees = document.querySelectorAll("[role=\"tree\"]");
        var i = 0;
        while (i < trees.length) {
            var treeNode = trees[i];
            var treeItems = treeNode.querySelectorAll("li[role=\"treeitem\"]");
            var j = 0;
            while (j < treeItems.length) {
                var itemNode = treeItems[j];
                var hasGroup = itemNode.querySelector("ul[role=\"group\"]");
                if (hasGroup) {
                    if (shouldExpand) {
                        itemNode.setAttribute("aria-expanded", "true");
                    } else {
                        itemNode.setAttribute("aria-expanded", "false");
                    }
                }
                j = j + 1;
            }

            if (treeNode._treeInstance) {
                updateVisibleTreeitems(treeNode._treeInstance);
            }
            i = i + 1;
        }
    }

    function createTree(node) {
        if (typeof node !== "object") {
            return null;
        }
        return {
            domNode: node,
            treeitems: [],
            firstChars: [],
            firstTreeitem: null,
            lastTreeitem: null,
            selectedItem: null
        };
    }

    function initTree(tree) {
        if (!tree.domNode.getAttribute("role")) {
            tree.domNode.setAttribute("role", "tree");
        }
        findTreeitems(tree.domNode, tree, null);
        updateVisibleTreeitems(tree);
        if (tree.firstTreeitem && tree.firstTreeitem.domNode) {
            tree.firstTreeitem.domNode.tabIndex = 0;
        }
    }

    function findTreeitems(node, tree, group) {
        var elem = node.firstElementChild;
        var ti = group;
        while (elem) {
            if (elem.tagName.toLowerCase() === "li" && elem.getAttribute("role") === "treeitem") {
                ti = createTreeitem(elem, tree, group);
                initTreeitem(ti);
                if (tree && tree.treeitems && tree.firstChars) {
                    tree.treeitems.push(ti);
                    tree.firstChars.push(ti.label.substring(0, 1).toLowerCase());
                }
            }
            if (elem.firstElementChild) {
                findTreeitems(elem, tree, ti);
            }
            elem = elem.nextElementSibling;
        }
    }

    function createTreeitem(node, treeObj, group) {
        if (typeof node !== "object") {
            return null;
        }
        node.tabIndex = -1;

        var label = "";
        var titleSpan = node.querySelector(".tree-title");
        var linkChild = node.querySelector("a.page-link");

        if (node.getAttribute("aria-label")) {
            label = node.getAttribute("aria-label").trim();
        } else if (titleSpan) {
            label = titleSpan.textContent.trim();
        } else if (linkChild) {
            label = linkChild.textContent.trim();
        } else {
            label = node.textContent.trim();
        }

        var isExpandable = false;
        var elem = node.firstElementChild;
        while (elem) {
            if (elem.tagName.toLowerCase() === "ul" && elem.getAttribute("role") === "group") {
                isExpandable = true;
            }
            elem = elem.nextElementSibling;
        }

        return {
            tree: treeObj,
            groupTreeitem: group,
            domNode: node,
            label: label,
            isExpandable: isExpandable,
            isVisible: false,
            inGroup: !!group
        };
    }

    function initTreeitem(treeitem) {
        treeitem.domNode.tabIndex = -1;
        if (treeitem.isExpandable && !treeitem.domNode.getAttribute("aria-expanded")) {
            treeitem.domNode.setAttribute("aria-expanded", "false");
        }
        treeitem.domNode.addEventListener("keydown", function (event) {
            handleTreeitemKeydown(treeitem, event);
        });
        treeitem.domNode.addEventListener("click", function (event) {
            handleTreeitemClick(treeitem, event);
        });
        treeitem.domNode.addEventListener("focus", function () {
            handleTreeitemFocus(treeitem);
        });
        treeitem.domNode.addEventListener("blur", function () {
            handleTreeitemBlur(treeitem);
        });
        if (!treeitem.isExpandable) {
            treeitem.domNode.addEventListener("mouseover", handleTreeitemMouseOver);
            treeitem.domNode.addEventListener("mouseout", handleTreeitemMouseOut);
        }
    }

    function setSelectedToItem(tree, treeitem) {
        if (tree.selectedItem) {
            tree.selectedItem.domNode.setAttribute("aria-selected", "false");
        }
        treeitem.domNode.setAttribute("aria-selected", "true");
        tree.selectedItem = treeitem;
    }

    function setFocusToItem(tree, treeitem) {
        var i = 0;
        while (i < tree.treeitems.length) {
            var ti = tree.treeitems[i];
            if (ti === treeitem) {
                ti.domNode.tabIndex = 0;
                ti.domNode.focus();
            } else {
                ti.domNode.tabIndex = -1;
            }
            i = i + 1;
        }
    }

    function setFocusToNextItem(tree, currentItem) {
        var nextItem = null;
        var i = tree.treeitems.length - 1;
        while (i >= 0) {
            var ti = tree.treeitems[i];
            if (ti === currentItem) {
                i = -1;
            } else {
                if (ti.isVisible) {
                    nextItem = ti;
                }
                i = i - 1;
            }
        }
        if (nextItem) {
            setFocusToItem(tree, nextItem);
        }
    }

    function setFocusToPreviousItem(tree, currentItem) {
        var prevItem = null;
        var i = 0;
        while (i < tree.treeitems.length) {
            var ti = tree.treeitems[i];
            if (ti === currentItem) {
                i = tree.treeitems.length;
            } else {
                if (ti.isVisible) {
                    prevItem = ti;
                }
                i = i + 1;
            }
        }
        if (prevItem) {
            setFocusToItem(tree, prevItem);
        }
    }

    function setFocusToParentItem(tree, currentItem) {
        if (currentItem.groupTreeitem) {
            setFocusToItem(tree, currentItem.groupTreeitem);
        }
    }

    function setFocusToFirstItem(tree) {
        if (tree.firstTreeitem) {
            setFocusToItem(tree, tree.firstTreeitem);
        }
    }

    function setFocusToLastItem(tree) {
        if (tree.lastTreeitem) {
            setFocusToItem(tree, tree.lastTreeitem);
        }
    }

    function expandTreeitem(tree, currentItem) {
        if (currentItem.isExpandable) {
            currentItem.domNode.setAttribute("aria-expanded", "true");
            updateVisibleTreeitems(tree);
        }
    }

    function expandAllSiblingItems(tree, currentItem) {
        var i = 0;
        while (i < tree.treeitems.length) {
            var ti = tree.treeitems[i];
            if (ti.groupTreeitem === currentItem.groupTreeitem && ti.isExpandable) {
                expandTreeitem(tree, ti);
            }
            i = i + 1;
        }
    }

    function collapseChildrenNodes(parentItem) {
        // Enforce strict containment mapping patterns
        var childItems = parentItem.domNode.querySelectorAll("li[role=\"treeitem\"]");
        var i = 0;
        while (i < childItems.length) {
            var item = childItems[i];
            var hasGroup = item.querySelector("ul[role=\"group\"]");
            if (hasGroup) {
                item.setAttribute("aria-expanded", "false");
            }
            i = i + 1;
        }
    }

    function collapseTreeitem(tree, currentItem) {
        var groupTreeitem = null;
        if (isTreeitemExpanded(currentItem)) {
            groupTreeitem = currentItem;
        } else {
            groupTreeitem = currentItem.groupTreeitem;
        }
        if (groupTreeitem) {
            groupTreeitem.domNode.setAttribute("aria-expanded", "false");
            collapseChildrenNodes(groupTreeitem);
            updateVisibleTreeitems(tree);
            setFocusToItem(tree, groupTreeitem);
        }
    }

    function isTreeitemExpanded(treeitem) {
        return !!(treeitem.isExpandable && treeitem.domNode.getAttribute("aria-expanded") === "true");
    }

    function updateVisibleTreeitems(tree) {
        if (tree && tree.treeitems && tree.treeitems.length > 0) {
            tree.firstTreeitem = tree.treeitems[0];
        }
        var i = 0;
        while (tree && tree.treeitems && i < tree.treeitems.length) {
            var ti = tree.treeitems[i];
            var parent = ti.domNode.parentNode;
            ti.isVisible = true;
            while (parent && parent !== tree.domNode) {
                if (parent.getAttribute("aria-expanded") === "false") {
                    ti.isVisible = false;
                }
                parent = parent.parentNode;
            }
            if (ti.isVisible) {
                tree.lastTreeitem = ti;
            }
            i = i + 1;
        }
    }

    function setFocusByFirstCharacter(tree, currentItem, char) {
        char = char.toLowerCase();
        var start = tree.treeitems.indexOf(currentItem) + 1;
        if (start === tree.treeitems.length) {
            start = 0;
        }
        var index = getIndexFirstChars(tree, start, char);
        if (index === -1) {
            index = getIndexFirstChars(tree, 0, char);
        }
        if (index > -1) {
            setFocusToItem(tree, tree.treeitems[index]);
        }
    }

    function getIndexFirstChars(tree, startIndex, char) {
        var i = startIndex;
        while (i < tree.firstChars.length) {
            if (tree.treeitems[i].isVisible && char === tree.firstChars[i]) {
                return i;
            }
            i = i + 1;
        }
        return -1;
    }

    function handleTreeitemKeydown(treeitem, event) {
        var flag = false;
        var key = event.key;
        if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }
        if (event.shiftKey && key.length === 1 && key.match(/\S/)) {
            setFocusByFirstCharacter(treeitem.tree, treeitem, key);
            flag = true;
        } else {
            switch (key) {
                case "Enter":
                case " ":
                    if (!treeitem.isExpandable) {
                        setFocusToItem(treeitem.tree, treeitem);
                    }
                    setSelectedToItem(treeitem.tree, treeitem);
                    flag = true;
                    break;
                case "ArrowUp":
                    setFocusToPreviousItem(treeitem.tree, treeitem);
                    flag = true;
                    break;
                case "ArrowDown":
                    setFocusToNextItem(treeitem.tree, treeitem);
                    flag = true;
                    break;
                case "ArrowRight":
                    if (treeitem.isExpandable) {
                        if (isTreeitemExpanded(treeitem)) {
                            setFocusToNextItem(treeitem.tree, treeitem);
                        } else {
                            expandTreeitem(treeitem.tree, treeitem);
                        }
                    }
                    flag = true;
                    break;
                case "ArrowLeft":
                    if (treeitem.isExpandable && isTreeitemExpanded(treeitem)) {
                        collapseTreeitem(treeitem.tree, treeitem);
                        flag = true;
                    } else if (treeitem.inGroup) {
                        setFocusToParentItem(treeitem.tree, treeitem);
                        flag = true;
                    }
                    break;
                case "Home":
                    setFocusToFirstItem(treeitem.tree);
                    flag = true;
                    break;
                case "End":
                    setFocusToLastItem(treeitem.tree);
                    flag = true;
                    break;
                case "*":
                    expandAllSiblingItems(treeitem.tree, treeitem);
                    flag = true;
                    break;
                default:
                    if (key.length === 1 && key.match(/\S/)) {
                        setFocusByFirstCharacter(treeitem.tree, treeitem, key);
                        flag = true;
                    }
                    break;
            }
        }
        if (flag) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    function handleTreeitemClick(treeitem, event) {
        var targetNode = event.target;
        var isTitleClick = false;
        var isLinkClick = false;
        if (targetNode && targetNode.classList) {
            if (targetNode.classList.contains("tree-title") || targetNode.closest(".tree-title")) {
                isTitleClick = true;
            }
            if (targetNode.classList.contains("page-link") || targetNode.closest("a.page-link")) {
                isLinkClick = true;
            }
        }
        if (isTitleClick || isLinkClick) {
            if (treeitem.isExpandable) {
                if (isTreeitemExpanded(treeitem)) {
                    collapseTreeitem(treeitem.tree, treeitem);
                } else {
                    expandTreeitem(treeitem.tree, treeitem);
                }
            } else {
                setFocusToItem(treeitem.tree, treeitem);
            }
            setSelectedToItem(treeitem.tree, treeitem);
        }
        event.stopPropagation();
    }

    function handleTreeitemFocus(treeitem) {
        var node = treeitem.domNode;
        if (treeitem.isExpandable) {
            var titleSpan = node.querySelector(".tree-title");
            if (titleSpan) {
                node = titleSpan;
            } else {
                node = node.firstElementChild;
            }
        }
        node.classList.add("focus");
    }

    function handleTreeitemBlur(treeitem) {
        var node = treeitem.domNode;
        if (treeitem.isExpandable) {
            var titleSpan = node.querySelector(".tree-title");
            if (titleSpan) {
                node = titleSpan;
            } else {
                node = node.firstElementChild;
            }
        }
        node.classList.remove("focus");
    }

    function handleTreeitemMouseOver(event) {
        event.currentTarget.classList.add("hover");
    }

    function handleTreeitemMouseOut(event) {
        event.currentTarget.classList.remove("hover");
    }

    // Framework Ready Bindings
    document.addEventListener("wb-ready.wb", function () {
        initializeAllTrees();
        initializeTreeButtons();
        checkQueryStringTriggers();
    });

    document.addEventListener("wet-boew-ready", function () {
        initializeAllTrees();
        initializeTreeButtons();
        checkQueryStringTriggers();
    });
})();
