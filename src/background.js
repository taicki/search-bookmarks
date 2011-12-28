function search(term, callback) {
  chrome.bookmarks.search(term, function(results) {
    callback(results);
  });
}

function resetDefaultSuggestion() {
  chrome.omnibox.setDefaultSuggestion({
    description: 'Search Bookmarks'
  });
}

chrome.omnibox.onInputChanged.addListener(
  function (text, suggest) {
    search(text, function(nodes) {
      var results = [];
      for (var i = 0, entry; i < 5 && (node = nodes[i]); i++) {
        results.push({
          content: node.url,
          description: node.title
        });
      }
      suggest(results);
    });
  }
);

chrome.omnibox.onInputEntered.addListener(function(text){
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.update(tab.id, {url: text});
  });
});

chrome.omnibox.onInputCancelled.addListener(function() {
  resetDefaultSuggestion();
});

chrome.omnibox.onInputStarted.addListener(function() {
  resetDefaultSuggestion();
});

resetDefaultSuggestion();
