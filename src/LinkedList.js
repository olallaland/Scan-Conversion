function LNode(element) {
    // edge对象
    this.element = element;
    // 下一个节点
    this.next = null;
    // 与当扫描线的交点（point对象）
    this.intersection = undefined;
    // 线段斜率的倒数
    this.slope = function() {
        var x1 = this.element.beginPoint.x;
        var x2 = this.element.endPoint.x;
        var y1 = this.element.beginPoint.y;
        var y2 = this.element.endPoint.y;
        if(x1 === x2) {
            return 0;
        } else if(y1 === y2) {
            return -1;
        } else {
            return (x1 - x2) / (y1 - y2);
        }
    };
}

function LinkedList() {
    this.head = new LNode("head");
    this.insert = insert;
    this.add = add;
    this.prev = prev;
    this.remove = remove;
    this.get = get;
    this.length = length;
    this.print = print;
}

// 向一个节点后面插入一个新节点
function insert(newNode, curNode) {
    newNode.next = curNode.next;
    curNode.next = newNode;
}

// 向链表结尾添加一个新节点
function add(newNode) {
    var curNode = this.head;
    while(curNode.next != null) {
        curNode = curNode.next;
    }
    curNode.next = newNode;
}

// 寻找节点的前一个节点
function prev(node) {
    var curNode = this.head;
    while(curNode != null && curNode.next !== node) {
        curNode = curNode.next;
    }
    return curNode;
}

// 删除节点
function remove(node) {
    var preNode = this.prev(node);
    if(preNode.next != null) {
        preNode.next = node.next;
    }
}

// 返回节点在链表中的位置
function get(index) {
    var curNode = this.head.next;
    var count = 0;
    while(curNode != null) {
        if(count === index) {
            return curNode;
        }
        curNode = curNode.next;
        count++;
    }
    return null;
}

// 返回链表的长度
function length() {
    var curNode = this.head.next;
    var count = 0;
    while(curNode != null) {
        count++;
        curNode = curNode.next;
    }
    return count;
}

// 打印链表
function print() {
    var curNode = this.head;
    while(curNode != null) {
        console.log(curNode.element);
        curNode = curNode.next;
    }
}



