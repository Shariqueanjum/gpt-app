const pool = require('../config/db');

const findActiveOfferWalls = async () => {
  const res = await pool.query(
    `SELECT id, name, internal_id, type, endpoint_url, iframe_url, 
            commission_rate, is_active, hash_key, callback_config
     FROM offer_walls 
     WHERE is_active = true 
     ORDER BY id`
  );
  return res.rows;
};

const findAllOfferWalls = async () => {
  const res = await pool.query(
    `SELECT id, name, internal_id, type, endpoint_url, iframe_url,
            hash_algorithm, commission_rate, is_active, hash_key, callback_config,
            created_at, updated_at
     FROM offer_walls
     ORDER BY id`
  );
  return res.rows;
};

const findByInternalId = async (internalId) => {
  const res = await pool.query(
    `SELECT id, name, internal_id, type, endpoint_url, iframe_url,
            commission_rate, is_active, hash_key, callback_config
     FROM offer_walls 
     WHERE internal_id = $1 AND is_active = true`,
    [internalId]
  );
  return res.rows[0];
};

const findById = async (id) => {
  const res = await pool.query(
    `SELECT id, name, internal_id, type, endpoint_url, iframe_url,
            commission_rate, is_active, hash_key, callback_config
     FROM offer_walls 
     WHERE id = $1 AND is_active = true`,
    [id]
  );
  return res.rows[0];
};

const findByIdAdmin = async (id) => {
  const res = await pool.query(
    `SELECT id, name, internal_id, type, endpoint_url, iframe_url,
            hash_algorithm, commission_rate, is_active, hash_key, callback_config,
            created_at, updated_at
     FROM offer_walls
     WHERE id = $1`,
    [id]
  );
  return res.rows[0];
};

// --- Write -----

const createOfferWall = async ({
  name, internal_id, type, endpoint_url, iframe_url,
  hash_algorithm, hash_key, commission_rate, callback_config,
}) => {
  const res = await pool.query(
    `INSERT INTO offer_walls
       (name, internal_id, type, endpoint_url, iframe_url,
        hash_algorithm, hash_key, commission_rate, callback_config, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
     RETURNING *`,
    [
      name, internal_id, type,
      endpoint_url || null,
      iframe_url   || null,
      hash_algorithm || null,
      hash_key       || null,
      commission_rate,
      JSON.stringify(callback_config || {}),
    ]
  );
  return res.rows[0];
};

const updateOfferWall = async (id, fields) => {
  const {
    name, internal_id, type, endpoint_url, iframe_url,
    hash_algorithm, hash_key, commission_rate, callback_config, is_active,
  } = fields;

  const res = await pool.query(
    `UPDATE offer_walls SET
       name            = COALESCE($1,  name),
       internal_id     = COALESCE($2,  internal_id),
       type            = COALESCE($3,  type),
       endpoint_url    = COALESCE($4,  endpoint_url),
       iframe_url      = COALESCE($5,  iframe_url),
       hash_algorithm  = COALESCE($6,  hash_algorithm),
       hash_key        = COALESCE($7,  hash_key),
       commission_rate = COALESCE($8,  commission_rate),
       callback_config = COALESCE($9,  callback_config),
       is_active       = COALESCE($10, is_active),
       updated_at      = NOW()
     WHERE id = $11
     RETURNING *`,
    [
      name         || null,
      internal_id  || null,
      type         || null,
      endpoint_url !== undefined ? endpoint_url : null,
      iframe_url   !== undefined ? iframe_url   : null,
      hash_algorithm !== undefined ? hash_algorithm : null,
      hash_key       !== undefined ? hash_key       : null,
      commission_rate !== undefined ? commission_rate : null,
      callback_config !== undefined ? JSON.stringify(callback_config) : null,
      is_active   !== undefined ? is_active : null,
      id,
    ]
  );
  return res.rows[0];
};

const toggleOfferWall = async (id, is_active) => {
  const res = await pool.query(
    `UPDATE offer_walls SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [is_active, id]
  );
  return res.rows[0];
};


const seedOfferWalls = async () => {
  const walls = [
    {
      name: 'Toluna',
      internal_id: 'toluna',
      type: 'api',
      endpoint_url: 'https://api.toluna.com/surveys',
      iframe_url: null,
      commission_rate: 20,
      hash_key: null,
      callback_config: JSON.stringify({
        s2s: {
          transaction_id_field: 'transaction_id',
          status_field: 'status',
          payout_field: 'payout',
          status_map: { completed: 'success', rejected: 'failed' }
        },
        browser: {
          transaction_id_field: 'transaction_id',
          payout_field: 'payout',
          signature_field: 'hash',
          hash_fields: ['transaction_id', 'payout', 'status']
        }
      })
    },
    {
      name: 'Dynata',
      internal_id: 'dynata',
      type: 'router',
      endpoint_url: 'https://dynata.com/go',
      iframe_url: null,
      commission_rate: 20,
      hash_key: null,
      callback_config: JSON.stringify({
        s2s: {
          transaction_id_field: 'tx_id',
          status_field: 'state',
          payout_field: 'reward',
          status_map: { '1': 'success', '0': 'failed', '2': 'quota_full' }
        },
        browser: {
          transaction_id_field: 'txn',
          payout_field: 'reward',
          signature_field: 'sig',
          hash_fields: ['txn', 'reward']
        }
      })
    },
    {
      name: 'Pollfish',
      internal_id: 'pollfish',
      type: 'iframe',
      endpoint_url: null,
      iframe_url: 'https://pollfish.com/iframe',
      commission_rate: 20,
      hash_key: null,
      callback_config: JSON.stringify({
        s2s: {
          transaction_id_field: 'transaction_id',
          status_field: 'status',
          payout_field: 'cpa',
          status_map: { completed: 'success', reversed: 'failed' }
        },
        browser: {
          transaction_id_field: 'transaction_id',
          payout_field: 'amount',
          signature_field: 'signature',
          hash_fields: ['transaction_id', 'amount']
        }
      })
    },
    {
      name: 'CPX Research',
      internal_id: 'cpx_research',
      type: 'router',
      endpoint_url: 'https://cpxresearch.com/go',
      iframe_url: null,
      commission_rate: 20,
      hash_key: null,
      callback_config: JSON.stringify({
        s2s: {
          transaction_id_field: 'transaction_id',    // CPX's external ID
          sub_id_field: 'sub_id',                     // Echoes YOUR internal TXN-ABD-001
          status_field: 'status',
          payout_field: 'payout',
          status_map: { completed: 'success', rejected: 'failed' }
        },
        browser: {
          transaction_id_field: 'transaction_id',
          sub_id_field: 'sub_id',
          payout_field: 'payout',
          signature_field: 'hash',
          hash_fields: ['transaction_id', 'payout', 'status']
        }
      })
    }
  ];

  for (const wall of walls) {
    await pool.query(
      `INSERT INTO offer_walls (name, internal_id, type, endpoint_url, iframe_url, commission_rate, hash_key, callback_config)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (internal_id) DO NOTHING`,
      [wall.name, wall.internal_id, wall.type, wall.endpoint_url, wall.iframe_url, wall.commission_rate, wall.hash_key, wall.callback_config]
    );
  }
};

module.exports = {
  findActiveOfferWalls,
  findAllOfferWalls,
  findByInternalId,
  findById,
  findByIdAdmin,
  createOfferWall,
  updateOfferWall,
  toggleOfferWall,
  seedOfferWalls
};