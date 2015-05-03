var xplemail = require("./lib/xpl-clock");
//var schema_clockconfig = require('/etc/wiseflat/schemas/clock.config.json');

var wt = new xplemail(null, {
	xplLog: false,
        forceBodySchemaValidation: false
});

wt.init(function(error, xpl) {

	if (error) {
		console.error(error);
		return;
	}
        
	//xpl.addBodySchema(schema_clockconfig.id, schema_clockconfig.definitions.body);
	
        // Load config file into hash
        //wt.readConfig();
        

        // Send every minutes an xPL status message 
        setInterval(function(){
                //wt.sendConfig();
	       wt.clockTime();

        }, 1000);
        
        xpl.on("xpl:clock.config", function(evt) {
		if(evt.headerName == 'xpl-cmnd') wt.writeConfig(evt);
        });
});

