const GROQ_API_KEY = process.env.GROQ_API_KEY;
const EMAILJS_SERVICE_ID = 'service_kyjodf9';
const EMAILJS_TEMPLATE_ID = 'template_8olow4m';
const EMAILJS_PUBLIC_KEY = 'YcWbP9LEjxjQvl-wp';
const YASH_EMAIL = 'yashwanthbalaji.2408@gmail.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = 'onboarding@resend.dev'; // Or your verified domain

// Send email via EmailJS API
async function sendEmailJS(params, templateId) {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: params,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`EmailJS failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Send email via Resend API
async function sendResendEmail(to, subject, html) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping thank you email');
    return null;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Resend API failed: ${response.status} - ${errorText}`);
    throw new Error(`Resend failed: ${response.status}`);
  }

  return response.json();
}

// Generate HTML thank you email
function generateThankYouHtml(userName) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background: #050506; }
    .container { max-width: 600px; margin: 0 auto; background: #0a0a0c; border: 1px solid rgba(232, 48, 48, 0.3); border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #e83030 0%, #b01f1f 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 2px; }
    .header p { color: rgba(255, 255, 255, 0.8); margin: 8px 0 0 0; font-size: 14px; }
    .content { padding: 40px 30px; color: #e8e8e8; line-height: 1.6; }
    .greeting { font-size: 16px; margin-bottom: 20px; }
    .message { background: rgba(232, 48, 48, 0.07); border-left: 4px solid #e83030; padding: 20px; margin: 25px 0; border-radius: 4px; }
    .message p { margin: 0; font-size: 14px; color: #e8e8e8; }
    .highlight { color: #ff4444; font-weight: 600; }
    ul { margin: 20px 0; padding-left: 20px; color: #e8e8e8; }
    li { margin-bottom: 12px; }
    .divider { height: 1px; background: rgba(232, 48, 48, 0.2); margin: 30px 0; }
    .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.06); }
    .signature p { margin: 0; font-size: 13px; color: #e8e8e8; }
    .footer-text { margin: 25px 0 0 0; font-size: 12px; color: #888890; line-height: 1.8; }
    a { color: #00e5ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    strong { color: #ffffff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>[ MESSAGE RECEIVED ]</h1>
      <p>YASH INTERFACE — SECURE RELAY</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        <p>Hello <strong>${userName}</strong>,</p>
      </div>

      <p>Thank you for reaching out. Your message has been successfully transmitted to Yash's secure relay system. We appreciate you taking the time to connect.</p>

      <div class="message">
        <p><span class="highlight">✓ STATUS:</span> MESSAGE CONFIRMED & QUEUED FOR REVIEW</p>
      </div>

      <p>Here's what happens next:</p>

      <ul>
        <li><strong>Priority Review</strong> — Your message is being reviewed personally by Yash with full attention</li>
        <li><strong>Thoughtful Response</strong> — Expect a meaningful reply within 24-48 hours</li>
        <li><strong>Collaboration Awaits</strong> — Whether it's a project, opportunity, or discussion, Yash is energized to explore possibilities</li>
      </ul>

      <p>In the meantime, connect with Yash on:</p>
      <ul>
        <li><a href="https://www.linkedin.com/in/yashwanthbalaji" target="_blank">LinkedIn</a> — Latest AI insights & professional updates</li>
        <li><a href="https://github.com/Yashwanth2408" target="_blank">GitHub</a> — Explore innovative projects & open-source work</li>
      </ul>

      <p style="margin-top: 25px; font-style: italic; color: #888890;">
        "Good conversations build the next mission." — This is just the beginning of something great.
      </p>

      <div class="divider"></div>

      <div class="signature">
        <p><strong>YASH</strong></p>
        <p style="margin: 5px 0 0 0; color: #888890;">AI Engineer · Founder @ LatentFlow.ai</p>
        <p style="margin: 8px 0 0 0; color: #e83030;">🚀 Building intelligent solutions at scale</p>
      </div>

      <div class="footer-text">
        <p>This is an automated confirmation that your message has been received. Yash personally reviews all messages and will respond with thoughtfulness and genuine interest. Your inquiry matters.</p>
        <p style="margin-top: 10px; color: #666670;">If you need immediate assistance, reach out directly: yashwanthbalaji.2408@gmail.com</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    let requestData;
    try {
      requestData = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON' }),
      };
    }

    const { from_name, from_email, message } = requestData;

    if (!from_name || !from_email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Email to Yash via EmailJS
    console.log('Sending email to Yash...');
    await sendEmailJS(
      {
        from_name,
        from_email,
        message,
        to_email: YASH_EMAIL,
      },
      EMAILJS_TEMPLATE_ID
    );

    // Email to user with thank you message via Resend
    console.log('Sending thank you email to user via Resend...');
    const thankyouHtml = generateThankYouHtml(from_name);
    
    try {
      await sendResendEmail(
        from_email,
        'Message Received — Yash Will Reply Shortly',
        thankyouHtml
      );
      console.log('Thank you email sent successfully to', from_email);
    } catch (resendErr) {
      console.error('Failed to send thank you email:', resendErr.message);
      // Don't fail the whole request if thank you email fails
      // Main email to Yash was already sent successfully
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Message sent successfully. Thank you email will be sent to your inbox.',
      }),
    };
  } catch (err) {
    console.error('Contact function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send message',
        details: err.message.substring(0, 200),
      }),
    };
  }
};
