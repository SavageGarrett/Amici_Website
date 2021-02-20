$(document).ready(function () {
  $('#divRssF').FeedEk({
    FeedUrl: 'http://interestgroupnetworks.blogspot.com/feeds/posts/default?alt=rss',
    MaxCount: 5,
    Tag: 'ul class="feedEkList"'
  }).done(function () {
    // Scroll to news item after click on recent news
    document.location.hash && scrollPage(document.location.hash);
  });
  $('#divRssL').FeedEk({
    FeedUrl: 'http://interestgroupnetworks.blogspot.com/feeds/posts/default?alt=rss',
    MaxCount: 3,
    ShowPubDate: false,
    ShowDesc: false,
    Tag: 'ol'
  });

  function scrollPage(hash) {
    // $().scrollTop() jumps to top again for some reason, use animate with 100 ms duration as workaround
    try {
      $('html, body').animate({scrollTop: $(hash).offset().top}, 100);
    } catch (e) {
      // No suitable hash to scroll to found
    }

  }
});
