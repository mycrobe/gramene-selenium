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

describe('Search and ensembl links (' + desired.browserName + ')', function () {
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

  it("should successfully perform search", function (done) {
    browser
      // Go to gramene
      .get("http://www.gramene.org/")

      // enter "tb1" into the search box
      .elementByCss("input.grm-search-box[name='query']")
      .sendKeys('tb1')

      // press the search button
      .elementByCss("input.grm-search-btn[type='submit']")
      .click()

      // wait for results, then open species sidebar
      .waitForElementByCss("#search-results", wd.asserters.textInclude('Results'), 2000)
      .elementByCss("a[href='#collapse-Species']")
      .click()
      .waitForElementByCss("#collapse-Species", wd.asserters.isDisplayed, 1000)

      // click Zea Mays (this loads a new page)
      .elementByCss("input[value='species~zea_mays']")
      .click()

      // ensure only one result
      .waitForElementByCss("#docs", wd.asserters.isDisplayed, 2000)
      .elementsByCss("#docs p")
      .should.eventually.have.length(1)

      // ensure result has text 'TB1_MAIZE'
      .elementByCss("#docs > p:first-child")
      .text()
      .should.eventually.include('TB1_MAIZE')

      .nodeify(done);
  });
});
