// To check if sidepanel is open or closed
// chrome.runtime.connect({ name: 'mySidepanel' });

///////////////
// Page Notes//
///////////////

const pnHelpButton = document.getElementById("page-notes-help-tab-button")

async function setActiveURL(url, autoOpen=false) {
    const table = document.getElementById("page-notes-matching-url-table");
    table.innerHTML = "";

    document.getElementById("page-notes-indicator").innerText = "";
    const page_notes = await get_matching_page_notes(url); 
    console.log("Searched. Page notes returned ", page_notes.length)
    if (page_notes.length > 0) { 
        document.getElementById("no-matching-page-notes").classList.add("hidden")
        document.getElementById("page-notes-indicator").innerText = "(" + page_notes.length + ")";
        makePageNoteTable(page_notes, table)
    } else {
        document.getElementById("no-matching-page-notes").classList.remove("hidden")
    }

    
    if (page_notes.length === 1 && pageNotesTabButton.classList.contains("hidden") && autoOpen) {
        open_page_note(page_notes[0].id, inPreview=true)
    } 
    // Sidepanel would have to be in focus... 
    // else {
    //     setTimeout(function () {
    //         document.getElementById("page-notes-search").click()
    //         document.getElementById("page-notes-search").focus()
    //     }, 1000)
    // } 
}


document.addEventListener("DOMContentLoaded", async function () {
    url = await getCurrentURL()
    console.log("======= dom tab url", url)
    setActiveURL(url, autoOpen=true);
});
        
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.active) {
        url = await getCurrentURL()
        console.log("======= active tab url", tab.url);
        setActiveURL(url);
    }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tab.active) {
        url = await getCurrentURL()
        console.log("======= updated tab url", tab.url);
        setActiveURL(url);
    }
});

document.getElementById("add-current-url").addEventListener("click", async function () {
    const url = await get_current_url()
    let url_pattern = await get_default_pattern(url)
    url_pattern = url_pattern.substring(0, maxPageNotesURLChar-1);
    url_pattern = urlPatternElement.value + "|" + url_pattern
    urlPatternElement.value = url_pattern
})

document.getElementById("add-current-domain").addEventListener("click", async function () {
    const url = await get_current_url()
    let domain = await get_default_title(url)
    let url_pattern = await get_default_pattern(domain)
    url_pattern = url_pattern.substring(0, maxPageNotesURLChar-1);
    url_pattern = urlPatternElement.value + "|" + url_pattern
    urlPatternElement.value = url_pattern
})

//////////////////////////////////
// Open this in the options page//
//////////////////////////////////

// document.getElementById("open-page-note-in-options").addEventListener("click", async function() {
//     const pageNoteId = idElement.value
//     const url = await chrome.runtime.getURL('options.html') + '#' + pageNoteId;
//     chrome.tabs.create({ url: url });

// });

async function quickEdit() {
    const previewIsActive = easyMDE.isPreviewActive();
    if (previewIsActive) {
        easyMDE.togglePreview();
    }
    easyMDE.codemirror.focus();
    save_page_note();
    easyMDE.codemirror.focus();
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request, sender) 
        if (request.type === "open-side-panel") {
            quickEdit();
        } else if (request.type === "open-key-board-shortcuts") {
            openKeyBoardShortcuts()
        }
});

function openKeyBoardShortcuts() {
    console.log("Help button clicked")
    pnHelpButton.click()
    if (easyMDE.isFullscreenActive()){
        easyMDE.toggleFullScreen
    }
    for (const [key, value] of Object.entries(pageNoteConfigOverwrite["shortcuts"])) {
        const element = document.getElementById("kbs_" + key);
        if (element) {
            element.innerText = value;
        } else {
            console.log(`Element with ID ${key} not found.`);
        }
    }
}


document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key === "?") {
        openKeyBoardShortcuts()
    }
})


///////////////////////
// REGEX PAGE SEARCH //
///////////////////////


// function highlightPatternMatches(regexInput) {
//     let marks = []; 
//     let matched_text = [];

//     function findMatchAndRecurse(element, regex) {
//         if (element.childNodes.length > 0) {
//             for (var i = 0; i < element.childNodes.length; i++) {
//                 findMatchAndRecurse(element.childNodes[i], regex);
//             }
//         }

//         var str = element.nodeValue;

//         if (str == null) {
//             // console.log(`${element} has no text -- Search for ${regex}`)
//             return;
//         }

//         var matches = str.match(regex);
//         // var parent = element.parentNode;

//         if (matches !== null) {
//             // console.log(`${element} HAS A MATCH -- Search for ${regex}`)
//             // // for match in matches
//             // for (var i = 0; i < matches.length; i++) {
                
//             // }

//             const parent = element.parentNode;
//                 const originalText = element.nodeValue;
//                 let pos = 0;
//                 let mark;

//                 for (let i = 0; i < matches.length; i++) {
//                     const { match, index } = matches[i];

//                     const before = document.createTextNode(originalText.substring(pos, index));
//                     pos = index + match.length;

//                     if (element.parentNode === parent) {
//                         parent.replaceChild(before, element);
//                     } else {
//                         parent.insertBefore(before, mark.nextSibling);
//                     }

//                     mark = document.createElement('mark');
//                     mark.appendChild(document.createTextNode(match));
//                     parent.insertBefore(mark, before.nextSibling);
//                     marks.push(mark);
//                 }

//                 const after = document.createTextNode(originalText.substring(pos));
//                 parent.insertBefore(after, mark.nextSibling);

//             // var pos = 0;
//             // var mark;
//             // for (var i = 0; i < matches.length; i++) {
//             //     var index = str.indexOf(matches[i], pos);
//             //     var before = document.createTextNode(str.substring(pos, index));
//             //     pos = index + matches[i].length;

//             //     if (element.parentNode == parent) {
//             //         parent.replaceChild(before, element);
//             //     } else {
//             //         parent.insertBefore(before, mark.nextSibling);
//             //     }

//             //     mark = document.createElement('mark');
//             //     mark.appendChild(document.createTextNode(matches[i]));
//             //     parent.insertBefore(mark, before.nextSibling);
//             //     marks.push(mark);
//             // }
//             // var after = document.createTextNode(str.substring(pos));
//             // parent.insertBefore(after, mark.nextSibling);
//         } else {
//             // console.log(`${element} has no match -- Search for ${regex}`)
//         }
//     }

//     console.log(`Regex search running for regex "${regexInput}"`);
//     const regex = new RegExp(regexInput, 'gi');
//     const body = document.body;

//     findMatchAndRecurse(body, regex);

//     return marks.length;
// }

function highlightPatternMatches(regexInput, inclusiveSearch=false) {
    function clearPreviousMarks() {
        const marks = document.querySelectorAll('mark');
        marks.forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize(); // Combine adjacent text nodes
        });
    }
    function isVisible(element) {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
    
        // Check if the element is visible and not covered up by other elements
        if (inclusiveSearch) {
            return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0'
            );
        } else {return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            element === document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        );}
    }
    

    clearPreviousMarks(); // Clear any previous highlights

    let matches = [];

    function findMatchAndRecurse(element, regex) {
        if (element.childNodes.length > 0) {
            for (let i = 0; i < element.childNodes.length; i++) {
                findMatchAndRecurse(element.childNodes[i], regex);
            }
        }

        if (element.nodeType === Node.TEXT_NODE && isVisible(element.parentNode)) {
            const str = element.nodeValue;
            if (str == null) {
                return;
            }

            const parent = element.parentNode;
            const originalText = element.nodeValue;
            const regexMatches = [...originalText.matchAll(regex)];

            if (regexMatches.length > 0) {
                let lastIndex = 0;
                const fragment = document.createDocumentFragment();
                let accum = Math.floor(Math.random() * 9000) + 1;

                regexMatches.forEach(match => {
                    accum += 1
                    const matchText = match[0];
                    const matchIndex = match.index;

                    if (matchIndex > lastIndex) {
                        fragment.appendChild(document.createTextNode(originalText.substring(lastIndex, matchIndex)));
                    }

                    const mark = document.createElement('mark');
                    mark.appendChild(document.createTextNode(matchText));
                    mark.id = `mark_${accum}`
                    fragment.appendChild(mark);

                    lastIndex = matchIndex + matchText.length;
                });

                if (lastIndex < originalText.length) {
                    fragment.appendChild(document.createTextNode(originalText.substring(lastIndex)));
                }

                parent.replaceChild(fragment, element);

            }
        }

    }

    console.log(`Regex search running for regex "${regexInput}"`);
    const regex = new RegExp(regexInput, 'gi');
    const body = document.body;

    findMatchAndRecurse(body, regex);

    // After replacement, get the bounding rects of the newly created marks
    const newMarks = document.querySelectorAll('mark');
    newMarks.forEach(newMark => {
        if (isVisible(newMark)) {
            const rect = newMark.getBoundingClientRect();
            matches.push({
                text: newMark.textContent,
                position: {
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height
                },
                id: newMark.id
            });
        }
    });

    return matches;
}





// async function _getMainTabDocument() {
//     return document.body
// }

// async function getMainTabDocument() {
//     let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     return await chrome.scripting.executeScript({
//             target: {tabId: tab.id},
//             function: _getMainTabDocument,
//             args: []
//         })
// }
function highlightElement(position, id) {
    console.log(id)
    window.scrollTo({
        top: position.top - 100, // Adjust offset as needed
        behavior: 'smooth'
    });
    element = document.getElementById(id)
    document.querySelectorAll('mark.highlighted').forEach(mark => {
        mark.classList.remove('highlighted');
    });
    element.classList.add('highlighted');
    // const element = document.elementFromPoint(position.left, position.top);
    // if (element && element.tagName === 'MARK') {
    //     document.querySelectorAll('mark.highlighted').forEach(mark => {
    //         mark.classList.remove('highlighted');
    //     });
    //     element.classList.add('highlighted');
        
    // } else {
    //     console.error('No matching element found or element is not a <mark>.');
    // }
}

const inclusiveSearch = document.getElementById("regex-inclusive");
const back = document.getElementById("regex-search-back")
const next = document.getElementById("regex-search-next")
back.addEventListener("click", async function () {
    const last = document.querySelector(".match-item.bold");
    // Get the row before "last"
    const previousRow = last.previousElementSibling;
    if (previousRow) {previousRow.click()}
})
next.addEventListener("click", async function () {
    const last = document.querySelector(".match-item.bold");
    // Get the row after "last"
    const nextRow = last.nextElementSibling;
    if (nextRow) {nextRow.click()}
})


document.getElementById('regex-search').addEventListener('keydown', async (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        console.log("searching regex")
        
        const regexInput = document.getElementById('regex-search').value;
        const resultsTable = document.getElementById('regex-search-results');
        let matches;

        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: highlightPatternMatches,
            args: [regexInput, inclusiveSearch.checked]
        }, (results) => {
            const matches = results[0].result;

            const rows = resultsTable.querySelectorAll('tr');
            // Iterate over each row
            rows.forEach(row => {
                // Check if the row does not have the class "permanent"
                if (!row.classList.contains('permanent')) {
                    // Remove the row
                    row.remove();
                }
            });
    
            // Check if matches is iterable
            if (Array.isArray(matches)) {
                // Display matches
                matches.forEach((match, index) => {
                    const matchElement = resultsTable.insertRow();
                    const cellOne = matchElement.insertCell();
                    cellOne.innerText = `${index + 1}`
                    const cellTwo = matchElement.insertCell();
                    cellTwo.innerText = `${match.text}`
                    matchElement.classList.add('match-item');
                    
                    matchElement.dataset.position = JSON.stringify(match.position);
                    
                    // Add click event listener to each match item
                    
                    matchElement.addEventListener('click', () => {
                        const last = document.querySelector(".match-item.bold");
                        if (last !== null) {
                            last.classList.remove("bold");
                        }
                        matchElement.classList.add("bold")
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            function: highlightElement,
                            args: [match.position, match.id]
                        });
                    });
                    if (index == 0) {matchElement.click()}
                    // resultsContainer.appendChild(matchElement);
                });              
            } else {
                console.error('Matches is not iterable:', matches);
            }
        });
    }
    
});

/////////
// TOC //
/////////
const tocArea = document.getElementById("toc-area")
const tocTabButton = document.getElementById("toc-tab-button")

function getTOC() {
    const headers = document.querySelectorAll("H1, H2, H3");
    let returnHtml = '<ol>';
    let currentLevel = 1;

    headers.forEach(function(header) {
        if (!header.innerText) { return; }
        let id = header.id || `TOC-ID-${currentLevel}`;
        header.id = id;

        const headerLevel = parseInt(header.tagName.replace(/\D/g, ''), 10);
        if (headerLevel > currentLevel) {
            returnHtml += "<ol>";
        } else if (headerLevel < currentLevel) {
            returnHtml += "</ol>".repeat(currentLevel - headerLevel);
        }

        returnHtml += `<li class='toc-${header.tagName.toLowerCase()} toc-element' id='${id}'>${header.innerText}</li>`;
        currentLevel = headerLevel;
    });

    return returnHtml + "</ol>".repeat(currentLevel) + "</ol>";
}

async function _openTocElement(id) {
    // currentURL = URL + `#${id}`
    const currentURL = new URL(window.location.href);
    currentURL.hash = id;
    window.location.href = currentURL.href;
}

async function openTocElement(element) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: _openTocElement,
        args: [element.id]
    });
}

tocTabButton.addEventListener("click", async function() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getTOC,
        args: []
    }, (results) => {
        console.log(results)
        tocArea.innerHTML = results[0].result;
        document.querySelectorAll(".toc-element").forEach(async function (element) {
            element.addEventListener("click", async function() {
                openTocElement(element)
            })
        })
    });
});



///////////
// OTHER //
///////////

const switchButtons = document.querySelectorAll(".switch-button")
const regexSearchTabButton = document.getElementById("regex-search-tab-button")
const group1 = document.querySelector(".group1")
const group2 = document.querySelector(".group2")

switchButtons.forEach(async function (button) {
    button.addEventListener("click", async function() {
        if (button.classList.contains("group1")) {
            group1.classList.add("hidden")
            group2.classList.remove("hidden")
            regexSearchTabButton.click()
        } else {
            group2.classList.add("hidden")
            group1.classList.remove("hidden")
            openPageNoteButton.click()
        }
    })
})


// EDGE SPECIFIC
if (navigator.userAgent.includes("Edg")) {
    console.log("Edge settings running")
    // Zoom in/out since not supported in Edge
    // Add event listener to detect key presses
    customZoom()
}

async function customZoom() {
    zoomSetting = await getSetting("zoomSetting", 1)
    document.body.style.zoom = zoomSetting

    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey) {
            if (event.key === '+') {
                // Zoom in logic
                document.body.style.zoom = parseFloat(getComputedStyle(document.body).zoom) + 0.1;
                console.log("in")
            } else if (event.key === '-') {
                // Zoom out logic
                document.body.style.zoom = parseFloat(getComputedStyle(document.body).zoom) - 0.1;
                console.log("out")
            }
            storeSetting("zoomSetting", parseFloat(getComputedStyle(document.body).zoom))
        }
    });
}


