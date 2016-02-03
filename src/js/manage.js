import '../css/manage.scss';

/* globals chrome: true*/
chrome.runtime.sendMessage({
    method: "getRules"
}, function(rules) {
    var html = [];
    for (var pattern in rules) {
        if (rules.hasOwnProperty(pattern)) {
            var rule = rules[pattern];
            html.push('<tr data-pattern="' +  pattern + '"><td>' +
                pattern + '</td><td>' +
                (rule.runIn || '') + '</td><td>' +
                (rule.runAt || '')  + '</td><td class="' + (rule.code ? '' : 'red') + '"><pre class="prettyprint linenums">' +
                rule.code + '</pre></td><td><button class="remove">remove</button></td></tr>');
        }
    }

    html.sort(function(item) {
        return item.pattern;
    });

    $('table.rules tbody').append(html.join(''));

    PR.prettyPrint();
});

$('table.rules').delegate('button.remove', 'click', function() {
    var $row = $(this).parents('tr');
    chrome.runtime.sendMessage({
        method: 'removeRule',
        pattern: $row.attr('data-pattern')
    }, function(success) {
        if (success) {
            $row.hide('slow', function() {
                $row.remove();
            });
        }
    });
});
