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
		this.token = null;
		var token = this.token;
		var jsonLoginData = this.prepareLoginJson();
		var p = new Promise(function (resolve, reject) {
			var connection = new WebSocket('ws://localhost:5000');

			connection.onmessage = function(e) {
			    //пришло сообщение от сервер, надо его обработать
			    console.log(e);
			    var res = JSON.parse(e.data);
			    switch(res.op) {
			    	case 'error': 
				    	alert('Сервер вернул ошибку при попытке зарегистрироваться: ' + res.op.error.message);
				    	reject(null);
				    	break;
			    	case 'token':
			    		resolve(res.token);	
			    		break;
			    	default:
				    	console.log(res);
				    	reject(Error('Этот ответ пока никак не обрабатывается. Смотри console log'));
				    	break;
			    };
			};
			connection.onerror = function(e) {
			    //ошибка соединения
			    console.log(e);
			    reject("Ошибка соединения");
			};
			connection.onclose = function(e) {
			    //соединение было закрыто
			    console.log(e.error);
			    reject("Соединение было закрыто");
			};
			connection.onopen = function(e) {
				//соединение установлено
			    //отправить запрос о регистрации
			    try
			    {
			    	connection.send(jsonLoginData);
			    }
			    catch(e)
			    {
			    	reject(e);
			    }
			};
		});

		p.then(
			function(result){
				this.token = result;
			});
		return p;
	}
}
