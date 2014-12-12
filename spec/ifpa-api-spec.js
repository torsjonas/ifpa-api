var IfpaApi = require("../ifpa-api");
var instance = new IfpaApi();

describe("API", function(){
	it("should have getCalendarEvents", function(){
		expect(instance.getCalendarEvents).toBeDefined();
	});

	it("should have getPlayerVsPlayer", function(){
		expect(instance.getPlayerVsPlayer).toBeDefined();
	});

	it("should have getPlayerInformation", function(){
		expect(instance.getPlayerInformation).toBeDefined();
	});

	it("should have getPlayerHistory", function(){
		expect(instance.getPlayerHistory).toBeDefined();
	});

	it("should have getCountryDirectors", function(){
		expect(instance.getCountryDirectors).toBeDefined();
	});

	it("should have searchPlayersByName", function(){
		expect(instance.searchPlayersByName).toBeDefined();
	});

	it("should have searchPlayersByEmail", function(){
		expect(instance.searchPlayersByEmail).toBeDefined();
	});
});