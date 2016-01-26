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
                var reg;
                try {
                    reg = new RegExp(key);
                } catch (e) {
                    continue;
                }
                var rule = rules[key];
                if (!rule.runIn) {
                    rule.runIn = 'window';
                }

                if (reg.test(url) && (!runIn || runIn === rule.runIn) && (!runAt || runAt === rule.runAt)) {
                    scripts.push({
                        runAt: rule.runAt,
                        code: rule.code,
                        runIn: rule.runIn
                    });
                }
            }
        }
        return scripts;
    }
}

/**
 * add listener to run script in tab
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {
        ['document_start', 'document_end', 'document_idle'].forEach(function(runAt) {
            chrome.tabs.executeScript(tabId, {
                runAt: runAt,
                code: 'console.log("injector in background:  + ' + runAt + '")'
            });
        });

        var rules = getRules(tab.url, 'window');
        for (var i = 0, len = rules.length; i < len; i++) {
            var rule = rules[i];
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
});

/**
 * script run in background
 */
chrome.webRequest.onBeforeRequest.addListener(function(details) {
    var rules = getRules(details.url, 'background');
    var ret = {};

    rules.forEach(function(rule) {
        var line = rule.code.split(':'),
            retKey = line.length > 1 ? line[0] : null,
            code = line[~~!!retKey],
            codes = code.split(/\n;/);

        codes.forEach(function(statment) {
            if (statment) {
                var r = runInBackground(details, statment);
                for (var key in r) {
                    if (r.hasOwnProperty(key)) {
                        var rkey = retKey || key;
                        ret[rkey] = r[key];
                        if (rkey === 'requestHeaders') {
                            if (!(ret[rkey] instanceof Array)) {
                                ret[rkey] = [];
                            }

                            for (var k in r[key]) {
                                if (r[key].hasOwnProperty(k)) {
                                    ret[rkey].push({
                                        name: k,
                                        value: r[key][k]
                                    });
                                }
                            }

                        }
                    }
                }
            }
        });
    });

    return ret;
}, {
    urls: ['<all_urls>']
}, ['blocking']);

var runInBackground = (function() {
    var functions = {
        replace: function() {
            var args = arguments;
            var val = this.valueOf();
            var target = args[args.length - 1];
            for (var i = 0; i < args.length - 1; i++) {
                val = val.replace(args[i], target);
            }
            return val;
        },
        is: function(value) {
            return value;
        }
    };

    return function(details, statment) {
        var codes = statment.split(/[\.\(]/),
            len = codes.length,
            name = codes.slice(0, len - 2),
            fn = codes[len - 2],
            args = codes[len - 1].replace(/[\(\);]/g, '').split(',');
        var d = details;
        name.forEach(function(key) {
            if (key) {
                d = d[key] || '';
            }
        });

        args.forEach(function(item, index, self) {
            item = item.trim();
            if (/^[\'\"].*[\'\"]$/.test(item)) {
                self[index] = item.slice(1, item.length - 1);
            }
        });

        var root = {}, ret = root;
        for (var i = 0, nlen = name.length; i < nlen - 1; i++) {
            var key = name[i];
            if (key) {
                ret = ret[key] = {};
            }
        }
        ret[name[i]] = functions[fn].apply(d, args);

        return root;
    };
})();


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method === "getRules") {
        sendResponse(getRules(request.url, request.runIn, request.runAt));
    } else if (request.method === "updateRules") {
        updateRules();
    }
});
