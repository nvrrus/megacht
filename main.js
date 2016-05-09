// 'ws://localhost:5000'
var server;
var chat;
var user;

new Promise(function(resolve) {
	if(document.readyState === 'complete') {
		resolve();
	}
	else {
		window.onload = resolve;
	}
}).then(function() {
	Handlebars.registerHelper("formatTime", function(timestamp) {
		var d = new Date();
		d.setTime(timestamp);
		// var curr_date = d.getDate(),
		// curr_month = d.getMonth() + 1,
		// curr_year = d.getFullYear();

  //   	return curr_year + "-" + curr_month + "-" + curr_date;
  		return d.toISOString().slice(0, 10);
	});
	// Подписываемся на клик по кнопке "Регистрации пользователя"
	btnRegistration.addEventListener('click', onClickRegistration);
	inpUserMessage.addEventListener('keypress', onInpMessageKeyPress);
});

function onInpMessageKeyPress(e) {
	if(e.keyCode === 13)
	{
		user.sendMessage(inpUserMessage.value);
	}
}

function onClickRegistration() {
	user = new User(inpName.value, inpLogin.value);
	user.registration();
	
}

function getTemplateHTML(templateHTML, sourceObj) {
	
	templateFn = Handlebars.compile(templateHTML);
	return templateFn({list: sourceObj});
};

function Server(serverAddres) {
	this.connection = new WebSocket(serverAddres);
	this.prepareJsonSendData = function(oppName, dataObj, token) {
		
		return JSON.stringify(loginObj);
	};
	this.registrationNewUser = function(name, login){
		var loginObj = {
			op: 'reg',
			data: {name: name, login: login}
		};

		this.connection.send(JSON.stringify(loginObj));
	};
	this.sendMessage = function(token, body) {
		var messageObj = {
			op: 'message',
			token: token, //уникальный идентификатор, полученный при регистрации
			data: {
				body: body //тело сообщения
			}
		};
		
		this.connection.send(JSON.stringify(messageObj));
	};
}

function Chat(users, messages, server) {
	var that = this;
	this.users = users;
	this.messages = messages;
	this.server = server;

	this.updateUsersHtml = function() {
		leftCol.innerHTML = getTemplateHTML(usersTemplate.innerHTML, this.users);
	};
	this.updateMessagesHtml = function() {
		divMessages.innerHTML = getTemplateHTML(messagesTemplate.innerHTML, this.messages);
		
	};
	
	this.updateUsersHtml();
	this.updateMessagesHtml();
	
	this.addNewUser = function(user) {
		this.users.push(user);
		this.updateUsersHtml();
		//alert("Новый пользователь вошел в чат: name=" + user.name + ', login=' + user.login);
	};
	this.removeUser = function(user) {
		this.users.pop();
		this.updateUsersHtml();
		//alert("Пользователь вышел из чата: name=" + user.name + ', login=' + user.login);
	};
	this.newMessage = function(user, body, time) {
		this.messages.push({user: user, body: body, time: time});
		this.updateMessagesHtml();
		//alert("Пришло новое сообщение в чат: name=" + user.name + ', login=' + user.login + ', body='+body+', time='+time);
	};
	this.userChangePhoto = function(user)  {
		this.updateUsersHtml();
		alert("Пользователь сменил фото: name=" +user.name + ', login='+user.login);
	};
	
	
	// Подписывем чат на сообщения сервера
	this.server.connection.onmessage = function(e) {
	    //пришло сообщение от сервер, надо его обработать
	    console.log(e);
	    var res = JSON.parse(e.data);
	    switch(res.op) {
	    	case 'error': 
		    	console.log(res);
		    	alert('Сервер вернул ошибку: ' + res.error.message);
		    break;
	    	case 'user-enter':
	    		console.log(res);
		    	that.addNewUser(res.user);
		    break;
		    case 'user-out':
	    		console.log(res);
		    	that.removeUser(res.user);
		    break;
	    	case 'message':
	    		console.log(res);
		    	that.newMessage(res.user, res.body, res.time);
		    break;
		    case 'user-change-photo':
		    	console.log(res);
		    	that.userChangePhoto(res.user);
		    break;
	    	default:
		    	console.log(res);
		    	reject(Error('Этот ответ пока никак не обрабатывается. Смотри console log'));
		    break;
	    };
	};
	this.server.connection.onerror = function(e) {
	    console.log(e);
	    alert("Произошла ошибка в чате: " + e.error.message);
	};
	
}

function User(name, login) {
	var that = this;
	this.checkLogin = function(login) {
		var expr = /^[a-z0-9]+$/i;
		
		if(expr.test(login))
			return true;

		var error = "Ошибка авторизации. Введенн некорректный логин: " + login + ". Логин может состоять только из букв и цифр!";
		alert(error);
		inpLogin.focus();
		throw new Error(error);
	};
	this.checkName = function(name) {
		var expr = /^[a-zа-яё ]+$/i;

		if(expr.test(name))
			return true;

		var error = "Ошибка авторизации. Введено некорректное имя: " + name + ". Имя может состоять только из букв.";
		alert(error);
		inpName.focus();
		throw new Error(error);
	}
	this.checkLogin(login);
	this.checkName(name);
	this.name = name;
	this.login = login;
	
	this.registration = function() {
		// Создаем соединение с сервером
		server = new Server('ws://localhost:5000');
		this.token = null;
		var token = this.token;
		var p = new Promise(function (resolve, reject) {
			server.connection.onmessage = function(e) {
			    //пришло сообщение от сервер, надо его обработать
			    console.log(e);
			    var res = JSON.parse(e.data);
			    switch(res.op) {
			    	case 'error': 
				    	reject('Сервер вернул ошибку при попытке зарегистрироваться: ' + res.error.message);
				    	break;
			    	case 'token':
			    		chat = new Chat(res.users, res.messages, server);
			    		resolve(res.token);
			    		break;
			    	default:
				    	console.log(res);
				    	reject(Error('Этот ответ пока никак не обрабатывается. Смотри console log'));
				    	break;
			    };
			};
			server.connection.onerror = function(e) {
			    //ошибка соединения
			    console.log(e);
			    reject("Ошибка соединения");
			};
			server.connection.onclose = function(e) {
			    //соединение было закрыто
			    that.token = null;
			    console.log(e.error);
			    reject("Соединение было закрыто");
			};
			server.connection.onopen = function(e) {
				//соединение установлено
			    //отправить запрос о регистрации
			    try
			    {
			    	server.registrationNewUser(name, login);
			    }
			    catch(e)
			    {
			    	reject(e);
			    }
			};
		});

		p.then(function(result) {
			that.token = result;
			divChatPanel.classList.toggle('hide');
			divRegPanel.classList.toggle('hide');
			alert("Создан пользователь. Пользователь зарегистирован в чате. Создан чат.");
		},
		function(error){
			alert(error);
		});
	
		return p;
	};
	this.sendMessage = function(message) {
		if(this.token === undefined || this.token === null) {
			alert('Невозможно отправить сообщение в чат. Нет соединения с сервером. Попробуйте зарегистрироваться.');
			return;
		}

		server.sendMessage(this.token, message);
	};
}
