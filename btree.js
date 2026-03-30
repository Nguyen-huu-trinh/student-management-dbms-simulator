class Node {
    constructor(leaf = true) {
        this.leaf = leaf;
        this.keys = [];
        this.values = [];
        this.children = [];
    }
}

class BTree {
    constructor() {
        this.root = new Node(true);
    }

    insert(key, value) {
        let root = this.root;

        this.insertInternal(root, key, value);

        // 🔥 nếu root bị tràn → split
        if (root.keys.length === 3) {
            let newRoot = new Node(false);
            newRoot.children.push(root);

            this.splitChild(newRoot, 0);
            this.root = newRoot;
        }
    }

    insertInternal(node, key, value) {
        let i = node.keys.length - 1;

        if (node.leaf) {
            // insert vào leaf
            node.keys.push(key);
            node.values.push(value);

            // sort
            let zipped = node.keys.map((k, i) => ({ k, v: node.values[i] }));
            zipped.sort((a, b) => a.k.localeCompare(b.k));

            node.keys = zipped.map(x => x.k);
            node.values = zipped.map(x => x.v);
        } else {
            while (i >= 0 && key < node.keys[i]) i--;
            i++;

            this.insertInternal(node.children[i], key, value);

            // 🔥 nếu child bị tràn → split
            if (node.children[i].keys.length === 3) {
                this.splitChild(node, i);
            }
        }
    }

    splitChild(parent, i) {
        let node = parent.children[i];

        // node có 3 keys → tách
        let left = new Node(node.leaf);
        let right = new Node(node.leaf);

        // chia keys
        left.keys = [node.keys[0]];
        left.values = [node.values[0]];

        right.keys = [node.keys[2]];
        right.values = [node.values[2]];

        // key giữa đẩy lên
        let midKey = node.keys[1];
        let midValue = node.values[1];

        // children nếu có
        if (!node.leaf) {
            left.children = node.children.slice(0, 2);
            right.children = node.children.slice(2);
        }

        // cập nhật parent
        parent.keys.splice(i, 0, midKey);
        parent.values.splice(i, 0, midValue);

        parent.children[i] = left;
        parent.children.splice(i + 1, 0, right);
    }

    search(node, key) {
        let i = 0;

        while (i < node.keys.length && key > node.keys[i]) i++;

        if (i < node.keys.length && node.keys[i] === key)
            return node.values[i];

        if (node.leaf) return null;

        return this.search(node.children[i], key);
    }

    toJSON(node = this.root) {
        return {
            keys: node.keys,
            values: node.values,
            children: node.children.map(c => this.toJSON(c))
        };
    }
}

module.exports = BTree;