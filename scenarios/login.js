const { execute, login, loginspecific } = require('../core');
const { loginBackEnd } = require('../core');
const colors = require('colors/safe');

describe('Login to Back end', () => {
  it('Start Login', async () => {
    let count = 10;
    let n = 1;
    while (count > 0) {
      try {
        //const id_token = await loginBackEnd('qa', 'admin__kms_qa_auto2', 'admin__kms_qa_auto2');
        //console.log(`${colors.red('id_token')} ${colors.green(id_token)}`);
        await login();
        break;
      } catch (error) {
        console.log(colors.red(`Login Failed at time: ${n}`));
        n += 1;
        count -= 1;
      }
    }
  });
});