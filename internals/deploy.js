const inquirer = require('inquirer');
const colors = require('colors');
const childProcess = require('child_process');
const utils = require('./utils');

const availableStages = utils.getAvailableStages();

if (!availableStages || availableStages.length === 0) {
  console.log('----------------------------------------------------------------------'.red);
  console.log('No stages available, to create a new stage run > '.red + 'npm run stages'.cyan.bold);
  console.log('----------------------------------------------------------------------'.red);
  process.exit(1);
}

const stageQuestion = {
  type: 'list',
  name: 'Select an STAGE to deploy',
  choices: utils.getAvailableStages,
};

const confirmationQuestionByStage = stage => ({
  type: 'confirm',
  name: 'WARNING'.yellow + ` - Are you sure to deploy STAGE -> ${stage}`.red,
  default: false,
});

const confirmationUpdateCreateDomain = () => ({
  type: 'confirm',
  name: 'WARNING'.yellow + ' - Do you want to update / create sub-domain for this deploy?'.red,
  default: true,
});

console.log('------------------------------------------------------------------------------------');
console.log('  Deploy Script');
console.log('------------------------------------------------------------------------------------');
console.log('');
console.log(`To create more Stages just run > ${'npm run stages'.cyan.bold}`);
console.log('');

const run = async () => {
  const stageAnswer = await inquirer.prompt([stageQuestion]);
  const selectedStage = stageAnswer[stageQuestion.name];
  const confirmationAnswer = await inquirer.prompt([confirmationQuestionByStage(selectedStage)]);
  const confirmationResult = confirmationAnswer[confirmationQuestionByStage(selectedStage).name];
  if (confirmationResult === true) {
    const confirmationAnswerDomain = await inquirer.prompt([confirmationUpdateCreateDomain()]);
    const confirmationResultDomain =
      confirmationAnswerDomain[confirmationUpdateCreateDomain().name];
    if (confirmationResultDomain === true) {
      console.log('Updating domain / subdomain in AWS Route53...'.yellow);
      const processSLSCreateDomain = childProcess.spawn('sls', [
        'create_domain',
        '--stage',
        selectedStage,
      ]);
      processSLSCreateDomain.stdout.on('data', (chunk) => {
        console.log(chunk.toString('utf8').gray);
      });
    }
    console.log(`Deploying STAGE ${selectedStage}...`.yellow);
    console.log('This process can take a while, please wait...'.yellow);
    const processSLSDeploy = childProcess.spawn('sls', ['deploy', '--stage', selectedStage]);
    processSLSDeploy.stdout.on('data', (chunk) => {
      console.log(chunk.toString('utf8').gray);
    });
  } else {
    console.log('Deploy cancelled'.gray);
  }
};

run();
