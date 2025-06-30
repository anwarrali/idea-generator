const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('✅ Server works!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
