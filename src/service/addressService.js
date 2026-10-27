const Address = require("../models/address");
const sequelize = require("../config/dbConnect");
const fields = ["name", "phone", "addressLine1", "addressLine2", "city", "state", "postalCode", "country", "isDefault"];
function normalize(data) {
  return {
    ...data,
    addressLine1: data.addressLine1 ?? data.address_line1,
    addressLine2: data.addressLine2 ?? data.address_line2,
    postalCode: data.postalCode ?? data.postal_code,
    isDefault: data.isDefault ?? data.is_default,
  };
}
function validate(data) {
  for (const key of ["name", "phone", "addressLine1", "city", "state", "postalCode", "country"]) {
    if (!String(data[key] || "").trim()) throw new Error(`${key} is required`);
  }
}
async function create(userId, rawData) {
  const data = normalize(rawData);
  validate(data);
  return sequelize.transaction(async (transaction) => {
    const count = await Address.count({ where: { userId }, transaction });
    const isDefault = count === 0 || data.isDefault === true || data.isDefault === "true" || data.isDefault === "on";
    if (isDefault) await Address.update({ isDefault: false }, { where: { userId }, transaction });
    const payload = Object.fromEntries(fields.filter(k => data[k] !== undefined).map(k => [k, data[k]]));
    payload.isDefault = isDefault;
    return Address.create({ ...payload, userId }, { transaction });
  });
}
async function list(userId) { return Address.findAll({ where: { userId }, order: [["isDefault", "DESC"], ["createdAt", "DESC"]] }); }
async function update(userId, id, rawData) {
  const data = normalize(rawData);
  return sequelize.transaction(async (transaction) => {
    const address = await Address.findOne({ where: { id, userId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!address) throw new Error("Address not found");
    const payload = Object.fromEntries(fields.filter(k => data[k] !== undefined).map(k => [k, data[k]]));
    if (payload.isDefault === true || payload.isDefault === "true" || payload.isDefault === "on") {
      await Address.update({ isDefault: false }, { where: { userId }, transaction });
      payload.isDefault = true;
    }
    await address.update(payload, { transaction });
    return address;
  });
}
async function remove(userId, id) {
  return sequelize.transaction(async (transaction) => {
    const address = await Address.findOne({ where: { id, userId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!address) throw new Error("Address not found");
    await address.destroy({ transaction });
    if (address.isDefault) {
      const next = await Address.findOne({ where: { userId }, order: [["createdAt", "ASC"]], transaction });
      if (next) await next.update({ isDefault: true }, { transaction });
    }
    return true;
  });
}
module.exports = { create, list, update, remove };
