const inquirer = require('inquirer');
const colors = require('colors');
const utils = require('../utils');

const CHOICES = {
  NEW_SCRATCH: 'Create new STAGE from scratch...',
  NEW_FROM_STAGE: 'Create new STAGE from other STAGE...',
};

const menuSelection = {
  type: 'list',
  name: 'Select an option',
  choices: Object.values(CHOICES),
};

console.log('------------------------------------------------------------------------------------');
console.log('  Stages Script');
console.log('------------------------------------------------------------------------------------');
console.log('');

inquirer.prompt([menuSelection]).then((answers) => {
  switch (answers[menuSelection.name]) {
    case CHOICES.NEW_FROM_STAGE:
      require('./createStageFromStage');
      break;
    case CHOICES.NEW_SCRATCH:
      require('./createStageScratch');
      break;
    default:
      console.log('Incorrect option selected.');
      process.exit(0);
  }
});
