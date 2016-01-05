import nock from 'nock';

export function mockNodeIsOnline (url) {
  nock(url)
    .get('/')
    .reply(200);
}


const origConsole = console.log;
export function consoleMock (fn) {
  let count = 0;
  return function (...args) {
    if (count > 0) {
      origConsole.apply(origConsole, args);
      console.log = origConsole;
      return;
    }

    count += 1;
    args.push(origConsole);
    fn.apply(fn, args);
    console.log = origConsole;
  };
}
