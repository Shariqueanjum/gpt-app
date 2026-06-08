const pool = require('./db');

const createTables = async () => {
  try {
    console.log('Creating tables...');

    // 1. USERS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        public_id VARCHAR(20) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) ,
        country VARCHAR(100) ,
        phone VARCHAR(20),
        dob DATE,
        gender VARCHAR(10),
        address TEXT,
        paypal_email VARCHAR(100),
        bank_account VARCHAR(100),
        bank_ifsc VARCHAR(20),
        bank_name VARCHAR(100),
        upi_id VARCHAR(50),
        referral_code VARCHAR(50) UNIQUE NOT NULL,
        referred_by INTEGER REFERENCES users(id),
        balance_available DECIMAL(10,2) DEFAULT 0,
        balance_locked DECIMAL(10,2) DEFAULT 0,
        balance_denied DECIMAL(10,2) DEFAULT 0,
        profile_completion INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. LOGIN_HISTORY
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ip_address VARCHAR(45) NOT NULL,
        user_agent TEXT NOT NULL,
        device_fingerprint VARCHAR(255) NOT NULL,
        location VARCHAR(100),
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. OFFER_WALLS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS offer_walls (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        internal_id VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL,
        endpoint_url TEXT,
        iframe_url TEXT,
        hash_algorithm VARCHAR(20),
        commission_rate INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. SURVEY_CLICKS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS survey_clicks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        offer_wall_id INTEGER REFERENCES offer_walls(id) ON DELETE CASCADE,
        transaction_id VARCHAR(100) UNIQUE NOT NULL,
        integration_type VARCHAR(20) NOT NULL,
        survey_id VARCHAR(100),
        survey_name VARCHAR(255),
        loi INTEGER,
        country VARCHAR(10),
        cpa_original DECIMAL(10,2) DEFAULT 0,
        cpa_user DECIMAL(10,2) DEFAULT 0,
        commission_rate INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );
    `);

    // 5. TRANSACTIONS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(30) NOT NULL,
        offer_wall_id INTEGER REFERENCES offer_walls(id),
        reference_type VARCHAR(30) NOT NULL,
        reference_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        commission_earned DECIMAL(10,2) DEFAULT 0,
        commission_rate_at_time INTEGER,
        referrer_id INTEGER REFERENCES users(id),
        referrer_earned DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. WITHDRAWALS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        method_details JSON NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        rejection_reason TEXT,
        bank_transaction_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. PAYMENT_METHODS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        min_amount DECIMAL(10,2) NOT NULL,
        max_amount DECIMAL(10,2) NOT NULL,
        processing_fee DECIMAL(10,2) DEFAULT 0,
        instructions TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. TICKETS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'open',
        admin_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. PAYMENT_PROOFS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_proofs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        reward_given BOOLEAN DEFAULT false,
        admin_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. ANNOUNCEMENTS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 11. ADMIN_USERS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 12. SETTINGS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 13. AUDIT_LOGS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES admin_users(id),
        action VARCHAR(50) NOT NULL,
        target_type VARCHAR(30) NOT NULL,
        target_id INTEGER NOT NULL,
        details JSON,
        ip_address VARCHAR(45) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 14. PENDING_VERIFICATION
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_registrations (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        referral_code VARCHAR(50) UNIQUE NOT NULL,
        referred_by INTEGER,
        country VARCHAR(100),
        verification_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

  // 15. USER_ANNOUNCEMENTS (per-user read/hide tracking)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_announcements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        announcement_id INTEGER REFERENCES announcements(id) ON DELETE CASCADE,
        is_read BOOLEAN DEFAULT false,
        is_deleted BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, announcement_id)
      );
    `);

    // 16. TRAFFIC_LOGS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS traffic_logs (
        id SERIAL PRIMARY KEY,
        
        -- Direction: outgoing (your server → offer wall) or incoming (offer wall → your server)
        direction VARCHAR(10) NOT NULL CHECK (direction IN ('outgoing', 'incoming')),
        
        -- Type of traffic
        type VARCHAR(20) NOT NULL CHECK (type IN ('survey_click', 's2s_callback', 'browser_callback', 'api_request', 'redirect')),
        
        -- Who initiated this
        user_id INTEGER REFERENCES users(id),
        user_public_id VARCHAR(20),
        user_username VARCHAR(50),
        
        -- Which offer wall
        offer_wall_id INTEGER REFERENCES offer_walls(id),
        offer_wall_name VARCHAR(100),
        offer_wall_internal_id VARCHAR(50),
        
        -- Survey click reference
        survey_click_id INTEGER REFERENCES survey_clicks(id),
        
        -- Transaction IDs
        internal_transaction_id VARCHAR(100),
        external_transaction_id VARCHAR(100),
        
        -- Request details
        url TEXT,
        method VARCHAR(10),
        headers JSONB,
        query_params JSONB,
        request_body JSONB,
        
        -- Response details
        response_status INTEGER,
        response_headers JSONB,
        response_body TEXT,
        
        -- Network info
        ip_address VARCHAR(45),
        user_agent TEXT,
        
        -- Performance
        processing_time_ms INTEGER,
        
        -- Error tracking
        error_message TEXT,
        error_stack TEXT,
        
        -- Processing result
        processing_result JSONB DEFAULT '{}',
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 17. PASSWORD_RESETS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

     // 18. VPN_CHECKS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vpn_checks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        ip_address VARCHAR(45) NOT NULL,
        is_vpn BOOLEAN DEFAULT false,
        is_proxy BOOLEAN DEFAULT false,
        is_tor BOOLEAN DEFAULT false,
        provider VARCHAR(100),
        country VARCHAR(10),
        risk_score INTEGER,
        raw_response JSONB,
        checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('All tables created successfully!');

    console.log('Checking schema updates...');
    await runSchemaUpdates();

  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

const runSchemaUpdates = async () => {
  const alterations = [
    `ALTER TABLE survey_clicks ALTER COLUMN cpa_original TYPE DECIMAL(10,2)`,
    `ALTER TABLE survey_clicks ALTER COLUMN cpa_user TYPE DECIMAL(10,2)`,
    `ALTER TABLE transactions ALTER COLUMN amount TYPE DECIMAL(10,2)`,
    `ALTER TABLE transactions ALTER COLUMN commission_earned TYPE DECIMAL(10,2)`,
    `ALTER TABLE transactions ALTER COLUMN referrer_earned TYPE DECIMAL(10,2)`,
    `ALTER TABLE withdrawals ALTER COLUMN amount TYPE DECIMAL(10,2)`,
    `ALTER TABLE payment_methods ALTER COLUMN min_amount TYPE DECIMAL(10,2)`,
    `ALTER TABLE payment_methods ALTER COLUMN max_amount TYPE DECIMAL(10,2)`,
    `ALTER TABLE payment_methods ALTER COLUMN processing_fee TYPE DECIMAL(10,2)`,
    `ALTER TABLE payment_proofs ALTER COLUMN amount TYPE DECIMAL(10,2)`,

    `ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date DATE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'`,
    `ALTER TABLE offer_walls ADD COLUMN IF NOT EXISTS hash_key TEXT`,
    `ALTER TABLE offer_walls ADD COLUMN IF NOT EXISTS callback_config JSONB DEFAULT '{}'`,

    `ALTER TABLE survey_clicks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE survey_clicks ADD COLUMN IF NOT EXISTS external_transaction_id VARCHAR(100)`,
    `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS image_url TEXT`,



    `CREATE INDEX IF NOT EXISTS idx_traffic_logs_direction ON traffic_logs(direction)`,
    `CREATE INDEX IF NOT EXISTS idx_traffic_logs_type ON traffic_logs(type)`,
    `CREATE INDEX IF NOT EXISTS idx_traffic_logs_user ON traffic_logs(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_traffic_logs_offer_wall ON traffic_logs(offer_wall_id)`,
    `CREATE INDEX IF NOT EXISTS idx_traffic_logs_internal_txn ON traffic_logs(internal_transaction_id)`,
    `CREATE INDEX IF NOT EXISTS idx_traffic_logs_external_txn ON traffic_logs(external_transaction_id)`,
    `CREATE INDEX IF NOT EXISTS idx_traffic_logs_created_at ON traffic_logs(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_traffic_logs_direction_created ON traffic_logs(direction, created_at DESC)`,

    `CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token)`,
    `CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email)`,

  ];

  for (const sql of alterations) {
    try {
      await pool.query(sql);
    } catch (err) {
      // Silently skip if already correct type or other non-critical error
      if (!err.message.includes('already exists')) {
        console.log(`Schema update skipped: ${err.message}`);
      }
    }
  }

  try {
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_survey_clicks_external_tx
    ON survey_clicks(external_transaction_id)
  `);

  console.log('Created unique index on external_transaction_id');
} catch (err) {
  console.log(`External transaction index skipped: ${err.message}`);
}
};

module.exports = createTables;