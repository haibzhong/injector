var rules = chrome.runtime.sendMessage({
    method: "getRules"
}, function(rules) {
    var html = [];
    for (var pattern in rules) {
        if (rules.hasOwnProperty(pattern)) {
            var rule = rules[pattern];
            html.push('<tr><td>' 
                + pattern + '</td><td>' 
                + (rule.runIn || '') + '</td><td>' 
                + (rule.runAt || '')  + '</td><td class="' + (rule.code ? '' : 'red') + '"><pre>' 
                + rule.code + '</pre></td><td><button class="remove">remove</button></td></tr>');
        }
    }

    html.sort(function(item) {
        return item.pattern;
    });

    $('table.rules tbody').append(html.join(''));
});
