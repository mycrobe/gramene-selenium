var wd = require('wd');
require('colors');
var _ = require("lodash");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var fs = require('fs');

const grameneHomeUrl = "http://www.gramene.org/";
const ensemblGenePageUrl = "http://dev.gramene.org/Zea_mays/Gene/Summary?db=core;g=AC233950.1_FG002;r=1:265811311-265813044;t=AC233950.1_FGT002";

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

var desired = JSON.parse(process.env.DESIRED || '{browserName: "firefox"}');
desired.name = 'test ensembl links in ' + desired.browserName;
desired.tags = ['ensembl'];

// this script derived from manual script here:
// https://docs.google.com/spreadsheets/d/1-AZGutpOmL97HHanTFQtHM9ZuWiiF1DrvMOpgyma1nM/edit#gid=0

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

  it("should successfully perform text search, refine by species and go to Ensembl", function (done) {
    browser
      // Go to gramene
      .get(grameneHomeUrl)

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
      .should.eventually.include('TEOSINTE BRANCHED 1')

      // modify the link so that it will open in the current window,
      // then click it to go to the refernced Ensembl page
      .eval("document.querySelector('#docs > p:first-child a').setAttribute('target','_self')")
      .elementByCss("#docs > p:first-child a")
      .click()

      // load ensembl results page
      .waitForElementByCss("#GeneSummary", wd.asserters.isDisplayed, 30000) // Ensembl is super slow.
      .title()
      .should.eventually.include("Ensembl Genomes: Zea mays - Summary - Gene: AC233950.1_FG002")
      .elementByCss("#ensembl_panel_1 h1")
      .text()
      .should.eventually.include("Gene: AC233950.1_FG002")

      .nodeify(done)
  });

  it('should have context links on the ensembl page', function(done) {
    browser

      // load ensembl results page
      .get(ensemblGenePageUrl)
      .waitForElementByCss("#page_nav", wd.asserters.isDisplayed, 10000) // Ensembl is super slow.

      // check the title
      .title()
      .should.eventually.include("Ensembl Genomes: Zea mays - Summary - Gene: TB1 (AC233950.1_FG002)")

      // get the left-hand context menu
      .elementsByCss("#page_nav ul.local_context a")

      // it should have 19 links at least (current page has 19)
      .should.eventually.have.length.of.at.least(19)

      .nodeify(done);
  });

  _.forEach(require('./ensemblGeneLinksTextTestData'), function(link) {
  //var link = require('./ensemblGeneLinksTextTestData')[0];
    it('should find and follow the link to ' + link.title, function(done) {
      browser
        // load ensembl results page
        .get(ensemblGenePageUrl)
        .waitForElementByCss("#page_nav", wd.asserters.isDisplayed, 10000, 1000) // Ensembl is super slow.

        // check the title
        .title()
        .should.eventually.include("Ensembl Genomes: Zea mays - Summary - Gene: TB1 (AC233950.1_FG002)")

        // find and click the link
        .elementByCss("#page_nav a[title='" + link.title + "']")

        // "click" the link by explicitly relocating to a[href]
        .getAttribute('href')
        .then(function(url) {
          return browser.get(url);
        })

        // make sure the page title includes the link title.
        .title()
        .should.eventually.include(link.expectedTitleSubstring)

        //.takeScreenshot().then(function(data) {
        //  var fname = 'results/' + link.title.replace(/\s/g, '') + '.1.png';
        //  fs.writeFile(fname, data.replace(/^data:image\/png;base64,/,''), 'base64', function(err) {
        //    if(err) throw err;
        //  });
        //})

        // wait for one async loaders to be done
        .waitForElementByCss(link.asyncPanelSelector, wd.asserters.isDisplayed, 30000, 2000)

        .takeScreenshot().then(function(data) {
          var fname = 'results/dev' + link.title.replace(/\s/g, '') + '.2.png';
          fs.writeFile(fname, data.replace(/^data:image\/png;base64,/,''), 'base64', function(err) {
            if(err) throw err;
          });
        })

        // look for test text in the text of the main part of the page
        .elementByCss(link.asyncPanelSelector)
        .text()
        .should.eventually.contain(link.expectedText)

        .nodeify(done);
    });
  });
});
