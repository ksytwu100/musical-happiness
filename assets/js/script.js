// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
  const timestamp = new Date().getTime();
  const randomNum = Math.floor(Math.random() * 1000); // Adjust the range as needed
  return `${timestamp}-${randomNum}`;
}
// Todo: create a function to create a task card
function createTaskCard(task, status) {
  const taskCard = document.createElement("div");
  taskCard.classList.add("task-card");
  taskCard.classList.add(status);
  taskCard.style.zIndex = "9999";
  taskCard.id = task.id;
  const title = document.createElement("h3");
  title.textContent = task.title;
  const taskCardBody = document.createElement("div");
  taskCardBody.classList.add("task-body");

  const description = document.createElement("p");
  description.textContent = task.description;
  const dueDate = document.createElement("p");

  const btnDelete = document.createElement("button");
  btnDelete.name = "Delete";
  dueDate.textContent = dayjs(task.duedate).format("MM/DD/YYYY");
  btnDelete.textContent = "Delete";
  btnDelete.onclick = () => handleDeleteTask(task.id);
  btnDelete.classList.add("btn");
  btnDelete.classList.add("btn-danger");

  taskCardBody.appendChild(description);
  taskCardBody.appendChild(dueDate);
  taskCardBody.appendChild(btnDelete);

  //Get Today's Date.
  const todayFormatted = dayjs(new Date()).format("DD/MM/YYYY");
  const dueDateFormatted = dayjs(task.duedate).format("DD/MM/YYYY");

  if (dueDateFormatted < todayFormatted) {
    taskCardBody.classList.add("past-due");
  }

  if (dueDateFormatted === todayFormatted) {
    taskCardBody.classList.add("due-today");
  }

  if (status === "done") {
    taskCardBody.classList.remove("due-today");
    taskCardBody.classList.remove("past-due");
  }

  taskCard.appendChild(title);
  taskCard.appendChild(taskCardBody);

  return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  const taskListContainerToDo = document.getElementById("todo-cards");
  taskListContainerToDo.innerHTML = "";
  const taskListContainerDoing = document.getElementById("in-progress-cards");
  taskListContainerDoing.innerHTML = "";
  const taskListContainerDone = document.getElementById("done-cards");
  taskListContainerDone.innerHTML = "";

  // Loop through your task data and create HTML elements for each task
  let tasks = JSON.parse(localStorage.getItem("tasks"));
  tasks.todo.forEach((task) => {
    const taskCard = createTaskCard(task, "todo");
    taskListContainerToDo.appendChild(taskCard);
  });

  tasks.doing.forEach((task) => {
    const taskCard = createTaskCard(task, "doing");
    taskListContainerDoing.appendChild(taskCard);
  });

  tasks.done.forEach((task) => {
    const taskCard = createTaskCard(task, "done");
    taskListContainerDone.appendChild(taskCard);
  });

  $(function () {
    $(".task-card").draggable({ revert: "invalid" });
    $(".column").droppable({
      drop: function (event, ui) {
        console.log("event", event);
        console.log("ui", ui);
        console.log("ui classlist", ui.draggable[0].children[1].classList);

        const _cardid = ui.draggable[0].id;
        const _newstatus = event.target.children[0].id;
        let _oldstatus = "";
        console.log("classList", ui.draggable[0].classList);
        if (ui.draggable[0].classList.value.indexOf("todo") !== -1) {
          _oldstatus = "todo";
        } else if (ui.draggable[0].classList.value.indexOf("doing") !== -1) {
          _oldstatus = "doing";
        } else if (ui.draggable[0].classList.value.indexOf("done") !== -1) {
          _oldstatus = "done";
        }

        handleDrop(_cardid, _newstatus, _oldstatus);
        renderTaskList();
      }
    });
  });
}
// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault(); // Prevent form submission

  const taskTitle = document.getElementById("task-title").value;
  const taskDescription = document.getElementById("task-description").value;
  const taskDueDate = document.getElementById("task-due-date").value;
  // Add the new task to your tasks data structure
  // 1. Get localStorage
  let tasks = JSON.parse(localStorage.getItem("tasks"));
  // 2. Check for data
  if (tasks === null || tasks === undefined) {
    // 3a. if no data, create taskList note included [to do], [doing, and [done] array
    tasks = {
      todo: [],
      doing: [],
      done: []
    };
  }
  // 3b. Move on to #4
  // 4. put new task doing array
  if (nextId === null) {
    nextId = 1;
  }

  tasks.todo.push({
    id: nextId,
    title: taskTitle,
    duedate: taskDueDate,
    description: taskDescription
  });
  let newId = nextId++;

  localStorage.setItem("nextId", newId);
  // 5. Stringify the Task list
  let jsonData = JSON.stringify(tasks);
  // 6. Put it back to localStorage
  localStorage.setItem("tasks", jsonData);

  // 7. Clear the form 2024-9-10
  document.getElementById("task-title").value = "";
  document.getElementById("task-description").value = "";
  document.getElementById("task-due-date").value = "";

  // 8. Close the form
  document.getElementById("btnClose");
  btnClose.click();

  // 9. Rerender the task list.
  renderTaskList();
}
// Todo: create a function to handle deleting a task
function handleDeleteTask(taskId) {
  // 1. Get Tasks
  const taskList = JSON.parse(localStorage.getItem("tasks"));

  // 2. Filter out the deleted items
  const _todo = taskList.todo.filter((task) => task.id !== taskId);
  const _doing = taskList.doing.filter((task) => task.id !== taskId);
  const _done = taskList.done.filter((task) => task.id !== taskId);

  // 3. Put the new tasks list in a update variable
  const updatedTasks = {
    todo: _todo,
    doing: _doing,
    done: _done
  };

  // 4. Push to local storage
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  // 5. Rerender the page.
  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(taskId, newStatus, oldStatus) {
  // 1. Get existing task lists.
  let tasks = JSON.parse(localStorage.getItem("tasks"));

  // 2. Put existing task lists in the status variables.
  let _todo = tasks.todo;
  let _doing = tasks.doing;
  let _done = tasks.done;
  let _selectedtask;

  // 3. Find the existing task and remove it from the current status.
  switch (oldStatus) {
    case "todo":
      _selectedtask = tasks.todo.filter(
        (task) => task.id.toString() === taskId
      )[0];
      _todo = tasks.todo.filter((task) => task.id.toString() !== taskId);
      break;
    case "doing":
      _selectedtask = tasks.doing.filter(
        (task) => task.id.toString() === taskId
      )[0];
      _doing = tasks.doing.filter((task) => task.id.toString() !== taskId);
      break;
    case "done":
      _selectedtask = tasks.done.filter(
        (task) => task.id.toString() === taskId
      )[0];
      _done = tasks.done.filter((task) => task.id.toString() !== taskId);
      break;
  }

  // 4. Add the existing status to the new status.
  switch (newStatus) {
    case "todo-cards":
      _todo.push(_selectedtask);
      break;
    case "in-progress-cards":
      _doing.push(_selectedtask);
      break;
    case "done-cards":
      _done.push(_selectedtask);
      break;
  }

  // 5. Put the updated lists into the a new task variable
  const updatedTasks = {
    todo: _todo,
    doing: _doing,
    done: _done
  };

  // 5. Push to local storage
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  // 6. Rerender the page.
  renderTaskList();
}

$(document).ready(function () {
  if (taskList === null) {
    return;
  }
  renderTaskList();

  console.log("document loaded");
});

$(window).on("load", function () {
  console.log("window loaded");
});

