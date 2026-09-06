async function loadStudents() {

    const response = await fetch("/api/students");

    const students = await response.json();

    const table = document.getElementById("studentTable");

    table.innerHTML = "";

    students.forEach(student => {

        const row = table.insertRow();

        row.innerHTML = `
            <td>${student.roll_no}</td>
            <td>${student.name}</td>
            <td>${student.course}</td>
            <td>
                <button onclick="deleteStudent(${student.id})">
                    Delete
                </button>
            </td>
        `;
    });
}


async function addStudent() {

    const name = document.getElementById("studentName").value.trim();
    const rollNo = document.getElementById("rollNo").value.trim();
    const course = document.getElementById("course").value.trim();

    if (!name || !rollNo || !course) {

        alert("Please fill all fields.");

        return;
    }

    const response = await fetch("/api/students", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name: name,
            rollNo: rollNo,
            course: course
        })
    });

    if (!response.ok) {

        alert("Could not add student.");

        return;
    }

    document.getElementById("studentName").value = "";
    document.getElementById("rollNo").value = "";
    document.getElementById("course").value = "";

    loadStudents();
}


async function deleteStudent(id) {

    const response = await fetch(`/api/students/${id}`, {

        method: "DELETE"
    });

    if (response.ok) {

        loadStudents();

    } else {

        alert("Could not delete student.");
    }
}


// Load students when page opens
loadStudents();