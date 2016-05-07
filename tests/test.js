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
		assert.isDefined(reg.registration());
		assert.isNotNull(reg.registration());

	});
});