/**
 * Submits data to mturk
 */
 
(function( $ ) {
	jsPsych["testing-display-data"] = (function(){

		var plugin = {};

		plugin.create = function(params) {
			var trials = new Array(1);
			trials[0] = {};
			trials[0].type = "testing-display-data";
                	trials[0].data = (typeof params.data === 'undefined') ? {} : params.data[i];
			return trials;
		};

		plugin.trial = function(display_element, block, trial, part) {
			
			// allow variables as functions
            		trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
	
			jsPsych.data.displayData('json');			

			display_element.append($('<button>', {
				"id": "jspsych-experiment-submit-button",
				"class": "testing-display-data",
				"html": "Done",
				"click": function() {
					
					display_element.html("");
					jsPsych.finishTrial();
				}
			}));
		};

		return plugin;
	})();
}) (jQuery);
