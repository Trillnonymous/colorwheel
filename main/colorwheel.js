(function(window){
	function ColorWheel(canvas){
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.width = canvas.width;
		this.height = canvas.height;
		this.cx = canvas.width / 2;
		this.cy = canvas.width / 2;
		this.radius = canvas.width / 2;
		this.counterClockwise = false;
		this.drag = false;
		this.startAngle = 0;
		this.endAngle = 360;
		this.create();
	}
	
	ColorWheel.prototype.create = function(){
		for (var a = this.startAngle; a <= this.endAngle; a++){
			var s = (a - 2) * Math.PI/180,
				e = a * Math.PI/180;
			this.context.beginPath();
			this.context.moveTo(this.cx, this.cy);
			this.context.arc(this.cx, this.cy, this.radius, s, e, this.counterClockwise);
			this.context.closePath();
			var gradient = this.context.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, this.radius);
			gradient.addColorStop(0, 'hsl(' + a + ', 10%, 100%)');
			gradient.addColorStop(1, 'hsl(' + a + ', 100%, 50%)');
			this.context.fillStyle = gradient;
			this.context.fill();
		}
	};
	
	ColorWheel.prototype.componentToHex = function(component){
		var hex = component.toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};
	
	ColorWheel.prototype.rgbToHex = function(components){
		var rHex = this.componentToHex(components[0]),
			gHex = this.componentToHex(components[1]),
			bHex = this.componentToHex(components[2]),
			aHex = typeof components[3] !== 'undefined' ? this.componentToHex(256 * components[3]) : '',
			result = '#' + rHex + gHex + bHex + aHex;
		return result;
	};
	
	ColorWheel.prototype.changeColor = function(event){
		var x = event.offsetX,
			y = event.offsetY,
			imageData = this.context.getImageData(x, y, 1, 1).data,
			rgbaColor = 'rgba(' + [imageData[0], imageData[1], imageData[2]].join(', ') + ', 1)';
		$(this.canvas).parent('.picker-container').find('.color-box').css('background-color', rgbaColor);
	};
	
	ColorWheel.prototype.init = function(){
		var that = this;
		$(this.canvas).on('click', $.proxy(this.changeColor, this), false);
		$(this.canvas).on('mousemove', $.proxy(function(event){
			if (this.drag === true){
				this.changeColor.apply(this, [event]);
			}
		}, this), false);
		$(this.canvas).on('mousedown', $.proxy(function(event){
			this.drag = true;
			this.changeColor.apply(this, [event]);
		}, this), false);
		$(this.canvas).on('mouseup', $.proxy(function(event){
			this.drag = false;
			this.changeColor.apply(this, [event]);
		}, this), false);
	};
	
	ColorWheel.create = function(canvas){
		return new ColorWheel(canvas);
	};
	
	window.ColorWheel = ColorWheel;
}(this == window ? this : window));
