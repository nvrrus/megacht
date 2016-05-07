describe('Тесты регистрации', function() {
	it('Логин не из букв и цифр при регистрации дает ошибку', function() {
		var token;
		
		try{
			 var reg = new User('Никита', '-qwe');
			 
			 assert.isTrue(false, "Не отловили ожидаемую ошибку");
		}
		catch(e){}
		
	});
	it('Логин из букв и цифр подходит для регистрации', function() {
		var reg = new User('Никита', '123qwe');
		var p = reg.registration();
		assert.isNotNull(p);
		assert.isDefined(p);
		p.then(
			function(resultToken){
				assert.isNotNull(resultToken);
				assert.isDefined(resultToken);
			}, 
			function(error){
				assert.isTrue(false, error);
			}
		);
	});
});