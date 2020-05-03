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
            email: "test@test.pl",
            password: "Test1234",
            confirmPassword: "Test1234",
        };
        await request(app)
            .post("/signup").send(req)
            .then((res) => {
                (res.status).should.be.equal(200);
                (res.body.success).should.be.equal(true);
                (res.body.data.email).should.be.equal(req.email);
                (res.body.data.type).should.be.equal("FREE");
                expect(res.body).to.have.all.keys("data", "success");
                expect(res.body.data).to.have.all.keys("type", "email");
            });
    });
    it("should return error user exist", async function () {
        const req = {
            email: "test@test.pl",
            password: "Test1234",
            confirmPassword: "Test1234",
        };
        await request(app)
            .post("/signup").send(req)
            .then((res) => {
                (res.status).should.be.equal(400);
                (res.body.success).should.be.equal(false);
                (res.body.errors[0].msg).should.be.equal("email_exist");
                (res.body.errors[0].param).should.be.equal("email");
                expect(res.body).to.have.all.keys("errors", "success");
                expect(res.body.errors[0]).to.have.all.keys("msg", "param");
            });
    });
    it("should return error invalid email", async function () {
        const req = {
            email: "test1",
            password: "Test1234",
            confirmPassword: "Test12345",
        };
        await request(app)
            .post("/signup").send(req)
            .then((res) => {
                (res.status).should.be.equal(400);
                (res.body.success).should.be.equal(false);
                (res.body.errors[0].msg).should.be.equal("email_invalid");
                (res.body.errors[0].param).should.be.equal("email");
                expect(res.body).to.have.all.keys("errors", "success");
                expect(res.body.errors[0]).to.have.all.keys("msg", "param");
            });
    });
    it("should return error passwords do not match", async function () {
        const req = {
            email: "test1@test.pl",
            password: "Test1234",
            confirmPassword: "Test12345",
        };
        await request(app)
            .post("/signup").send(req)
            .then((res) => {
                (res.status).should.be.equal(400);
                (res.body.success).should.be.equal(false);
                (res.body.errors[0].msg).should.be.equal("passwords_do_not_match");
                (res.body.errors[0].param).should.be.equal("confirmPassword");
                expect(res.body).to.have.all.keys("errors", "success");
                expect(res.body.errors[0]).to.have.all.keys("msg", "param");
            });
    });
    it("should return error password too short", async function () {
        const req = {
            email: "test1@test.pl",
            password: "Test",
            confirmPassword: "Test",
        };
        await request(app)
            .post("/signup").send(req)
            .then((res) => {
                (res.status).should.be.equal(400);
                (res.body.success).should.be.equal(false);
                (res.body.errors[0].msg).should.be.equal("password_too_short");
                (res.body.errors[0].param).should.be.equal("password");
                expect(res.body).to.have.all.keys("errors", "success");
                expect(res.body.errors[0]).to.have.all.keys("msg", "param");
            });
    });

    /* after((done) =>{
        mongoose.disconnect()
        .then(() => console.log("Disconnect"))
        .then(() => done());
        
    }); */
});