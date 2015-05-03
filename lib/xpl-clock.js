var Xpl = require('xpl-api');
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
	
	clockTime: function(){
		var self = this;
		var date = new Date();
		var seconds = date.getSeconds();
                var minute = date.getMinutes();
                var hour = date.getHours();
                var year = date.getFullYear();
                var month = date.getMonth(); // beware: January = 0; February = 1, etc.
                var day = date.getDate();
                var dayOfWeek = date.getDay(); 
		var currentObject = new Date(year, month, day, hour, minute, seconds);
		
		if (seconds == '00' || seconds == '0') {
			var json = {};
			json.time = hour +':'+ minute +':'+ seconds;
			json.dayOfWeek = dayOfWeek;
			json.currentObject = currentObject;
			self._sendXplStat(json, 'clock.basic', '*');
		}
	}
	
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}
