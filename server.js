const express = require("express");
const cors = require("cors");
const fs = require("fs");
const BTree = require("./btree");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* LOAD DATA */
let database = JSON.parse(fs.readFileSync("students.json"));

/* BUILD B-TREE */
let tree = new BTree();
let idTree = new BTree();
let nameTree = new BTree();
database.forEach((s, i) => {
    idTree.insert(s.id, i);
    let existing = nameTree.search(nameTree.root, s.name);

    if (existing === null) {
        nameTree.insert(s.name, [i]); // tạo mới
    } else {
        existing.push(i); // thêm vào list
    }
});
/* API */

// get all
app.get("/students", (req, res) => {
    res.json(database);
});

// add
app.post("/add", (req, res) => {
    const { id, name, gender } = req.body;

    if (database.find(s => s.id === id)) {
        return res.json({ message: "ID tồn tại!" });
    }

    database.push({ id, name, gender });

    // ID index
    idTree.insert(id, database.length - 1);

    // NAME index
    let existing = nameTree.search(nameTree.root, name);

    if (existing === null) {
        nameTree.insert(name, [database.length - 1]);
    } else {
        existing.push(database.length - 1);
    }

    fs.writeFileSync("students.json", JSON.stringify(database, null, 2));

    res.json({ message: "Added" });
});

// SEARCH (theo id hoặc name)
app.get("/search", (req, res) => {
    const { keyword } = req.query;

    // 🔴 Nếu không nhập gì
    if (!keyword) {
        return res.json({
            result: [],
            highlightKeys: [],
            message: "Vui lòng nhập từ khóa"
        });
    }

    // 🔍 1. Tìm theo ID (B-Tree)
    let idIndex = idTree.search(idTree.root, keyword);

    if (idIndex !== null) {
        return res.json({
            result: [database[idIndex]],
            highlightKeys: [keyword],
            message: ""
        });
    }

    // 🔍 2. Tìm theo NAME (B-Tree)
    let nameIndexes = nameTree.search(nameTree.root, keyword);

    if (nameIndexes !== null) {
        let result = nameIndexes.map(i => database[i]);

        let ids = result.map(s => s.id);

        return res.json({
            result: result,
            highlightKeys: ids,
            message: ""
        });
    }

    // 🔴 KHÔNG TÌM THẤY
    return res.json({
        result: [],
        highlightKeys: [],
        message: "Sinh viên không tồn tại"
    });
});


// delete
app.delete("/delete/:id", (req, res) => {
    let id = req.params.id;

    let index = database.findIndex(s => s.id === id);

    if (index === -1) return res.json({ message: "Not found" });

    database.splice(index, 1);

    // rebuild tree
    database.splice(index, 1);

    // rebuild
    idTree = new BTree();
    nameTree = new BTree();

    database.forEach((s, i) => {
        idTree.insert(s.id, i);

        let existing = nameTree.search(nameTree.root, s.name);

        if (existing === null) {
            nameTree.insert(s.name, [i]);
        } else {
            existing.push(i);
        }
    });

    fs.writeFileSync("students.json", JSON.stringify(database, null, 2));

    res.json({ message: "Deleted" });
});

// get btree
app.get("/btree", (req, res) => {
    res.json(idTree.toJSON()); 
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});