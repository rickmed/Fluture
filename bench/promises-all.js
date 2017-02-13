const benchmark = require('benchmark');
const DataTask = require('data.task');
const Fluture = require('..');
const FunTask = require('fun-task');
const BBPromise = require('bluebird');

const suite = new benchmark.Suite();

const noop = () => {};
const add1 = x => x + 1;

suite.add('Fluture', {
  defer: true,
  fn(def){
    Fluture((rej, res) => res(1))
    .map(add1)
    .chain(x => Fluture.of(add1(x)))
    .fork(noop, () => def.resolve());
  }
});

suite.add('data.task', {
  defer: true,
  fn(def){
    new DataTask((rej, res) => res(1))
    .map(add1)
    .chain(x => DataTask.of(add1(x)))
    .fork(noop, () => def.resolve());
  }
});

suite.add('FunTask', {
  defer: true,
  fn(def){
    FunTask.create(res => res(1))
    .map(add1)
    .chain(x => FunTask.of(add1(x)))
    .run({success: () => def.resolve()});
  }
});

suite.add('Bluebird Promise', {
  defer: true,
  fn(def){
    new BBPromise(res => res(1))
    .then(add1)
    .then(x => BBPromise.resolve(add1(x)))
    .then(() => def.resolve(), noop);
  }
});

suite.add('Native Promise', {
  defer: true,
  fn(def){
    new Promise(res => res(1))
    .then(add1)
    .then(x => Promise.resolve(add1(x)))
    .then(() => def.resolve(), noop);
  }
});

suite.on('complete', require('./_print'));
suite.run();
