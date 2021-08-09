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

/*
FUNCIONES DE VALIDACIÓN
*/
function validateFormLogin() {
  console.log("inside validation");
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const vuserName =
    username.length >= 6 && username.length < 15 && !username.includes(" ");
  const vpassword = password.length >= 8;
  const buttonSubmit = document.getElementById("btn-submit");
  if (vuserName && vpassword) {
    console.log("valid!");
    buttonSubmit.removeAttribute("disabled");
  } else {
    console.log("not valid!");
    buttonSubmit.setAttribute("disabled", true);
  }
}

function validateSignUp() {
  console.log("inside validation");
  const username = document.getElementById("username2").value;
  const password1 = document.getElementById("password1").value;
  const password2 = document.getElementById("password2").value;

  const vuserName =
    username.length >= 6 && username.length < 15 && !username.includes(" ");
  const vpassword = password1.length >= 8 && password1 === password2;

  const buttonSubmit = document.getElementById("btn-submit2");
  //validation: password1 needs to match with password2
  if (vuserName && vpassword) {
    console.log("valid!");
    buttonSubmit.removeAttribute("disabled");
  } else {
    console.log("not valid!");
    buttonSubmit.setAttribute("disabled", true);
  }
}

//FUNCTIONS (Client)
function createUser() {
  const username = document.getElementById("username2").value;
  const password = document.getElementById("password1").value;

  const newUser = api.newUser.create(username, password);
  console.log(newUser);
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
  if(user.active === false){
      goToLogin()
  }
}

function onLoadMain() {
  console.log("onload");
  //to get the params from the URL
  const search = window.location.search;
  const urlParams = new URLSearchParams(search);

  const userId = urlParams.get("id");

  console.log("id: ", userId); //this is of type 'string' so we need to cast to number
  //we need to search this user id in our db-local
  const user = api.newUser.getUser(+userId);
  console.log(user);
  if (!user || !user.active) {
    goToLogin();
  }

  const title = document.getElementById("username-title");
  title.innerHTML = `${user.username}`;
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
      console.log(user);
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
    logout: function (id) {
      const db_local = localStorage.getItem(usersdb);
      if (!db_local) {
        return null;
      }
      const db = JSON.parse(db_local);
      let user;
      const index = db.users.findIndex(
        (user) => user.id === id
      );
      user = db.users[index];
      //the user now needs to have the flag active as false
      db.users[index].active = false;
      localStorage.setItem(usersdb, JSON.stringify(db));

      return user;
    },
  },
};
