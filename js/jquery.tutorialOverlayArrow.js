/*
Arrows for Tutorial Overlay tips
*/
(function ($) {

    function Arrow(tipRect, options) {
        this.padding = options.padding;
        this.size = options.size;
        this.headSize = options.headSize;
        this.direction = options.direction;
        this.drawHeadFn = options.drawHeadFn;

        _calculateArrow(this, tipRect);
    }

    //TODO: what's a better way to do this?
    $.tutorialOverlay.createArrow = function (tipRect, options) {
        return new Arrow(tipRect, options);
    };

    Arrow.prototype.toggleDirection = function (tipRect) {
        var newDirection = this.direction;
        switch (this.direction) {
        case 'SSE':
            newDirection = 'SSW';
            $.translateRect(tipRect, this.size, 0);
            break;

        case 'SSW':
            newDirection = 'SSE';
            $.translateRect(tipRect, -this.size, 0);
            break;

        case 'NNE':
            newDirection = 'NNW';
            $.translateRect(tipRect, this.size, 0);
            break;

        case 'NNW':
            newDirection = 'NNE';
            $.translateRect(tipRect, -this.size, 0);
            break;

        case 'WSW':
            newDirection = 'WNW';
            $.translateRect(tipRect, 0, this.size);
            break;

        case 'WNW':
            newDirection = 'WSW';
            $.translateRect(tipRect, 0, -this.size);
            break;

        case 'ESE':
            newDirection = 'ENE';
            $.translateRect(tipRect, 0, this.size);
            break;

        case 'ENE':
            newDirection = 'ESE';
            $.translateRect(tipRect, 0, -this.size);
            break;
        }
        this.direction = newDirection;
        _calculateArrow(this, tipRect);
    };

    /*
     * If the arrow does not point to the rect defined by targetRect,
     *   then return false;
     */
    Arrow.prototype.isValid = function (targetRect) {
        var valid = false;
        var endPt = this.endPt;
        switch (this.direction) {
        case 'SSE':
        case 'SSW':
            //Arrow points south
            valid = (endPt.x >= targetRect.left) && (endPt.x <= targetRect.right) && (endPt.y <= targetRect.top);
            break;

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

    Arrow.prototype.addToTip = function (tipRect) {
        $.addPointToRect(this.endPt.x, this.endPt.y, tipRect);
    };

    Arrow.prototype.translate = function (dx, dy) {
        this.startPt.x += dx;
        this.startPt.y += dy;
        this.endPt.x += dx;
        this.endPt.y += dy;
        this.controlPt.x += dx;
        this.controlPt.y += dy;
    };

    Arrow.prototype.render = function (color, canvasContext) {
        canvasContext.beginPath();
        if (color) {
            canvasContext.strokeStyle = color;
        }

        //draw curve from startPt to endPt
        canvasContext.moveTo(this.startPt.x, this.startPt.y);
        canvasContext.quadraticCurveTo(this.controlPt.x, this.controlPt.y, this.endPt.x, this.endPt.y);

        //draw tip of arrow
        if (this.drawHeadFn) {
            this.drawHeadFn(
                this.startPt.x, this.startPt.y,
                this.controlPt.x, this.controlPt.y,
                this.endPt.x, this.endPt.y
            );
        } else {
            var dx = this.endPt.x - this.controlPt.x;
            var dy = this.endPt.y - this.controlPt.y;
            var angle;
            if (dx === 0) {
                angle = Math.PI / 2;
                if (this.startPt.y > this.endPt.y) {
                    angle *= 3;
                }
            } else {
                angle = Math.atan2(dy, dx);
            }
            canvasContext.lineTo(
                this.endPt.x - this.headSize * Math.cos(angle - Math.PI / 6),
                this.endPt.y - this.headSize * Math.sin(angle - Math.PI / 6)
            );
            canvasContext.moveTo(this.endPt.x, this.endPt.y);
            canvasContext.lineTo(
                this.endPt.x - this.headSize * Math.cos(angle + Math.PI / 6),
                this.endPt.y - this.headSize * Math.sin(angle + Math.PI / 6)
            );
        }

        canvasContext.stroke();
    };

    var _calculateArrow = function (arrow, tipRect) {
        switch (arrow.direction) {
        case 'SSE':
            arrow.startPt = {
                x: tipRect.right + arrow.padding,
                y: tipRect.top + tipRect.height / 2
            };
            arrow.endPt = {
                x: tipRect.right + arrow.size,
                y: arrow.startPt.y + (arrow.size - arrow.padding)
            };
            arrow.controlPt = {
                x: arrow.endPt.x,
                y: arrow.startPt.y
            };
            break;

        case 'SSW':
            arrow.startPt = {
                x: tipRect.left - arrow.padding,
                y: tipRect.top + tipRect.height / 2
            };
            arrow.endPt = {
                x: tipRect.left - arrow.size,
                y: arrow.startPt.y + (arrow.size - arrow.padding)
            };
            arrow.controlPt = {
                x: arrow.endPt.x,
                y: arrow.startPt.y
            };
            break;

        case 'NNE':
            arrow.startPt = {
                x: tipRect.right + arrow.padding,
                y: tipRect.top + tipRect.height / 2
            };
            arrow.endPt = {
                x: tipRect.right + arrow.size,
                y: arrow.startPt.y - (arrow.size - arrow.padding)
            };
            arrow.controlPt = {
                x: arrow.endPt.x,
                y: arrow.startPt.y
            };
            break;

        case 'NNW':
            arrow.startPt = {
                x: tipRect.left - arrow.padding,
                y: tipRect.top + tipRect.height / 2
            };
            arrow.endPt = {
                x: tipRect.left - arrow.size,
                y: arrow.startPt.y - (arrow.size - arrow.padding)
            };
            arrow.controlPt = {
                x: arrow.endPt.x,
                y: arrow.startPt.y
            };
            break;

        case 'WSW':
            arrow.startPt = {
                x: tipRect.left + arrow.size / 2,
                y: tipRect.bottom + arrow.padding
            };
            arrow.endPt = {
                x: tipRect.left - (arrow.size / 2) + arrow.padding,
                y: tipRect.bottom + arrow.size
            };
            arrow.controlPt = {
                x: arrow.startPt.x,
                y: arrow.endPt.y
            };
            break;

        case 'WNW':
            arrow.startPt = {
                x: tipRect.left + arrow.size / 2,
                y: tipRect.top - arrow.padding
            };
            arrow.endPt = {
                x: tipRect.left - arrow.size / 2 + arrow.padding,
                y: tipRect.top - arrow.size
            };
            arrow.controlPt = {
                x: arrow.startPt.x,
                y: arrow.endPt.y
            };
            break;

        case 'ESE':
            arrow.startPt = {
                x: tipRect.right - arrow.size / 2,
                y: tipRect.bottom + arrow.padding
            };
            arrow.endPt = {
                x: tipRect.right + arrow.size / 2 - arrow.padding,
                y: tipRect.bottom + arrow.size
            };
            arrow.controlPt = {
                x: arrow.startPt.x,
                y: arrow.endPt.y
            };
            break;

        case 'ENE':
            arrow.startPt = {
                x: tipRect.right - arrow.size / 2,
                y: tipRect.top - arrow.padding
            };
            arrow.endPt = {
                x: tipRect.right + arrow.size / 2 - arrow.padding,
                y: tipRect.top - arrow.size
            };
            arrow.controlPt = {
                x: arrow.startPt.x,
                y: arrow.endPt.y
            };
            break;
        }
    };
})(jQuery);