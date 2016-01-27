/* globals chrome: true, ace: true */

function saveChanges() {
    var $el = $(this).parents('div.rule');
    var pattern = $el.find('[name=pattern]').val(),
        runAt = $el.find('select.runAt').val(),
        runIn = $el.find('select.runIn').val(),
        scripts = $el.find('div.code')[0].editor.getValue();

    if (!pattern || !scripts) {
        return;
    }

    chrome.storage.local.get(['rules'], function(data) {
        var rules = data.rules || {};

        var lastPattern = $el.find('[name=pattern]').attr('data-lastPattern');
        if (lastPattern !== pattern) {
            if (lastPattern) {
                delete rules[lastPattern];
            }
            $el.find('[name=pattern]').attr('data-lastPattern', pattern);
        }

        rules[pattern] = {
            code: scripts,
            runAt: runAt,
            runIn: runIn
        };

        chrome.storage.local.set({
            'rules': rules
        }, function() {
            chrome.runtime.sendMessage({
                method: "updateRules"
            });
        });
        window.close();
    });
}

function deleteRule() {
    var $el = $(this).parents('div.rule');

    chrome.storage.local.get(['rules'], function(data) {
        var rules = data.rules || {};
        var lastPattern = $el.find('[name=pattern]').attr('data-lastPattern');
        chrome.runtime.sendMessage({
            method: "removeRule",
            pattern: lastPattern
        });
        $el.find('div.code')[0].editor = null;
        $el.remove();
    });
}

function initPage() {
    chrome.tabs.getSelected(null, function(tab) {
        var url = tab.url;
        $('#pattern').val(url);

        chrome.storage.local.get(['rules'], function(data) {
            var rules = data.rules;
            var matchedRules = [];

            for (var key in rules) {
                if (rules.hasOwnProperty(key)) {
                    try {
                        var reg = new RegExp(key);
                    } catch (e) {
                        console.log('injector: ', e);
                        continue;
                    }

                    if (reg.test(url)) {
                        var rule = rules[key];
                        if (typeof rule === 'string') {
                            rule = {
                                code: rule
                            };
                        }
                        matchedRules.push({
                            pattern: key,
                            code: rule.code,
                            runAt: rule.runAt,
                            runIn: rule.runIn
                        });
                    }
                }
            }

            if (matchedRules.length === 0) {
                matchedRules.push({
                    pattern: convertUrlToRegexpString(url),
                    code: '',
                    runAt: 'document_idle',
                    runIn: 'window'
                });
            }

            var template = $('#tpl').html(),
                nodes = [];
            for (var i = 0, len = matchedRules.length; i < len; i++) {
                var $node = $(template);
                var match = matchedRules[i];
                $node.find('input[name=pattern]').val(match.pattern)
                    .attr('data-lastPattern', match.pattern);
                $node.find('div.code').html(match.code);
                $node.find('select.runAt').val(match.runAt);
                $node.find('select.runIn').val(match.runIn);
                nodes.push($node);
            }
            $('#rules').append(nodes);

            // init editor
            $('#rules div.code').each(function() {
                var editor = ace.edit(this);
                editor.renderer.setShowGutter(false);
                editor.getSession().setMode("ace/mode/javascript");
                editor.setOptions({
                    maxLines: Infinity,
                    minLines: 25
                });
                this.editor = editor;
            });
        });

        $('button[name=new]').click(function() {
            var template = $('#tpl').html();
            var $node = $(template);
            $node.find('input[name=pattern]').val(convertUrlToRegexpString(url))
                .attr('data-lastPattern', '');
            $node.find('div.code').html('');

            // init editor
            var codeEl = $(this).parent().after($node).next().find('div.code');
            var editor = ace.edit(codeEl[0]);
            editor.renderer.setShowGutter(false);
            editor.getSession().setMode("ace/mode/javascript");
            editor.setOptions({
                maxLines: Infinity,
                minLines: 25
            });
            codeEl[0].editor = editor;
        });

        $('button[name=manage]').click(function() {
            var newURL = "manage.html";
            chrome.tabs.create({
                url: newURL
            });
        });
    });

    $('#rules').delegate('button[name=save]', 'click', saveChanges);
    $('#rules').delegate('button[name=delete]', 'click', deleteRule);
    /**
    $('#rules').delegate('button.prettyPrint', 'click', function() {
        var editor = $(this).parents('div.rule').find('div.code')[0].editor;
        editor.setValue(prettyprint(editor.getValue()));
    });
    **/

    $('#rules').delegate('select.runIn', 'change', function() {
        var val = $(this).val();
        if (val === 'window') {
            $(this).parents('div.rule').find('select.runAt').parent().show();
        } else {
            $(this).parents('div.rule').find('select.runAt').parent().hide();
        }
    });

    console.log('fired');
}

$(initPage);


/***** utils **/
function convertUrlToRegexpString(url) {
    var regStr = url.replace(/([^0-9a-zA-Z])/g, '\\$1');
    return regStr;
}

function prettyprint(code) {
    return code;
}
