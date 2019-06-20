// BOILER PLATE
const papa = require('papaparse');

let obj = {};
obj.fields = [
  'Material',
  'Qty', 
  'Base Price',
  'Qty 1',
  'Price 1',
  'Qty 2',
  'Price 2',
  'Qty 3',
  'Price 3',
];
obj.data = [];

for (let i=0; i < 20; i++) {
  let material = Array(7).fill(0).map(x => Math.random().toString(36).charAt(2)).join('').toUpperCase();

  let basePrice = Math.random() * (1000 - 50) + 50;

  let row = [
    material,
    1,
    (basePrice).toFixed(2),
    100,
    (basePrice * 1.1).toFixed(2),
    250,
    (basePrice * 1.13).toFixed(2),
    500,
    (basePrice * 1.15).toFixed(2),
  ];

  obj.data.push(row);
}

console.log(obj);

let csv = papa.unparse(obj, { header: true });

console.log(csv);
