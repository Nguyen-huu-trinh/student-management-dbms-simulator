async function add() {
    let id = document.getElementById("id").value;
    let name = document.getElementById("name").value;
    let gender = document.getElementById("gender").value;

    await fetch("/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, gender })
    });

    load();
}

async function search() {
    let id = document.getElementById("searchId").value;

    let res = await fetch("/search/" + id);
    let data = await res.json();

    alert(JSON.stringify(data));
}

async function load() {
    let res = await fetch("/students");
    let data = await res.json();

    let list = document.getElementById("list");
    list.innerHTML = "";

   data.forEach(s => {
    list.innerHTML += `
    <li>
        ${s.id} - ${s.name}
        <button onclick="deleteStudent('${s.id}')">❌ Xóa</button>
    </li>`;
});
}

async function deleteStudent(id) {
    await fetch("/delete/" + id, {
        method: "DELETE"
    });

    load(); // reload lại danh sách
}

async function load() {
    let t = await fetch("/btree");
    this.tree = await t.json();

    console.log(this.tree); // 🔥 xem dữ liệu
}
load();