const createPrices = () => {
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
    'UOM',
    'Price Unit',
  ];
  obj.data = [];
  
  for (let i=0; i < 20; i++) {
    let material = Array(7).fill(0).map(x => Math.random().toString(36).charAt(2)).join('').toUpperCase(); // Random 7 character alphanumeric string
    let basePrice = Math.random() * (1000 - 50) + 50; // Random number between 50 and 1000
    
    let row = [
      material,
      1,
      (basePrice).toFixed(2),
      100,
      (basePrice * .9).toFixed(2),
      250,
      (basePrice * .85).toFixed(2),
      500,
      (basePrice * .75).toFixed(2),
      'FT',
      '1000',
    ];
  
    obj.data.push(row);
  }

  return obj;
}

module.exports = createPrices;
