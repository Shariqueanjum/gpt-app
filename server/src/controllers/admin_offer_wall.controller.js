const {
  findAllOfferWalls,
  findByIdAdmin,
  createOfferWall,
  updateOfferWall,
  toggleOfferWall,
} = require('../repositories/offer_wall.repository');
const { buildEntryUrl } = require('../services/survey_click.service');

/** GET /api/admin/offer-walls */
const listAll = async (req, res, next) => {
  try {
    const walls = await findAllOfferWalls();
    res.json({ success: true, data: walls });
  } catch (err) { next(err); }
};

/** GET /api/admin/offer-walls/:id */
const getOne = async (req, res, next) => {
  try {
    const wall = await findByIdAdmin(req.params.id);
    if (!wall) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: wall });
  } catch (err) { next(err); }
};

/** POST /api/admin/offer-walls */
const create = async (req, res, next) => {
  try {
    const wall = await createOfferWall(req.body);
    res.status(201).json({ success: true, data: wall });
  } catch (err) { next(err); }
};

/** PUT /api/admin/offer-walls/:id */
const update = async (req, res, next) => {
  try {
    const wall = await updateOfferWall(req.params.id, req.body);
    if (!wall) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: wall });
  } catch (err) { next(err); }
};

/** PATCH /api/admin/offer-walls/:id/toggle */
const toggle = async (req, res, next) => {
  try {
    const existing = await findByIdAdmin(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    const wall = await toggleOfferWall(req.params.id, !existing.is_active);
    res.json({ success: true, data: wall });
  } catch (err) { next(err); }
};

/**
 * POST /api/admin/offer-walls/:id/preview-url
 * Body: { base_url, mock_user (optional) }
 * Returns what the entry URL would look like for a given user shape.
 */
const previewUrl = async (req, res, next) => {
  try {
    const wall = await findByIdAdmin(req.params.id);
    if (!wall) return res.status(404).json({ success: false, message: 'Not found' });

    const mockUser = req.body.mock_user || {
      public_id: 'USR-PREVIEW-001',
      username:  'preview_user',
      email:     'preview@example.com',
      country:   'IN',
      gender:    'male',
      dob:       '1995-06-15',
      full_name: 'Preview User',
      phone:     '+91-9999999999',
      referral_code: 'REF123',
      level_id:  3,
    };

    const baseUrl = req.body.base_url ||
      (wall.type === 'iframe' ? wall.iframe_url : wall.endpoint_url) || '';

    const mockTxnId = 'TXN-USR-PREVIEW-001-TEST';
    const previewUrl = buildEntryUrl(baseUrl, mockUser, mockTxnId, wall.callback_config || {});

    res.json({
      success: true,
      data: {
        preview_url: previewUrl,
        mock_user: mockUser,
        mock_transaction_id: mockTxnId,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { listAll, getOne, create, update, toggle, previewUrl };
