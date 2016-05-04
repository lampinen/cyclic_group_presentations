//For fyp experiment questions with manipulable polygon and arrow diagram
//Code adapted from jspsych demos

(function($) {
    jsPsych['polygon-arrow-which-representation'] = (function() {

        var plugin = {};

        plugin.create = function(params) {

            var trials = new Array(1);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {
                    //"images": params.stimuli[i], // array of images to display
                    //"stim_height": params.stim_height || 100,
                    //"stim_width": params.stim_width || 100,
		    "nsides": params.nsides || 6, //Number or 'n' for the arbitrary polygon sketch
                    "timing_post_trial": (typeof params.timing_post_trial === 'undefined') ? 0 : params.timing_post_trial,
                    "added_prompt": (typeof params.added_prompt === 'undefined') ? '' : params.added_prompt,
                    "force_response":  (typeof params.force_response === 'undefined') ? true : params.force_response,
		    "response_choices": ["Not at all", "", "Somewhat", "", "Very much"],
		    "response_values": [0,1,2,3,4],
                    "canvas_width": params.canvas_width || 300,
                    "canvas_height": params.canvas_height || 300
                };
            }
            return trials;
        };

        plugin.trial = function(display_element, trial) {

	trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
	var turkInfo = jsPsych.turk.turkInfo();
	var start_time = (new Date()).getTime();
        var response_history = [];


	display_element.append('<div id="polygon-question-div"></div>');
	$('#polygon-question-div').append(trial.added_prompt)
	var modular_likert = 'How much did you use the arithmetic method when solving that problem?<br /><br /><ul class="likert">'
	for (var j in trial.response_choices) {
		modular_likert += '<li>' + '<input id="representation-modular-response-'+j+'" name="representation-modular-response" type=radio value='+trial.response_values[j]+'><label>'+trial.response_choices[j]+'</label></li>'	
	}
	modular_likert += '</ul><br />'
	var polygon_likert = 'How much did you use the polygon method when solving that problem?<br /><br /><ul class="likert">'
	for (var j in trial.response_choices) {
		polygon_likert += '<li>' + '<input id="representation-polygon-response-'+j+'" name="representation-polygon-response" type=radio value='+trial.response_values[j]+'><label>'+trial.response_choices[j]+'</label></li>'	
	}
	polygon_likert += '</ul><br />'
	$('#polygon-question-div').append(modular_likert)
	$('#polygon-question-div').append(polygon_likert)
	var end_function = function() {
		var polygon_response = $('input[name="representation-polygon-response"]:checked').val();
		var modular_response = $('input[name="representation-modular-response"]:checked').val();
		 if (trial.force_response && (typeof polygon_response == "undefined" || typeof modular_response == "undefined")) { //If no response to radio button question
			window.alert("Please answer the question before continuing.");
			return;
		}
		var end_time = (new Date()).getTime();
		var rt = end_time - start_time;
		
	        var prev_data = jsPsych.data.getLastTrialData();
	
		jsPsych.data.write({
			"nsides": trial.nsides,
			"question": prev_data.question,
			"added_prompt": trial.added_prompt,
			"polygon_response": polygon_response,
			"modular_response": modular_response,
			"rt": rt
		});
		jsPsych.pluginAPI.cancelAllKeyboardResponses();

		// advance to next part
		display_element.html("");
		jsPsych.finishTrial();
//			jsPsych.data.displayData('json');
	};
        $('#polygon-question-div').append($('<button>', {
		"id": "polygon-question-done-btn",
		"class": "polygon-arrow-which-representation",
		"html": "Continue",
		"click": end_function 
	}));
	
	//Listen for enter as alternative submit
	var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
		callback_function: end_function,
		valid_responses: [13],
		rt_method: 'date',
		persist: true,
		allow_held_key: false
	});




	};
        return plugin;
    })();
})(jQuery);
