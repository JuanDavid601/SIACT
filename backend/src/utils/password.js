const bcrypt = require("bcryptjs");

const COSTO = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, COSTO);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
