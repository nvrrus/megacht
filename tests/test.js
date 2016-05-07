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
		var user = new User('Никита', '123qwe');
		var p = user.registration();
		
		assert.isNotNull(p);
		assert.isDefined(p);
		
		return p.then(
			function(resultToken){
				assert.isNotNull(resultToken);
				assert.isDefined(resultToken);
				assert.equal(resultToken, user.token);
				done();
			}, 
			function(error){
				assert.isTrue(false, error);
				done();
			}
		);
	});
});