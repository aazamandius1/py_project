document.addEventListener('DOMContentLoaded', function() {
    //on page load read the data, saved in div element, parse it and populate table
    const initialDataElement = document.getElementById('initialData');
    const initialData = JSON.parse(initialDataElement.dataset.initialData);
    populateTable(initialData);  
    // Function to populate the table
    function populateTable(data) {
        const table = document.getElementById('todo-table');
        table.querySelector('tbody').innerHTML = '';
        data.forEach(item => {
            const row = table.insertRow();
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
        });
    }

    // function that submits new todo and reload the table with new todos data
    const fetchAddToDoBtn = document.querySelector("#add_todo_btn");
    async function create_new_todo() {
      const todo_text = document.getElementById('todo').value;
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
        populateTable(todos_table_data);
      } catch (error) {
        console.log(error);
      }
    }

    // add event listener for #fetchAddToDoBtn button
    fetchAddToDoBtn.addEventListener("click", create_new_todo);

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
        populateTable(jsonResult); // Re-populate the table with the updated data
    } catch (error) {
            console.log(error);
        }
    }

  

});