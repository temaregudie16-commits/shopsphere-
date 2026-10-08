const bcrypt = require("bcryptjs");

const password = "Temare@2026Shop";

bcrypt.hash(password, 10).then((hash) => {
  console.log(hash);
});
