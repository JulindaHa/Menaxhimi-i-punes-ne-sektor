// ===============================
// Paneli i Gjurmimit të Detyrave
// ===============================


// Ngarko detyrat nga memoria
let tasks = [];

try {

    tasks = JSON.parse(localStorage.getItem("tasks")) || [];

} catch (error) {

    tasks = [];

    localStorage.removeItem("tasks");

}



// Shfaq datën aktuale
const currentDate = document.getElementById("currentDate");


if (currentDate) {

    currentDate.textContent = new Date().toLocaleDateString("sq-AL", {

        weekday: "long",

        year: "numeric",

        month: "long",

        day: "numeric"

    });

}



// Ruaj detyrat
function saveTasks() {

    localStorage.setItem("tasks", JSON.stringify(tasks));

}



// Shto detyrë të re
const taskForm = document.getElementById("taskForm");


if (taskForm) {


    taskForm.addEventListener("submit", function(e) {


        e.preventDefault();



        const specialistSelect = document.getElementById("taskPerson");


        const selectedSpecialist = 
            specialistSelect.options[specialistSelect.selectedIndex];



        const task = {


            id: Date.now(),


            title: document
                .getElementById("taskTitle")
                .value
                .trim(),



            person: selectedSpecialist.value,


            email: selectedSpecialist.dataset.email || "",



            deadline: document
                .getElementById("taskDeadline")
                .value,



            priority: document
                .getElementById("taskPriority")
                .value,



            status: document
                .getElementById("taskStatus")
                .value,



            createdAt: new Date().toISOString()


        };



        tasks.push(task);


        saveTasks();



        alert(

`✅ Detyra u krijua me sukses!

👤 Specialist:
${task.person}

📧 Email:
${task.email}`

        );



        this.reset();


        updateDashboard();


    });


}



// Ndrysho statusin
function updateTaskStatus(id, status) {


    const task = tasks.find(t => t.id === id);



    if (task) {


        task.status = status;


        saveTasks();


        updateDashboard();


    }


}




// Fshi detyrë
function deleteTask(id) {


    if (confirm("Jeni të sigurt që doni të fshini këtë detyrë?")) {


        tasks = tasks.filter(task => task.id !== id);


        saveTasks();


        updateDashboard();


    }


}



// Kontrollo vonesën
function isLate(deadline, status) {


    if (!deadline || status === "perfunduar") {


        return false;


    }



    const today = new Date();


    today.setHours(0,0,0,0);



    const deadlineDate = new Date(deadline);


    deadlineDate.setHours(0,0,0,0);



    return deadlineDate < today;


}




// Teksti i statusit
function getStatusText(status) {


    const statuses = {


        "per te bere": "📋 Për të Bërë",


        "ne progres": "🚧 Në Progres",


        "ne rishikim": "👀 Në Rishikim",


        "bllokuar": "🟣 Bllokuar",


        "perfunduar": "✅ Përfunduar"


    };


    return statuses[status] || status;


}




// Teksti i prioritetit
function getPriorityText(priority) {


    const priorities = {


        "kritik": "🔴 Kritik",


        "larte": "🟠 I Lartë",


        "mesatar": "🟡 Mesatar",


        "ulet": "🟢 I Ulët"


    };


    return priorities[priority] || priority;


}




// Siguria për tekstet
function escapeHTML(text) {


    return String(text || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");


}





// Përditëso panelin
function updateDashboard(filter = "te gjitha") {


    let filteredTasks = tasks;



    if (filter === "vonuara") {


        filteredTasks = tasks.filter(task =>

            isLate(task.deadline, task.status)

        );


    } else if (filter !== "te gjitha") {


        filteredTasks = tasks.filter(task =>

            task.status === filter

        );


    }




    document.getElementById("totalTasks").textContent = tasks.length;



    document.getElementById("inProgressTasks").textContent =

        tasks.filter(t => t.status === "ne progres").length;



    document.getElementById("doneTasks").textContent =

        tasks.filter(t => t.status === "perfunduar").length;



    document.getElementById("lateTasks").textContent =

        tasks.filter(t => isLate(t.deadline, t.status)).length;




    const tasksList = document.getElementById("tasksList");



    if (!tasksList) return;



    if (filteredTasks.length === 0) {


        tasksList.innerHTML = `

            <div class="empty-state">

                <p>📭 Nuk ka detyra për të shfaqur.</p>

            </div>

        `;


        return;


    }




    tasksList.innerHTML = filteredTasks.map(task => {


        const late = isLate(task.deadline, task.status);



        let cardClass = task.priority;



        if (task.status === "bllokuar")

            cardClass = "bllokuar";



        if (task.status === "perfunduar")

            cardClass = "perfunduar";



        if (late)

            cardClass += " vonuar";




        return `


        <div class="task-card ${cardClass}">


            <div class="task-info">


                <h4>${escapeHTML(task.title)}</h4>


                <p>
                👤 ${escapeHTML(task.person)}
                |
                ${getPriorityText(task.priority)}
                </p>


                <p>
                📧 ${escapeHTML(task.email)}
                </p>


                <p class="deadline ${late ? "vonuar" : ""}">

                    📅 ${new Date(task.deadline)
                    .toLocaleDateString("sq-AL")}

                    ${late ? " ⚠️ E VONUAR" : ""}

                </p>


            </div>




            <div class="task-actions">


                <select onchange="updateTaskStatus(${task.id}, this.value)">



                    <option value="per te bere" ${task.status==="per te bere"?"selected":""}>
                    📋 Për të Bërë
                    </option>



                    <option value="ne progres" ${task.status==="ne progres"?"selected":""}>
                    🚧 Në Progres
                    </option>



                    <option value="ne rishikim" ${task.status==="ne rishikim"?"selected":""}>
                    👀 Në Rishikim
                    </option>



                    <option value="bllokuar" ${task.status==="bllokuar"?"selected":""}>
                    🟣 Bllokuar
                    </option>



                    <option value="perfunduar" ${task.status==="perfunduar"?"selected":""}>
                    ✅ Përfunduar
                    </option>



                </select>



                <button class="delete-btn" onclick="deleteTask(${task.id})">

                    🗑️

                </button>


            </div>


        </div>


        `;


    }).join("");

}





// Filtrat
document.querySelectorAll(".filter-btn").forEach(button => {


    button.addEventListener("click", function() {



        document.querySelectorAll(".filter-btn")

        .forEach(btn => btn.classList.remove("active"));



        this.classList.add("active");



        updateDashboard(this.dataset.filter);



    });


});




// Nisja fillestare
updateDashboard();




// Lejo përdorimin nga HTML
window.updateTaskStatus = updateTaskStatus;

window.deleteTask = deleteTask;
