const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openDatabase } = require('../src/data/db');
const { createData } = require('../src/data');
const { createLabsService } = require('../src/services/labs');

const student = { id: 1, email: 'ana@demo.test', name: 'Ана', role: 'student' };

function setup() {
  const data = createData(openDatabase(':memory:'));
  return { data, service: createLabsService({ labs: data.labs }) };
}

test('listing the labs needs a signed-in user', () => {
  const { service } = setup();
  assert.throws(() => service.listLabs(null), (error) => error.code === 'unauthenticated');
  assert.throws(() => service.listLabs(undefined), (error) => error.code === 'unauthenticated');
});

test('a signed-in user sees every lab with its number of workstations, in name order', () => {
  const { data, service } = setup();
  const b = data.labs.create('Б лаборатория');
  const a = data.labs.create('А лаборатория');
  data.labs.addWorkstation(a, 'PC-01');
  data.labs.addWorkstation(a, 'PC-02');
  data.labs.addWorkstation(b, 'PC-01');
  assert.deepEqual(service.listLabs(student), [
    { id: a, name: 'А лаборатория', workstations: 2 },
    { id: b, name: 'Б лаборатория', workstations: 1 },
  ]);
});

test('a lab with no workstations is listed with 0, and no labs is an empty list', () => {
  const { data, service } = setup();
  assert.deepEqual(service.listLabs(student), []);
  data.labs.create('Празна');
  assert.equal(service.listLabs(student)[0].workstations, 0);
});
