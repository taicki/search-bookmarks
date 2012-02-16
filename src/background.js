String.prototype.escapeHTML = function() {
  return this.replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/&lt;match&gt;/g, '<match>')
    .replace(/&lt;\/match&gt;/g, '</match>');
};

function search(term, callback) {
  chrome.bookmarks.search(term, function(results) {
    callback(term, results);
  });
}

function resetDefaultSuggestion() {
  chrome.omnibox.setDefaultSuggestion({
    description: 'Search Bookmarks'
  });
}

function formatMatch(re, text) {
  return text.replace(re, "<match>$1</match>")
}

function formatResult(terms, url, title) {
  var re = new RegExp('(' + terms.join('|') + ')', 'ig');
  var urlResult = formatMatch(re, url).escapeHTML();
  var titleResult = formatMatch(re, title).escapeHTML();
  return "<url>" + urlResult + "</url> - <dim>" + titleResult + "</dim>";
}

chrome.omnibox.onInputChanged.addListener(
  function (text, suggest) {
    search(text, function(term, nodes) {
      var terms = term.split(/\s/);
      var results = [];
      for (var i = 0, entry; i < 5 && (node = nodes[i]); i++) {
        results.push({
          content: node.url,
          description: formatResult(terms, node.url, node.title)
        });
      }
      suggest(results);
    });
  }
);

chrome.omnibox.onInputEntered.addListener(function(text){
  chrome.tabs.getSelected(null, function(tab) {
    if (text.match(/(^|\s)https?:\/\//i)) {
      var url = text;
    } else {
      var url = "chrome://bookmarks/#q=" + text;
    }
    chrome.tabs.update(tab.id, {url: url, selected: true});
  });
});

chrome.omnibox.onInputCancelled.addListener(function() {
  resetDefaultSuggestion();
});

chrome.omnibox.onInputStarted.addListener(function() {
  resetDefaultSuggestion();
});

resetDefaultSuggestion();
