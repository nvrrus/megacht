function User(name, login) {
	this.checkLogin = function(login) {
		
		var expr = /^[a-z0-9]+$/i;
		
		if(expr.test(login))
			return true;

		throw new Error("Ошибка авторизации. Введенн некорректный логин (" + login + "). Логин может состоять только из букв и цифр!");
	};
	this.checkLogin(login);
	this.name = name;
	this.login = login;
	
	this.prepareLoginJson = function() {

		var loginObj = {
			op: 'reg',
			data: {
				name: this.name,
				login: this.login
			}
		};

		return JSON.stringify(loginObj);
		
	};
	this.registration = function() {
		var connection = new WebSocket('ws://localhost:5000');
		var jsonLoginData = this.prepareLoginJson();
		connection.onmessage = function(e) {
		    //пришло сообщение от сервер, надо его обработать
		    console.log(e);
		    var res = JSON.parse(e.data);
		    switch(res.op) {
		    	case 'error': 
		    		alert('Сервер вернул ошибку при попытке зарегистрироваться: ' + res.op.error.message);
		    		return null;
		    	case 'token':
		    		return res.token;	
		    	default:
		    		console.log(res);
		    		throw new Error('Этот ответ пока никак не обрабатывается. Смотри console log');	
		    };
		};
		connection.onerror = function(e) {
		    //ошибка соединения
		    console.log(e);
		};
		connection.onerror = function(e) {
		    //соединение было закрыто
		    console.log(e.error);
		};
		connection.onopen = function(e) {
			//соединение установлено
		    //отправить запрос о регистрации
		    connection.send(jsonLoginData);
		};
	}
}

//var user = new User('Никита', 'nvrrus');
//reg.registration();