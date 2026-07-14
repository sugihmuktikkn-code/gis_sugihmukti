const fs = require('fs');
const path = 'src/data.ts';
let data = fs.readFileSync(path, 'utf8');
data = data.replace(/contact:\s*'[^']+'/g, "contact: '62895320695308'");
fs.writeFileSync(path, data);
