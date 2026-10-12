import { spawn } from 'node:child_process';

const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Run this script through npm run verify.');
const outcomes = [];
for (const script of ['doctor', 'lint', 'build', 'test:unit', 'test:integration', 'test:reader', 'test:export']) {
  console.log(`\nRunning npm run ${script}`);
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [npmCli, 'run', script], { stdio: 'inherit', shell: false });
    child.once('error', reject);
    child.once('exit', (value) => resolve(value ?? 1));
  });
  outcomes.push({ script, code });
}
console.table(outcomes);
if (outcomes.some(outcome => outcome.code !== 0)) {
  console.error('Verification is incomplete: at least one command failed or could not run. See its output above. Visual owner review remains a separate gate.');
  process.exitCode = 1;
} else console.log('All automated verification commands passed. Visual owner review remains a separate gate.');
