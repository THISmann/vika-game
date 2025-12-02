module.exports.generateToken = (role) => {
  return Buffer.from(`${role}-${Date.now()}`).toString("base64");
};