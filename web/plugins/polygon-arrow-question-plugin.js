//For fyp experiment questions with manipulable polygon and arrow diagram
//Code adapted from jspsych demos

(function($) {
    jsPsych['polygon-arrow-question'] = (function() {

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
                    "prompt": (typeof params.prompt === 'undefined') ? '' : params.prompt,
                    "response_type": (typeof params.response_type === 'undefined') ? 'free' : params.response_type, //'free' or 'multi'
		    "response_choices": (typeof params.prompt === 'undefined') ? [] : params.response_choices, //If response type = 'multi', these are the choices
                    "correct_response": (typeof params.correct_response === 'undefined') ? '' : params.correct_response,
                    "force_response":  (typeof params.force_response === 'undefined') ? true : params.force_response,
		    "explain": (typeof params.explain === 'undefined') ? false : params.explain, //Whether to provide a box for explanations
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
	var orientation_history = [];
        var response_history = [];
	var explanation_history = [];


	display_element.append('<div id="polygon-question-div">'+trial.prompt+'<br /><br /></div>');
	if (trial.explain) {
                $('#polygon-question-div').append('<i>Answer:</i><br />')
	}
	if (trial.response_type == 'free') {
                $('#polygon-question-div').append($('<textarea>', {
                        "id": "polygon-arrow-text-response"
                })) 
		setTimeout(function () { $('#polygon-arrow-text-response').focus() },50); //Delay avoids a bug where keystroke from previous screen gets carried over into text box
                $('#polygon-arrow-text-response').on("change keyup paste", function () {
                        var this_response = document.getElementById("polygon-arrow-text-response").value;
			if (this_response.indexOf(response_history[response_history.length-1]) == 0) { //If this is just a continuation of what was typed before, replace it 
				response_history[response_history.length-1] = this_response;
			}
			else {
                        	response_history.push(this_response);
			}
                });


	//	$('#polygon-arrow-text-response').focus();
	}
	else {
		if (trial.response_choices == []) {
			window.alert("Error: No response choices found");
		}
		for (var j in trial.response_choices) {
			$('#polygon-question-div').append($('<input>', {
				"id": "polygon-arrow-radio-response-"+j,
				"name": "polygon-arrow-radio-response",
				"type": "radio",
				"class": "polygon-arrow-question",
				"value": trial.response_choices[j]
			}));
			$('#polygon-arrow-radio-response-'+j).on("change", function () {

                                        var this_object = $('input[name="polygon-arrow-radio-response"]:checked');
					var this_response = this_object.val();
					response_history.push(this_response);

                                });
			$('#polygon-question-div').append(''+trial.response_choices[j]+'<br />');
		}
	}
        if (trial.explain) {
                $('#polygon-question-div').append('<br /><i>Explanation:</i><br />')
                $('#polygon-question-div').append($('<textarea>', {
                        "id": "polygon-arrow-text-explanation"
                })) 
		setTimeout(function () { $('#polygon-arrow-text-explanation').focus() },50); //Delay avoids a bug where keystroke from previous screen gets carried over into text box
                $('#polygon-arrow-text-explanation').on("change keyup paste", function () {
                        var this_explanation = document.getElementById("polygon-arrow-text-explanation").value;
			if (this_explanation.indexOf(explanation_history[explanation_history.length-1]) == 0) { //If this is just a continuation of what was typed before, replace it 
				explanation_history[explanation_history.length-1] = this_explanation;
			}
			else {
                        	explanation_history.push(this_explanation);
			}
                });
        }

	$('#polygon-question-div').append('<br /><br />');
	var end_function = function() {
		var this_response = (trial.response_type == 'free') ? document.getElementById("polygon-arrow-text-response").value : $('input[name="polygon-arrow-radio-response"]:checked').val();
		if (trial.explain) {
		    var this_explanation = document.getElementById("polygon-arrow-text-explanation").value;
		}
		else {
		    var this_explanation = "";
		}
		if (trial.force_response && (typeof this_response == "undefined" || this_response === "" || (trial.explain && this_explanation == "" ))) { //If no response to radio button question
			window.alert("Please answer the question before continuing.");
			return;
			this_response = "";
		}
		var end_time = (new Date()).getTime();
		var rt = end_time - start_time;

		
		jsPsych.data.write({
			"nsides": trial.nsides,
			"question": trial.prompt,
			"response_type": trial.response_type,
			"response_choices": (trial.response_type == 'free') ? [] : trial.response_choices,
			"correct_response": trial.correct_response,
			"response": this_response,
			"explain": trial.explain,
			"explanation": this_explanation,
                        "explanation_history": explanation_history,
			"orientation_history": orientation_history,
                        "response_history": response_history,
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
		"class": "polygon-arrow-question",
		"html": "Continue",
		"click": end_function 
	}));
	display_element.append($('<canvas>', {
		"id": "polygon-canvas",
		"class": "polygon-canvas",
		"style": "border:1px solid #000000;",
		"css": {
			"position": "relative",
			"width": trial.canvas_width,
			"height": trial.canvas_height
		}
	}).width(trial.canvas_width).height(trial.canvas_height));
	//Setting these again because for some reason the above doesn't work
	$('#polygon-canvas')[0].width = trial.canvas_width;
	$('#polygon-canvas')[0].height = trial.canvas_height;


	//CANVAS SETUP////////////////////////////////////////////////////////////////////////////////

	//Returns an array of [x,y] pairs, for the vertices of a regular n-sided polygon, with the first point at the top, and the points preceeding counterclockwise
	function get_polygon_coords(n_sides,cent_x,cent_y,radius) {
		var points = [];
		for (var i=0; i < n_sides; i++) {
			points.push([cent_x+radius*Math.sin(2*i*Math.PI/n_sides),cent_y-radius*Math.cos(2*i*Math.PI/n_sides)]);
		}
		return points
	}

	//Draws polygon with on the canvas, with both vertices and edges marked
	function drawPolygon(cv_draw,nsides,center_x,center_y,radius) {
		if (nsides === 'n') {
			var n_polygon_sides = 10;
			var poly_points = get_polygon_coords(n_polygon_sides,center_x,center_y,radius); 
			var label_points = get_polygon_coords(n_polygon_sides,center_x,center_y,radius*1.2); 
			var prev = poly_points.length-1;
			var font_size = Math.ceil(radius/3.5);
			cv_draw.font = "bold "+font_size+"px Arial";
			label_i = 0; //Why is p_i not {0,1,...}?
			for (p_i in poly_points) {
				if (label_i < 3) {
					//Vertex
					cv_draw.beginPath();
					cv_draw.arc(poly_points[p_i][0],poly_points[p_i][1],5,0,2*Math.PI);
					cv_draw.closePath();
					cv_draw.fill();
					//Label	
					cv_draw.fillText(label_i,label_points[p_i][0]-font_size/3.5,label_points[p_i][1]+font_size/3);
				}
				if (label_i > 0 && label_i < 3) {
					//Edge
					cv_draw.beginPath()
					cv_draw.moveTo(poly_points[prev][0],poly_points[prev][1])
					cv_draw.lineTo(poly_points[p_i][0],poly_points[p_i][1]);
					cv_draw.lineWidth = 4;
					cv_draw.setLineDash([1,0]);
					cv_draw.stroke();
				}
				else {
					//Edge
					cv_draw.beginPath()
					cv_draw.moveTo(poly_points[prev][0],poly_points[prev][1])
					cv_draw.lineTo(poly_points[p_i][0],poly_points[p_i][1]);
					cv_draw.lineWidth = 4;
					cv_draw.setLineDash([4,15]);
					cv_draw.stroke();
				}
				prev = p_i;
				label_i++;
			}
			cv_draw.setLineDash([1,0]);
		}
		else {
			var poly_points = get_polygon_coords(nsides,center_x,center_y,radius); 
			var label_points = get_polygon_coords(nsides,center_x,center_y,radius*1.2); 
			var prev = poly_points.length-1;
			var font_size = Math.ceil(radius/3.5);
			cv_draw.font = "bold "+font_size+"px Arial";
			label_i = 0; //Why is p_i not {0,1,...}?
			for (p_i in poly_points) {
				//Vertex
				cv_draw.beginPath();
				cv_draw.arc(poly_points[p_i][0],poly_points[p_i][1],5,0,2*Math.PI);
				cv_draw.closePath();
				cv_draw.fill();
				//Label	
				cv_draw.fillText(label_i,label_points[p_i][0]-font_size/3.5,label_points[p_i][1]+font_size/3);
				//Edge
				cv_draw.beginPath()
				cv_draw.moveTo(poly_points[prev][0],poly_points[prev][1])
				cv_draw.lineTo(poly_points[p_i][0],poly_points[p_i][1]);
				cv_draw.lineWidth = 4;
				cv_draw.stroke();
				prev = p_i;
				label_i++;
			}
		}
	}


	//Arrow 'constructor'
	function Arrow(canvas,origin_x,origin_y,n_positions,length,orientation) {
		if (typeof canvas == "undefined") {
			window.alert("Error: Arrow constructor requires a canvas object");
		}
		this.canvas = canvas;
		this.origin_x = origin_x || 0;
		this.origin_y = origin_y || 0;
		this.n_positions = n_positions || 6;
		this.length = length || 10;
		this.orientation = orientation || 0;
		//Other properties
		this.tail_width = length/10;
		this.head_size = length/5;
		
		this.cv_draw = canvas.getContext("2d");
		//Animation properties
		this.dragging = false;
		this.dragofforientation = 0; //Mouse position offset when dragging
	}

	//Draws an arrow object
	Arrow.prototype.draw = function() {
		
		one_by_root_three = 1.0/Math.sqrt(3);
		//Arrow tail
		this.cv_draw.beginPath();
		this.cv_draw.moveTo(this.origin_x,this.origin_y);
		head_x = this.origin_x + (this.length+1)*Math.sin(this.orientation); //The +1 is to get rid of slight line between tail and head of arrow
		head_y = this.origin_y - (this.length+1)*Math.cos(this.orientation);
		this.cv_draw.lineTo(head_x,head_y)	
		head_x = this.origin_x + this.length*Math.sin(this.orientation);
		head_y = this.origin_y - this.length*Math.cos(this.orientation);
		this.cv_draw.lineWidth = this.tail_width;
		this.cv_draw.stroke();
		//Arrow head
		this.cv_draw.beginPath();
		this.cv_draw.moveTo(head_x + this.head_size*Math.sin(this.orientation),head_y - this.head_size*Math.cos(this.orientation));
		this.cv_draw.lineTo(head_x + one_by_root_three*this.head_size*Math.cos(this.orientation),head_y + one_by_root_three*this.head_size*Math.sin(this.orientation));
		this.cv_draw.lineTo(head_x - one_by_root_three*this.head_size*Math.cos(this.orientation),head_y - one_by_root_three*this.head_size*Math.sin(this.orientation));
		this.cv_draw.closePath();
		this.cv_draw.fill();
	}

	//Dragging handling for arrow object stuff

	var getMouse = function(e,canvas) { //Gets mouse location relative to canvas, code stolen from https://github.com/simonsarris/Canvas-tutorials/blob/master/shapes.js 
		var element = canvas;
		var offsetX = 0;
		var offsetY = 0;
		var html = document.body.parentNode;
		var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
		if (element.offsetParent !== undefined) {
			do {
				offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
			} while ((element = element.offsetParent));
		}

		if (document.defaultView && document.defaultView.getComputedStyle) {
			stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
			stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
			styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
			styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
		}
		htmlTop = html.offsetTop;
		htmlLeft = html.offsetLeft;
		offsetX += stylePaddingLeft + styleBorderLeft + htmlLeft;
		offsetY += stylePaddingTop + styleBorderTop + htmlTop;

		mx = e.pageX - offsetX;
		my = e.pageY - offsetY;
		return {x: mx, y: my};	
	};
	
	function arrowContains(arrow,x,y) { //Returns whether (x,y) on the canvas is 'within' the arrow, as defined by the bounding rectangle oriented with the arrow
		var A_norm = arrow.length;
		var B_x = x - arrow.origin_x;
		var B_y = y - arrow.origin_y;
		var arrow_head_x = arrow.origin_x + arrow.length*Math.sin(arrow.orientation);
		var arrow_head_y = arrow.origin_y - arrow.length*Math.cos(arrow.orientation);
		var A_x = arrow_head_x - arrow.origin_x;
		var A_y = arrow_head_y - arrow.origin_y;
		var BdotAhat =  (B_x*A_x+B_y*A_y)/A_norm;
		if (BdotAhat > 0 && BdotAhat <= (A_norm+arrow.head_size) && (B_x*B_x+B_y*B_y-BdotAhat*BdotAhat) <= (arrow.head_size*arrow.head_size)/Math.sqrt(3)) {
			return true;
		} 
		return false;

	}

	function getMouseOrientation(mouse,arrow) {	
			var mouse_orientation = 0.5*Math.PI+Math.atan2(mouse.y-this_arrow.origin_y,mouse.x-this_arrow.origin_x);
			if (mouse_orientation < 0) {
				mouse_orientation += 2*Math.PI;
			}
			return mouse_orientation;
	}


	//Canvas context
	var canvas = $('#polygon-canvas')[0];
	var cv_draw = canvas.getContext("2d");

	//Animation settings
	var frame_freq = 30; //How many milliseconds between calls to redraw the canvas

	//polygon settings
	var cv_width = canvas.width;
	var cv_height = canvas.height;
	var polygon_center_x = 0.5*cv_width;
	var polygon_center_y = 0.5*cv_height;
	var polygon_radius = cv_height*0.3;

	//Arrow settings
	var arrow_init_orientation = 0; //4*2*Math.PI/6;
	var arrow_length = 0.7*polygon_radius;
	var tracking_freq = 16; //How many milliseconds between calls to track arrow if moving 

	orientation_history.push([arrow_init_orientation]);

	var this_arrow = new Arrow(canvas,polygon_center_x,polygon_center_y,trial.nsides,arrow_length,arrow_init_orientation);
	var redrawCanvas = function(force_redraw) {
		var force_redraw = force_redraw || false;
		if (this_arrow.dragging || force_redraw) {
			cv_draw.clearRect(0,0,canvas.width,canvas.height);
			drawPolygon(cv_draw,trial.nsides,polygon_center_x,polygon_center_y,polygon_radius); //Draw the polygon	
			this_arrow.draw();
		}
		return;
	};

	var trackArrow = function() {
		if (this_arrow.dragging) {
			orientation_history[orientation_history.length-1].push(this_arrow.orientation);			
		}
	}

	canvas.addEventListener('mousedown', function(e) { 
		var mouse = getMouse(e,this_arrow.canvas);
		if (arrowContains(this_arrow,mouse.x,mouse.y)) {
			this_arrow.dragging = true;
			var mouse_orientation = getMouseOrientation(mouse,this_arrow);
			this_arrow.dragofforientation = mouse_orientation-this_arrow.orientation;
			orientation_history.push([]);
		}
		else { //Jump to orientation on click
			this_arrow.dragging = true;
			var mouse_orientation = getMouseOrientation(mouse,this_arrow);
			this_arrow.orientation = mouse_orientation;
			this_arrow.dragofforientation = 0;
			orientation_history.push([]);
			orientation_history[orientation_history.length-1].push(this_arrow.orientation);			
		}
		return; 
	}, true);

	canvas.addEventListener('mousemove', function(e) {
		if (this_arrow.dragging){
			var mouse = getMouse(e,this_arrow.canvas);
			var mouse_orientation = getMouseOrientation(mouse,this_arrow);
			this_arrow.orientation = mouse_orientation-this_arrow.dragofforientation;
		}
	}, true); 

	canvas.addEventListener('mouseup', function(e) { 
		if (this_arrow.dragging) {
			this_arrow.dragging = false;
			if (trial.nsides === 'n') {
				orientation_history[orientation_history.length-1].push(this_arrow.orientation);
			}
			else {
				//Make arrow snap to vertices
				var mouse = getMouse(e,this_arrow.canvas);
				var mouse_orientation = getMouseOrientation(mouse,this_arrow);
				var best_difference = Infinity;
				var best_orientation = 0;
				var this_difference;
				var or_increment = 2*Math.PI/this_arrow.n_positions;
				for (var or_i = 0; or_i <= this_arrow.n_positions; or_i++) {
					this_difference = Math.abs(mouse_orientation - or_i*or_increment);
					if (this_difference < best_difference) {
						best_difference = this_difference;
						best_orientation = or_i*or_increment;
					}
				} 
				this_arrow.orientation = best_orientation;
				orientation_history[orientation_history.length-1].push(best_orientation);

			}
			redrawCanvas(true);
		}
		return; 
	}, true);
	
	redrawCanvas(true);
	
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

	setInterval(redrawCanvas,frame_freq);
	setInterval(trackArrow,tracking_freq);



	};
        return plugin;
    })();
})(jQuery);
