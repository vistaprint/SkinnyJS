/*
Arrows for Tutorial Overlay tips
*/
(function ($) {
    $.tutorialOverlay = $.tutorialOverlay || {};

    /**
     * Public factory method to create an Arrow.
     * @param {rectangle} tipRect - the bounding box of the Tip
     * @param {Object} options - the options used to initialize this Arrow.
     **/
    $.tutorialOverlay.createArrow = function (tipRect, options) {
        return new Arrow(tipRect, options);
    };

    /**
     * An Arrow to be drawn connecting a tip to its target.
     * @constructor
     * @param {rectangle} tipRect - the bounding box of the Tip
     * @param {Object} options - the options used to initialize this Arrow.
     **/
    function Arrow(tipRect, options) {
        //Private variables
        var _padding = options.padding; //space between arrow and tip/target
        var _size = options.size; //size of the drawn arrow's [square] bounding box
        var _headSize = options.headSize; //size of the arrow head
        var _direction = options.direction; //direction of the arrow
        var _drawFn = options.drawFn; //function used to draw the arrow head
        var _endPt, _startPt, _controlPt; //points used for rendering the arrow

        /**
         * Get the padding used for this Arrow.
         * @returns {Number} the padding
         **/
        this.getPadding = function () {
            return _padding;
        };

        /**
         * Get the size of this Arrow.  The Arrow's bounding box is assumed to be square.
         * @returns {Number} the size of the arrow
         **/
        this.getSize = function () {
            return _size;
        };

        /**
         * Get the direction of this Arrow.
         * @returns {String} the direction of the arrow
         **/
        this.getDirection = function () {
            return _direction;
        };

        /**
         * Switch the direction of the arrow.
         * @param {rectangle} tipRect - the bounding box of the associated Tip
         **/
        this.toggleDirection = function (tipRect) {
            var newDirection = _direction;
            var dx = 0;
            var dy = 0;
            switch (_direction) {
            case 'SSE':
                newDirection = 'SSW';
                dx = _size;
                break;

            case 'SSW':
                newDirection = 'SSE';
                dx = -_size;
                break;

            default:
            case 'NNE':
                newDirection = 'NNW';
                dx = _size;
                break;

            case 'NNW':
                newDirection = 'NNE';
                dx = -_size;
                break;

            case 'WSW':
                newDirection = 'WNW';
                dy = _size;
                break;

            case 'WNW':
                newDirection = 'WSW';
                dy = -_size;
                break;

            case 'ESE':
                newDirection = 'ENE';
                dy = _size;
                break;

            case 'ENE':
                newDirection = 'ESE';
                dy = -_size;
                break;
            }
            $.translateRect(tipRect, dx, dy);
            _direction = newDirection;
            _calculatePoints(tipRect);
        };

        /**
         * If the arrow does not point to the rect defined by targetRect,
         *   then return false;
         * @param {rectangle} targetRect - the Arrow is expected to point to this rectangle
         * @returns {Boolean} true iff the arrow points to targetRect
         */
        this.isValid = function (targetRect) {
            var valid = false;
            var endPt = _endPt;
            //Make sure that right/bottom are valid.
            targetRect.right = targetRect.left + targetRect.width;
            targetRect.bottom = targetRect.top + targetRect.height;
            switch (_direction) {
            case 'SSE':
            case 'SSW':
                //Arrow points south
                valid = (endPt.x >= targetRect.left) && (endPt.x <= targetRect.right) && (endPt.y <= targetRect.top);
                break;

            default:
            case 'NNE':
            case 'NNW':
                //Arrow points north
                valid = (endPt.x >= targetRect.left) && (endPt.x <= targetRect.right) && (endPt.y >= targetRect.bottom);
                break;

            case 'WSW':
            case 'WNW':
                //Arrow points west
                valid = (endPt.y >= targetRect.top) && (endPt.y <= targetRect.bottom) && (endPt.x >= targetRect.right);
                break;

            case 'ESE':
            case 'ENE':
                //Arrow points east
                valid = (endPt.y >= targetRect.top) && (endPt.y <= targetRect.bottom) && (endPt.x <= targetRect.left);
                break;
            }
            return valid;
        };

        /**
         * Adjust the Tip's bounding box to include this Arrow.
         * @param {rectangle} tipRect - the bounding box of the Tip
         **/
        this.addToTip = function (tipRect) {
            $.addPointToRect(_endPt.x, _endPt.y, tipRect);
        };

        /**
         * Move the location of the Arrow.
         * @param {Number} dx - the amount to move horizontally
         * @param {Number} dy - the amount to move vertically
         **/
        this.translate = function (dx, dy) {
            _startPt.x += dx;
            _startPt.y += dy;
            _endPt.x += dx;
            _endPt.y += dy;
            _controlPt.x += dx;
            _controlPt.y += dy;
        };

        /**
         * Renders the arrow using a custom function.
         * The function is passed an options object containing:
         *  color - the color to use when rendering the arrow
         *  headSize - the size of the head of the arrow
         *  startX, startY - the coordinates for the start of the arrow
         *  endX, endY - the coordinates for the end of the arrow
         *  controlX, controlY - the coordinates for the 'control point' of the arrow
         *  Together start, end, control make up three corners of the bounding box of the arrow.
         * @param {string} color - The color to render the arrow.
         * @param {CanvasRenderingContext2D} canvasContext - The HTML Canvas context to render to.
         **/
        this.render = function (color, canvasContext) {
            _drawFn(canvasContext, {
                startX: _startPt.x,
                startY: _startPt.y,
                controlX: _controlPt.x,
                controlY: _controlPt.y,
                endX: _endPt.x,
                endY: _endPt.y,
                headSize: _headSize,
                color: color
            });
        };

        /**
         * Calculate the start, control, and end points of this arrow.
         * @param {rectangle} tipRect - the Tip's bounding box
         **/
        var _calculatePoints = function (tipRect) {
            //Make sure that right/bottom are valid.
            tipRect.right = tipRect.left + tipRect.width;
            tipRect.bottom = tipRect.top + tipRect.height;
            switch (_direction) {
            case 'SSE':
                _startPt = {
                    x: tipRect.right + _padding,
                    y: tipRect.top + tipRect.height / 2
                };
                _endPt = {
                    x: tipRect.right + _size,
                    y: _startPt.y + (_size - _padding)
                };
                _controlPt = {
                    x: _endPt.x,
                    y: _startPt.y
                };
                break;

            case 'SSW':
                _startPt = {
                    x: tipRect.left - _padding,
                    y: tipRect.top + tipRect.height / 2
                };
                _endPt = {
                    x: tipRect.left - _size,
                    y: _startPt.y + (_size - _padding)
                };
                _controlPt = {
                    x: _endPt.x,
                    y: _startPt.y
                };
                break;

            default:
            case 'NNE':
                _startPt = {
                    x: tipRect.right + _padding,
                    y: tipRect.top + tipRect.height / 2
                };
                _endPt = {
                    x: tipRect.right + _size,
                    y: _startPt.y - (_size - _padding)
                };
                _controlPt = {
                    x: _endPt.x,
                    y: _startPt.y
                };
                break;

            case 'NNW':
                _startPt = {
                    x: tipRect.left - _padding,
                    y: tipRect.top + tipRect.height / 2
                };
                _endPt = {
                    x: tipRect.left - _size,
                    y: _startPt.y - (_size - _padding)
                };
                _controlPt = {
                    x: _endPt.x,
                    y: _startPt.y
                };
                break;

            case 'WSW':
                _startPt = {
                    x: tipRect.left + _size / 2,
                    y: tipRect.bottom + _padding
                };
                _endPt = {
                    x: tipRect.left - (_size / 2) + _padding,
                    y: tipRect.bottom + _size
                };
                _controlPt = {
                    x: _startPt.x,
                    y: _endPt.y
                };
                break;

            case 'WNW':
                _startPt = {
                    x: tipRect.left + _size / 2,
                    y: tipRect.top - _padding
                };
                _endPt = {
                    x: tipRect.left - _size / 2 + _padding,
                    y: tipRect.top - _size
                };
                _controlPt = {
                    x: _startPt.x,
                    y: _endPt.y
                };
                break;

            case 'ESE':
                _startPt = {
                    x: tipRect.right - _size / 2,
                    y: tipRect.bottom + _padding
                };
                _endPt = {
                    x: tipRect.right + _size / 2 - _padding,
                    y: tipRect.bottom + _size
                };
                _controlPt = {
                    x: _startPt.x,
                    y: _endPt.y
                };
                break;

            case 'ENE':
                _startPt = {
                    x: tipRect.right - _size / 2,
                    y: tipRect.top - _padding
                };
                _endPt = {
                    x: tipRect.right + _size / 2 - _padding,
                    y: tipRect.top - _size
                };
                _controlPt = {
                    x: _startPt.x,
                    y: _endPt.y
                };
                break;
            }
        };

        /**
         * The default arrow-drawing function.
         * This function draws an arc from startPt to endPt, using controlPt to determine the midpoint and size of the arc.
         * @param {CanvasRenderingContext2D} canvasContext - The HTML Canvas context to render to.
         * @param {Oject} options - The options to use when rendering the arrow, including the start, control, and end points.
         * @see render
         **/
        var _defaultDrawFn = function (canvasContext, options) {
            canvasContext.beginPath();
            if (options.color) {
                canvasContext.strokeStyle = options.color;
            }

            var startX = options.startX;
            var startY = options.startY;
            var controlX = options.controlX;
            var controlY = options.controlY;
            var endX = options.endX;
            var endY = options.endY;
            var headSize = options.headSize;

            //draw curve from startPt to endPt
            canvasContext.moveTo(startX, startY);
            canvasContext.quadraticCurveTo(controlX, controlY, endX, endY);

            //draw tip of arrow
            var dx = endX - controlX;
            var dy = endY - controlY;
            var angle;
            if (dx === 0) {
                angle = Math.PI / 2;
                if (startY > endY) {
                    angle *= 3;
                }
            } else {
                angle = Math.atan2(dy, dx);
            }
            canvasContext.lineTo(
                endX - headSize * Math.cos(angle - Math.PI / 6),
                endY - headSize * Math.sin(angle - Math.PI / 6)
            );
            canvasContext.moveTo(endX, endY);
            canvasContext.lineTo(
                endX - headSize * Math.cos(angle + Math.PI / 6),
                endY - headSize * Math.sin(angle + Math.PI / 6)
            );

            canvasContext.stroke();
        };

        //Ensure that a drawing function is specified.
        if (!_drawFn) {
            _drawFn = _defaultDrawFn;
        }

        //Initialize points
        _calculatePoints(tipRect);
    }
})(jQuery);