//For fyp experiment instructions without polygon and arrow diagram
//Code adapted from jspsych demos

(function($) {
    jsPsych['instructions'] = (function() {

        var plugin = {};

        plugin.create = function(params) {

            var trials = new Array(1);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {
                    //"images": params.stimuli[i], // array of images to display
                    //"stim_height": params.stim_height || 100,
                    //"stim_width": params.stim_width || 100,
                    "timing_post_trial": (typeof params.timing_post_trial === 'undefined') ? 0 : params.timing_post_trial,
                    "text": (typeof params.text === 'undefined') ? '' : params.text
                };
            }
            return trials;
        };

        plugin.trial = function(display_element, trial) {

	trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
	var turkInfo = jsPsych.turk.turkInfo();
	var start_time = (new Date()).getTime();

	display_element.append('<div id="question-div">'+trial.text+'<br /><br /></div>');
	var end_function = function() {
		var end_time = (new Date()).getTime();
		var rt = end_time - start_time;
		
		jsPsych.data.write({
			"instructions": trial.text,
			"rt": rt
		});

                jsPsych.pluginAPI.cancelAllKeyboardResponses();

		// advance to next part
		display_element.html("");
		jsPsych.finishTrial();
//			jsPsych.data.displayData('json');
	};

        $('#question-div').append($('<button>', {
		"id": "instructions-done-btn",
		"class": "instructions",
		"html": "Continue",
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
})(jQuery);
