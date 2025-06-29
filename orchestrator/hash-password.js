const bcrypt = require('bcrypt');
const password = process.argv[2];

if (!password) {
  console.error('Usage: node hash-password.js <password_to_hash>');
  process.exit(1);
}

const saltRounds = 12;
bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log(hash);
});