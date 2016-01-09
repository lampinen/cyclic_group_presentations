//For fyp experiment feedback without polygon and arrow diagram
//Code adapted from jspsych demos

(function($) {
    jsPsych['feedback'] = (function() {

        var plugin = {};

        plugin.create = function(params) {

            var trials = new Array(1);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {
                    //"images": params.stimuli[i], // array of images to display
                    //"stim_height": params.stim_height || 100,
                    //"stim_width": params.stim_width || 100,
                    "timing_post_trial": (typeof params.timing_post_trial === 'undefined') ? 0 : params.timing_post_trial,
                    "correct_text": (typeof params.correct_text === 'undefined') ? 'Correct!' : params.correct_text,
                    "incorrect_text": (typeof params.incorrect_text === 'undefined') ? 'Sorry, that was incorrect.' : params.incorrect_text
                };
            }
            return trials;
        };

        plugin.trial = function(display_element, trial) {

	trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
	var turkInfo = jsPsych.turk.turkInfo();
	var start_time = (new Date()).getTime();
	var prev_data = jsPsych.data.getLastTrialData();
	var text_displayed = '';
	
	if (prev_data.response == prev_data.correct_response) {
		text_displayed = trial.correct_text;	
		display_element.append('<div id="question-div">'+trial.correct_text+'<br /><br /></div>');
	} 
	else {
		text_displayed = trial.incorrect_text;	
		display_element.append('<div id="question-div">'+trial.incorrect_text+'<br /><br /></div>');
	}

	var end_function = function() {
		var end_time = (new Date()).getTime();
		var rt = end_time - start_time;
		
		jsPsych.data.write({
			"feedback": text_displayed,
			"rt": rt
		});

                jsPsych.pluginAPI.cancelAllKeyboardResponses();


		// advance to next part
		display_element.html("");
		jsPsych.finishTrial();
//			jsPsych.data.displayData('json');
	};
        $('#question-div').append($('<button>', {
		"id": "feedback-done-btn",
		"class": "feedback",
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
