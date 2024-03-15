// Global variables
let originalData = [];

// DOM elements
const todoTable = document.getElementById('todo-table');
const addTodoBtn = document.querySelector("#add_todo_btn");
const registerButton = document.getElementById('registerButton');
const registerModal = document.getElementById('registerModal');
const usernameInput = document.getElementById('nicknameInput');
const clearFilterBtn = document.querySelector("#clear_filter");
const todoInput = document.getElementById('todo');

// Event listeners
if (addTodoBtn) addTodoBtn.addEventListener("click", createNewTodo);
if (todoInput) todoInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default form submission behavior
    createNewTodo(); /* Call function to submit the data*/}});
if (registerButton) registerButton.addEventListener('click', showRegisterModal);
if (registerModal) registerModal.addEventListener('submit', registerUser);
if (usernameInput) usernameInput.addEventListener('input', checkUsernameAvailability);
if (clearFilterBtn) clearFilterBtn.addEventListener("click", clearFilter);

// Populate table with initial data
document.addEventListener('DOMContentLoaded', function() {
    try {
        const initialDataElement = document.getElementById('initialData');
        const initialData = JSON.parse(initialDataElement.dataset.initialData);
        populateTable(initialData);
    } catch {
        console.log('No initial data found.');
    }
});

// Functions
function populateTable(data) {
    const tbody = todoTable.querySelector('tbody');
    tbody.innerHTML = '';
    data.forEach(item => {
        const row = tbody.insertRow();
        populateRow(row, item);
    });
}

function populateRow(row, item) {
    /*row.insertCell(0).innerText = item._id; // ID  */
    row.insertCell(0).innerText = item.todo_text; // Task
    row.insertCell(1).innerText = new Date(item.created).toLocaleString(); // Created

    // Check if the 'done' field is false or not present
    if (item.done === false || item.done === undefined) {
        // If 'done' is false or not present, insert a cell for the "Mark as done" button
        const doneCell = row.insertCell(2);
        const doneButton = document.createElement('button');
        doneButton.innerText = 'Mark as done';
        doneButton.addEventListener('click', () => markTaskAsDone(item._id));
        doneCell.appendChild(doneButton);
    } else {
        // If 'done' is true, insert a cell for the "Done" status
        row.insertCell(2).innerText = new Date(item.done).toLocaleString()
    }


    addDeleteButton(row, item._id);
    addTagsCell(row, item.tags);
    addTagsInputAndButton(row, item._id);
}


function addDeleteButton(row, taskId) {
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete entry';
    deleteButton.addEventListener('click', () => deleteTask(taskId));
    row.insertCell(3).appendChild(deleteButton);
}

function addTagsCell(row, tags) {
    const tagsCell = row.insertCell(4);
    if (tags && tags.length > 0) {
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.textContent = tag; // No need to trim or split
            tagElement.classList.add('tag');
            // Add event listener to each tag element
            tagElement.addEventListener('click', () => fetchTodosByTag(tag));
            tagsCell.appendChild(tagElement);
        });
    }
}

function addTagsInputAndButton(row, taskId) {
    const tagsInputField = document.createElement('input');
    tagsInputField.id = 'tagsInputField' + taskId;
    row.insertCell(5).appendChild(tagsInputField);

    const addTagsButton = document.createElement('button');
    addTagsButton.innerText = 'Add tag';
    addTagsButton.addEventListener('click', () => addTagsToTodo(tagsInputField.value, taskId));
    row.insertCell(6).appendChild(addTagsButton);

    tagsInputField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default form submission behavior
            addTagsToTodo(tagsInputField.value, taskId); /* Call function to submit the data*/}});    

    const clearTagsButton = document.createElement('button');
    clearTagsButton.innerText = 'Clear tags';
    clearTagsButton.addEventListener('click', () => clearTagsFromTodo(taskId));
    row.insertCell(7).appendChild(clearTagsButton);
}

async function createNewTodo() {
    const todoText = todoInput.value;
    if (!todoText) {
        alert('Please type a non-empty string');
        return;
    }
    const data = { todo: todoText };
    try {
        const res = await fetch("/add_todo", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify(data)
        });
        const jsonResult = await res.json();
        originalData = jsonResult;
        populateTable(jsonResult);
        todoInput.value = '';
    } catch (error) {
        console.log(error);
    }
}

async function deleteTask(taskId) {
    const data = { id: taskId };
    try {
        const res = await fetch("/delete_todo", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify(data)
        });
        const jsonResult = await res.json();
        originalData = jsonResult;
        populateTable(jsonResult);
    } catch (error) {
        console.log(error);
    }
}

async function markTaskAsDone(taskId) {
    const data = { id: taskId };
    try {
        const res = await fetch("/markdone", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify(data)
        });
        const jsonResult = await res.json();
        originalData = jsonResult;
        populateTable(jsonResult);
    } catch (error) {
        console.log(error);
    }
}

async function registerUser(event) {
    event.preventDefault();
    const registerFormData = new FormData(event.target);
    const data = Object.fromEntries(registerFormData.entries());
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const responseData = await response.json();
        if (responseData.success) {
            alert('User registration successful');
        } else {
            alert('Registration failed: ' + responseData.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration.');
    }
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

function checkUsernameAvailability() {
    const nickname = this.value;
    if (nickname && nickname.length > 2) {
        fetch('/check-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname: nickname }),
        })
        .then(response => response.json())
        .then(data => {
            const feedbackElement = document.getElementById('username-feedback');
            feedbackElement.textContent = data.available ? 'Username is available' : 'Username is taken';
            feedbackElement.style.color = data.available ? 'green' : 'red';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while checking username availability.');
        });
    }
}

async function addTagsToTodo(tagsText, taskId) {
    const tags = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    if (tags.length === 0) {
        alert('Please enter at least one valid tag, or several, separated by commas.');
        return;
    }
    const data = { id: taskId, tags_string: tags.join(', ') };
    try {
        const res = await fetch("/addtag", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify(data),
        });
        const jsonResult = await res.json();
        originalData = jsonResult;
        populateTable(jsonResult);
    } catch (error) {
        console.log(error);
    }
}

async function clearTagsFromTodo(taskId) {
    const data = { id: taskId };
    try {
        const res = await fetch("/cleartags", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify(data),
        });
        const jsonResult = await res.json();
        originalData = jsonResult;
        populateTable(jsonResult);
    } catch (error) {
        console.log(error);
    }
}

async function fetchTodosByTag(tag) {
    try {
        const response = await fetch(`/tags/${encodeURIComponent(tag.trim())}`);
        const data = await response.json();
        populateTable(data);
    } catch (error) {
        console.error('Error fetching filtered todos:', error);
    }
}

function clearFilter() {
    populateTable(originalData);
}
