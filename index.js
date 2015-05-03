var xplemail = require("./lib/xpl-clock");

var wt = new xplemail(null, {
	xplLog: false,
        forceBodySchemaValidation: false
});

wt.init(function(error, xpl) {

	if (error) {
		console.error(error);
		return;
	}
        
        // Send every minutes an xPL status message 
        setInterval(function(){
	       wt.clockTime();
        }, 1000);
        
});

