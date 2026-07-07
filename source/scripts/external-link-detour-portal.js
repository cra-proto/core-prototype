"use strict";

/**
 * TODO: Add choice to select which exit URL type to use (mine or WET)
 * MAYBE: Add option to bypass exit redirect if specific querystring?
 * Cookie for developer option
 * # Custom settings
developerOptions: true
exitPage: "https://cra-design.github.io/gst-hst-business/exit-intent.html"
externalOrigin: "https://www.canada.ca"
relativeExternalLinks: false

siteBanner: true
exitByURL: false

    <data id="devoptions" value="{{ site.developerOptions }}"></data>
    <data id="exitpage" value="{{ site.exitPage }}"></data>
    <data id="relextlnk" data-origin="{{ site.externalOrigin }}" value="{{ site.relativeExternalLinks }}"></data>
 * 
 * 
 */

//  exitPage.value = "https://cra-design.github.io/gst-hst-business/exit-intent.html",
//  exitPage.dataset.exitByUrl = "false",
//  relExternalLnk.value = "false",
//  relExternalLnk.dataset.origin = "https://www.canada.ca",
let exitPage = document.getElementById("exitpage");
let relExternalLnk = document.getElementById("relextlnk");
let inlineStyleText1, inlineStyleText2, 
    visitedLinkStyle = document.createElement("style"), 
    linkExcludes = [], 
    adjustLinks = function adjustLinks(elm, hrefSelector, actionSelector, formActionSelector, destStartPath) {
        let linkExcludeIndex = function linkExcludeIndex(testURI) {
                return linkExcludes.findIndex(function findlink(linkArr) {
                    if ("origin" in linkArr) {
                        return linkArr.origin.toLowerCase() === testURI.toLowerCase();
                    }
                }, testURI);
            }, 
            adjustHref = function adjustHref(el, destStartPath) {
                let adjustedURI = el, 
                    replaceChar = ["?", "#", "&"];

                if (destStartPath !== "") {
                    adjustedURI = new URL(adjustedURI, destStartPath).href;
                }
                replaceChar.forEach(function entityReplace(arrEl) {
                    adjustedURI = adjustedURI.replace(arrEl, encodeURIComponent(arrEl));
                }, adjustedURI);
                return adjustedURI;
            }, 
            updateFormSubmit = function updateFormSubmit(formEl, formAttr, exitPageURI) {
                let hiddenInEl;

                hiddenInEl = document.createElement("input");
                hiddenInEl.value = adjustHref(formEl[formAttr], destStartPath);
                hiddenInEl.name = "uri";
                hiddenInEl.type = "hidden";
                formEl.append(hiddenInEl);
                formEl[formAttr] = exitPageURI;
            };

        if (exitPage !== null) {
            if (hrefSelector !== "") {
                elm.querySelectorAll(hrefSelector).forEach(function updateExitHref(hrefElm) {
                    const maxURILength = 2048;
                    let queryHash, 
                        pagetitle = encodeURIComponent(hrefElm.innerText), 
                        exitPageURI = exitPage.value, 
                        destURI = adjustHref(hrefElm.href, destStartPath), 
                        currentURI = hrefElm.protocol + "//" + hrefElm.hostname + hrefElm.pathname, 
                        lnkExclIdx = linkExcludeIndex(currentURI);

                    if (lnkExclIdx === -1) {
                        if (pagetitle === "") {
                            pagetitle = encodeURIComponent(hrefElm.textContent);
                        }
                        switch (true) {
                            case (destURI.length > 0 && exitPageURI.length + destURI.length + 5 <= maxURILength):
                                if (destURI.length > 0) {
                                    exitPageURI = exitPageURI + "?uri=" + destURI;
                                }
                            // falls through
                            case (pagetitle.length > 0 && exitPageURI + pagetitle.length + 11 <= maxURILength):
                                if (pagetitle.length > 0) {
                                    exitPageURI = exitPageURI + "&pagetitle=" + pagetitle;
                                }
                        }
                        hrefElm.href = exitPageURI;
                    } else if ("destination" in linkExcludes[lnkExclIdx] === true) {
                        queryHash = hrefElm.href.substring(linkExcludes[lnkExclIdx].origin.length);
                        hrefElm.href = linkExcludes[lnkExclIdx].destination + queryHash;
                    }
                });
            }

            if (actionSelector !== "") {
                elm.querySelectorAll(actionSelector).forEach(function updateExitAction(actionElm) {
                    let queryHash, 
                        exitPageURI = exitPage.value, 
                        currentURI = actionElm.protocol + "//" + actionElm.hostname + actionElm.pathname, 
                        lnkExclIdx = linkExcludeIndex(currentURI);

                    actionElm.method = "GET";
                    if (lnkExclIdx === -1) {
                        updateFormSubmit(actionElm, "action", exitPageURI);
                    } else if ("destination" in linkExcludes[lnkExclIdx] === true) {
                        queryHash = actionElm.href.substring(linkExcludes[lnkExclIdx].origin.length);
                        updateFormSubmit(actionElm, "action", linkExcludes[lnkExclIdx].destination + queryHash);
                    }
                });
            }

            if (formActionSelector !== "") {
                elm.querySelectorAll(formActionSelector).forEach(function updateExitForm(formActionElm) {
                    let queryHash, 
                        exitPageURI = exitPage.value, 
                        currentURI = formActionElm.protocol + "//" + formActionElm.hostname + formActionElm.pathname, 
                        lnkExclIdx = linkExcludeIndex(currentURI);

                    if (lnkExclIdx === -1) {
                        updateFormSubmit(formActionElm, "formaction", exitPageURI);
                    } else if ("destination" in linkExcludes[lnkExclIdx] === true) {
                        queryHash = formActionElm.href.substring(linkExcludes[lnkExclIdx].origin.length);
                        updateFormSubmit(formActionElm, "formaction", linkExcludes[lnkExclIdx].destination + queryHash);
                    }
                });
            }
        }
    }, 
    getDomain = function (url) {
        let pattern = new RegExp("^(https?:\/\/[^\/]+\/[^\/]*\/?)"), 
            domains = pattern.exec(url);

        if (domains !== null) {
            return domains[0];
        }
        return "";
    }, 
    rootDomain = getDomain(globalThis.location.origin + globalThis.location.pathname), 
//    rootDomain = getDomain(globalThis.location.origin + globalThis.location.pathname), 
    defaultadjustLinks = function defaultadjustLinks(elm, isAjaxed, relExternalLnk) {
        adjustLinks(elm, "a[href^='http']:not([href^='" + rootDomain + "'], [data-exit='false'], .wb-exitscript), area[href^='http']:not([href^='" + rootDomain + "'], [data-exit='false'], .wb-exitscript)", "form[action^='http']:not([action^='" + rootDomain + "'], [data-exit='false'], .wb-exitscript)", "input[formaction^='http']:not([formaction^='" + rootDomain + "'], [data-exit='false'], .wb-exitscript), button[formaction^='http']:not([formaction^='" + rootDomain + "'], [formaction^='/'], [data-exit='false'], .wb-exitscript)", "");
        if ((relExternalLnk && relExternalLnk.dataset.origin !== "") && (relExternalLnk.value.toLowerCase() === "true" || isAjaxed === true)) {
            adjustLinks(elm, "a[href^='/']:not([data-exit='false'], .wb-exitscript), area[href^='/']:not([data-exit='false'], .wb-exitscript)", "form[action^='/']:not([data-exit='false'], .wb-exitscript)", "input[formaction^='/']:not([data-exit='false'], .wb-exitscript), button[formaction^='/']:not([data-exit='false'], .wb-exitscript)", relExternalLnk.dataset.origin);
        }
    };


//load link exclude JSON file
if ("modLinkFile" in exitPage.dataset && exitPage.dataset.modLinkFile !== "") {

    fetch(exitPage.dataset.modLinkFile)
        .then(response => response.json())
        .then(data => {
            linkExcludes = data;
    });
}

//Remove visited link highlighting from links to exit page
if (exitPage !== null) {
    inlineStyleText1 = "Not to be copied to Canada.ca";
    inlineStyleText2 = "CSS for GitHub specific elements";
    if (document.documentElement.lang === "fr") {
        inlineStyleText1 = "Ne pas copier sur Canada.ca";
        inlineStyleText2 = "CSS pour les éléments spécifiques à GitHub";
    }
    visitedLinkStyle.innerHTML = "/*\n*** " + inlineStyleText1 + " ***\n\n" + inlineStyleText2 + "\n*//\n\n a[href*='" + exitPage.value + "']:visited { color:inherit; }\n.btn-primary[href*='" + exitPage.value + "']:visited, .btn-success[href*='" + exitPage.value + "']:visited, .btn-info[href*='" + exitPage.value + "']:visited, .btn-danger[href*='" + exitPage.value + "']:visited { color: #ffffff; }\n.btn-default[href*='" + exitPage.value + "']:visited { color: #335075; }\n.btn-warning[href*='" + exitPage.value + "']:visited { color: #000000; }\n";
    document.head.insertAdjacentHTML("beforeend", visitedLinkStyle);
}

// changes all external site links and forms to go to destination link
defaultadjustLinks(document, false, relExternalLnk);