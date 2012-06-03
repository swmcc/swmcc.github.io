// My own awesome little template function
(function(a){var b=/{{\s*([\w|\.]*)\s*}}/gi;a.tpl=function(a,f){return a.replace(b,function(a,b){for(var e=b.split("."),c=f,d=0,g=e.length;d<g;d++)c=c[e[d]];return c})}})(this);

function relativeTime( dateObject ) {
	var relative_to = new Date(),
		delta = parseInt( ( relative_to.getTime() - dateObject ) / 1000, 10 );
	delta = delta + ( relative_to.getTimezoneOffset() * 60 );
	if ( delta < 60 ) {
		return  'less than a minute ago' ;
	} else if( delta < 120 ) {
		return   'about a minute ago' ;
	} else if( delta < ( 60 * 60 ) ) {
		return ( parseInt( delta / 60, 10) ).toString() + ' minutes ago ';
	} else if( delta < ( 120 * 60 ) ) {
		return 'about an hour ago';
	} else if( delta < ( 24 * 60 * 60 ) ) {
		return 'about ' + ( parseInt( delta / 3600, 10 ) ).toString() +  ' hours ago';
	} else if( delta < ( 48 * 60 * 60 ) ) {
		return '1 day ago';
	} else {
		return ( parseInt( delta / 86400, 10 ) ).toString() + ' days ago';
	}
}

function parseToRelativeTime( str ) {
	return relativeTime( new Date( Date.parse( str ) ) );
}

function linkifyTweet(text) {
	text = text.replace(/(https?:\/\/\S+)/gi, function ( str ) {
		return '<a href="' + str + '">' + str + '</a>';
	});
	text = text.replace(/(^|)@(\w+)/gi, function ( str ) {
		return '<a href="http://twitter.com/' + str + '">' + str + '</a>';
	});
	text = text.replace(/(^|)#(\w+)/gi, function ( str ) {
		return '<a href="http://search.twitter.com/search?q=' + str.replace(/#/,'%23') + '">' + str + '</a>';
	});
	return text;
}