const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function line(id, name, hsn, gstRate, price, qty = 1) {
  return { id, name, sku: `SKU-${id}`, hsn, gstRate, price, qty };
}

function order(id, coupon, items) {
  return { id, coupon, items };
}

test('CURRENT BEHAVIOUR: order #1001 without coupon invoices 5% and 12% items', () => {
  const o = order(1001, '', [
    line(1, 'Rice', '1006', 5, 500),
    line(2, 'Ghee', '0405', 12, 110)
  ]);
  const checkout = pricing.computeTotals(o.items, o.coupon);
  const figures = invoice.computeInvoiceFigures(o);

  assert.deepStrictEqual(figures, {
    subtotal: 610,
    discount: 0,
    tax: 38.2,
    cgst: 19.1,
    sgst: 19.1,
    total: 648.2,
    rows: [
      { name: 'Rice', sku: 'SKU-1', hsn: '1006', qty: 1, price: 500, gstPercent: 5, line: 500, lineTax: 25 },
      { name: 'Ghee', sku: 'SKU-2', hsn: '0405', qty: 1, price: 110, gstPercent: 12, line: 110, lineTax: 13.2 }
    ]
  });
  assert.deepStrictEqual({ subtotal: checkout.subtotal, discount: checkout.discount, tax: checkout.tax, total: checkout.total },
    { subtotal: 610, discount: 0, tax: 38.2, total: 648.2 });
});

test('order #1002 SAVE10 invoice matches checkout discount and GST', () => {
  const o = order(1002, 'SAVE10', [
    line(1, 'Rice', '1006', 5, 640),
    line(2, 'Ghee', '0405', 12, 380)
  ]);
  const checkout = pricing.computeTotals(o.items, o.coupon);
  const figures = invoice.computeInvoiceFigures(o);

  assert.deepStrictEqual(figures, {
    subtotal: 1020,
    discount: 102,
    tax: 69.84,
    cgst: 34.92,
    sgst: 34.92,
    total: 987.84,
    rows: [
      { name: 'Rice', sku: 'SKU-1', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 },
      { name: 'Ghee', sku: 'SKU-2', hsn: '0405', qty: 1, price: 380, gstPercent: 12, line: 380, lineTax: 41.04 }
    ]
  });
  assert.deepStrictEqual({ subtotal: checkout.subtotal, discount: checkout.discount, tax: checkout.tax, total: checkout.total },
    { subtotal: 1020, discount: 102, tax: 69.84, total: 987.84 });
});

test('order #1004 SAVE10 invoice applies the checkout cap and slab GST', () => {
  const o = order(1004, 'SAVE10', [
    line(1, 'Rice', '1006', 5, 1120),
    line(2, 'Ghee', '0405', 12, 1120)
  ]);
  const checkout = pricing.computeTotals(o.items, o.coupon);
  const figures = invoice.computeInvoiceFigures(o);

  assert.deepStrictEqual(figures, {
    subtotal: 2240,
    discount: 150,
    tax: 177.65,
    cgst: 88.83,
    sgst: 88.82,
    total: 2267.65,
    rows: [
      { name: 'Rice', sku: 'SKU-1', hsn: '1006', qty: 1, price: 1120, gstPercent: 5, line: 1120, lineTax: 52.25 },
      { name: 'Ghee', sku: 'SKU-2', hsn: '0405', qty: 1, price: 1120, gstPercent: 12, line: 1120, lineTax: 125.4 }
    ]
  });
  assert.deepStrictEqual({ subtotal: checkout.subtotal, discount: checkout.discount, tax: checkout.tax, total: checkout.total },
    { subtotal: 2240, discount: 150, tax: 177.65, total: 2267.65 });
});

test('CURRENT BEHAVIOUR: order #1008 without coupon invoices all 18% items', () => {
  const o = order(1008, '', [
    line(1, 'Packaged Tea', '0902', 18, 300),
    line(2, 'Syrup', '2106', 18, 200)
  ]);
  const checkout = pricing.computeTotals(o.items, o.coupon);
  const figures = invoice.computeInvoiceFigures(o);

  assert.deepStrictEqual(figures, {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    rows: [
      { name: 'Packaged Tea', sku: 'SKU-1', hsn: '0902', qty: 1, price: 300, gstPercent: 18, line: 300, lineTax: 54 },
      { name: 'Syrup', sku: 'SKU-2', hsn: '2106', qty: 1, price: 200, gstPercent: 18, line: 200, lineTax: 36 }
    ]
  });
  assert.deepStrictEqual({ subtotal: checkout.subtotal, discount: checkout.discount, tax: checkout.tax, total: checkout.total },
    { subtotal: 500, discount: 0, tax: 90, total: 590 });
});

test('invoice #1004 matches checkout GST slabs and capped coupon figures', () => {
  const o = order(1004, 'SAVE10', [
    line(1, 'Rice', '1006', 5, 1120),
    line(2, 'Ghee', '0405', 12, 1120)
  ]);
  const checkout = pricing.computeTotals(o.items, o.coupon);
  const figures = invoice.computeInvoiceFigures(o);

  assert.deepStrictEqual({
    subtotal: figures.subtotal,
    discount: figures.discount,
    tax: figures.tax,
    cgst: figures.cgst,
    sgst: figures.sgst,
    total: figures.total
  }, {
    subtotal: checkout.subtotal,
    discount: checkout.discount,
    tax: checkout.tax,
    cgst: checkout.cgst,
    sgst: checkout.sgst,
    total: checkout.total
  });
  assert.deepStrictEqual({
    subtotal: figures.subtotal,
    discount: figures.discount,
    tax: figures.tax,
    cgst: figures.cgst,
    sgst: figures.sgst,
    total: figures.total,
    rows: figures.rows.map(row => ({ gstPercent: row.gstPercent, lineTax: row.lineTax }))
  }, {
    subtotal: 2240,
    discount: 150,
    tax: 177.65,
    cgst: 88.83,
    sgst: 88.82,
    total: 2267.65,
    rows: [
      { gstPercent: 5, lineTax: 52.25 },
      { gstPercent: 12, lineTax: 125.4 }
    ]
  });
});
