    "use strict";

    let exitOrigin, pagetitle, 
        devOptionsLocStore = null, 
        pageURL = window.location, 
        devOptions = document.getElementById("devoptions"), 
        getQueryEl = function getQueryEl(field) {
            const params = new Proxy(new URLSearchParams(pageURL.search), {
                get: (searchParams, prop) => searchParams.get(prop),
            });
            return params[field];
        };

    //script for back button
    document.getElementById("back").addEventListener("click", () => {
        history.back();
    });

    //script for leave site button
    if (typeof URLSearchParams !== "undefined" && devOptions !== null) {
        if ("locStorage" in devOptions.dataset && devOptions.dataset.locStorage !== "") {
            devOptionsLocStore = localStorage.getItem(devOptions.dataset.locStorage);
        }

        exitOrigin = getQueryEl("uri");
        if (exitOrigin !== null && (devOptionsLocStore === "true" || (devOptions.value.toLowerCase() === "true" && devOptionsLocStore !== "false"))) {
            pagetitle = getQueryEl("pagetitle");
            if (pagetitle !== null) {
                document.getElementById("leavesitelnk").innerHTML = pagetitle;
            } else {
                document.getElementById("leavesitelnk").innerHTML = exitOrigin;
            }
            document.getElementById("leavesitelnk").addEventListener("click", () => {
                let extractQuerystring = function extractQuerystring() {
                        const params = new URLSearchParams(pageURL.search);

                        params.delete("pagetitle");
                        params.delete("uri");
                        return params.toString();
                    },
                    queryStr = extractQuerystring();

                if (queryStr !== "") {
                    queryStr = "?" + queryStr;
                }
                window.location = exitOrigin + queryStr + window.location.hash;
            });
            document.getElementById("exitLink").classList.remove("hidden");
        }

        //remove exit script button if no value sent
        if (getQueryEl("exturl") !== null && (devOptionsLocStore === "true" || (devOptions.value.toLowerCase() === "true" && devOptionsLocStore !== "false"))) {
            document.getElementById("exitWETLink").classList.remove("hidden");
//            $("#exitWETLink").trigger("wb-init.wb-exitscript");
        }
    }