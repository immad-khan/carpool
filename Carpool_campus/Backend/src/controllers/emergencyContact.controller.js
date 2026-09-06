const EmergencyContact = require('../models/EmergencyContact');
const ApiError = require('../utils/ApiError');
const { success, noContent } = require('../utils/apiResponse');

// GET /emergency-contacts
async function list(req, res) {
  const contacts = await EmergencyContact.find({ userId: req.user._id }).sort('-createdAt');
  return success(res, { data: contacts.map((c) => c.toPublicJSON()) });
}

// POST /emergency-contacts
async function create(req, res) {
  const { name, phone } = req.body;
  const contact = await EmergencyContact.create({ userId: req.user._id, name, phone });
  return success(res, { statusCode: 201, data: contact.toPublicJSON() });
}

async function findOwned(contactId, userId) {
  const contact = await EmergencyContact.findById(contactId);
  if (!contact) throw ApiError.notFound('Emergency contact not found');
  if (contact.userId.toString() !== userId.toString()) throw ApiError.forbidden('Not the owner');
  return contact;
}

// PATCH /emergency-contacts/:contactId
async function update(req, res) {
  const contact = await findOwned(req.params.contactId, req.user._id);

  const { name, phone } = req.body;
  if (name !== undefined) contact.name = name;
  if (phone !== undefined) contact.phone = phone;
  await contact.save();

  return success(res, { data: contact.toPublicJSON() });
}

// DELETE /emergency-contacts/:contactId
async function remove(req, res) {
  const contact = await findOwned(req.params.contactId, req.user._id);
  await contact.deleteOne();
  return noContent(res);
}

module.exports = { list, create, update, remove };
