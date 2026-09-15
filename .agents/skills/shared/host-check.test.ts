import {test, expect} from 'bun:test';
import {mkdtemp, writeFile, chmod, rm, readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

const helper = resolve(import.meta.dir, '../doublezero-status/scripts/check-doublezero-status.sh');
test('DoubleZero validates every alias before SSH and retains any host failure', async () => {
 const dir = await mkdtemp(join(tmpdir(),'dz-test-'));
 try {
  const log = join(dir,'calls');
  await writeFile(join(dir,'ssh'), '#!/bin/bash\nprintf "%s\\n" "$*" >> "$SSH_TEST_LOG"\nfor arg in "$@"; do if [ "$arg" = "badhost" ]; then exit 9; fi; done\nexit 0\n');
  await chmod(join(dir,'ssh'),0o700);
  const run = async (args:string[]) => {
   const proc = Bun.spawn(['bash',helper,...args],{env:{...process.env,PATH:`${dir}:${process.env.PATH}`,SSH_TEST_LOG:log},stdout:'pipe',stderr:'pipe'});
   await Promise.all([new Response(proc.stdout).text(),new Response(proc.stderr).text()]);
   return proc.exited;
  };
  expect(await run(['goodhost','-oProxyCommand=bad'])).toBe(2);
  expect(await Bun.file(log).exists()).toBe(false);
  expect(await run(['badhost','goodhost'])).toBe(1);
  const calls = await readFile(log,'utf8');
  expect(calls).toContain('BatchMode=yes');
  expect(calls).toContain('-- badhost');
  expect(calls).toContain('-- goodhost');
  expect(await run(['goodhost'])).toBe(0);
  expect(await run([])).toBe(2);
  expect(await run(['--help'])).toBe(0);
 } finally {await rm(dir,{recursive:true,force:true});}
});
