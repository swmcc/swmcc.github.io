
logging = true;

$('a').click(function(){
  if (typeof $(this).data('ga') === "undefined") {
    if (logging == true) {
      // Take attributes of the element and fire through instead
      // of logging
      console.warn('no data-ga for clicked element: ', $(this));
    }
  } else {
    var gaArray = $(this).data('ga').split(',');
    _gaq.push(['_trackEvent', gaArray[0], gaArray[1], gaArray[2]]);
    if (logging == true) {
      console.log('fired GA: ', ['_trackEvent', gaArray[0], gaArray[1], gaArray[2]]);
    }
  }
});