const inquirer = require('inquirer');
const colors = require('colors');
const childProcess = require('child_process');
const utils = require('./utils');

const availableStages = utils.getAvailableStages();

// This stages must be removed manually.
const NON_REMOVABLE_STAGES = ['stg', 'prod', 'production', 'staging'];

const stageQuestion = {
  type: 'text',
  name: 'Stage to remove deployment',
};

const confirmationQuestionByStage = stage => ({
  type: 'confirm',
  name: 'WARNING'.yellow + ` - Are you sure to remove deployed STAGE -> ${stage}`.red,
  default: false,
});

const confirmationUpdateRemoveDomain = () => ({
  type: 'confirm',
  name: 'WARNING'.yellow + ' - Do you want to update / remove sub-domain for this deploy?'.red,
  default: true,
});

console.log('------------------------------------------------------------------------------------');
console.log('  Deploy Removal Script');
console.log('------------------------------------------------------------------------------------');
console.log('');

const run = async () => {
  const stageAnswer = await inquirer.prompt([stageQuestion]);
  const selectedStage = stageAnswer[stageQuestion.name];
  if (NON_REMOVABLE_STAGES.includes(selectedStage)) {
    console.log(`The STAGE ${selectedStage} is blocked, this is a important STAGE, please remove manually from AWS`
      .red);
    process.exit(0);
  }
  const confirmationAnswer = await inquirer.prompt([confirmationQuestionByStage(selectedStage)]);
  const confirmationResult = confirmationAnswer[confirmationQuestionByStage(selectedStage).name];
  if (confirmationResult === true) {
    const confirmationAnswerDomain = await inquirer.prompt([confirmationUpdateRemoveDomain()]);
    const confirmationResultDomain =
      confirmationAnswerDomain[confirmationUpdateRemoveDomain().name];
    if (confirmationResultDomain === true) {
      console.log('Updating domain / subdomain in AWS Route53...'.yellow);
      const processSLSDeleteDomain = childProcess.spawn('sls', [
        'delete_domain',
        '--stage',
        selectedStage,
      ]);
      processSLSDeleteDomain.stdout.on('data', (chunk) => {
        console.log(chunk.toString('utf8').gray);
      });
    }
    console.log(`Removing Deploy STAGE ${selectedStage}...`.yellow);
    console.log('This process can take a while, please wait...'.yellow);
    const processSLSRemove = childProcess.spawn('sls', ['remove', '--stage', selectedStage]);
    processSLSRemove.stdout.on('data', (chunk) => {
      console.log(chunk.toString('utf8').gray);
    });
  } else {
    console.log('Deploy removal cancelled'.gray);
  }
};

run();
