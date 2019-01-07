const fs = require('fs');
const path = require('path');
const moment = require('moment');

const fileLogger = (folderName, fileContent) => {

  let loggerDirectory = path.join(__dirname) + '/logFiles';
  let subLoggerDirectory = loggerDirectory + '/' + folderName;
  let fileName = moment(new Date()).format('DD-MM-YYYY') + '.txt';
  let logDate = moment().utc(new Date()).format('DD-MM-YYYY HH:mm:ss');

  fileContent = logDate + ' ' + fileContent

  if (fs.existsSync(loggerDirectory)) {
    if (fs.existsSync(subLoggerDirectory)) {
        fs.appendFileSync(subLoggerDirectory + '/' + fileName, fileContent + "\n");
    } else {
      fs.mkdirSync(path.join(__dirname, 'logFiles' + '/' + folderName));
      fs.writeFile(subLoggerDirectory + '/' + fileName, fileContent + '\n', (err) => {
        if (err) throw err;
      });
    }
  } else {
    fs.mkdirSync(path.join(__dirname, 'logFiles'));
    fs.mkdirSync(path.join(__dirname, 'logFiles' + '/' + folderName));
    fs.writeFile(subLoggerDirectory + '/' + fileName, fileContent + '\n', (err) => {
      if (err) throw err;
    });
  }
};


exports.fileLogger = fileLogger;
