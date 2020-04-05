// imports of testing libraries 
import * as mocha from "mocha";
import * as chai from "chai";
import sinon = require("sinon");

import {agent as request} from "supertest";
import app from "../src/app";
const should = chai.should();
const expect = chai.expect;


describe("Auth Controller", function() {
    before(function(done) {
        this.timeout(300); // A very long environment setup.
        setTimeout(done, 100);
      });
    it("should create new FREE user", async function () {
        const req = {
            email : "test@test.pl",
            password: "Test1234",
            confirmPassword: "Test1234",
        };
        await request(app)
            .post("/signup").send(req)
            .then((res) => {
                (res.status).should.be.equal(200);
                (res.body.success).should.be.equal(true);
                (res.body.data.email).should.be.equal(req.email);
                (res.body.data.role).should.be.equal("FREE");
                expect(res.body.data).to.have.all.keys("role", "email");
            });
    });
    it("should be retried another 2 times", async function () {
        const req = {
            title : "First example project4",
            subtitle: "nwoo tyty",
            description: ""
        };
        await request(app)
            .post("/account/project").send(req)
            .then((res) => console.log(res.status))
            .catch((err) => console.log(err.status));
    });
    /* after((done) =>{
        mongoose.disconnect()
        .then(() => console.log("Disconnect"))
        .then(() => done());
        
    }); */
});