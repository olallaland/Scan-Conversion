
// 绘制两个点之间的线段
function drawLine(cxt, point1, point2, color) {
    cxt.beginPath();
    cxt.strokeStyle ="rgba("+color[0] + "," +
        +color[1] + "," +
        +color[2] + "," +
        +255 + ")" ;
    //这里线宽取1会有色差，但是类似半透明的效果有利于debug，取2效果较好
    cxt.lineWidth = 1;
    cxt.moveTo(point1.x, point1.y);
    cxt.lineTo(point2.x, point2.y);
    cxt.stroke();
}

// 绘制一个点
function drawPoint(cxt, x, y, color) {
    //建立一条新的路径
    cxt.beginPath();
    //设置画笔的颜色
    cxt.strokeStyle ="rgb("+color[0] + "," +
        +color[1] + "," +
        +color[2] + ")" ;
    //设置路径起始位置
    cxt.moveTo(x, y);
    //在路径中添加一个节点
    cxt.lineTo(x + 0.5,y + 0.5);
    //用画笔颜色绘制路径
    cxt.stroke();
}


// 判断扫描线和边是否相交
function isIntersected(height, edge) {
    return edge.minY() <= height && edge.maxY() >= height;
}

// 求扫描线和边的交点（由于扫描线是平行于x轴的，所以可以使用相似三角形简化计算）
function getIntersection(scanLine, edge) {
    var h = scanLine.beginPoint.y;
    var x1 = edge.beginPoint.x;
    var y1 = edge.beginPoint.y;
    var x2 = edge.endPoint.x;
    var y2 = edge.endPoint.y;
    var xi = x1 - (x1 - x2) * (h - y1) / (y2 - y1);

    return new Point(xi, h);
}

// 判断两个浮点数是否相等
function equals(num1, num2) {
    var delta = 1e-10;
    return Math.abs(num1 - num2) < delta;
}

// 扫描转换算法
function scanPolygon(polygon, color) {
    var activeEdgeList = new LinkedList();
    var edges = polygon.edgeList;
    var edgePointer = 0;
    // 将多边形的边按照minY顺序由小到大排序
    edges.sort(function(edge1, edge2) {
        return edge1.minY() - edge2.minY();
    });

    for(var i = 0; i <= c.height; i++) {
        // 当前扫描线与所有边的交点的集合
        var intersections = [];
        // 计算生成当前扫描线
        var scanLine = new Edge(new Point(0, i), new Point(c.width, i));

        // 更新active edge list -- 添加新的边
        for(var j = edgePointer; j < edges.length; j++) {
            if(isIntersected(i, edges[j])) {
                activeEdgeList.add(new LNode(edges[j]));
                // 由于多边形的边只会被添加一次，所以在添加完这条边后，将指针后移，防止重复添加
                edgePointer++;
            }
        }

        // 更新active edge list -- 删除不再与扫描线有交点的边
        // 求active edge list中的所有的边与扫描线的交点
        // 1. 平行线特殊情况 单独处理
        // 2. 利用连贯性，如果这条表与上一条扫描线有交点，那么这次它与扫描线的交点的横坐标为上一次的交点加上直线斜率的倒数
        // 3. 不满足以上两种情况则直接求交点
        var curNode = activeEdgeList.head.next;
        while(curNode != null) {
            var curEdge = curNode.element;
            if(!isIntersected(i, curEdge)) {
                activeEdgeList.remove(curNode);
            } else {
                if(curEdge.beginPoint.y === curEdge.endPoint.y) {
                    drawLine(cxt, curEdge.beginPoint, curEdge.endPoint, color);
                    // 设定平行线与扫描线有两个交点，分别为初始点和结尾点
                    curNode.intersection = curEdge.beginPoint;
                    intersections.push(curNode.intersection);
                    // 每个node只有一个交点，因此这里要添加一个平行线的副本到active edge list中
                    activeEdgeList.insert(new LNode(curEdge), curNode);
                    curNode = curNode.next;
                    curNode.intersection = curEdge.endPoint;
                    intersections.push(curNode.intersection);
                } else {
                    if(curNode.intersection !== undefined) {
                        // 使用连贯性计算交点
                        curNode.intersection.x += curNode.slope();
                        curNode.intersection.y = i;
                    } else {
                        curNode.intersection = getIntersection(scanLine, curEdge);
                    }
                    intersections.push(curNode.intersection);
                }
            }
            curNode = curNode.next;
        }

        // 对重复的交点进行处理(将扫描线上移一个像素，再求交点；根据交点的个数，进行处理)
        var test = i - 1;
        // 记录要删除的交点的index
        var deleteIndex = [];
        for(var k = 0; k < intersections.length; k++) {
            for(var l = k + 1; l < intersections.length; l++) {
                if(equals(intersections[k].x, intersections[l].x)) {
                    // 记录上一条扫描线与这两条边的交点数
                    var count = 0;
                    if(isIntersected(test, activeEdgeList.get(k).element)) {
                        count++;
                    }
                    if(isIntersected(test, activeEdgeList.get(l).element)) {
                        count++;
                    }
                    // 交点数为0，删去这两个交点；交点数为1，删去其中一个交点；交点数为0，保留这两个交点
                    if(count === 0) {
                        deleteIndex.push(k);
                        deleteIndex.push(l);
                    } else if(count === 1) {
                        deleteIndex.push(k);
                    }
                }
            }
        }

        //删去多余交点后，新的交点列表
        var intersectionsNew = [];
        var delPointer = 0;
        for(var m = 0; m < intersections.length; m++) {
            if(m === deleteIndex[delPointer]) {
                delPointer++;
                continue;
            }
            intersectionsNew.push(intersections[m]);
        }

        //对交点沿x轴正向排序
        intersectionsNew.sort(function(p1, p2) {
            return p1.x - p2.x;
        });

        //经过处理的交点两两配对，用相应颜色在两点之间画线段
        for(var n = 0; n < intersectionsNew.length - 1; n += 2) {
            drawLine(cxt, intersectionsNew[n], intersectionsNew[n + 1], color);
        }
    }
}

// 判断鼠标点击位置是否在某点周围
function isAround(x, y, point, radius) {
    var x1 = point.x;
    var y1 = point.y;
    return Math.pow(x - x1, 2) + Math.pow(y - y1, 2) <= Math.pow(radius, 2);
}

// 鼠标点击事件
function mouseDown(event) {
    var e = window.event;
    var x = e.offsetX;
    var y = e.offsetY;

    // 判断点是否在某个顶点的周围一定位置
    for(var i = 0; i < points.length; i++) {
        if(isAround(x, y, points[i], tolerance)) {
            flag = 1;
            dragPoint = i;
            break;
        }
    }
}

// 鼠标移动事件
function mouseMove(event) {
    var e = window.event;
    var newX = e.offsetX;
    var newY = e.offsetY;
    // 如果点击位置不在canvas中，则忽略事件
    if(newX < 0 || newX > c.width || newY < 0 || newY > c.height) {
        flag = 0;
    }

    // 当鼠标移动时，根据鼠标实时的坐标，重新进行扫描转换
    if(flag === 1 && dragPoint !== undefined) {
        points[dragPoint].x = newX;
        points[dragPoint].y = newY;
        // 刷新canvas
        c.height = canvasSize.maxY;
        // 首先对不以拖拽点为顶点的多边形做扫描转换
        for(var i = polygonList.length - 1; i >= 0; i--) {
            if(!polygonList[i].containsPoint(dragPoint)) {
                scanPolygon(polygonList[i], points[polygonList[i].pointList[0]].color);
            }
        }
        // 然后对以拖拽点为顶点的多边形做扫描转换
        for(var i = 0; i < polygonList.length; i++) {
            if(polygonList[i].containsPoint(dragPoint)) {
                scanPolygon(polygonList[i], points[polygonList[i].pointList[0]].color);
            }
        }

        // 画顶点周围的圆形手柄
        for(var i = 0; i < points.length; i++) {
            points[i].drawHandle(cxt, tolerance);
        }
    }
}

// 鼠标放开事件
function mouseUp(event) {
    flag = 0;
}

var c = document.getElementById("myCanvas");
var cxt = c.getContext("2d");
//将canvas坐标整体偏移0.5，用于解决宽度为1个像素的线段的绘制问题
cxt.translate(0.5, 0.5);
//设置canvas的长宽
c.width = canvasSize.maxX;
c.height = canvasSize.maxY;
// 所有点的集合
var points = [];
// 所有四边形的集合
var polygonList = [];
// 点击事件的flag
var flag = 0;
// 被拖拽的顶点的index
var dragPoint;
// 拖拽顶点的容差范围
var tolerance = 10;

// 读取配置文件，获得所有的point对象
for(var i = 0; i < vertex_pos.length; i++) {
    points.push(new Point(vertex_pos[i][0], vertex_pos[i][1], vertex_color[i]));
}

// 读取配置文件，得到所有的polygon对象
for(var i = 0; i < polygon.length; i++) {
    // 每个四边形的所有边的集合
    var edges = [];
    for(var j = 0; j < polygon[i].length; j++) {
        var end = (j + 1 === polygon[i].length) ? 0 : j + 1;
        edges.push(new Edge(points[polygon[i][j]], points[polygon[i][end]]));
    }
    polygonList.push(new Polygon(edges, polygon[i]));
}

// 初始时为canvas中的多边形填充颜色：第一次扫描转换
for(var i = 0; i < polygonList.length; i++) {
    scanPolygon(polygonList[i], points[polygonList[i].pointList[0]].color);
}

// 为多边形的每个顶点画一个圆形手柄，以便于顶点的拉拽
for(var i = 0; i < points.length; i++) {
    points[i].drawHandle(cxt, tolerance);
}




