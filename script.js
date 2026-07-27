
// Ruajtja dhe ngarkimi i detyrave
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Shfaq datën e sotme
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('sq-AL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// Ruaj detyrat në localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Shto detyrë të re
document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const task = {
        id: Date.now(),
        title: document.getElementById('taskTitle').value,
        person: document.getElementById('taskPerson').value,
        deadline: document.getElementById('taskDeadline').value,
        priority: document.getElementById('taskPriority').value,
        status: document.getElementById('taskStatus').value,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    this.reset();
    updateDashboard();
});

// Përditëso statusin e detyrës
function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;
        saveTasks();
        updateDashboard();
    }
}

// Fshi detyrën
function deleteTask(taskId) {
    if (confirm('Jeni të sigurt që doni të fshini këtë detyrë?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        updateDashboard();
    }
}

// Kontrollo nëse detyra është e vonuar
function isLate(deadline, status) {
    if (status === 'perfunduar') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate < today;
}

// Merr tekstin e statusit
function getStatusText(status) {
    const statusMap = {
        'per te bere': '📋 Për të Bërë',
        'ne progres': '🚧 Në Progres',
        'ne rishikim': '👀 Në Rishikim',
        'bllokuar': '🟣 Bllokuar',
        'perfunduar': '✅ Përfunduar'
    };
    return statusMap[status] || status;
}

// Merr tekstin e prioritetit
function getPriorityText(priority) {
    const priorityMap = {
        'kritik': '🔴 Kritik',
        'larte': '🟠 I Lartë',
        'mesatar': '🟡 Mesatar',
        'ulet': '🟢 I Ulët'
    };
    return priorityMap[priority] || priority;
}

// Përditëso statistikat dhe listën
function updateDashboard(filter = 'te gjitha') {
    let filteredTasks = tasks;
    
    if (filter === 'vonuara') {
        filteredTasks = tasks.filter(t => isLate(t.deadline, t.status));
    } else if (filter !== 'te gjitha') {
        filteredTasks = tasks.filter(t => t.status === filter);
    }
    
    // Përditëso statistikat
    document.getElementById('totalTasks').textContent = tasks.length;
    document.getElementById('inProgressTasks').textContent = tasks.filter(t => t.status === 'ne progres').length;
    document.getElementById('doneTasks').textContent = tasks.filter(t => t.status === 'perfunduar').length;
    document.getElementById('lateTasks').textContent = tasks.filter(t => isLate(t.deadline, t.status)).length;
    
    // Përditëso listën
    const tasksList = document.getElementById('tasksList');
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<div class="empty-state"><p>📭 Nuk ka detyra për të shfaqur.</p></div>';
        return;
    }
    
    tasksList.innerHTML = filteredTasks.map(task => {
        const late = isLate(task.deadline, task.status);
        let cardClass = task.priority;
        if (task.status === 'bllokuar') cardClass = 'bllokuar';
        if (task.status === 'perfunduar') cardClass = 'perfunduar';
        if (late) cardClass += ' vonuar';
        
        return `
            <div class="task-card ${cardClass}">
                <div class="task-info">
                    <h4>${task.title}</h4>
                    <p>👤 ${task.person} | ${getPriorityText(task.priority)}</p>
                    <p class="deadline ${late ? 'vonuar' : ''}">
                        📅 ${new Date(task.deadline).toLocaleDateString('sq-AL')}
                        ${late ? ' ⚠️ E VONUAR' : ''}
                    </p>
                </div>
                <div class="task-actions">
                    <select onchange="updateTaskStatus(${task.id}, this.value)">
                        <option value="per te bere" ${task.status === 'per te bere' ? 'selected' : ''}>📋 Për të Bërë</option>
                        <option value="ne progres" ${task.status === 'ne progres' ? 'selected' : ''}>🚧 Në Progres</option>
                        <option value="ne rishikim" ${task.status === 'ne rishikim' ? 'selected' : ''}>👀 Në Rishikim</option>
                        <option value="bllokuar" ${task.status === 'bllokuar' ? 'selected' : ''}>🟣 Bllokuar</option>
                        <option value="perfunduar" ${task.status === 'perfunduar' ? 'selected' : ''}>✅ Përfunduar</option>
                    </select>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

// Filtra
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        updateDashboard(this.dataset.filter);
    });
});

