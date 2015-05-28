(function (globals) {
    function Node(distance, parent) {
        this.parent = parent || null;
        this.distance = distance;
        this.children = null;
    }

    Node.prototype.addChildren = function addChildren(left, right) {
        this.children = [left, right];
    };

    Node.prototype.isRoot = function isRoot() {
        return this.parent === null;
    };

    Node.prototype.getRoot = function getRoot() {
        if (this.isRoot()) return this;

        return this.parent.getRoot();
    };

    Node.prototype.isLeafNode = function isLeafNode() {
        return this.children === null;
    };

    Node.prototype.getDepth = function getDepth() {
        if (this.isRoot()) return this.distance;

        return this.distance + this.parent.getDepth();
    };

    function argmax(collection, fun) {
        var element = collection[0];
        var max = fun(element);

        for (var i = 1; i < collection.length; i++) {
            var current = collection[i];
            var result = fun(current);

            if (result > max) {
                max = result;
                element = current;
            }
        }

        return element;
    }

    Node.prototype.getDeepestLeaf = function getDeepestLeaf(distance) {
        var accumulatedDistance = (distance || 0) + this.distance;

        if (this.children && this.children.length === 2) {
            return argmax(this.children.map(function (child) {
                return child.getDeepestLeaf(accumulatedDistance);
            }), function (result) {
                return result.distance;
            });
        }

        return {
            distance: accumulatedDistance,
            node: this
        };
    };

    Node.prototype.getLevelDepth = function () {
        if (this.isRoot()) return 1;

        return 1 + this.parent.getLevelDepth();
    };

    Node.prototype.getLevelDeepestLeaf = function getLevelDeepestLeaf(depth) {
        var accumulatedDepth = (depth || 0) + 1;

        if (this.children && this.children.length === 2) {
            return argmax(this.children.map(function (child) {
                return child.getLevelDeepestLeaf(accumulatedDepth);
            }), function (result) {
                return result.depth;
            });
        }

        return {
            depth: depth,
            node: this
        };
    };

    Node.prototype.getMaximumBranching = function getMaximumBranching() {
        return this.getLevelDeepestLeaf();
    };

    function toPlainObject(node) {
        var object = {distance: node.distance};

        if (node.children && node.children.length === 2)
            object.children = node.children.map(toPlainObject);

        return object;
    };

    function fromPlainObject(object, parent) {
        var node = new Node(object.distance, parent);

        if (object.children && object.children.length === 2) {
            node.addChildren.apply(node, object.children.map(function (childObject) {
                return fromPlainObject(childObject, node);
            }));
        }

        return node;
    };

    Node.prototype.toJSON = function toJSON() {
        return JSON.stringify(toPlainObject(this));
    };

    Node.fromJSON = function fromJSON(json) {
        return fromPlainObject(JSON.parse(json));
    };

    globals.Node = Node;
}(window));

(function (globals) {
    var app = globals.app || {};
    var Node = globals.Node;

    var context;
    var canvas;
    var size;

    var tree;

    app.init = function init(config) {
        canvas = config.canvas;
        context = canvas.getContext('2d');
        size = {width: canvas.width, height: canvas.height};
    };

    app.setTreeJSON = function setTreeJSON(json) {
        tree = Node.fromJSON(json);
    };

    function drawLine(x1, y1, x2, y2) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }

    function drawTree(x, y, width, height, distanceWidth, node) {
        context.beginPath();
        context.arc(x, y, 5, 0, 2 * Math.PI);
        context.fill();

        var nextX = x + node.distance * distanceWidth;
        context.fillText(node.distance, x + (nextX - x) / 2, y - 5)
        drawLine(x, y, nextX, y);

        if (node.children && node.children.length === 2) {
            var nextYOffset = height / (Math.pow(2, node.getLevelDeepestLeaf().depth) / 2);
            var nextHeight = nextYOffset - 10;

            console.log('drawing children at (', nextX, ',', y - nextYOffset, ') and (', nextX, ',', y + nextYOffset, ') with nextHeight', nextHeight);

            drawLine(nextX, y, nextX, y - nextYOffset);
            drawTree(nextX, y - nextYOffset, width, nextHeight, distanceWidth, node.children[0]);

            drawLine(nextX, y, nextX, y + nextYOffset);
            drawTree(nextX, y + nextYOffset, width, nextHeight, distanceWidth, node.children[1]);
        }
    }

    app.draw = function draw() {
        size = {
            width: canvas.width,
            height: canvas.height
        };
        context.clearRect(0, 0, size.width, size.height);

        if (!tree) {
            context.fillText('No valid tree!', size.width / 2, size.height / 2);
            return;
        }

        var levels = tree.getLevelDeepestLeaf().depth;
        var branching = Math.pow(2, levels);
        var depth = tree.getDeepestLeaf().distance;

        console.log('levels:', levels, '\n', 'branching:', branching, '\n', 'depth:', depth);

        // Draw grid
        context.strokeStyle = '#aaa';
        var xStep = size.width / (levels + 1);
        for (var x = 0; x <= levels + 1; x++) {
            drawLine(x * xStep, 0, x * xStep, size.height);
        }

        var yStep = size.height / branching;
        for (var y = 0; y <= branching; y++) {
            drawLine(0, y * yStep, size.width, y * yStep);
        }

        // Draw staring with root
        context.fillStyle = 'black';
        context.strokeStyle = 'black';
        drawTree(0, 5 + (size.height - 5) / 2, size.width, size.height - 10, size.width / depth, tree);
    };

    app.status = function getStatus() {
        return {
            context: context,
            size: size,
            tree: tree
        };
    };

    globals.app = app;
}(window));
