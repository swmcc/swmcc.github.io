function dbg(txt) { if (window.console) console.log(txt); }

var Terminal = new Class({

	commandHistory: [],
	commandHistoryIndex: -1,

	initialize: function(container) {
		this.terminal = container;
		this.out('Welcome to Ubuntu 12.04 (GNU/Linux 2.6.18-274.7.1.el5.028stab095.1 x86_64)');
		this.out('<br />');
		this.out('Last login: Sun May 6 22:18:00 2012 from host68-194-277-14.range86-184.btcentralplus.com');
		this.out('<br />');
		this.out('Type <b>\'help\'</b> for a list of available commands.');	
		this.out('&nbsp;');
		this.prompt();

		this.path = '.';

		// Hook events
		$(document).addEvent('keydown',  function(event) { this.keydown(event); }.bind(this));
		$(document).addEvent('keypress', function(event) { this.keypress(event); }.bind(this));
	},

	// Process keystrokes
	keydown: function(event) {
		dbg('keydown> ' + event.key + '(' + event.code + ') ' + event.control + ' - ' + event.shift + ' - ' + event.alt + ' - ' + event.meta);
		if (event.control /*|| event.shift*/ || event.alt || event.meta) return;
		var command = this.currentCommand.get('html');

		if (event.key == 'enter') {
			event.preventDefault();
			this.run();
			return;
		}

                if (event.key == 'backspace') {
                        event.preventDefault();
                        if (command.substr(command.length-6) == '&nbsp;') {
                                command = command.substr(0, command.length-6);
                        } else {
                                command = command.substr(0, command.length-1);
                        }
                        this.currentCommand.set('html', command);
                        return;
                }

	},

	keypress: function(event) {
		dbg('keypress> ' + event.key + '(' + event.code + ') ' + event.control + ' - ' + event.shift + ' - ' + event.alt + ' - ' + event.meta);
		if (event.control /*|| event.shift*/ || event.alt || event.meta) return;
		var command = this.currentCommand.get('html');

		//$('body').focus();

		if (event.key == 'enter') {
			event.preventDefault();
		//	this.run();
			return;
		}


		if (event.key == 'space') {
			event.preventDefault();
			command += '&nbsp;';
			this.currentCommand.set('html', command);
			return;
		}

		if (event.code == 38) { // Up arrow
			event.preventDefault();
			dbg(this.commandHistoryIndex + ', ' + this.commandHistory.length);
			if (this.commandHistoryIndex > 0) {
				this.commandHistoryIndex--;
				this.currentCommand.set('html', this.commandHistory[this.commandHistoryIndex]);
			}
			return;
		}

		if (event.code == 40) { // Down arrow
			event.preventDefault();
			dbg(this.commandHistoryIndex + ', ' + this.commandHistory.length);
			if (this.commandHistoryIndex < this.commandHistory.length) {
				this.commandHistoryIndex++;
				this.currentCommand.set('html', this.commandHistory[this.commandHistoryIndex]);
				// This can overflow the array by 1, which will clear the command line
			}
		}

		// For all typing keys
		if (this.validkey(event.code)) {
			event.preventDefault();
			if (event.code == 46) {
				command += '.';
			} else {
				command += event.key;
			}
			this.currentCommand.set('html', command);
			return;
		}
	},

	validkey: function(code) {
		return  (code > 64 && code < 91)  ||	// [A-Z]
				(code > 96 && code < 123) ||	// [a-z]
				(code == 95) || // _
				(code > 44 && code < 58);		// -./[0-9]
	},

	// Outputs a line of text
	out: function(text) {
		var p = new Element('div');
		p.set('html', text);
		this.terminal.grab(p);
	},

	// Displays the prompt for command input
	prompt: function() {
		var currentTime = new Date();
		var hours   = currentTime.getHours();
		var minutes = currentTime.getMinutes();
		var seconds = currentTime.getSeconds();

		if (hours < 10 ) {
			hours = "0" + hours;
		}

		if (minutes < 10){
			minutes = "0" + minutes;
		}

		if (seconds < 10) {
			seconds = "0" + seconds;
		}

		var time = (hours + ":" + minutes + ":" + seconds);
		if (this.currentPrompt)
		this.currentPrompt.getElement('.cursor').destroy();
		this.currentPrompt = new Element('div');
		this.currentPrompt.grab(new Element('span').addClass('prompt').set('text', time + ' [swm.cc]: ~ $'));
		this.currentCommand = new Element('span').addClass('command');
		this.currentPrompt.grab(this.currentCommand);
		this.currentPrompt.grab(new Element('span').addClass('cursor'));
		this.terminal.grab(this.currentPrompt);
		$(window).scrollTo(0, this.currentPrompt.getPosition().y);
	},

	guess: function() {
		var command = this.currentCommand.get('html');
		if (command.substr(0,1) == 'c')
			command = 'copy';
		this.currentCommand.set('html', command);
	},

	// Executes a command
	run: function() {
		var command = this.currentCommand.get('text');

		this.commandHistory.push(command);
		this.commandHistoryIndex = this.commandHistory.length;

		if (command == 'help') {
			this.out('List of available commands:');
			this.out('<span class="commandhelp">blog</span>swmcc\'s blog.');
			this.out('<span class="commandhelp">clear</span>Clear screen.');
			this.out('<span class="commandhelp">cd</span>Change Directroy.');
			this.out('<span class="commandhelp">contact</span>Contact info.');
			this.out('<span class="commandhelp">copy</span>Copyright info.');
			this.out('<span class="commandhelp">cv</span>Displays a compact cv.');
			this.out('<span class="commandhelp">exit</span>Exit this session.');
			this.out('<span class="commandhelp">git</span>github address.')
			this.out('<span class="commandhelp">goto</span>Jump to other pages.');
			this.out('<span class="commandhelp">help</span>Displays this list.');
			this.out('<span class="commandhelp">ls</span>List directories.');
			this.out('<span class="commandhelp">projects</span>List of projects swmcc is involved with.');
			this.out('<span class="commandhelp">skills</span>Professional skills.');
			this.out('<span class="commandhelp">talks</span>List of my talks.');
			this.out('<span class="commandhelp">whereami</span>Where are you?');
			this.out('<span class="commandhelp">wget</span>Download files to your desktop.');
			this.out('<span class="commandhelp">whois</span>Who is swmcc?');
			this.prompt();
			return;
		}

		// ---------------------
		
		if (command == 'blog') {
			this.out('<a target="_blank" href="http://swm.cc/blog">swm.cc/blog</a> - My inane ramblings');
			this.prompt();
			return;
		}

		if (command.substr(0,2) == 'cd') {
			var dest = command.substr(3);
			if (dest == 'porn') {
				this.out('-bash: cd: porn/: Permission denied - dirty fecker!');
			} else if ( dest == 'sandbox' ) {
				this.out('-bash: cd: sandbox/: Permission denied - nosey fecker!');
			} else if ( dest == '') {
				this.out('');
			} else {
				this.out('-bash: cd: ' + dest + ': No such file or directory');
			}
 			this.prompt();
			return;
		}

		if (command == 'clear') {
			this.currentPrompt = null;
			this.terminal.empty();
			this.prompt();
			return;
		}

		if (command == 'contact') {
			this.out('Feel free to contact me on <a href="http://www.twitter.com">twitter</a> via a shout at <a href="http://www.twitter.com/swmcc">@swmcc</a> or DM. Or you can email me.');
			this.out('-----------------------------')
			this.out('me@swm.cc');
			this.out('http://www.twitter.com/swmcc');
			this.prompt();
			return;
		}

		if (command == 'copy') {
			this.out('Copyright &copy; 2002 - 2014 swm.cc');
			this.prompt();
			return;
		}

		if (command == 'cv') {
                        this.out(' - <b><i>Head Tea Maker</i></b> at Mission IQ from Sep 2013 to the present');
			this.out(' - <b><i>Senior Developer</i></b> at Repknight from Oct 2012 from Sep 2013');
			this.out(' - <b><i>Senior Programmer</i></b> at Tascomi from June 2009 to Oct 2012');
			this.out(' - <b><i>Technical Lead</i></b> at Rehabstudio from December 2008 to June 2009');
			this.out(' - <b><i>Senior Software Engineer</i></b> at Maildistiller from September 2007 to December 2008');
			this.out(' - <b><i>Development Manager</i></b> at the Pilton Group from April 2002 to September 2007');
			this.out(' - <b><i>Systems Administrator</i></b> at Bytel.net.uk from April 2001 to April 2002');
			this.out(' - <b><i>Programmer</i></b> at Blackstar.co.uk - January 2000 to November 2000');
			this.out('<br />For an up to date cv use the wget command (wget cv.doc)');
			this.out('For my github resume use goto (goto resume)');
			this.prompt();
			return;
		}

		if (command == 'exit') {
			window.location.href = "http://www.swm.cc";
			return;
		}
		
	
		if (command.substr(0,4) == 'goto') {
			var dest = command.substr(5);
			if (dest == 'blog') {
				window.location.href = 'http://blog.swm.cc';
			} else if ( dest == 'delicious' ) {
				window.location.href = 'http://delicious.com/swmcc'; 
			} else if ( dest == 'github' ) {
				window.location.href = 'http://www.github.com/swmcc';
			} else if ( dest == 'resume' ) {
				window.location.href = 'http://resume.github.com/?swmcc';
			} else if ( dest == 'talks' ) {
				window.location.href = 'http://swm.cc/#talks';		
			} else if ( dest == '') {
				this.out('-bash: goto: blog github resume talks');
			} else {
				this.out('-bash: goto: ' + dest + ': No such destination');
			}
 			this.prompt();
			return;
		}

		if (command == 'git') {
			this.out('<a target="_blank" href="http://github.com/swmcc">http://github.com/swmcc</a> - Where I host my code');
			this.prompt();
			return;
		}

		if (command == 'linkedin') {
			this.out('<a target="_blank" href="http://www.linkedin.com/in/swmcc" target="_blank">http://www.linkedin.com/in/swmcc</a>');
			this.prompt();
			return;
		}

		if (command.substr(0,2) == 'ls') {
   			var dir = [
        		"How.to.kill.hipsters.by.thought.alone.mp4.nzb",
      			"node-v0.8.9.tar.gz",
      			"<span class='dir'>porn/</span>",
      			"me.jpg",
      			"cv.doc",
      			"<span class='dir'>sandbox/</span>",
    		];
    
    		var string ='';
    			for (var i = 0; i < dir.length; i++) {
      			string += dir[i] + '<br />';
    		}

    		this.out(string);
			this.prompt();
			return;
		}

		if (command == 'projects') {
			this.out('<b>TV-Listings</b> - Uses a daily feed from XMLTV.org and puts the data into a db [perl] (<a target="_blank" href="https://github.com/swmcc/TV-Listings">https://github.com/swmcc/TV-Listings</a>)');
			this.out('<b>quantum</b> -A mini app that will take my tweets from the twitter archive and produce stats on it. Basically.'); 
			this.prompt();
			return;
		}

		if (command == 'skills') {
			this.out('<b><i>Below is a brief example of what I can do:</i></b>');
			this.out('apache, bash, centos, coffee, couchdb, debain');
			this.out('javascript, json mod, mongodb, mysql, node.js');
			this.out('perl, php, postgres, python, ruby');
			this.out('server administration, soap, sqlite, xmlrpc');
			this.prompt();
			return;
		}

		if (command == 'talks') {
      this.out(' - <b><i>Life outside rails</i></b> Belfast Ruby May 2014');
			this.out(' - <b><i>Tmux lightning talk</i></b> Belfast Ruby Oct 2013');
			this.out(' - <b><i>A brief intro to Neo4j</i></b> Belfast Ruby June 2013');
			this.out(' - <b><i>Giants are made....</i></b> lightning talk in London May 2012');
			this.out('<br />To see more info on the talks please use goto (goto talks)');
			this.prompt();
		return;
		}

		if ( command == 'whereami') {
			this.out('<br /><b>http://swm.cc</b><br /><br />');
			this.prompt();
			return;
		}
		if (command == 'whois') {
			this.out('<img src="https://secure.gravatar.com/avatar/4e1bdb1052b8faf5b72e93eca9af9c5b?s=420" width="73" height="92" alt="Stephen McCullough" itemprop="image"><b>Stephen McCullough</b> I\'m a software developer and mainly specialise in web applications, based in Glenavy and work in Belfast, Northern Ireland. I work for a great start-up company called <a href="http://missioniq.com">MissionIQ">MissionIQ</a>.');
			this.prompt();
			return;
		}

		if ( command.substr(0,4) == 'wget') {
			var what = command.substr(5);
			if (what == 'cv.doc') { window.location.href = "/!/cv.doc"; return; }
			if (what == '') { this.out('wget cv.doc'); }
			this.prompt();
			return;
		}

		if (command)
			this.out('-bash: ' + command + ': command not found');
			this.prompt();
		}
});

$(window).addEvent('domready', function() {
	window.terminal = new Terminal($('terminal'));
});
