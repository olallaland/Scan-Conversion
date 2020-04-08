
// point对象
function Point(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.drawHandle = function(cxt, radius) {
        var ratio;
        var edgeX;
        var edgeY;
        for (var i = 0; i < 360; i += 12) {
            // 围绕某个点画一个圆
            // 假设一个圆的圆心坐标是(a,b)，半径为r
            // 则圆上每个点的X坐标=a + Math.sin(2Math.PI / 360) * r ；Y坐标=b + Math.cos(2Math.PI / 360) * r
            ratio = i * Math.PI / 180;
            edgeX = radius * Math.cos(ratio) + this.x;
            edgeY = radius * Math.sin(ratio) + this.y;
            //drawPoint(cxt, edgeX, edgeY, [0, 0, 0]);
            drawLine(cxt, this, new Point(edgeX, edgeY), [255, 0, 0]);
        }
    }
}

// edge对象
function Edge(beginPoint, endPoint) {
    this.beginPoint = beginPoint;
    this.endPoint = endPoint;
    this.minY = function() {
        return this.beginPoint.y > this.endPoint.y ? this.endPoint.y : this.beginPoint.y;
    };
    this.maxY = function() {
        return this.beginPoint.y < this.endPoint.y ? this.endPoint.y : this.beginPoint.y;
    };
    this.minX = function() {
        return this.beginPoint.x > this.endPoint.x ? this.endPoint.x : this.beginPoint.x;
    };
}

// polygon对象
function Polygon(edgeList, pointList) {
    this.edgeList = edgeList;
    this.pointList = pointList;
    this.containsPoint = function(pointIndex) {
        for(var i = 0; i < this.pointList.length; i++) {
            if(pointIndex === pointList[i]) {
                return true;
            }
        }
        return false;
    };
}


