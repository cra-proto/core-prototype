/*
* GitHub only script
*
* Creates developer buttons - go to GitHub source version and contenEditable page edit buttons
*
*/

"use strict";

let devOptions = document.getElementById("devoptions");
let keywords = document.getElementById("pageKeywords");
let notedLinksList = document.getElementById("notedlinks");
let insertId = "test-banner";

let notedLinksArr, pageOrigin, 
    pageKey = location.pathname.replaceAll("/","").replaceAll(":","").replaceAll("-","").split(".").slice(0, -1).join(".").toLowerCase(), 
    pageStorage = localStorage.getItem(pageKey), 
    getGithubURL = function (pageURL) {
        let pageName = "", 
            githubURL = null;

        if (pageURL.indexOf(".htm") === -1) {
            pageName = "index.html";
        }

        switch (true) {
            // Generate GitHub.com URL's from [repo name].github.io URL's
            case pageURL.indexOf(".github.io/") > -1:
                githubURL = pageURL.toString().replace(new RegExp("^https:\/\/(.*?)\.github\.io\/(.*?)\/((?:.*)(?=\/))?(\/?.*\..+)?"), "https:\/\/github\.com\/$1\/$2\/blob\/main\/$3$4" + pageName);
                break;
            // Generate GitHub.com URL's from test.canada.ca URL's
            case pageURL.indexOf("://test.canada.ca/") > -1:
                githubURL = pageURL.toString().replace(new RegExp("^https:\/\/test\.canada\.ca\/(.*?)\/((?:.*)(?=\/))?(\/?.*\..+)?"), "https:\/\/github\.com\/gc-proto\/$1\/blob\/master\/$2$3" + pageName);
                break;
            // Generate GitHub.com URL's from [repo name].alpha.canada.ca URL's
            case pageURL.indexOf(".alpha.canada.ca/") > -1:
                githubURL = pageURL.toString().replace(new RegExp("^https:\/\/design\.cra-arc\.alpha\.canada\.ca\/(.*?)\/((?:.*)(?=\/))?(\/?.*\..+)?"), "https:\/\/github\.com\/alpha-canada-ca\/cra-ucd-guide\/blob\/main\/$1\/$2$3" + pageName);
                break;
        }
        if (githubURL !== null) {
            return githubURL;
        } else {
            return "";
        }
    };

    let devOptionsLocStore = null, 
        editStartContent = "";

    if (devOptions !== null && "locStorage" in devOptions.dataset && devOptions.dataset.locStorage !== "") {
        devOptionsLocStore = localStorage.getItem(devOptions.dataset.locStorage);
    }

    if (devOptionsLocStore === "true" || (devOptions !== null && devOptions.value.toLowerCase() === "true" && devOptionsLocStore !== "false")) {
            let pageInfo, titleElm, subjectElm, descriptionElm, keywordsElm, modifyDateElm, issueDateElm, 
                insertElm = document.getElementById(insertId), 
                gitURL = "", 
                githubLinkInfo = "", 
                notedLinkInfo = "", 
                metadataInfo = "", 
                overlaySec = "", 
                overlayBox = document.querySelector(".wb-lbx"), 
                initOverlayEvent = new CustomEvent("wb-init.wb-lbx", {
                    bubbles: true, 
                    cancelable: true
                }), 
                setEditButton = function setEditButton() {
                    document.getElementById("editBtn").title = "Edit";
                    document.getElementById("editIcon").classList.remove("glyphicon-remove", "glyphicon-floppy-disk");
                    document.getElementById("editIcon").classList.add("glyphicon-edit");
                    document.getElementById("iconText").innerHTML = "Edit";
                }, 
                setStopEditButton = function setStopEditButton() {
                    document.getElementById("editBtn").title = "Stop edit";
                    document.getElementById("editIcon").classList.remove("glyphicon-edit", "glyphicon-floppy-disk");
                    document.getElementById("editIcon").classList.add("glyphicon-remove");
                    document.getElementById("iconText").innerHTML = "Stop edit";
                }, 
                setCacheButton = function setCacheButton() {
                    document.getElementById("editBtn").title = "Cache edits";
                    document.getElementById("editIcon").classList.remove("glyphicon-edit", "glyphicon-remove");
                    document.getElementById("editIcon").classList.add("glyphicon-floppy-disk");
                    document.getElementById("iconText").innerHTML = "Cache edits";
                }, 
                tinyMCEInit = function () {
                    tinymce.remove();
                    tinymce.init({
                        promotion: false, 
                        license_key: "gpl", 
                        init_instance_callback: function (ed) {
                            pageOrigin = document.querySelector("mat-drawer-content").innerHTML;

                            // Load modified page content if it exists from local Storage
                            if (localStorage.getItem(pageKey)) {
                                document.querySelector("mat-drawer-content").innerHTML = localStorage.getItem(pageKey);
                            }
                            ed.execCommand("mceVisualBlocks");
                           // ed.target.hide();
                        }, 
                        setup: function (ed) {
                            ed.on("input Change", function (e) {
                                if (e.originalEvent === undefined || ("command" in e.originalEvent === false && ("focusedEditor" in e.originalEvent === true && e.originalEvent.focusedEditor !== null)) || ("command" in e.originalEvent === true && e.originalEvent.command !== "mceVisualBlocks" && e.originalEvent.command !== "mceVisualChars")) {
                                    switch (document.querySelector("mat-drawer-content").innerHTML) {
                                        case pageOrigin:
                                            localStorage.removeItem(pageKey);
                                            pageStorage = null;
                                            document.getElementById("deleteChangeBtn").classList.add("hidden");
                                            setStopEditButton();
                                            break;
                                        case editStartContent:
                                        case pageStorage:
                                            setStopEditButton();
                                            break;
                                        default:
                                            setCacheButton();
                                            break;
                                    }
                                }
                            });
                        }, 
                        plugins: "accordion advlist anchor autolink autoresize charmap code codesample fullscreen help image importcss link lists media nonbreaking pagebreak quickbars searchreplace table visualblocks visualchars save", 
                        toolbar: "undo redo | searchreplace | blocks styles removeformat | bold code | bullist numlist table | link unlink anchor | outdent indent alignnone | hr nonbreaking charmap | visualblocks visualchars | help", 
                        inline: true, 
                        language: "en", 
                        quickbars_image_toolbar: false, 
                        quickbars_selection_toolbar: true, 
                        quickbars_insert_toolbar: false, 
                        relative_urls: false, 
                        entity_encoding: "raw", 
                        importcss_append: true, 
                        content_css: "https://wet-boew.github.io/themes-dist/GCWeb/GCWeb/css/theme.min.css", 
                        selector: "mat-drawer-content"
                    });
                };

            // Add toolbar and buttons
            if (insertElm !== null) {
                gitURL = getGithubURL(window.location.origin + window.location.pathname);
                pageInfo = "<div id=\"devtoolbar\" class=\"pull-right mrgn-rght-md\">\n    <ul class=\"btn-toolbar list-inline\" role=\"toolbar\">\n        <li id=\"editBtnGrp\" class=\"btn-group margin-right-10px\">";
                pageInfo = pageInfo + "<button id=\"editBtn\" class=\"btn-default mdc-button mat-mdc-button-base quartz-button quartz-secondary-button mat-mdc-button mat-unthemed\" data-exit=\"false\" href=\"\" title=\"Edit\"><span id=\"editIcon\" class=\"glyphicon glyphicon-edit mrgn-tp-sm\"></span><span id=\"iconText\" class=\"wb-inv quartz-invisible\">Edit</span></button>";

                pageInfo = pageInfo + "<button id=\"deleteChangeBtn\" class=\"btn-default mdc-button mat-mdc-button-base quartz-button quartz-secondary-button mat-mdc-button mat-unthemed";
                if (localStorage.getItem(pageKey) === null) {
                    pageInfo = pageInfo + " hidden";
                }

                pageInfo = pageInfo + "\" title=\"Remove edits\" href=\"#\"><span class=\"glyphicon glyphicon-trash mrgn-tp-sm\"></span><span class=\"wb-inv quartz-invisible\">Remove edits</span></button>";
                pageInfo = pageInfo + "</li>\n";
                if (notedLinksList !== null && notedLinksList.value !== "") {
                    notedLinksArr = JSON.parse(notedLinksList.value);
                    if ((notedLinksArr.length === 1 && notedLinksArr[0].sourcetitle.trim() !== "") || notedLinksArr.length > 1) {
                        notedLinkInfo = "<h3 class=\"mrgn-tp-sm\">Noted links</h3>\n<ol id=\"notedpages-links\" class=\"list-inline mrgn-bttm-0\">\n";
                        notedLinksArr.forEach(function addNotedLinks(notedLinksData) {
                           notedLinkInfo = notedLinkInfo + "<li><span class=\"glyphicon glyphicon-link mrgn-rght-sm\"></span><a data-exit=\"false\" href=\"" + notedLinksData.sourcelink + "\" target=\"_blank\">" + notedLinksData.sourcetitle + "</a></li>\n";
                        });
                        notedLinkInfo = notedLinkInfo + "</ol>\n";
                    }
                }

                titleElm = document.querySelector("meta[name=dcterms\\.title]");
                if (titleElm !== null && "content" in titleElm === true && titleElm.content.trim() !== "") {
                    metadataInfo = metadataInfo + "<p class=\"mrgn-bttm-sm\"><strong>Title</strong>:&nbsp;" + titleElm.content.trim() + "</p>\n";
                }

                subjectElm = document.querySelector("meta[name=dcterms\\.subject]");
                if (subjectElm !== null && "content" in subjectElm === true && subjectElm.content.trim() !== "") {
                    metadataInfo = metadataInfo + "<p class=\"mrgn-bttm-sm\"><strong>Subject</strong>:&nbsp;" + subjectElm.content.trim() + "</p>\n";
                }

                descriptionElm = document.querySelector("meta[name=dcterms\\.description]");
                if (descriptionElm !== null && "content" in descriptionElm === true && descriptionElm.content.trim() !== "") {
                    metadataInfo = metadataInfo + "<p class=\"mrgn-bttm-sm\"><strong>Description</strong>:&nbsp;" + descriptionElm.content.trim() + "</p>\n";
                }

                if (keywords !== null && keywords.value.trim() !== "") {
                    metadataInfo = metadataInfo + "<p><strong>Keywords</strong>:&nbsp;<span id=\"pageKeywords\" class=\"mrgn-lft-sm\">" + keywords.value + "</span></p>";
                } else {
                    keywordsElm = document.querySelector("meta[name=dcterms\\.keywords]");
                    if (keywordsElm !== null && "content" in keywordsElm === true && keywordsElm.content.trim() !== "") {
                        metadataInfo = metadataInfo + "<p class=\"mrgn-bttm-sm\"><strong>Keywords</strong>:&nbsp;" + keywordsElm.content.trim() + "</p>\n";
                    }
                }

                modifyDateElm = document.querySelector("meta[name=dcterms\\.modified]");
                if (modifyDateElm !== null && "content" in modifyDateElm === true && modifyDateElm.content.trim() !== "") {
                    metadataInfo = metadataInfo + "<p class=\"mrgn-bttm-sm\"><strong>Date modified</strong>:&nbsp;" + modifyDateElm.content.trim() + "</p>\n";
                }

                issueDateElm = document.querySelector("meta[name=dcterms\\.issued]");
                if (issueDateElm !== null && "content" in issueDateElm === true && issueDateElm.content.trim() !== "") {
                    metadataInfo = metadataInfo + "<p class=\"mrgn-bttm-sm\"><strong>Date issued</strong>:&nbsp;" + issueDateElm.content.trim() + "</p>\n";
                }

                pageInfo = pageInfo + "        <li id=\"resBtnGrp\" class=\"btn-group margin-right-10px\"><button id=\"resolutionBtn\" class=\"btn-default mdc-button mat-mdc-button-base quartz-button quartz-secondary-button mat-mdc-button mat-unthemed\" data-exit=\"false\" href=\"#\" title=\"View page at different WET resolution widths\" target=\"_blank\"><span class=\"glyphicon glyphicon-resize-horizontal mrgn-tp-sm\"></span><span class=\"wb-inv quartz-invisible\">View page at different WET resolution widths</span></button></li>\n";

                if (gitURL !== "") {
                    githubLinkInfo = githubLinkInfo + "        <p><a id=\"githubOverlayBtn\" data-exit=\"false\" href=\"#\" target=\"_blank\"><span class=\"fab fa-github mrgn-tp-sm mrgn-rght-sm\"></span>Go to GitHub source</a></p>\n";
                }

                if (notedLinkInfo + githubLinkInfo + metadataInfo !== "") {
                    pageInfo = pageInfo + "        <li id=\"pageInfoBtnGrp\" class=\"btn-group margin-right-10px\"><button id=\"pageInfoBtn\" popovertarget=\"dev-page-info\" type=\"button\" class=\"btn-default mdc-button mat-mdc-button-base quartz-button quartz-secondary-button mat-mdc-button mat-unthemed wb-lbx\" data-exit=\"false\" href=\"#dev-page-info\" aria-controls=\"dev-page-info\" role=\"button\" title=\"Page information\"><span class=\"glyphicon glyphicon-info-sign mrgn-tp-sm\"></span><span class=\"wb-inv quartz-invisible\">Page information</span></button></li>\n";
                }

                if (gitURL !== "") {
                    pageInfo = pageInfo + "        <li id=\"githubBtnGrp\" class=\"btn-group margin-right-10px\"><button id=\"githubBtn\" class=\"btn-default mdc-button mat-mdc-button-base quartz-button quartz-secondary-button mat-mdc-button mat-unthemed\" data-exit=\"false\" href=\"#\" title=\"Go to GitHub source\" target=\"_blank\"><span class=\"fab fa-github mrgn-tp-sm\"></span><span class=\"wb-inv quartz-invisible\">Go to GitHub source</span></button></li>\n";
                }

                pageInfo = pageInfo + "    </ul>\n</div>\n";
                insertElm.innerHTML = pageInfo + insertElm.innerHTML;
                if (notedLinkInfo + githubLinkInfo + metadataInfo !== "") {
                    overlaySec = overlaySec + "<div class=\"quartz-invisible cdk-overlay-backdrop cdk-overlay-dark-backdrop cdk-overlay-backdrop-showing\"></div><div class=\"quartz-invisible cdk-global-overlay-wrapper\" dir=\"ltr\" style=\"justify-content: center; align-items: center;\"><div id=\"dev-page-info\" class=\"cdk-overlay-pane quartz-dialog-container mat-mdc-dialog-panel\" style=\"max-width: 800px;\"><div tabindex=\"0\" class=\"cdk-visually-hidden cdk-focus-trap-anchor\" aria-hidden=\"true\"></div><mat-dialog-container tabindex=\"-1\" class=\"mat-mdc-dialog-container mdc-dialog cdk-dialog-container mat-mdc-dialog-container-with-actions mdc-dialog--open\" id=\"dev-page-info-dialog\" role=\"dialog\" aria-modal=\"true\" style=\"--mat-dialog-transition-duration: 150ms;\"><div class=\"mdc-dialog__container\"><div class=\"mat-mdc-dialog-surface mdc-dialog__surface\"><quartz-dialog-content class=\"component mat-mdc-dialog-component-host ng-star-inserted\"><div class=\"quartz-dialog\"><div class=\"quartz-dialog-title\"><quartz-icon-button mat-dialog-close=\"\" class=\"closed ng-star-inserted\" type=\"button\"><button class=\"mat-mdc-tooltip-trigger quartz-button quartz-icon-button mdc-icon-button mat-mdc-icon-button grey-text-color mat-unthemed mat-mdc-button-base\" type=\"\" name=\"\" value=\"\"><span class=\"mat-mdc-button-persistent-ripple mdc-icon-button__ripple\"></span><mat-icon role=\"img\" class=\"mat-icon notranslate material-icons mat-ligature-font mat-icon-no-color ng-star-inserted\" aria-hidden=\"true\" data-mat-icon-type=\"font\"> close </mat-icon><span class=\"quartz-invisible ng-star-inserted\">closes popup window</span><span class=\"mat-mdc-focus-indicator\"></span><span class=\"mat-mdc-button-touch-target\"></span><span class=\"mat-ripple mat-mdc-button-ripple\"></span></button></quartz-icon-button><div class=\"mat-mdc-dialog-title\"><h2 class=\"mat-mdc-dialog-title\">Page information</h2></div></div><mat-dialog-content id=\"dev-info-body\" class=\"mat-mdc-dialog-content mdc-dialog__content\">\n"
                    overlaySec = overlaySec + notedLinkInfo;
                    overlaySec = overlaySec + githubLinkInfo;
                    if (notedLinkInfo + githubLinkInfo !== "" && metadataInfo !== "") {
                        overlaySec = overlaySec + "\n<hr>\n";
                    }
                    if (metadataInfo !== "") {
                        overlaySec = overlaySec + "<h3 class=\"mrgn-tp-sm mrgn-bttm-md\">Metadata</h3>\n" + metadataInfo;
                    }
                    overlaySec = overlaySec + "</div><mat-dialog-actions class=\"mat-mdc-dialog-actions mdc-dialog__actions ng-star-inserted\"><quartz-secondary-button mat-dialog-close=\"\" type=\"button\"><button mat-button=\"\" class=\"quartz-button quartz-secondary-button mdc-button mat-mdc-button mat-unthemed mat-mdc-button-base\" type=\"\" name=\"\" value=\"\"><span class=\"mat-mdc-button-persistent-ripple mdc-button__ripple\"></span><span class=\"mdc-button__label\">Close</span><span class=\"mat-mdc-focus-indicator\"></span><span class=\"mat-mdc-button-touch-target\"></span></button></quartz-secondary-button></mat-dialog-actions></mat-dialog-content></div></quartz-dialog-content></div></div></mat-dialog-container><div tabindex=\"0\" class=\"cdk-visually-hidden cdk-focus-trap-anchor\" aria-hidden=\"true\"></div></div>\n";
                    let infoOverlayElm = document.querySelector("div.cdk-overlay-container");
                    if (infoOverlayElm !== null && infoOverlayElm !== undefined) {
                        infoOverlayElm.insertAdjacentHTML("beforeend", overlaySec);
                    } else {
                        document.body.insertAdjacentHTML("beforeend", "<div class=\"quartz-invisible cdk-overlay-container\" aria-hidden=\"true\">" + overlaySec + "</div>");
                    }
//                    insertElm.outerHTML = insertElm.outerHTML + overlaySec;

                    if (overlayBox !== null) {
                        overlayBox.dispatchEvent(initOverlayEvent);
                    }
                }
            }

            if (document.getElementById("devtoolbar") !== null) {

                // Initialize Edit button
                if (document.getElementById("editBtn") !== null) {
                    document.getElementById("editBtn").addEventListener("click", function (event) {
                        let currentContent, 
                            editArea = document.querySelector("mat-drawer-content");

                        if (editArea !== null) {
                            currentContent = editArea.innerHTML;
                            if (editArea.contentEditable === "true") {

                                // Caches current modified page content to local storage
                                if (editStartContent !== "") {
                                    if (pageOrigin === currentContent) {
                                        localStorage.removeItem(pageKey);
                                        document.getElementById("deleteChangeBtn").classList.add("hidden");

                                    } else if (editStartContent !== currentContent) {
                                        localStorage.setItem(pageKey, currentContent);
                                        document.getElementById("deleteChangeBtn").classList.remove("hidden");
                                    }
                                    editStartContent = "";
                                }
                                editArea.contentEditable = "false";
                               // tinymce.activeEditor.execCommand("mceVisualBlocks");
                               // tinymce.activeEditor.hide();
                                tinymce.remove();
                                setEditButton();
                               // document.designMode = "off";
                            } else {
                                tinyMCEInit();
                                editArea.contentEditable = "true";
                               // tinymce.activeEditor.execCommand("mceVisualBlocks");
                               // tinymce.activeEditor.show();
                                editStartContent = editArea.innerHTML;
                                setStopEditButton();
                               // document.designMode = "on";
                            }
                        }
                        void 0;
                        event.preventDefault();
                    });
                }

                // Delete page edits button
                document.getElementById("deleteChangeBtn").addEventListener("click", function() {
                    document.querySelector("mat-drawer-content").innerHTML = pageOrigin;
                    localStorage.removeItem(pageKey);
                    editStartContent = "";
                    document.getElementById("deleteChangeBtn").classList.add("hidden");
                    setEditButton();
                });

                // resize page width button
                document.getElementById("resolutionBtn").addEventListener("click", function() {
                    let defaultFrameHeight = 505, 
                        frameWidthXS = 480, 
                        frameWidthSM = 991, 
                        frameWidthMD = 1199, 
                        frameWidthXSmax = 767, 
                        frameWidthSMmax = 991, 
                        frameWidthMDmax = 1199, 
                        generateResolutionPage = function generateResolutionPage(pageURL) {
                            let header, resPage, pgtitle, iframe, 
                                resArr = [
                                    { width: frameWidthXS, label: "Extra small devices (<768px)" }, 
                                    { width: frameWidthSM, label: "Small devices (<992px)" }, 
                                    { width: frameWidthMD, label: "Medium devices (<1200px)" }, 
                                ], 
                                getFilenameFromUrlSplit = function (pageURL) {
                                    let filenameWithParams, questionMarkIndex;

                                    if (pageURL) {
                                        filenameWithParams = pageURL.split("/").pop();
                                        questionMarkIndex = filenameWithParams.indexOf("?");
                                        if (questionMarkIndex !== -1) {
                                            return filenameWithParams.substring(0, questionMarkIndex);
                                        }
                                        return filenameWithParams;
                                    }
                                    return "";
                                };

                            resPage = window.open("", "_blank").document;
                            if (resPage !== null || resPage.closed === false) {
                                header = resPage.createElement("h1");
                                header.textContent = pageURL;
                                resPage.body.appendChild(header);
                                resArr.forEach(function (sizedata) {
                                    let subhead = resPage.createElement("h2"), 
                                        sp = resPage.createElement("span"), 
                                        frameContainer = resPage.createElement("div");

                                    iframe = resPage.createElement("iframe");
                                    subhead.textContent = sizedata.label + " ";
                                    sp.style.color = "palegoldenrod";
                                    sp.textContent = sizedata.width + "px";
                                    subhead.appendChild(sp);
                                    subhead.style.background = "black";
                                    subhead.style.color = "white";
                                    subhead.style.padding = "10px 20px";
                                    // frameContainer.style.width = sizedata.width;
                                    frameContainer.appendChild(subhead);
                                    iframe.src = pageURL;
                                    iframe.sandbox = "allow-scripts";
                                    iframe.style.width = sizedata.width + "px";
                                    iframe.style.border = "2px solid black";
                                    iframe.style.height = defaultFrameHeight + "px";
                                    iframe.draggable = "true";
                                    frameContainer.appendChild(iframe);
                                    resPage.body.appendChild(frameContainer);
                                }, resPage);
                                pgtitle = resPage.createElement("title");
                                pgtitle.textContent = "WET page widths [" + getFilenameFromUrlSplit(pageURL) + "]";
                                resPage.head.appendChild(pgtitle);
                            }
                        }, 
                        getQueryEl = function getQueryEl(field, val) {
                            // Get a querystring value
                            const params = new Proxy(new URLSearchParams(window.location.search), {
                                get: (searchParams, prop) => searchParams.get(prop), 
                            });

                            if (params[field] !== null) {
                                return params[field];
                            }
                            return val;
                        }, 
                        getFrameWidth = function getFrameWidth(widthval, queryVal, minwidth, maxwidth) {
                            widthval = getQueryEl(queryVal, widthval);
                            if (widthval > maxwidth) {
                                return widthval = maxwidth;
                            } else if (widthval < minwidth) {
                                return (widthval = minwidth);
                            }
                            return widthval;
                        };

                    defaultFrameHeight = getQueryEl("ifheight", defaultFrameHeight);
                    frameWidthXS = getFrameWidth(frameWidthXS, "ifwidthxs", 0, frameWidthXSmax)
                    frameWidthSM = getFrameWidth(frameWidthSM, "ifwidthsm", frameWidthXSmax + 1, frameWidthSMmax);
                    frameWidthMD = getFrameWidth(frameWidthMD, "ifwidthmd", frameWidthSMmax + 1, frameWidthMDmax);
                    generateResolutionPage(window.location.origin + window.location.pathname);
                });

                // Initialize GitHub button
                if (gitURL !== "") {
                    if (document.getElementById("githubBtn") !== null) {
                        document.getElementById("githubBtn").href = gitURL;
                    }

                    if (document.getElementById("githubOverlayBtn") !== null) {
                        document.getElementById("githubOverlayBtn").href = gitURL;
                    }
                }
            }
    }