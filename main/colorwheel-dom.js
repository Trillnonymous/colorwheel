(function($, window){
	function ColorWheel($element){
		// The main wrapper for the color wheel
		this.$wrapper = $element;
		// The color wheel element (jQuery)
		this.$colorWheel = $element.find('canvas[data-type="color-wheel"]');
		// The color wheel element (JavaScript)
		this.colorWheel = this.$colorWheel.get(0);
		// The 2D context of the color wheel
		this.context = this.colorWheel.getContext("2d");
		// The width of the color wheel
		this.width = this.colorWheel.width;
		// The height of the color wheel
		this.height = this.colorWheel.height;
		// The x-axis of the color block
		this.x = 0;
		// The y-axis of the color block
		this.y = 0;
		// The radial x-axis of the color wheel
		this.cx = this.width / 2;
		// The radial y-axis of the color wheel
		this.cy = this.width / 2;
		// The radius of the color wheel
		this.radius = this.width / 2;
		// The boolean value to determine whether the color wheel is counterclockwise
		this.counterClockwise = false;
		// The boolean value to determine whether to drag the mouse on the color wheel
		this.drag = false;
		// The start (minimum) angle for the wheel
		this.startAngle = 0;
		// The end (maximum) angle for the wheel
		this.endAngle = 360;
		// Default RGBA color
		this.RGBAColor = "rgba(255, 0, 0, 1)";
		// Creating the color wheel by default
		this.create();
	}
	ColorWheel.prototype.create = function(){
		for (var angle = this.startAngle; angle <= this.endAngle; angle++){
			var start = (angle - 2) * Math.PI / 180,
				end = angle * Math.PI / 180;
			this.context.beginPath();
			this.context.moveTo(this.cx, this.cy);
			this.context.arc(
				this.cx,
				this.cy,
				this.radius,
				start,
				end,
				this.counterClockwise
			);
			this.context.closePath();
			var gradient = this.context.createRadialGradient(
				this.cx,
				this.cy,
				0,
				this.cx,
				this.cy,
				this.radius
			);
			gradient.addColorStop(0, "hsl(" + angle + ", 10%, 100%)");
			gradient.addColorStop(1, "hsl(" + angle + ", 100%, 50%)");
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
		var rL = components[0] / 255,
			gL = components[1] / 255,
			bL = components[2] / 255,
			max = Math.max(rL, gL, bL),
			min = Math.min(rL, gL, bL),
			h, s, l = (max + min) / 2;
		if (max === min){
			h = s = 0;
		} else {
			var dist = max - min;
			s = l > 0.5 ? dist / (2 - max - min) : dist / (max + min);
			switch (max) {
				case rL:
					h = (gL - bL) / dist + (gL < bL ? 6 : 0);
					break;
				case gL:
					h = (bL - rL) / dist + 2;
					break;
				case bL:
					h = (rL - gL) / dist + 4;
					break;
			}
			h = h / 6;
		}
		return [Math.round(h * 360), Math.round(s * 100) + '%', Math.round(l * 100) + '%'];
	};
	ColorWheel.prototype.hslToRgb = function(components){
		var r, g, b, h = components[0] / 360,
			s = this.toNumber(components[1]) / 100,
			l = this.toNumber(components[2]) / 100;
		if (s === 0){
			r = g = b = l;
		} else {
			function hueToRgb(p, q, t){
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			}
			var q = l < 0.5 ? l * (1 + s) : l + s - l * s,
				p = 2 * l - q;
			r = hueToRgb(p, q, h + 1 / 3);
			g = hueToRgb(p, q, h);
			b = hueToRgb(p, q, h - 1 / 3);
		}
		return [r, g, b].map(function(component){
			return Math.round(component * 255);
		});
	};
	ColorWheel.prototype.hslToHex = function(components){
		var rgb = this.hslToRgb(components),
			hex = this.rgbToHex(rgb);
		return hex;
	};
	ColorWheel.prototype.hexToRgb = function(hex){
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
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
	ColorWheel.prototype.toDecimal = function(percentage){
		if (typeof percentage === 'number') return percentage;
		var percent = parseInt(percentage.replace('%', ''), 10);
		percent = percent / 100;
		return percent;
	};
	ColorWheel.prototype.toNumber = function(percentage){
		if (typeof percentage === 'number') return percentage;
		var percent = parseInt(percentage.replace('%', ''), 10);
		return percent;
	};
	ColorWheel.prototype.isType = function(components){
		if (typeof components === 'string'){
			return 'Hex';
		} else if (Array.isArray(components)) {
			var isHSL = components.some(function(component){
				return typeof component === 'string' && component.lastIndexOf('%', 1) > -1;
			});
			if (isHSL){
				return 'HSL';
			} else {
				return 'RGB';
			}
		}
	};
	ColorWheel.prototype.lighten = function(components, percent, converter){
		var r, g, b;
		if (this.isType(components) === 'Hex'){
			r = parseInt(color.substring(1, 3), 16);
			g = parseInt(color.substring(3, 5), 16);
			b = parseInt(color.substring(5, 7), 16);
		} else if (this.isType(components) === 'RGB'){
			r = components[0];
			g = components[1];
			b = components[2];
		} else if (this.isType(components) === 'HSL'){
			components = this.hexToRgb(components);
			r = components[0];
			g = components[1];
			b = components[2];
		} else {
			return null;
		}
		r = parseInt(r * (100 + percent) / 100, 10);
		g = parseInt(g * (100 + percent) / 100, 10);
		b = parseInt(b * (100 + percent) / 100, 10);
		r = (r < 255) ? r : 255;
		g = (g < 255) ? g : 255;
		b = (b < 255) ? b : 255;
		if (typeof converter === 'undefined' || converter === 'Hex'){
			var rr = ((r.toString(16).length === 1) ? "0" + r.toString(16) : r.toString(16)),
				gg = ((g.toString(16).length === 1) ? "0" + g.toString(16) : g.toString(16)),
				bb = ((b.toString(16).length === 1) ? "0" + b.toString(16) : b.toString(16));
			return '#' + [rr, gg, bb].join('');
		} else if (converter === 'RGB') {
			return [r, g, b];
		} else if (converter === 'HSL') {
			return this.rgbToHsl([r, g, b]);
		} else {
			return null;
		}
	};
	ColorWheel.prototype.darken = function(components, percent, converter){
		return this.lighten(components, -percent, converter);
	};
	ColorWheel.prototype.insertData = function(){
		var rgba = this.RGBAColor,
			rgbaComponents = rgba.replace(/rgb(?:a|)\(([^\(\)]{1,})\)/g, "$1"),
			components = rgbaComponents.split(/\,(?:\s+|)/g).map(Number),
			hslComponents = this.rgbToHsl(components),
			hex = this.rgbToHex(components),
			$hexElem = this.$wrapper.find('input[data-name="Hex"]'),
			$rElem = this.$wrapper.find('input[data-name="R"]'),
			$gElem = this.$wrapper.find('input[data-name="G"]'),
			$bElem = this.$wrapper.find('input[data-name="B"]'),
			$hElem = this.$wrapper.find('input[data-name="H"]'),
			$sElem = this.$wrapper.find('input[data-name="S"]'),
			$lElem = this.$wrapper.find('input[data-name="L"]'),
			$colorbox = this.$wrapper.find(".color-box");
		$rElem.val(components[0]);
		$gElem.val(components[1]);
		$bElem.val(components[2]);
		$hElem.val(hslComponents[0]);
		$sElem.val(hslComponents[1]);
		$lElem.val(hslComponents[2]);
		$hexElem.val(hex);
		$colorbox.css("background-color", rgba);
	};
	ColorWheel.prototype.changeColor = function(event){
		this.x = event.offsetX;
		this.y = event.offsetY;
		var imageData = this.context.getImageData(this.x, this.y, 1, 1).data,
			r = imageData[0],
			g = imageData[1],
			b = imageData[2];
		this.RGBAColor = "rgba(" + [r, g, b].join(", ") + ", 1)";
		this.insertData();
	};
	ColorWheel.prototype.init = function(){
		var $colorWheel = this.$colorWheel;
		$colorWheel.on("click", $.proxy(this.changeColor, this));
		$colorWheel.on(
			"mousedown",
			$.proxy(function(event){
				this.drag = true;
				this.changeColor.apply(this, [event]);
			}, this)
		);
		$colorWheel.on(
			"mousemove",
			$.proxy(function(event) {
				if (this.drag === true){
					this.changeColor.apply(this, [event]);
				}
			}, this)
		);
		$colorWheel.on(
			"mouseup",
			$.proxy(function(event){
				this.drag = false;
				this.changeColor.apply(this, [event]);
			}, this)
		);
	};
}(jQuery, window));
