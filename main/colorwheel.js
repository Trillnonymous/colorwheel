(function(window) {
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
			var s = (a - 2) * Math.PI / 180,
				e = a * Math.PI / 180;
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
			result = '#' + rHex + gHex + bHex;
		return result;
	};
	
	ColorWheel.prototype.rgbToHsl = function(components){
		var rL = components[0] / 255, gL = components[1] / 255, bL = components[2] / 255,
			max = Math.max(rL, gL, bL), min = Math.min(rL, gL, bL),
			h, s, l = (max + min) / 2;
		if (max === min){
			h = s = 0;
		} else {
			var dist = max - min;
			s = l > 0.5 ? dist / (2 - max - min) : dist / (max + min);
			
			switch (max){
				case rL: h = (gL - bL) / dist + (gL < bL ? 6 : 0); break;
				case gL: h = (bL - rL) / dist + 2; break;
				case bL: h = (rL - gL) / dist + 4; break;
			}
			
			h = h / 6;
		}
		
		return [h, s, l];
	};
	
	ColorWheel.prototype.hslToRgb = function(components){
		var r, g, b, h = components[0] / 360, s = components[1] / 100, l = components[2] / 100;
		if (s === 0){
			r = g = b = l;
		} else {
			function hueToRgb(p, q, t){
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1/6) return p + (q - p) * 6 * t;
				if (t < 1/2) return q;
				if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}
			
			var q = l < 0.5 ? l * (1 + s) : l + s - l * s,
				p = 2 * l - q;
			
			r = hueToRgb(p, q, h + 1/3);
			g = hueToRgb(p, q, h);
			b = hueToRgb(p, q, h - 1/3);
		}
		
		return [r, g, b].map(function(component){ return Math.round(component * 255); });
	};
	
	ColorWheel.prototype.hslToHex = function(components){
		var rgb = this.hslToRgb(components),
			hex = this.rgbToHex(rgb);
		return hex;
	};

	ColorWheel.prototype.hexToRgb = function(hex){
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b){
			return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [
			parseInt(result[1], 16),
			parseInt(result[2], 16),
			parseInt(result[3], 16),
			1
		] : null;
	};

	ColorWheel.prototype.insertData = function(rgba){
		var rgbaComponents = rgba.replace(/rgb(?:a|)\(([^\(\)]{1,})\)/g, '$1'),
			components = rgbaComponents.split(/\,(?:\s+|)/g).map(Number),
			hex = this.rgbToHex(components),
			$hexElem = $(this.canvas).parent('.picker-container').find('#input-hex'),
			$rElem = $(this.canvas).parent('.picker-container').find('#input-red'),
			$gElem = $(this.canvas).parent('.picker-container').find('#input-green'),
			$bElem = $(this.canvas).parent('.picker-container').find('#input-blue'),
			$colorbox = $(this.canvas).parent('.picker-container').find('.color-box');
		$rElem.val(components[0]);
		$gElem.val(components[1]);
		$bElem.val(components[2]);
		$hexElem.val(hex);
		$colorbox.css('background-color', rgba);
	};

	ColorWheel.prototype.changeColor = function(event){
		var x = event.offsetX,
			y = event.offsetY,
			imageData = this.context.getImageData(x, y, 1, 1).data,
			rgbaColor = 'rgba(' + [imageData[0], imageData[1], imageData[2]].join(', ') + ', 1)';
		this.insertData(rgbaColor);
	};

	ColorWheel.prototype.init = function(){
		$(this.canvas).on('click', $.proxy(this.changeColor, this));
		$(this.canvas).on('mousemove', $.proxy(function(event){
			if (this.drag === true) {
				this.changeColor.apply(this, [event]);
			}
		}, this));
		$(this.canvas).on('mousedown', $.proxy(function(event){
			this.drag = true;
			this.changeColor.apply(this, [event]);
		}, this));
		$(this.canvas).on('mouseup', $.proxy(function(event){
			this.drag = false;
			this.changeColor.apply(this, [event]);
		}, this));
	};

	ColorWheel.create = function(canvas){
		return new ColorWheel(canvas);
	};

	window.ColorWheel = ColorWheel;
}(this == window ? this : window));
