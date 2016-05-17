//For fyp experiment questions with manipulatable polygon and arrow diagram
//Code adapted from jspsych demos

(function($) {
    jsPsych['question'] = (function() {

        var plugin = {};

        plugin.create = function(params) {

            var trials = new Array(1);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {
                    "timing_post_trial": (typeof params.timing_post_trial === 'undefined') ? 0 : params.timing_post_trial,
                    "prompt": (typeof params.prompt === 'undefined') ? '' : params.prompt,
                    "response_type": (typeof params.response_type === 'undefined') ? 'free' : params.response_type, //'free' or 'multi'
		    "response_choices": (typeof params.prompt === 'undefined') ? [] : params.response_choices, //If response type = 'multi', these are the choices
                    "correct_response": (typeof params.correct_response === 'undefined') ? '' : params.correct_response,
                    "explain": (typeof params.explain === 'undefined') ? false : params.
explain, //Whether to provide a box for explanations
		    "force_response":  (typeof params.force_response === 'undefined') ? true : params.force_response
                };
            }
            return trials;
        };

        plugin.trial = function(display_element, trial) {

	trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
	var turkInfo = jsPsych.turk.turkInfo();
	var start_time = (new Date()).getTime();
	var orientation_history = [];
	var response_history = [];
	var explanation_history = [];

	display_element.append('<div id="question-div">'+trial.prompt+'<br /><br /></div>');
        if (trial.explain) {
                $('#question-div').append('<i>Answer:</i><br />')
        }

	if (trial.response_type == 'free') {
		$('#question-div').append($('<textarea>', {
			"id": "text-response"
		}));
		setTimeout(function () { $('#text-response').focus() },50); //Delay avoids a bug where keystroke from previous screen gets carried over into text box
		$('#text-response').on("change keyup paste", function () {
			var this_response = document.getElementById("text-response").value;
                        if (this_response.indexOf(response_history[response_history.length-1]) == 0) { //If this is just a continuation of what was typed before, replace it 
                               response_history[response_history.length-1] = this_response;
                        }
                        else {
                                response_history.push(this_response);
                        }

		});
	//	$('#text-response').focus();
	}
	else {
		if (trial.response_choices == []) {
			window.alert("Error: No response choices found");
		}
		for (var j in trial.response_choices) {
			$('#question-div').append($('<input>', {
				"id": "radio-response-"+j,
				"name": "radio-response",
				"type": "radio",
				"class": "question",
				"value": trial.response_choices[j]
			}));
                        $('#radio-response-'+j).on("change", function () {

                                        var this_object = $('input[name="radio-response"]:checked');
					var this_response = this_object.val();
					response_history.push(this_response);

                                });

			$('#question-div').append(''+trial.response_choices[j]+'<br />');
		}
	}
        if (trial.explain) {
                $('#question-div').append('<br /><i>Explanation:</i><br />')
                $('#question-div').append($('<textarea>', {
                        "id": "text-explanation"
                })) 
                setTimeout(function () { $('#text-explanation').focus() },50); //Delay avoids a bug where keystroke from previous screen gets carried over into text box
                $('#text-explanation').on("change keyup paste", function () {
                        var this_explanation = document.getElementById("text-explanation").value;
                        if (this_explanation.indexOf(explanation_history[explanation_history.length-1]) == 0) { //If this is just a continuation of what was typed before, replace it 
                                explanation_history[explanation_history.length-1] = this_explanation;
                        }
                        else {
                                explanation_history.push(this_explanation);
                        }
                });
        }


	$('#question-div').append('<br /><br />');
	var end_function = function() {
		var end_time = (new Date()).getTime();
		var rt = end_time - start_time;

		var this_response = (trial.response_type == 'free') ? document.getElementById("text-response").value : $('input[name="radio-response"]:checked').val();
                if (trial.explain) {
                    var this_explanation = document.getElementById("text-explanation").value;
                }
		else {
		    var this_explanation = ""; 
		}
                if (trial.force_response && (typeof this_response == "undefined" || this_response === "" || (trial.explain && this_explanation == "" ))) { //If no response to radio button question
			window.alert("Please answer the question before continuing.");
			return;
		}
		
		jsPsych.data.write({
			"question": trial.prompt,
			"response_type": trial.response_type,
			"response_choices": (trial.response_type == 'free') ? [] : trial.response_choices,
			"correct_response": trial.correct_response,
			"response": this_response,
                        "explain": trial.explain,
                        "explanation": this_explanation,
                        "explanation_history": explanation_history,
			"response_history": response_history,
			"rt": rt
		});

                jsPsych.pluginAPI.cancelAllKeyboardResponses();

		// advance to next part
		display_element.html("");
		jsPsych.finishTrial();
//			jsPsych.data.displayData('json');
	};

        $('#question-div').append($('<button>', {
		"id": "question-done-btn",
		"class": "question",
		"html": "Continue",
		"click": end_function 
	}));

	/*
        //Listen for enter as alternative submit
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_function,
                valid_responses: [13],
                rt_method: 'date',
                persist: true,
                allow_held_key: false
        }); 
	*/

	};
        return plugin;
    })();
})(jQuery);
