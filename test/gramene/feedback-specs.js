var wd = require('wd');
require('colors');
var _ = require("lodash");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

// checking sauce credential
if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
  console.warn(
    '\nPlease configure your sauce credential:\n\n' +
    'export SAUCE_USERNAME=<SAUCE_USERNAME>\n' +
    'export SAUCE_ACCESS_KEY=<SAUCE_ACCESS_KEY>\n\n'
  );
  throw new Error("Missing sauce credentials");
}

// http configuration, not needed for simple runs
wd.configureHttp({
  timeout: 60000,
  retryDelay: 15000,
  retries: 5
});

var desired = JSON.parse(process.env.DESIRED || '{browserName: "chrome"}');
desired.name = 'example with ' + desired.browserName;
desired.tags = ['tutorial'];

// this script derived from manual script here:
// https://docs.google.com/spreadsheets/d/1U8Cr8MjS-9dbS8guuesjZZr_w3kvleIm5WGjAeqWgE4/edit#gid=0

describe('feedback (' + desired.browserName + ')', function () {
  var browser;
  var allPassed = true;

  before(function (done) {
    var username = process.env.SAUCE_USERNAME;
    var accessKey = process.env.SAUCE_ACCESS_KEY;
    browser = wd.promiseChainRemote("ondemand.saucelabs.com", 80, username, accessKey);
    if (process.env.VERBOSE) {
      // optional logging
      browser.on('status', function (info) {
        console.log(info.cyan);
      });
      browser.on('command', function (meth, path, data) {
        console.log(' > ' + meth.yellow, path.grey, data || '');
      });
    }
    browser
      .init(desired)
      .nodeify(done);
  });

  afterEach(function (done) {
    allPassed = allPassed && (this.currentTest.state === 'passed');
    done();
  });

  after(function (done) {
    browser
      .quit()
      .sauceJobStatus(allPassed)
      .nodeify(done);
  });

  it("should get home page", function (done) {
    browser
      .get("http://www.gramene.org/")
      .title()
      .should.become("Gramene: A comparative resource for plants | Gramene")
      .elementByCss("a[href='/contact']")
      .text()
      .should.eventually.include('Contact')
      .nodeify(done);
  });


  it("should go to the contact page from the home page", function (done) {
    var url = "http://www.gramene.org/";
    browser
      .get(url)
      .elementByCss("a[href='/contact']")
      .click()
      .waitForElementByCss("h1", wd.asserters.textInclude('Questions? Comments? Please let us know'), 10000)
      .title()
      .should.eventually.include("Gramene Web Tools")
      .elementByCss("input[name='refer_to_url']")
      .getAttribute('value')
      .should.eventually.include(url)
      .nodeify(done);
  });

  it("should go to the contact page from the arabidopsis page", function (done) {
    var url = "http://ensembl.gramene.org/Arabidopsis_thaliana/Info/Index";
    browser
      .get(url)
      .elementByCss("a[href='http://www.gramene.org/contact']")
      .click()
      .waitForElementByCss("h1", wd.asserters.textInclude('Questions? Comments? Please let us know'), 10000)
      .title()
      .should.eventually.include("Gramene Web Tools")
      .elementByCss("input[name='refer_to_url']")
      .getAttribute('value')
      .should.eventually.include(url)
      .nodeify(done);
  });

  // TODO figure out how to defeat captcha and then test form filling and email receipt

});
