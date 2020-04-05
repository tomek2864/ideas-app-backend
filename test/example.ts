// imports of testing libraries 
import * as mocha from "mocha";
import * as chai from "chai";
import sinon = require("sinon");

//chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should();

// ========== PENDING TESTS =============
// If you avoid to define the callback to an it block, the test will result as pending
describe("Pending Test", function () {
    it("should be marked as pending");
});


// ========== RETRIES FUNCTIONALITY =============
// using the this.retries() function, you will explicetely set the number of times to retry a certain test.
// considering the first execution, if you specify this.retries(n), the test will be executed 1+n times
describe("Retries Test", function () {
    it("should be retried another 2 times", function () {
        this.retries(2);
        ([1, 2, 3].length).should.be.equal(3);
    });
});

// ========== EXPECT, ASSERT AND SHOULD KEYWORDS =============
// integrating mocha with chai, you can use the following ways for testing: expect, should and assert
describe("using expect, should and assert", function () {
    it("should use should keyword", function () {
        const x = 5;
        x.should.be.equal(5);
    });
    it("should use expect keyword", function () {
        const x = 5;
        expect(x).to.be.equal(5);
    });
    it("should use assert keyword", function () {
        const x = 5;
        assert.equal(x, 5);
    });
});



// ========== CHAI METHODS =============
describe("explore all the chai methods and functionalities", function () {

    it("should check correctly the types", function () {
        const x = 3;
        x.should.be.a("number");
        const y = "hello";
        y.should.be.a("string");
        const w = {};
        w.should.be.a("object");
        const z = function () { };
        z.should.be.a("function");
    });

    it("should check correctly the length of an array", function () {
        const list = [1, 2, 3, 4, 5];
        list.should.have.lengthOf(5);
    });


    it("should check correctly the equality of simple types and complex types", function () {
        const string = "test";
        const obj = { test: "TEST", foo: { bar: { baz: "quux" } } };
        string.should.be.equal("test");
        obj.should.be.deep.equal({ test: "TEST", foo: { bar: { baz: "quux" } } });
        obj.should.be.eql({ test: "TEST", foo: { bar: { baz: "quux" } } });
    });

    it("should use the not statement", function () {
        const foo = "foo bar";
        foo.should.not.equal("foo");
        const fn = function () { };
        fn.should.not.throw(Error);
        expect({ foo: "baz" }).to.have.property("foo").and.not.equal("bar");
    });

    it("should use the any statement", function () {
        const foo = { bar: "value" };
        expect(foo).to.have.any.keys("bar", "baz");
    });

    it("should use the all statement", function () {
        const foo = {
            bar: "value1",
            baz: "value2",
            bee: "SAda"
        };
        expect(foo).to.have.all.keys("bar", "baz");
    });

    it("should use include/contains statements", function () {
        expect([1, 2, 3]).to.include(2);
        expect("foobar").to.contain("foo");
        expect({ foo: "bar", hello: "universe" }).to.include.keys("foo");
    });

    it("should use the ok statement", function () {
        expect("everything").to.be.ok;
        expect(1).to.be.ok;
        expect(false).to.not.be.ok;
        expect(undefined).to.not.be.ok;
        expect(null).to.not.be.ok;
    });


    it("should use the true/false statements", function () {
        expect(true).to.be.true;
        expect(1).to.not.be.true;
        expect(false).to.be.false;
        expect(0).to.not.be.false;
    });


    it("should use null/undefined statements", function () {
        expect(null).to.be.null;
        expect(undefined).to.not.be.null;
        expect(undefined).to.be.undefined;
        expect(null).to.not.be.undefined;
    });

    it("should use exist statement to check if the target is neither null or undefined", function () {
        let foo = "hi", bar = null, baz;
        expect(foo).to.exist;
        expect(bar).to.not.exist;
        expect(baz).to.not.exist;
    });

    it("should use empty statement to check if the length is 0", function () {
        expect([]).to.be.empty;
        expect("").to.be.empty;
        expect({}).to.be.empty;
    });

    it("should use above/below statements to compare values", function () {
        expect("foo").to.have.length.above(2);
        expect([1, 2, 3]).to.have.length.above(2);
        expect("foo").to.have.length.below(4);
        expect([1, 2, 3]).to.have.length.below(4);
    });

    it("should use least/most statements to compare values", function () {
        expect("foo").to.have.length.of.at.least(2);
        expect([1, 2, 3]).to.have.length.of.at.least(3);
        expect("foo").to.have.length.of.at.most(4);
        expect([1, 2, 3]).to.have.length.of.at.most(3);
    });

    it("should use within statement to compare values", function () {
        expect("foo").to.have.length.within(2, 4);
        expect([1, 2, 3]).to.have.length.within(2, 4);
    });

    it("should use match statement to use a regular expression for comparing values", function () {
        expect("foobar").to.match(/^foo/);
    });


    it("should use string statement to check that a string contains a substring", function () {
        expect("foobar").to.have.string("bar");
    });


    it("should use the respondTo statement to check that the target object/class responds to a certain method", function () {
        const Klass = function () { };
        Klass.prototype.bar = function () { };
        expect(Klass).to.respondTo("bar");
        const obj = { bar: function () { } };
        expect(obj).to.respondTo("bar");
    });


    it("should use the satisfy statement to check that a target passes a given truth test", function () {
        expect(1).to.satisfy(function (num: number) { return num > 0; });
    });


    it("should use the members statement to check that a target include or not certain elements", function () {
        expect([1, 2, 3]).to.include.members([3, 2]);
        expect([1, 2, 3]).to.not.include.members([3, 2, 8]);
        expect([4, 2]).to.have.members([2, 4]);
        expect([5, 2]).to.not.have.members([5, 2, 1]);
    });


    it("should use the oneOf statement to check that a target element contains an element as top level element of an array", function () {
        expect("a").to.be.oneOf(["a", "b", "c"]);
        expect(9).to.not.be.oneOf(["z"]);
        expect([3]).to.not.be.oneOf([1, 2, [3]]);
    });


    it("should use the change statement to check that a function changes a certain property of an object", function () {
        const obj = { val: 10 };
        const fn = function () { obj.val += 3; };
        const noChangeFn = function () { return "foo" + "bar"; };
        expect(fn).to.change(obj, "val");
        expect(noChangeFn).to.not.change(obj, "val");
    });


    it("should use the increase/decrease statements to check that a function increases or decreases a property of an object or a value", function () {
        const obj = { val: 10 };
        const increaseFn = function () { obj.val = 15; };
        expect(increaseFn).to.increase(obj, "val");
        const decreaseFn = function () { obj.val = 5; };
        expect(decreaseFn).to.decrease(obj, "val");
    });

});