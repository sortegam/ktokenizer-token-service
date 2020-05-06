const inquirer = require('inquirer');
const colors = require('colors');
const utils = require('../utils');
const fs = require('fs');

const availableStages = utils.getAvailableStages();

if (!availableStages || availableStages.length === 0) {
  console.log('----------------------------------------------------------------------'.red);
  console.log('No stages available, to create a new stage run > '.red + 'npm run stages'.cyan.bold);
  console.log('----------------------------------------------------------------------'.red);
  process.exit(1);
}

const QUESTIONS = {
  cloneStage: {
    type: 'list',
    name: 'Source Stage Name',
    choices: availableStages,
  },
  newStage: {
    type: 'text',
    name: 'New Stage Name',
  },
};

console.log('------------------------------------------------------------------------------------');
console.log('  Creating STAGE from other STAGE...');
console.log('------------------------------------------------------------------------------------');
console.log('');

const run = async () => {
  const cloneAnswer = await inquirer.prompt([QUESTIONS.cloneStage]);
  const selectedStage = cloneAnswer[QUESTIONS.cloneStage.name];
  let newStage;
  do {
    const newStageAnswer = await inquirer.prompt([QUESTIONS.newStage]);
    newStage = newStageAnswer[QUESTIONS.newStage.name];
    if (availableStages.includes(newStage)) {
      console.log(`The STAGE ${newStage} already exists, please choose another STAGE name...`.red);
    }
  } while (availableStages.includes(newStage));
  console.log(`Creating STAGE ${newStage} from ${selectedStage}...`.yellow);
  fs.copyFileSync(`.env-${selectedStage}`, `.env-${newStage}`);
  utils.setVarInEnvFile(`.env-${newStage}`, 'KTOKENIZER_STAGE', newStage);
  console.log(`STAGE ${newStage} has been created!`.green);
};

run();
