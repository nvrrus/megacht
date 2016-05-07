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
		var p = new Promise(function (resolve, reject) {
			var connection = new WebSocket('ws://localhost:5000');
			var jsonLoginData = this.prepareLoginJson();
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
			    reject(e);
			};
			connection.onerror = function(e) {
			    //соединение было закрыто
			    console.log(e.error);
			    reject(e);
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

//var user = new User('Никита', 'nvrrus');
//reg.registration();