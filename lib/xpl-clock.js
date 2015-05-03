var Xpl = require('xpl-api');
var clock = require('posix-clock');
var fs = require('fs');
var os = require('os');
var pjson = require('../package.json');

function wt(device, options) {
	options = options || {};
	this._options = options;
        
        this.configFile = "/etc/wiseflat/clock.config.json";
        this.configHash = [];    
        
        this.server;
        this.config = 0;
        
	this.version = pjson.version;

        options.xplSource = options.xplSource || "bnz-clock."+os.hostname();

	this.xpl = new Xpl(options);
};

module.exports = wt;

var proto = {
    
        init: function(callback) {
                var self = this;

                self.xpl.bind(function(error) {
                        if (error) {
                                return callback(error);
                        }
                        self._log("XPL is ready");
                        callback(null,  self.xpl);
                });
                
        },

	_log: function(log) {
		/*if (!this._configuration.xplLog) {
			return;
		}*/
                
		console.log('xpl-clock -', log);
	},

        _sendXplStat: function(body, schema, target) {
                var self = this;                
                self.xpl.sendXplStat(
                        body,
                        schema,
			target
                );
        },

        _sendXplTrig: function(body, schema, target) {
                var self = this;                
                self.xpl.sendXplTrig(
                        body,
                        schema,
			target
                );
        },


        /*
         *  Config xPL message
         */
	
        readConfig: function(callback) {
                var self = this;
                fs.readFile(self.configFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) self._log("file "+self.configFile+" is empty ...");
                        else {
                            self.configHash = JSON.parse(body);
                            self._setServerConfig(self.configHash);
                        }
                });
        },

        sendConfig: function(callback) {
                var self = this;
                self._sendXplStat(self.configHash, 'email.config', '*');
        },
        
        writeConfig: function(evt) {
                var self = this;
		self.configHash.version = self.version;
                self.configHash.enable = evt.body.enable;
                fs.writeFile(self.configFile, JSON.stringify(self.configHash), function(err) {
                        if (err) self._log("file "+self.configFile+" was not saved to disk ...");
			else self._sendXplStat(self.configHash, 'email.config', evt.header.source);
                });
        },
	
        /*
         *  Plugin specifics functions
         */
        
	clockResolution: function(){
		var clockResolution = clock.getres(clock.MONOTONIC);
		console.log(
		    'Resolution of CLOCK_MONOTONIC: '
			+ clockResolution.sec + ' sec and '
			+ clockResolution.nsec + ' nanosec.'
		    , clockResolution
		);
	},
	
	clockTime: function(){
		var clockTime = clock.gettime(clock.MONOTONIC);
		console.log(
		    'Time from CLOCK_MONOTONIC: '
			+ clockTime.sec + ' sec and '
			+ clockTime.nsec + ' nanosec.'
		    , clockTime
		);
	}
	
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}
