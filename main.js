function Calculator(firstNumber) {
	this.firstNumber = firstNumber;
}

Calculator.prototype.sum = function()
{
	var res = this.firstNumber;
	for (var i = 0; i <  arguments.length; i++) {
		res += arguments[i];
	}
	return res;
}

Calculator.prototype.dif = function() {
	var res = this.firstNumber;
	for (var i = 0; i <  arguments.length; i++) {
		res -= arguments[i];
	}
	return res;
}

function MyCalculator(firstNumber) {
	this.firstNumber = firstNumber;
}

MyCalculator.prototype = Object.create(Calculator.prototype);

MyCalculator.prototype.sum = function() {
	console.log("Переопределенный sum");
	return Calculator.prototype.sum.apply(this, arguments);
}

MyCalculator.prototype.div = function() {
	var res = this.firstNumber;
	for (var i = 0; i <  arguments.length; i++) {
		res /= arguments[i];
	}
	return res;
}

MyCalculator.prototype.mul = function() {
	var res = this.firstNumber;
	for (var i = 0; i <  arguments.length; i++) {
		res *= arguments[i];
	}
	return res;
}

var calc2 = new MyCalculator(100);
console.log(calc2.div(5));
console.log(calc2.div(5, 2));
console.log(calc2.mul(10));
console.log(calc2.sum(10));
console.log(calc2.dif(10));

var calc1 = new Calculator(100);
console.log(calc1.sum(10));
console.log(calc1.dif(10));

