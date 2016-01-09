/**
 * Submits data to mturk
 */
 
(function( $ ) {
	jsPsych["turk-final"] = (function(){

		var plugin = {};

		plugin.create = function(params) {
			var trials = new Array(1);
			trials[0] = {};
			trials[0].type = "turk-final";
                	trials[0].data = (typeof params.data === 'undefined') ? {} : params.data[0];
			trials[0].text = (typeof params.text === 'undefined') ? 'Thank you for participating in the experiment. Please click the button below to submit the results to mechanical turk and return. Note that this may take some time. YOU WILL NOT RECEIVE PAYMENT IF YOU DO NOT CLICK SUBMIT AND WAIT FOR THE SUBMISSION TO COMPLETE.' : params.text;
                	trials[0].post_text = (typeof params.post_text === 'undefined') ? '' : params.post_text;
			return trials;
		};

		plugin.trial = function(display_element,trial) {
			
			// allow variables as functions
            		trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
			
		
				//Save the data by email
				ajaxIsComplete = false;
				$( document ).ajaxComplete(function() {
					ajaxIsComplete = true;
				});

				function saveData(this_name, this_data){
				   $.ajax({
				      type: 'POST',
				      url: 'https://web.stanford.edu/~lampinen/cgi-bin/email.php', 
				      dataType: "json",
				      data: {this_name: this_name, this_data: this_data},
				      success: function(data) {
//					alert("Success!");
				      },
				      error: function (jqXHR, textStatus, errorThrown)
				      {
//					alert("POST error: " + errorThrown + " textStatus: " + textStatus);	
				      }
				   });
				}

				var turkInfo = jsPsych.turk.turkInfo();
				saveData("subject_"+turkInfo.workerId,JSON.stringify(jsPsych.data.getData()));
			//Add prompt
			display_element.append(trial.text + '<br /><br />');

			var end_function = function() {
				if (!ajaxIsComplete) { 
					setTimeout(end_function,5000)
					return;				
				}	


				//Submit to turk
				jsPsych.turk.submitToTurk({
					"data": ""// JSON.stringify(jsPsych.data.getData())
				});

		                jsPsych.pluginAPI.cancelAllKeyboardResponses();
//				jsPsych.data.localSave('lampinen_data_'+(new Date()).getTime()+'.json','json');	
				display_element.html(trial.post_text);
				jsPsych.finishTrial();
			};

			display_element.append($('<button>', {
				"id": "jspsych-experiment-submit-button",
				"class": "turk-final",
				"html": "Submit Experiment",
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
