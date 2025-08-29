// backend/testEmail.js - File test riêng để kiểm tra
const sendEmail = require('./config/sendEmail');
require('dotenv').config();

async function testEmailService() {
    try {
        console.log('🧪 Testing email service...');
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');

        const result = await sendEmail({
            sendTo: 'phanduylamgv@gmail.com', // Thay bằng email test của bạn
            subject: '🧪 Test Email Service',
            html: `
                <h2>Email Service Test</h2>
                <p>Nếu bạn nhận được email này, email service đang hoạt động tốt!</p>
                <p>Thời gian: ${new Date().toLocaleString()}</p>
            `
        });

        console.log('✅ Test successful:', result);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Chạy test: node testEmail.js
testEmailService();