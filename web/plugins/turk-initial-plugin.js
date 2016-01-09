/**
 * Lets subjects start experiment if they are not just previewing
 */
 
(function( $ ) {
	jsPsych["turk-initial"] = (function(){

		var plugin = {};

		plugin.create = function(params) {
			var trials = new Array(1);
			trials[0] = {
                    		"timing_post_trial": (typeof params.timing_post_trial === 'undefined') ? 1000 : params.timing_post_trial,
				"type": "turk-initial",
				"intro_text": (typeof params.intro_text === 'undefined') ? 'Please click "Begin Experiment" to begin the experiment.'  : params.intro_text,
				"data": (typeof params.data === 'undefined') ? {} : params.data[i]
			};
			return trials;
		};

		plugin.trial = function(display_element, trial) {
			
			// allow variables as functions
            		trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
			
			//Add prompt
			display_element.append(trial.intro_text+'<br /><br />');

			var end_function = function() {
				var turkInfo = jsPsych.turk.turkInfo();

				if (!turkInfo.previewMode || turkInfo.outsideTurk)  {
					jsPsych.pluginAPI.cancelAllKeyboardResponses();
					display_element.html("");
					jsPsych.finishTrial();
				}
			};
			display_element.append($('<button>', {
				"id": "jspsych-experiment-begin-button",
				"class": "turk-initial",
				"html": "Begin Experiment",
				"click": end_function 
			}));
			//Listen for enter as alternative submit
			var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
				callback_function: end_function,
				valid_responses: [13],
				rt_method: 'date',
				persist: false,
				allow_held_key: false
			}); 

		};

		return plugin;
	})();
}) (jQuery);
