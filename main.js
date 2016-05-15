var serverAdr = 'ws://localhost:5000',
server,
chat,
user,
modalWindow;

// Основной промис на загрузку страницы
new Promise(function(resolve) {
	if(document.readyState === 'complete') {
		resolve();
	}
	else {
		window.onload = resolve;
	}
}).then(function() {
	//Хелпер для отображения даты сообщения шаблонизатором
	Handlebars.registerHelper("formatTime", function(timestamp) {
		var d = new Date();
		d.setTime(timestamp);
  		return d.toLocaleString();
	});

	// Подписываемся на клик по кнопке "Регистрации пользователя"
	btnRegistration.addEventListener('click', onClickRegistration);
	inpUserMessage.addEventListener('keypress', onInpMessageKeyPress);
	ulUsers.addEventListener('click', onClickChangeAvatar);

	modalWindow = new ModalWindow();
});

// Обработка клика по аватару зарегистрированного пользователя
function onClickChangeAvatar(e) {
	console.log(e);
	if(!findClosestId(e.target, user.login))
		return;
	// Скрываем представление выбранного аватара
	modalWindow.showPreview(false);
	// Открываем модальное окно
	modalWindow.showModal(true);
}

// Проверяет есть ли в родительских элементах заданный идентификатор
function findClosestId(curentElement, id) {
	if(!curentElement)
		return false;

	if(curentElement.id === id)
		return true;

	var parent = curentElement.parentElement;

	return findClosestId(parent, id);
}

// Обработка ввода нового сообщения
function onInpMessageKeyPress(e) {
	if(e.keyCode === 13)
	{
		user.sendMessage(inpUserMessage.value);
		inpUserMessage.value = "";
	}
}

// Обработка клика по регистрации
function onClickRegistration() {
	user = new User(inpName.value, inpLogin.value);
	user.registration();
}

function getTemplateHTML(templateHTML, sourceObj) {
	sourceObj.sort(function(a, b){
		if(b.token != null)
			return 1;
		
		return -1;
	});
	templateFn = Handlebars.compile(templateHTML);
	return templateFn({list: sourceObj});
};

// Объект  модального окна выбора аватара
function ModalWindow() {
	var that = this;
	divModalWindow.addEventListener('click', function onClickModalWindow(e) {
		// По клику на модальном окне, скрываем его
		that.showModal(false);
		divChangeAvatar.classList.remove('drop');
		divChangeAvatar.classList.remove('error');
	});

	this.showModal = function(visible){
		if(visible) {
			if(divModalWindow.classList.contains('hide'))
				divModalWindow.classList.remove('hide');
			if(divChangeAvatar.classList.contains('hide'))
				divChangeAvatar.classList.remove('hide');
		} 
		else {
			if(!divModalWindow.classList.contains('hide'))
				divModalWindow.classList.add('hide');	
			if(!divChangeAvatar.classList.contains('hide')) 
				divChangeAvatar.classList.add('hide');	
		}
	};
	this.showPreview = function(visible, message) {
		if(message)
			pDragMessage.innerHTML = message;
		else
			pDragMessage.innerHTML = 'Перетащите сюда фотографию (только jpg, размер не более 512 кб)';

		if(visible) {
			if(divPreviewBlock.classList.contains('hide'))
			{
				pDragMessage.classList.add('hide');
				divPreviewBlock.classList.remove('hide');	
			}
		} 
		else {
			if(!divPreviewBlock.classList.contains('hide'))
			{
				pDragMessage.classList.remove('hide');
				divPreviewBlock.classList.add('hide');	
			}
		}
	};
	this.setAvatar = function(src) {
		imgPreview.src = src;
	};

	// Если не поддерживается перетаскивание файлов, выводим ошибку
	if (typeof(window.FileReader) == 'undefined') {
	    divChangeAvatar.innerHTML = 'Не поддерживается браузером!';
	    divChangeAvatar.classList.add('error');
	}

	window.addEventListener("dragover",function(e){
	  e = e || event;
	  e.preventDefault();
	},false);
	window.addEventListener("drop",function(e){
	  e = e || event;
	  e.preventDefault();
	},false);

	divChangeAvatar.addEventListener('dragover', function(e) {
		if (e.preventDefault) 
			e.preventDefault();
		
		divChangeAvatar.classList.add('hover');
	    return false;
	});
	    
	divChangeAvatar.addEventListener('dragleave', function(e) {
		if (e.preventDefault) 
			 e.preventDefault(); 
		
		divChangeAvatar.classList.remove('hover');
	    return false;
	});

	divChangeAvatar.addEventListener('drop', function(e) {
	    e.preventDefault();
      	divChangeAvatar.classList.remove('hover');
	    divChangeAvatar.classList.add('drop');
	    var file = e.dataTransfer.files[0];
		        
		if (file.size > user.maxAvatarFileSize) {
		    that.showError("Файл слишком большой!");
		    divChangeAvatar.classList.remove('drop');
		    divChangeAvatar.classList.add('error');
		    return false;
		}

		if(file.type !== 'image/jpeg') {
			that.showPreview(false, "Выберите файл с расширением .jpeg");
			divChangeAvatar.classList.remove('drop');
		    divChangeAvatar.classList.add('error');
		    return false;
		}

		var reader = new FileReader();
		reader.onloadend = function(){ 
			that.setAvatar(reader.result);
			that.showPreview(true);
			btnUpload.addEventListener('click', that.onClickUpload);
			btnCancel.addEventListener('click', that.onClickCancel);			
		};

		if(file) {
			reader.readAsDataURL(file);
			user.avatar = file;
		}
		else {
			imgPreview.src = '';
		}	
	});

	this.onClickUpload = function() {
		divChangeAvatar.classList.remove('drop');
		divChangeAvatar.classList.remove('error');
		that.showModal(false);
		user.changeAvatar();
	};
	this.onClickCancel = function(){
		divChangeAvatar.classList.remove('drop');
		divChangeAvatar.classList.remove('error');
		that.showPreview(false);
	};
}

// Объект сервера
function Server(serverAddres) {
	this.wsAddress = 'ws://' + serverAddres;
	this.httpAddress = 'http://' + serverAddres;
	this.connection = new WebSocket(this.wsAddress);
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

// Объект сообщений
function Message(body, user, time) {
	this.body = body;
	this.time = time;
	this.user = user;
	this.name = function(){
		return user.name;
	};
	this.login = function(){
		return user.login;
	};
	this.avatar = function(){
		return user.avatar;
	};
}

// Объект чата
function Chat(users, messages, server) {
	var that = this;
	this.users = users;
	this.messages = [];
	
	this.getUser = function(userLogin, userName) {
		var res = null;
		users.forEach(function(item){
			if(item.login === userLogin) {
				res = item; 
				return;
			}
		});
		if(res === null){
			var notActiveUser = new User(userName, userLogin);
			users.push(notActiveUser);
			return notActiveUser;
		}

		return res;
	};
	this.getActiveUsers = function(){
		return users.filter(function(item){
			return item.isActive;
		});
	};
	messages.forEach(function(mes){
		that.messages.push(new Message(mes.body, that.getUser(mes.user.login, mes.user.name), mes.time));
	});

	this.server = server;

	this.updateUsersPhoto = function(users) {
		var arrayOfPromises = [];
		for (var i = 0; i < users.length; i++) {
			arrayOfPromises.push(users[i].getAvatar());
		}
			
		return Promise.all(arrayOfPromises);
	};

	// Загружаем все аватарки всех пользователей
	var promise = this.updateUsersPhoto(this.users);
	promise.then(
		function() {
			// Когда все фотки загружены, делаем обновление страницы по шаблонам 
			that.updateUsersHtml();
			that.updateMessagesHtml();
		},
		function(error){
			alert(error)	
		} 
	);

	// Обновляет окно пользователей чата
	this.updateUsersHtml = function() {
		ulUsers.innerHTML = getTemplateHTML(usersTemplate.innerHTML, this.getActiveUsers());
		var regUserElement = document.getElementById(user.login);
		regUserElement.classList.add('regUser');
	};
	// Обновляет окно сообщений чата
	this.updateMessagesHtml = function() {
		ulMessages.innerHTML = getTemplateHTML(messagesTemplate.innerHTML, this.messages);
	};
	// Обновляет пользователя чата и его сообщения
	this.updateUserHtml = function(user) {
		var changeElements = ulUsers.querySelectorAll('[data-login="' + user.login  +'"]');
		this.updateSrcAvatar(changeElements, user.avatar); 
		that.updateMessagesOfUserHtml(user);
	};
	// Обновляет сообщения пользователя чата
	this.updateMessagesOfUserHtml = function(user) {
		var changeElements = ulMessages.querySelectorAll('[data-login="' + user.login  +'"]');
		this.updateSrcAvatar(changeElements, user.avatar);
	};
	this.updateSrcAvatar = function(elements, avatarSrc){
		if(elements == null || elements == undefined)
			return;

		for (var i = 0; i < elements.length; i++) {
			elements[i].firstChild.firstChild.src = avatarSrc;
		}
	}

	this.addNewUser = function(user) {
		this.users.push(user);
		var sourceObj = [];
		sourceObj.push(user);
		ulUsers.innerHTML = ulUsers.innerHTML + getTemplateHTML(usersTemplate.innerHTML, sourceObj);
		// Загрузка аватара нового пользователя, после загрузки, обновление его фотки в чате
		user.getAvatar().then(
			function() {
				that.updateUserHtml(user);
			}
		)
		//alert("Новый пользователь вошел в чат: name=" + user.name + ', login=' + user.login);
	};
	this.removeUser = function(userLogin) {
		var elements = ulUsers.querySelectorAll('[data-login="' + userLogin  +'"]');
		if(elements == null || elements == undefined)
			return;

		for (var i = 0; i < elements.length; i++) {
			ulUsers.removeChild(elements[i])
		}
		//alert("Пользователь вышел из чата: name=" + user.name + ', login=' + user.login);
	};
	this.newMessage = function(user, body, time) {
		var newMessage = new Message(body, user, time);
		this.messages.push(newMessage);
		var sourceObj = [];
		sourceObj.push(newMessage);
		ulMessages.innerHTML = ulMessages.innerHTML + getTemplateHTML(messagesTemplate.innerHTML, sourceObj);
		updateListSelection(ulMessages, ulMessages.lastChild);


		//alert("Пришло новое сообщение в чат: name=" + user.name + ', login=' + user.login + ', body='+body+', time='+time);
	};
	function updateListSelection(ulElement, targetLi) {
	    ulElement.scrollTop = 10000000;
	};
	this.userChangePhoto = function(user)  {
		var promise = user.getAvatar();
		promise.then(function(){
			that.updateUserHtml(user)
			that.updateMessagesOfUserHtml(user);
		});
		//alert("Пользователь сменил фото: name=" +user.name + ', login='+user.login);
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
		    	that.addNewUser(new User(res.user.name, res.user.login, true));
		    break;
		    case 'user-out':
	    		console.log(res);
		    	that.removeUser(res.user.login);
		    break;
	    	case 'message':
	    		console.log(res);
		    	that.newMessage(chat.getUser(res.user.login), res.body, res.time);
		    break;
		    case 'user-change-photo':
		    	console.log(res);
		    	that.userChangePhoto(that.getUser(res.user.login));
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

// Объект пользователя
function User(name, login, isActive) {
	var that = this;
	that.isActive = isActive === undefined ? false : isActive;
	this.maxAvatarFileSize = 512000;
	this.checkLogin = function(login) {
		var expr = /^[a-z0-9]+$/i;
		
		if(expr.test(login))
			return true;

		var error = "Ошибка авторизации. Введенн некорректный логин: " + login + ". Логин может состоять только из латинских букв и цифр!";
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
	};
	this.changeAvatar = function() {
		var data = new FormData();
		data.append('photo', this.avatar);
		data.append('token', this.token);
		var xhr = new XMLHttpRequest();
		xhr.open('POST', server.httpAddress + '/upload', true); 
		xhr.onerror = function(e){
			alert(e.error);
		}
		xhr.send(data);
	};
	this.checkLogin(login);
	this.checkName(name);
	this.name = name;
	this.login = login;
	
	this.getAvatar = function() {
		var xhr = new XMLHttpRequest();
		xhr.responseType = "arraybuffer";
		xhr.open('GET', server.httpAddress + '/photos/'+ this.login, true); 
		xhr.send();

		var p = new Promise(function(resolve, reject){
			xhr.onreadystatechange = function() { // (3)
				if (xhr.readyState != 4) 
					return;

				if (xhr.status != 200) {
					 reject(xhr.status + ': ' + xhr.statusText);
				} else {
					resolve(that.login);
				}
			}
		});
		
		p.then(function(res) {
			console.log('Получена фото пользователя с login=' + res);
		   	var blob = new Blob([xhr.response], {
	            type: xhr.getResponseHeader("Content-Type")
	        });
        	that.avatar = window.URL.createObjectURL(blob);
		},
		function(error){
			console.log(error);
		});
		return p;
	};
	
	this.registration = function() {
		// Создаем соединение с сервером
		server = new Server('localhost:5000');
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
			    		that.isActive = true;
			    		var users = [];
			    		users.push(that);
			    		res.users.forEach(function(item) {
			    			if(item.login !== that.login)
			    			{
			    				var newUser = new User(item.name, item.login, true);
			    				users.push(newUser);
			    			}
			    		});

			    		chat = new Chat(users, res.messages, server);
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
			//alert("Создан пользователь. Пользователь зарегистирован в чате. Создан чат.");
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
