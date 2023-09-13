document.addEventListener("DOMContentLoaded", function () {
    const todoList = document.getElementById("todoList");
    const addTodoButton = document.getElementById("addTodo");
    const sortByDateButton = document.getElementById("sortByDate");
    const filterCategorySelect = document.getElementById("filterCategory");
    const searchInput = document.getElementById("search");
    const voiceSearchButton = document.getElementById("voiceSearch");
    let editingTodo = null;

    // Load tasks from local storage on page load
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

            savedTasks.forEach(task => {
                if (task.dueDate !== null) {
                    addTaskToList(task);
                } else {
                    // Check if the task is a daily reminder
                    if (task.dailyReminder) {
                        alert(`Daily Reminder: ${task.task}`);
                    }
                }
            });

    addTodoButton.addEventListener("click", addTodo);
    sortByDateButton.addEventListener("click", sortTodosByDate);
    filterCategorySelect.addEventListener("change", filterByCategory);
    searchInput.addEventListener("input", searchTodos);
    voiceSearchButton.addEventListener("click", startVoiceRecognition);

    function startVoiceRecognition() {
                        const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
                        recognition.lang = "en-US";
                        recognition.start();
                        recognition.onresult = function (event) {
                            const voiceResult = event.results[0][0].transcript;
                            searchInput.value = voiceResult;
                            searchTodos();
                        };
                    }

                    function addTodo() {
                        const taskInput = document.getElementById("task");
                        const categoryInput = document.getElementById("category");
                        const dueDateInput = document.getElementById("dueDate");
                    
                        const task = taskInput.value.trim();
                        const category = categoryInput.value;
                        const dueDate = dueDateInput.value;
                    
                        if (task === "") {
                            alert("Please enter a valid task.");
                            return;
                        }
                    
                        if (!isValidDate(dueDate)) {
                            alert("Please enter a valid due date in the format YYYY-MM-DD.");
                            return;
                        }
                    
                        const dueDateObj = new Date(dueDate);
                        const currentDate = new Date();
                    
                        if (dueDateObj < currentDate) {
                            alert("Due date should be in the future.");
                            return;
                        }
                    
                        const newTask = {
                            task: task,
                            category: category,
                            dueDate: dueDate
                        };
                    
                        addTaskToList(newTask);
                        saveTaskToLocalStorage(newTask);
                    
                        taskInput.value = "";
                        categoryInput.value = "business";
                        dueDateInput.value = "";
                    }
                    

    function addTaskToList(task) {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${task.task}</span>
            <span>${task.dueDate}</span>
            <span class="category">${task.category}</span>
            <button class="complete-button">Complete</button>
            <button class="edit-button">Edit</button>
            <button class="delete-button">Delete</button>
        `;

        todoList.appendChild(li);
    }

    function saveTaskToLocalStorage(task) {
        const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        savedTasks.push(task);
        localStorage.setItem("tasks", JSON.stringify(savedTasks));
    }

    function sortTodosByDate() {
        const todos = Array.from(todoList.children);
        todos.sort((a, b) => {
            const dateA = new Date(a.children[1].textContent);
            const dateB = new Date(b.children[1].textContent);
            return dateA - dateB;
        });
        todos.forEach(todo => todoList.appendChild(todo));
    }

    function filterByCategory() {
        const selectedCategory = filterCategorySelect.value;
        const todos = Array.from(todoList.children);
        todos.forEach(todo => {
            const category = todo.querySelector(".category").textContent;
            const completed = todo.style.backgroundColor === "rgb(195, 230, 203)";
            const categoryMatch = selectedCategory === "all" || category === selectedCategory;
            const completedMatch = selectedCategory === "completed" && completed;
            const nonCompletedMatch = selectedCategory === "noncompleted" && !completed;
            if (categoryMatch || completedMatch || nonCompletedMatch) {
                todo.style.display = "flex";
            } else {
                todo.style.display = "none";
            }
        });
    }

    function searchTodos() {
        const searchTerm = searchInput.value.toLowerCase();
        Array.from(todoList.children).forEach(todo => {
            const task = todo.children[0].textContent.toLowerCase();
            if (task.startsWith(searchTerm)) {
                todo.style.display = "flex";
            } else {
                todo.style.display = "none";
            }
        });
    }

    todoList.addEventListener("click", function (e) {
        const target = e.target;
        const todo = target.parentElement;
        if (target.classList.contains("delete-button")) {
            todo.remove();
            removeTaskFromLocalStorage(todo);
        } else if (target.classList.contains("complete-button")) {
            todo.style.backgroundColor = "#c3e6cb";
            updateTaskInLocalStorage(todo, { completed: true });
        } else if (target.classList.contains("edit-button")) {
            const taskInput = document.getElementById("task");
            const dueDateInput = document.getElementById("dueDate");
            const categoryInput = document.getElementById("category");
            editingTodo = todo;
            taskInput.value = todo.children[0].textContent;
            dueDateInput.value = todo.children[1].textContent;
            categoryInput.value = todo.children[2].textContent;
            addTodoButton.innerText = "Save";
        }
    });

    addTodoButton.addEventListener("click", function () {
        const taskInput = document.getElementById("task");
        const categoryInput = document.getElementById("category");
        const dueDateInput = document.getElementById("dueDate");
        if (editingTodo) {
            editingTodo.children[0].textContent = taskInput.value;
            editingTodo.children[1].textContent = dueDateInput.value;
            editingTodo.children[2].textContent = categoryInput.value;
            addTodoButton.innerText = "Add Task";
            updateTaskInLocalStorage(editingTodo, {
                task: taskInput.value,
                dueDate: dueDateInput.value,
                category: categoryInput.value
            });
            editingTodo = null;

            taskInput.value = "";
            dueDateInput.value = "";
            categoryInput.value = "business";
        }
    });

    function removeTaskFromLocalStorage(todo) {
        const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const taskIndex = savedTasks.findIndex(task => {
            return (
                task.task === todo.children[0].textContent &&
                task.dueDate === todo.children[1].textContent &&
                task.category === todo.children[2].textContent
            );
        });
        if (taskIndex !== -1) {
            savedTasks.splice(taskIndex, 1);
            localStorage.setItem("tasks", JSON.stringify(savedTasks));
        }
    }

    function updateTaskInLocalStorage(todo, updatedTask) {
        const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const taskIndex = savedTasks.findIndex(task => {
            return (
                task.task === todo.children[0].textContent &&
                task.dueDate === todo.children[1].textContent &&
                task.category === todo.children[2].textContent
            );
        });
        if (taskIndex !== -1) {
            savedTasks[taskIndex] = { ...savedTasks[taskIndex], ...updatedTask };
            localStorage.setItem("tasks", JSON.stringify(savedTasks));
        }
    }
});

function isValidDate(dateString) {
    const regexDate = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexDate.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

function updateClock() {
    const clockElement = document.getElementById("clock");
    const now = new Date();
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short"
    };
    const formattedTime = now.toLocaleDateString(undefined, options);
    clockElement.textContent = formattedTime;
}
updateClock();
setInterval(updateClock, 1000);