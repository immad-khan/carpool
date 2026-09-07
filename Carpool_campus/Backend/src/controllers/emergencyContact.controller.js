const { success, noContent } = require('../utils/apiResponse');
const { id, emergencyContacts } = require('../mock/store');

async function list(req, res) {
  const myContacts = [...emergencyContacts.values()].filter(c => c.userId === req.user._id);
  return success(res, { data: myContacts });
}

async function create(req, res) {
  const { name, phone, relation } = req.body;
  const contactId = id();
  const contact = { id: contactId, userId: req.user._id, name, phone, relation };
  emergencyContacts.set(contactId, contact);
  return success(res, { statusCode: 201, data: contact });
}

async function update(req, res) {
  const contact = emergencyContacts.get(req.params.contactId);
  if (!contact) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } });
  Object.assign(contact, req.body);
  return success(res, { data: contact });
}

async function remove(req, res) {
  emergencyContacts.delete(req.params.contactId);
  return noContent(res);
}

module.exports = { list, create, update, remove };
