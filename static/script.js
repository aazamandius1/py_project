let originalData = []; // Store the original data here
document.addEventListener('DOMContentLoaded', function() {
    try {
    //on page load read the data, saved in div element, parse it and populate table 
    const initialDataElement = document.getElementById('initialData');
    const initialData = JSON.parse(initialDataElement.dataset.initialData);
    populateTable(initialData);  
    } catch { console.log('this is fine, go on');}

    // Function to populate the table
    function populateTable(data) {
        const table = document.getElementById('todo-table');
        const tbody = table.querySelector('tbody')
        tbody.innerHTML='';

        data.forEach(item => {
            const row = tbody.insertRow();
            row.insertCell(0).innerText = item[0]; // ID
            row.insertCell(1).innerText = item[1]; // Task
            row.insertCell(2).innerText = item[2]; // Created
            row.insertCell(3).innerText = item[3]; // Done 
            if (!item[3]) { // Assuming item[3] is the "Done" column
                const doneButton = document.createElement('button');
                doneButton.innerText = 'Mark as done';
                doneButton.addEventListener('click', function() {
                    markTaskAsDone(item[0]); // Assuming item[0] is the task ID
                });
                row.insertCell(3).appendChild(doneButton);
            }
            // Delete button row
            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Delete entry';
            deleteButton.addEventListener('click', function() {
                deleteTask(item[0]); // Assuming item[0] is the task ID
            });
            row.insertCell(4).appendChild(deleteButton);

        // Tags cell
        const tagsCell = row.insertCell(5);
        if (item[4] && item[4].trim() !== '') { // Assuming item[4] is the "tags" column in db`s returned data
            const tags = item[4].split(','); 

            tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.textContent = tag.trim(); //
                tagElement.classList.add('tag');     // Add a class for styling
                tagElement.addEventListener('click', () => {
                    filterTasks(tag.trim());         // Implement a function to filter tasks by tag
                });
                tagsCell.appendChild(tagElement);
            });
        }    
    
        // Adding tags input and button to the table
        const addTagsButton = document.createElement('button');
        const tagsInputField = document.createElement('input');
        tagsInputField.id = 'tagsInputField' + item[0];
        row.insertCell(6).appendChild(tagsInputField);
        row.insertCell(7).appendChild(addTagsButton);
        addTagsButton.innerText = 'Add tags';
        addTagsButton.addEventListener('click', function() {
            const tags_text = document.getElementById('tagsInputField' + item[0]).value;
            addTagsToTodo(tags_text, item[0]); // Assuming item[0] is the task ID
        });
                
        });
    }

    // function that submits new todo and reload the table with new todos data
    const fetchAddToDoBtn = document.querySelector("#add_todo_btn");
    async function create_new_todo() {
      const todo_text = document.getElementById('todo').value;
      if (todo_text.length === 0) {
        alert('Please type non empty string');
        return; // Exit the function if no valid tags
    }      
      const data = {todo: todo_text}
      try {
        const res = await fetch("/add_todo", {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json;charset=utf-8'},
                                body: JSON.stringify(data)
                                });
        const jsonResult = await res.json();
        const todos_table_data = jsonResult;
        document.getElementById('todo').value=''
        originalData = todos_table_data;
        populateTable(todos_table_data);
      } catch (error) {
        console.log(error);
      }
    }
    try {
        // add event listener for #fetchAddToDoBtn button
        fetchAddToDoBtn.addEventListener("click", create_new_todo);

        // add event listener for #clear_filter button
        const clearFilterBtn = document.querySelector("#clear_filter");
        clearFilterBtn.addEventListener("click", function () {
            populateTable(originalData);
        });

    } catch(error) {console.log(error)}
    // Function to add tags to task
    async function addTagsToTodo(tags_text, taskId) {
    //validate tags input 
        const tags = tags_text.split(',').map(tag=>tag.trim());
        const uniqueTags = tags.filter((tag, index, self) =>
            tag.length > 0 && index === self.findIndex((t) => (
                t.toLowerCase() === tag.toLowerCase()
            ))
        );

        if (uniqueTags.length === 0) {
            alert('Please enter at least one valid tag, or several, separated by comas.');
            return; // Exit the function if no valid tags
        }

        const validatedTagsString = uniqueTags.join(', ');
    
    
    const data = {id: taskId,
                  tags_string: validatedTagsString };
    try {
        const res = await fetch("/addtags", {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: JSON.stringify(data)
        });
        const jsonResult = await res.json();
        originalData = jsonResult;
        populateTable(jsonResult); // Re-populate the table with the updated data
    } catch (error) {
            console.log(error);
        }
    }
    // Function to mark a task as done
    async function markTaskAsDone(taskId) {
    const data = {id: taskId};
    try {
        const res = await fetch("/markdone", {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: JSON.stringify(data)
        });
        const jsonResult = await res.json();
        originalData = jsonResult;
        populateTable(jsonResult); // Re-populate the table with the updated data
    } catch (error) {
            console.log(error);
        }
    }
    //function to delete todo entry
    async function deleteTask(taskId) {
        const data = {id: taskId};
        try {
            const res = await fetch("/delete_todo", {
                method: 'POST',
                headers: {'Content-Type': 'application/json;charset=utf-8'},
                body: JSON.stringify(data)
            });
            const jsonResult = await res.json();
            originalData = jsonResult;
            populateTable(jsonResult); // Re-populate the table with the updated data
        } catch (error) {
                console.log(error);
            }
        }


    function filterTasks(tag) {
        if (!tag) return;
        // Filter the original data based on the selected tag
        const filteredData = originalData.filter(item => {
            // Assuming item[4] contains the tags as a comma-separated string
            if (!item[4] || item[4].trim() === '') {    // Handle items without tags
                return false; // Include items without tags in the filtered data
            }
            const tags = item[4].split(',');
            return tags.includes(tag);
        });

        // Repopulate the table with the filtered data
        populateTable(filteredData);
    }

    //Implementing Search
    try {
        const searchButton = document.querySelector("#searchButton");
        searchButton.addEventListener("click", searchTasks);
    } catch(error) {console.log(error)}
    function searchTasks() {
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
        if (searchQuery.length === 0) {
            alert('Please enter keyword or phrase to search');
            return; // Exit the function if no valid tags
        }
        const filteredData =originalData.filter(item => {
            return item[1].toLowerCase().includes(searchQuery)
        });
        document.getElementById('searchInput').value = ''; 
        populateTable(filteredData)
    }

    //register button event listener to show register modal 
    try {
        document.getElementById('registerButton').addEventListener('click', function() {
            document.getElementById('registerModal').style.display = 'block';
        });
        // Add a close button to the modal
        document.getElementById('registerModal').addEventListener('click', function(event) {
            if (event.target === this) {
                this.style.display = 'none';
            }
        }); } 
    catch(error) {console.log(error)}


    //function to fetch registration data to backend and get results
    document.getElementById('registerModal').addEventListener('submit', async function(event) {
        
        event.preventDefault(); // Prevent the default form submission
    
        const registerFormData = new FormData(event.target); // Get form data
        const data = Object.fromEntries(registerFormData.entries()); // Convert form data to an object
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const responseData = await response.json();
    
            if (responseData.success) {
                // Registration was successful, redirect or show a success message
                alert('user registration succsessful')
            } else {
                // Show an error message
                alert('Registration failed: ' + responseData.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration.');
        }
    });

    //adding check 4 username avaliabilyty 
    document.getElementById('nickname').addEventListener('input', function() {
        const nickname = this.value;
        if (nickname.length > 2) { // Check if the nickname is at least 3 characters long
            fetch('/check-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nickname: nickname }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.available) {
                    // The username is available
                    document.getElementById('username-feedback').textContent = 'Username is available';
                    document.getElementById('username-feedback').style.color = 'green';
                } else {
                    // The username is taken
                    document.getElementById('username-feedback').textContent = 'Username is taken';
                    document.getElementById('username-feedback').style.color = 'red';
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred while checking username availability.');
            });
        }
    });
});