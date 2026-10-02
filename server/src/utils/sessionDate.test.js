import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextSunday } from './sessionDate.js';

test('from a Wednesday returns the coming Sunday', () => {
  const wed = new Date(2024, 0, 3); // 2024-01-03 is a Wednesday
  const result = nextSunday(wed);
  assert.equal(result.getDay(), 0, 'result must be a Sunday');
  assert.equal(result.getFullYear(), 2024);
  assert.equal(result.getMonth(), 0);
  assert.equal(result.getDate(), 7); // 2024-01-07
});

test('from a Saturday returns the very next day (Sunday)', () => {
  const sat = new Date(2024, 0, 6); // 2024-01-06 is a Saturday
  const result = nextSunday(sat);
  assert.equal(result.getDay(), 0);
  assert.equal(result.getDate(), 7); // 2024-01-07
});

test('from a Sunday returns the following Sunday (strictly future)', () => {
  const sun = new Date(2024, 0, 7); // 2024-01-07 is a Sunday
  const result = nextSunday(sun);
  assert.equal(result.getDay(), 0);
  assert.equal(result.getDate(), 14); // 2024-01-14
});

test('result is always a Sunday for every day of a week', () => {
  for (let i = 8; i <= 14; i++) {
    const result = nextSunday(new Date(2024, 0, i));
    assert.equal(result.getDay(), 0, `day ${i} should map to a Sunday`);
    assert.ok(result > new Date(2024, 0, i), 'result must be strictly in the future');
  }
});
