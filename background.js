/* globals chrome: true */

var rules = {};

function updateRules() {
    chrome.storage.local.get(['rules'], function(data) {
        rules = data.rules;
    });
}

updateRules();

function getRules(url, runIn, runAt) {
    if (!url) {
        return rules;
    } else {
        var scripts = [];
        for (var key in rules) {
            if (rules.hasOwnProperty(key)) {
                var reg = new RegExp(key);
                var rule = rules[key];
                if (reg.test(url) && (!runIn || runIn === rule.runIn) && (!runAt || runAt === rule.runAt)) {
                    scripts.push({
                        runAt: rule.runAt,
                        code: rule.code
                    });
                }
            }
        }
        return scripts;
    }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {
        ['document_start', 'document_end', 'document_idle'].forEach(function(runAt) {
            chrome.tabs.executeScript(tabId, {
                runAt: runAt,
                code: 'console.log("injector in background:  + ' + runAt + '")'
            });
        });

        var rules = getRules(tab.url);
        for (var i = 0, len = rules.length; i < len; i++) {
            var rule = rules[i];
            if (rule.runIn === 'background') {
                eval(rule.code);
            } else if (!rule.runIn || rule.runIn === 'window') {
                chrome.tabs.executeScript(tabId, {
                    runAt: rule.runAt,
                    code: 'var tag = document.createElement("script"); tag.innerHTML = "' +
                        'try {\\n' +
                        rule.code.replace(/([\'\"])/g, '\\$1').replace(/\n/g, '\\n') +
                        '\\n}\\n catch(e) {console.error(\\"injector: \\", e)};";' +
                        'document.documentElement.appendChild(tag);'
                });
            }
        }
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method === "getRules") {
        sendResponse(getRules(request.url, request.runIn, request.runAt));
    } else if (request.method === "updateRules") {
        updateRules();
    }
});
