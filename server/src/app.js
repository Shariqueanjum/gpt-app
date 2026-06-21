const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');
const userRoutes = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { globalLimiter } = require('./middlewares/rateLimit.middleware');
const errorHandler = require('./middlewares/error.middleware');
const loginHistoryRoutes = require('./routes/login_history.routes');
const offerWallRoutes = require('./routes/offer_wall.routes');
const surveyClickRoutes = require('./routes/survey_click.routes');
const callbackRoutes = require('./routes/callback.routes');
const transactionRoutes = require('./routes/transaction.routes');
const adminSeedRoutes = require('./routes/admin_seed.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentMethodRoutes = require('./routes/payment_method.routes');
const withdrawalRoutes = require('./routes/withdrawal.routes');
const adminWithdrawalRoutes = require('./routes/admin_withdrawal.routes');
const adminUserRoutes = require('./routes/admin_user.routes');
const referralRoutes = require('./routes/referral.routes');
const fraudRoutes = require('./routes/fraud.routes');
const auditLogRoutes = require('./routes/audit_log.routes');
const levelRoutes = require('./routes/level.routes');
const streakRoutes = require('./routes/streak.routes');
const reversalRoutes = require('./routes/reversal.routes');
const ticketRoutes = require('./routes/ticket.routes');
const adminTicketRoutes = require('./routes/admin_ticket.routes');
const paymentProofRoutes = require('./routes/payment_proof.routes');
const adminPaymentProofRoutes = require('./routes/admin_payment_proof.routes');
const announcementRoutes = require('./routes/announcement.routes');
const adminAnnouncementRoutes = require('./routes/admin_announcement.routes');
const settingsRoutes = require('./routes/settings.routes');
const adminSettingsRoutes = require('./routes/admin_settings.routes');
const adminTrafficLogRoutes = require('./routes/admin_traffic_log.routes');
const performanceRoutes = require('./routes/performance.routes');
const adminVPNRoutes = require('./routes/admin_vpn.routes');
const adminOfferWallRoutes = require('./routes/admin_offer_wall.routes');
const liveActivityRoutes = require('./routes/live_activity.routes');

const app = express();

app.use(cors());
app.use(express.json());
//app.use(globalLimiter);

// routes
app.use('/', healthRoutes);
app.use('/api', healthRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/test', testRoutes);

app.use('/api/user', userRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use('/api/login-history', loginHistoryRoutes);

app.use('/api/offer-walls', offerWallRoutes);

app.use('/api/survey-clicks', surveyClickRoutes);

app.use('/api/callback', callbackRoutes);

app.use('/api/transactions', transactionRoutes);

app.use('/api/admin/seed', adminSeedRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/payment-methods', paymentMethodRoutes);

app.use('/api/withdrawals', withdrawalRoutes);

app.use('/api/admin/withdrawals', adminWithdrawalRoutes);

app.use('/api/admin/users', adminUserRoutes);

app.use('/api/referrals', referralRoutes);

app.use('/api/admin/fraud', fraudRoutes);

app.use('/api/admin/audit-logs', auditLogRoutes);

app.use('/api/levels', levelRoutes);

app.use('/api/streak', streakRoutes);

app.use('/api/admin/reversals', reversalRoutes);

app.use('/api/tickets', ticketRoutes);

app.use('/api/admin/tickets', adminTicketRoutes);

app.use('/api/payment-proofs', paymentProofRoutes);

app.use('/api/admin/payment-proofs', adminPaymentProofRoutes);

app.use('/api/announcements', announcementRoutes);

app.use('/api/admin/announcements', adminAnnouncementRoutes);

app.use('/api/settings', settingsRoutes);

app.use('/api/admin/settings', adminSettingsRoutes);

app.use('/api/admin/traffic-logs', adminTrafficLogRoutes);

app.use('/api/performance', performanceRoutes);

app.use('/api/admin/vpn', adminVPNRoutes);

app.use('/api/admin/offer-walls', adminOfferWallRoutes);

app.use('/api/live-activity', liveActivityRoutes);

app.use(errorHandler)

module.exports = app;