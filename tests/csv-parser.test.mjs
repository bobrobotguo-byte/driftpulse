import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBrokerCSV } from '../web/js/csv-parser.js';

test('parseBrokerCSV parses English and Chinese headers', () => {
  const csv = [
    '账户,账户类型,代码,持仓数量,现价',
    'IBKR,Taxable,VOO,12,540',
    'Schwab,Roth IRA,BND,50,73',
    'Total,,CASH,0,1'
  ].join('\n');

  const { holdings, warnings } = parseBrokerCSV(csv);
  assert.equal(holdings.length, 2);
  assert.equal(holdings[0].ticker, 'VOO');
  assert.equal(holdings[0].accountType, 'Taxable');
  assert.equal(holdings[1].accountType, 'Tax-Advantaged');
  assert.equal(warnings.length, 1);
});
