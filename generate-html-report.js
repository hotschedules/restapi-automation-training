const fs = require('fs');

const rootFolder = process.cwd();
const deaultFilePath = `${rootFolder}/html-report.html`;


const htmlHead = '<head><style>table { border-collapse: collapse; font-family: "Times New Roman", Times, serif}table thead {background-color: #2e6c80}table thead tr td span {color: #ffffff; font-weight: bold}table tbody {background-color: #FBFAB3;}table tbody td {color: #0000ff}table tr td {border: 1px solid #000; }</style></head>';
const htmlFooter = '<p><span style="color: #008080;"><strong>Google sheet report:</strong></span>&nbsp;<span style="color: #0000ff;"><a href="https://docs.google.com/spreadsheets/d/1W9R7RSd2ozO3OPrk63D-CgECJV-4LKEszwiW4LLxfAk/edit#gid=1578462828">https://docs.google.com/spreadsheets/d/1W9R7RSd2ozO3OPrk63D-CgECJV-4LKEszwiW4LLxfAk/edit#gid=1578462828</a></span></p><p><span style="color: #0000ff;"><span style="color: #339966;"><strong>qTest:</strong></span>&nbsp;<a href="https://hotschedules.qtestnet.com//p/41560/portal/project#tab=testexecution&amp;object=2&amp;id=1817510">https://hotschedules.qtestnet.com//p/41560/portal/project#tab=testexecution&amp;object=2&amp;id=1817510</a></span></p><p>&nbsp;</p>';
const passedCell = '<td><span style="background-color: #00ff00;">Passed</span>';
const failedCell = '<td><span style="background-color: #ff0000;">Failed</span></td>';

class HTMLReport {
  constructor(title, googleUrl, qTestUrl) {
    this.tbody = '';
    this.title = title;
    this.googleUrl = googleUrl;
    this.qTestUrl = qTestUrl;
  }

  generateTestCaseCell(name) {
    return `<td><span>${name}</span></td>`;
  }

  generateResultCell(result) {
    if (result.toLowerCase() === 'passed') {
      return passedCell;
    }
    return failedCell;
  }

  generateTableHead() {
    return '<thead><tr><td><span>Test case</span></td><td><span >Result</span></td></tr></thead>';
  }

  generateTableBody() {
    return `<tbody>${this.tbody}</tbody>`;
  }

  generateTable() {
    const head = this.generateTableHead();
    const body = this.generateTableBody();
    return `<table>${head}${body}</table>`;
  }

  async addRow(testcase, result) {
    const row = `<tr>${this.generateTestCaseCell(testcase)}${this.generateResultCell(result)}</tr>`;
    this.tbody += row;
  }

  generateHtmlHead() {
    return htmlHead;
  }

  generateHtmlFooter() {
    const footer = `${'<p>' +
        '<span style="color: #008080;"><strong>Google sheet report:</strong></span>&nbsp;<span style="color: #0000ff;">' +
        '<a href="'}${
        this.googleUrl
        }">Click here.</a></span>` +
        '</p>' +
        '<p>' +
        '<span style="color: #0000ff;"><span style="color: #339966;"><strong>qTest:</strong></span>' +
        `<a href="${
        this.qTestUrl
        }">Click here.</a>` +
        '</span>' +
        '</p>';

    return footer;
  }

  generateHtmlBodyTile() {
    return `<h2 style=\"color: #2e6c80;\">${this.title}</h2>`;
  }

  generateHtmlBody() {
    const title = this.generateHtmlBodyTile();
    const table = this.generateTable();
    const footer = this.generateHtmlFooter();
    const htmlBody = `${title}${table}${footer}`;
    return `<body>${htmlBody}</body>`;
  }

  generateHtmlString() {
    const head = this.generateHtmlHead();
    const body = this.generateHtmlBody();
    const data = `<html>${head}${body}</html>`;
    return data;
  }

  async saveFile(filePath = deaultFilePath) {
    const data = this.generateHtmlString();
    fs.writeFileSync(`${filePath}`, data);
    console.info(`Complete save html report file to file path: ${filePath}`);
  }
}

module.exports = HTMLReport;

