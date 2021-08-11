/*
FUNCIONES DE ENRUTAMIENTO
*/
function goToMain(userId) {
  window.location.href =
    "http://localhost:5500/pages/main-page.html?id=" + userId;
}

function goToLogin() {
  window.location.href = "http://localhost:5500/pages/signin.html";
}

function goToEdit(userId, noteId) {
  window.location.href =
    "http://localhost:5500/pages/edit-page.html?userId=" +
    userId +
    "&noteId=" +
    noteId;
}

function goBack() {
  const search = window.location.search;
  const urlParams = new URLSearchParams(search);

  const userId = urlParams.get("userId");
  goToMain(userId);
}

/*
FUNCIONES DE VALIDACIÓN
*/
function validateFormLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const vuserName =
    username.length >= 6 && username.length < 15 && !username.includes(" ");
  const vpassword = password.length >= 8;
  const buttonSubmit = document.getElementById("btn-submit");
  if (vuserName && vpassword) {
    buttonSubmit.removeAttribute("disabled");
  } else {
    buttonSubmit.setAttribute("disabled", true);
  }
}

function validateSignUp() {
  const username = document.getElementById("username2").value;
  const password1 = document.getElementById("password1").value;
  const password2 = document.getElementById("password2").value;

  const vuserName =
    username.length >= 6 && username.length < 15 && !username.includes(" ");
  const vpassword = password1.length >= 8 && password1 === password2;

  const buttonSubmit = document.getElementById("btn-submit2");
  //validation: password1 needs to match with password2
  if (vuserName && vpassword) {
    buttonSubmit.removeAttribute("disabled");
  } else {
    buttonSubmit.setAttribute("disabled", true);
  }
}

function validateNoteCreation() {
  const title = document.getElementById("note-title").value;
  const description = document.getElementById("note-description").value;
  const createBtn = document.getElementById("create-note");

  if (title.length > 3 && description.length > 3) {
    createBtn.removeAttribute("disabled");
  } else {
    createBtn.setAttribute("disabled", true);
  }
}

//CLIENT FUNCTIONS
function createUser() {
  const username = document.getElementById("username2").value;
  const password = document.getElementById("password1").value;

  const newUser = api.newUser.create(username, password);

  if (newUser) {
    goToLogin();
  } else {
    alert("This username already exists");
  }
}

function loginUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const user = api.newUser.login(username, password);
  if (user) {
    goToMain(user.id);
  } else {
    alert("User doesn't exist");
  }
}

function closeSession() {
  //to get the params from the URL
  const search = window.location.search;
  const urlParams = new URLSearchParams(search);

  const userId = +urlParams.get("id");
  const user = api.newUser.logout(userId);
  if (user.active === false) {
    goToLogin();
  }
}

function onLoadMain() {
  //to get the params from the URL
  const search = window.location.search;
  const urlParams = new URLSearchParams(search);

  const userId = urlParams.get("id");

  //we need to search this user id in our db-local
  const user = api.newUser.getUser(+userId);

  if (!user || !user.active) {
    goToLogin();
  }

  const title = document.getElementById("username-title");
  title.innerHTML = `${user.username}`;

  drawNotes(user);
}

function onLoadEdit() {
  //to get the params from the URL
  const search = window.location.search;
  const urlParams = new URLSearchParams(search);

  const userId = urlParams.get("userId");
  const noteId = urlParams.get("noteId");
  const user = api.newUser.getUser(+userId);

  user.notes.forEach(function (note) {
    if (note.id === +noteId) {
      drawNoteInfo(note);
    }
  });
}

function noteCreation() {
  const title = document.getElementById("note-title").value;
  const description = document.getElementById("note-description").value;

  const search = window.location.search;
  const urlParams = new URLSearchParams(search);

  const userId = +urlParams.get("id");

  const newNote = api.newNote.createNote(userId, title, description);

  if (!newNote) {
    alert("The note was not created!");
  } else {
    const user = api.newUser.getUser(userId);
    drawNotes(user);
  }
}

function drawNotes(userId) {
  //to get the params from the URL
  const search = window.location.search;
  const urlParams = new URLSearchParams(search);

  const id = urlParams.get("id");
  const user = api.newUser.getUser(+id);
  const container = document.getElementById("container-notes");

  container.innerHTML = "";

  const notes = user.notes;
  notes.forEach(function (note) {
    const template = `
    <div class="col mt-4">
        <div class="p-3 card" onclick="goToEdit(${user.id},${note.id})">
            <h2>${note.title}</h2>  
            <p>${note.description}</p>
        </div>
    </div>
    `;
    container.innerHTML += template;
  });
}

function drawNoteInfo(note) {
  const container = document.getElementById("edit-container");
  container.innerHTML = "";
  const template = `
    <div class="card notes">
      <div class="card-body">
        <div class="mb-3">
          <label for="title" class="form-label">Title</label>
          <input type="text" class="form-control" id="title" value="${note.title}">
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">Description</label>
          <textarea id="description" class="form-control" >${note.description}</textarea>
      </div>
      <div class="d-grid gap-2">
        <button class="btn btn-primary" type="button">Save</button>
      </div>
    </div>
  </div> `;
  container.innerHTML = template;
}

function remove() {
  const search = window.location.search;
  const urlParams = new URLSearchParams(search);

  const id = urlParams.get("userId");
  const noteId = urlParams.get("noteId");

  api.newNote.deleteNote(+id, +noteId);

  goToMain(id);
  drawNotes(id);
}

//FUNCTIONS (API)

//database of users:DB
/* const DB = {
    users: [
         {
            id:1,
            username: "Leslie",
            password: "346512334",
            notes: [
                {
                    id:1,
                    title: "title",
                    description: "lorem...."
                }
            ]
        } 
    ]
}*/

const usersdb = "USERS_DB";
const api = {
  newUser: {
    create: function (username, password) {
      const user = {
        id: 1,
        active: false,
        username,
        password,
        notes: [],
      };

      const db_local = localStorage.getItem(usersdb);
      let db = undefined;

      //if db_local exist we transform it from string to object
      if (db_local) {
        db = JSON.parse(db_local);
        //else we initialize the db
      } else {
        db = {
          counter: 1,
          counterNotes: 1,
          users: [],
        };
      }

      //check if the username already exists:
      //we can also use filter() or find()
      db.users.forEach(function (user) {
        if (user.username === username) {
          return null;
        }
      });

      user.id = db.counter;
      db.counter++;

      db.users.push(user);

      //once we save it to the local storage we need first to transform it to a string
      localStorage.setItem(usersdb, JSON.stringify(db));
      return user;
    },
    getUser: function (userId) {
      const db_local = localStorage.getItem(usersdb);
      if (!db_local) {
        return null;
      }
      const db = JSON.parse(db_local);
      const user = db.users.find((user) => user.id === userId);

      return user;
    },
    login: function (username, password) {
      const db_local = localStorage.getItem(usersdb);

      if (!db_local) {
        return null;
      }
      const db = JSON.parse(db_local);

      let user;
      const index = db.users.findIndex(
        (user) => user.username === username && user.password === password
      );
      user = db.users[index];
      //the user now needs to have the flag active as true
      db.users[index].active = true;
      localStorage.setItem(usersdb, JSON.stringify(db));

      return user;
    },
    logout: function (userId) {
      const db_local = localStorage.getItem(usersdb);
      if (!db_local) {
        return null;
      }
      const db = JSON.parse(db_local);
      let user;
      const index = db.users.findIndex((user) => user.id === userId);
      user = db.users[index];
      //the user now needs to have the flag active as false
      db.users[index].active = false;
      localStorage.setItem(usersdb, JSON.stringify(db));

      return user;
    },
  },
  newNote: {
    createNote: function (userId, title, description) {
      const db_local = localStorage.getItem(usersdb);
      if (!db_local) {
        return null;
      }
      const db = JSON.parse(db_local);
      const index = db.users.findIndex((user) => user.id === userId);

      const newNote = {
        id: db.counterNotes,
        title,
        description,
      };

      db.counterNotes++;
      db.users[index].notes.push(newNote);

      localStorage.setItem(usersdb, JSON.stringify(db));

      return newNote;
    },
    deleteNote: function (userId, noteId) {
      const db_local = localStorage.getItem(usersdb);
      if (!db_local) {
        return null;
      }
      const db = JSON.parse(db_local);
      
      const user = db.users.find((user) => user.id === userId);
      
      const userNotes = user.notes;
      const indexNote = userNotes.findIndex((note) => note.id === noteId);

      userNotes.splice(indexNote, 1);
      localStorage.setItem(usersdb, JSON.stringify(db));
      return userNotes;
    },
  },
};
