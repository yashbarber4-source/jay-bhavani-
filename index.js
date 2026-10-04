const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

// =============================================
//   JAY BHAVANI WHATSAPP BOT
//   Numbers: Call 7433064084 | WA 9726251477
// =============================================

const TOKEN       = "EAAP1WZAVogJcBShSJ1wbBZBfURWyObGKpuTeJwkAn8Gblo1KJJxNmNxhSEkswKKib8GkZBjoJuM3znl7QsxbSzZC9WRbmZBFRgGYTsixX3GSeqMy3XoTBAOyk3luZBPNa9PWq0GWrm2aZBCxQnF65XM1MhwQh5p3mS7P0lYPdO84mbk4ERkyeGobWrsO479WiekueFAlcFa5V28uSi70965s0ZBqcMZAXTx9ois6I797aY9Wi4n4tkeKsSGBZATZATgIpOoWklUaP7oEoUwwfYLZBwWwvETh";
const PHONE_ID    = "1397212316802735";
const VERIFY_TOKEN = "jaybhavani2024";  // Webhook verify token (aap change kar sakte hain)
const WA_API      = `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`;

// User sessions (in-memory)
const sessions = {};

// =============================================
//   SEND MESSAGE HELPER
// =============================================
async function sendMessage(to, text) {
  try {
    await axios.post(WA_API, {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: text }
    }, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Send error:", err.response?.data || err.message);
  }
}

// =============================================
//   SEND INTERACTIVE BUTTONS
// =============================================
async function sendButtons(to, bodyText, buttons) {
  try {
    await axios.post(WA_API, {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.map((btn, i) => ({
            type: "reply",
            reply: { id: `btn_${i}`, title: btn }
          }))
        }
      }
    }, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    // Fallback to text if buttons fail
    const fallback = bodyText + "\n\n" + buttons.map((b, i) => `${i + 1}️⃣ ${b}`).join("\n");
    await sendMessage(to, fallback);
  }
}

// =============================================
//   SEND LIST MESSAGE
// =============================================
async function sendList(to, bodyText, buttonText, sections) {
  try {
    await axios.post(WA_API, {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: bodyText },
        action: {
          button: buttonText,
          sections: sections
        }
      }
    }, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    await sendMessage(to, bodyText);
  }
}

// =============================================
//   BOT LOGIC
// =============================================
async function handleMessage(from, text) {
  const msg = text.trim().toLowerCase();
  const session = sessions[from] || { step: "start" };

  // ---- GREETING / MAIN MENU ----
  if (session.step === "start" || msg === "hi" || msg === "hello" || msg === "hii" || msg === "menu" || msg === "start") {
    sessions[from] = { step: "main_menu" };
    await sendButtons(from,
      `🟠 *JAY BHAVANI* 🟠\n━━━━━━━━━━━━━━━━━━\nIndia's Trusted Fast Food Brand\nSince 1998 | Pan India & International\n━━━━━━━━━━━━━━━━━━\n\nNamaste! 🙏 Aapka swagat hai Jay Bhavani mein.\n\nAap kis liye sampark kar rahe hain?`,
      ["🏪 Shop / Outlet", "🤝 Franchise Enquiry"]
    );
    return;
  }

  // ---- MAIN MENU RESPONSES ----
  if (session.step === "main_menu") {
    if (msg.includes("shop") || msg.includes("outlet") || msg === "1" || msg.includes("btn_0")) {
      sessions[from] = { step: "shop_menu" };
      await sendButtons(from,
        `🏪 *JAY BHAVANI — SHOP INFO*\n━━━━━━━━━━━━━━━━━━\n\nAap humse kya jaanna chahte hain?`,
        ["📍 Location & Timings", "📋 Menu & Prices", "⚠️ Complaint"]
      );
      return;
    }

    if (msg.includes("franchise") || msg === "2" || msg.includes("btn_1")) {
      sessions[from] = { step: "franchise_menu" };
      await sendList(from,
        `🤝 *JAY BHAVANI FRANCHISE*\n━━━━━━━━━━━━━━━━━━\nIndia ka fastest-growing QSR brand!\n\n*3 Franchise Models Available:*\n\nNiche se apna model select karein 👇`,
        "Models Dekhein",
        [
          {
            title: "Franchise Models",
            rows: [
              { id: "express", title: "🔹 Express Model", description: "₹13 Lakh* | 150–400 Sq.Ft" },
              { id: "special", title: "🔹 Special Model", description: "₹23 Lakh* | 400+ Sq.Ft" },
              { id: "premium", title: "🔹 Premium Model", description: "₹30 Lakh* | 800+ Sq.Ft" }
            ]
          }
        ]
      );
      return;
    }
  }

  // ---- SHOP MENU ----
  if (session.step === "shop_menu") {
    if (msg.includes("location") || msg.includes("timing") || msg.includes("btn_0")) {
      await sendMessage(from,
        `📍 *Jay Bhavani — Location & Timings*\n━━━━━━━━━━━━━━━━━━\n\nAapke nearest outlet ki details ke liye hamse direct sampark karein:\n\n📞 Call: +91 7433064084\n🌐 Website: https://jaybhavanifrenchaise.netlify.app\n\n_Menu type karein wapas main menu dekhne ke liye._`
      );
      sessions[from] = { step: "start" };
      return;
    }
    if (msg.includes("menu") || msg.includes("price") || msg.includes("btn_1")) {
      await sendMessage(from,
        `📋 *Jay Bhavani — Menu & Prices*\n━━━━━━━━━━━━━━━━━━\n\nHumari website par poori menu aur prices available hain:\n\n🌐 https://jaybhavanifrenchaise.netlify.app\n📞 +91 7433064084\n\n_Menu type karein wapas main menu dekhne ke liye._`
      );
      sessions[from] = { step: "start" };
      return;
    }
    if (msg.includes("complaint") || msg.includes("btn_2")) {
      await sendMessage(from,
        `⚠️ *Complaint / Feedback*\n━━━━━━━━━━━━━━━━━━\n\nHumein aapki complaint ke baare mein sunkar dukh hua. 🙏\n\nKripya apni complaint seedha email karein:\n📧 yashbarber4@gmail.com\n\nYa call karein:\n📞 +91 7433064084\n\nHum 24 ghante ke andar respond karenge.`
      );
      sessions[from] = { step: "start" };
      return;
    }
  }

  // ---- FRANCHISE MODEL DETAILS ----
  if (session.step === "franchise_menu" || session.step === "model_selected") {

    if (msg === "express" || msg.includes("13") || msg.includes("express")) {
      sessions[from] = { step: "collect_details", model: "Express Model (₹13 Lakh*)" };
      await sendMessage(from,
        `🔹 *EXPRESS MODEL — ₹13 Lakh**\n━━━━━━━━━━━━━━━━━━\n📐 Space Required: 150–400 Sq.Ft\n💰 Investment: ₹13 Lakh*\n\n✅ *Support Milega:*\n• Site Selection — High footfall location guidance\n• Kitchen & Setup — Equipment aur counter design\n• Staff Training — Complete operations training\n• Marketing — Social media + local ads support\n• Supply Chain — Direct raw material supply\n• Brand — Jay Bhavani national brand identity\n\n🏆 *Best For:* Small kiosk, food court, compact location\n\n🌐 https://jaybhavanifrenchaise.netlify.app\n━━━━━━━━━━━━━━━━━━\n👇 Aage badhne ke liye *apna Naam* type karein:`
      );
      return;
    }

    if (msg === "special" || msg.includes("23") || msg.includes("special")) {
      sessions[from] = { step: "collect_details", model: "Special Model (₹23 Lakh*)" };
      await sendMessage(from,
        `🔹 *SPECIAL MODEL — ₹23 Lakh**\n━━━━━━━━━━━━━━━━━━\n📐 Space Required: 400+ Sq.Ft\n💰 Investment: ₹23 Lakh*\n\n✅ *Support Milega:*\n• Site Selection — Prime location evaluation\n• Kitchen & Setup — Full kitchen design & equipment\n• Staff Recruitment & Training — Hiring se training tak\n• Marketing — Digital marketing + launch campaign\n• Supply Chain — Established supply network\n• Brand — Jay Bhavani trusted legacy\n\n🏆 *Best For:* Medium standalone outlet, commercial area\n\n🌐 https://jaybhavanifrenchaise.netlify.app\n━━━━━━━━━━━━━━━━━━\n👇 Aage badhne ke liye *apna Naam* type karein:`
      );
      return;
    }

    if (msg === "premium" || msg.includes("30") || msg.includes("premium")) {
      sessions[from] = { step: "collect_details", model: "Premium Model (₹30 Lakh*)" };
      await sendMessage(from,
        `🔹 *PREMIUM MODEL — ₹30 Lakh**\n━━━━━━━━━━━━━━━━━━\n📐 Space Required: 800+ Sq.Ft\n💰 Investment: ₹30 Lakh*\n\n✅ *Support Milega:*\n• Site Selection — Premium high-visibility location\n• Complete Outlet Setup — Kitchen + dining + interior\n• Staff Training — Chef + management training\n• Marketing & Pre-Launch — Grand opening + digital PR\n• Supply Chain — Dedicated quality management\n• Brand — Jay Bhavani international brand backing\n\n🏆 *Best For:* Flagship dine-in, prime location\n\n🌐 https://jaybhavanifrenchaise.netlify.app\n━━━━━━━━━━━━━━━━━━\n👇 Aage badhne ke liye *apna Naam* type karein:`
      );
      return;
    }
  }

  // ---- COLLECT LEAD DETAILS ----
  if (session.step === "collect_details") {
    sessions[from] = { ...session, step: "collect_city", name: text };
    await sendMessage(from, `Dhanyavaad *${text}* ji! 🙏\n\nAb apni *City* batayein:`);
    return;
  }

  if (session.step === "collect_city") {
    sessions[from] = { ...session, step: "collect_timeline", city: text };
    await sendButtons(from,
      `Acha, *${text}* mein! 📍\n\nAap franchise kab shuru karna chahenge?`,
      ["Turant / ASAP", "1 Mahine mein", "3 Mahine mein"]
    );
    return;
  }

  if (session.step === "collect_timeline") {
    const s = sessions[from];
    const summary =
      `✅ *Lead Captured!*\n━━━━━━━━━━━━━━━━━━\n` +
      `👤 Naam: ${s.name}\n📍 City: ${s.city}\n🤝 Model: ${s.model}\n⏰ Timeline: ${text}\n📞 Number: +${from}`;

    // Thank user
    await sendMessage(from,
      `🎉 *Bahut Badhiya ${s.name} ji!*\n\nAapki details humari franchise team ko bhej di gayi hai.\n\n*Aapka Chosen Model:* ${s.model}\n\n📞 Humari team *24 ghante ke andar* aapko call karegi.\n\nTab tak franchise details yahan check karein:\n🌐 https://jaybhavanifrenchaise.netlify.app\n\n_Koi aur sawaal? Type karein *menu*_ 🙏`
    );

    // Notify owner (send lead to owner's number)
    const ownerMsg =
      `🆕 *NEW FRANCHISE LEAD!*\n━━━━━━━━━━━━━━━━━━\n` +
      `👤 Naam: ${s.name}\n📍 City: ${s.city}\n🤝 Model: ${s.model}\n⏰ Timeline: ${text}\n📞 WhatsApp: +${from}\n━━━━━━━━━━━━━━━━━━\n_Jay Bhavani Bot se bheja gaya_`;

    await sendMessage("919726251477", ownerMsg);

    sessions[from] = { step: "start" };
    console.log("NEW LEAD:", summary);
    return;
  }

  // ---- DEFAULT ----
  await sendMessage(from,
    `Mujhe samajh nahi aaya. 😊\n\nWapas main menu dekhne ke liye *menu* type karein.`
  );
  sessions[from] = { step: "start" };
}

// =============================================
//   WEBHOOK VERIFICATION (Meta)
// =============================================
app.get("/webhook", (req, res) => {
  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// =============================================
//   WEBHOOK RECEIVER (Incoming Messages)
// =============================================
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  try {
    const entry    = req.body?.entry?.[0];
    const changes  = entry?.changes?.[0];
    const value    = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) return;

    const msg  = messages[0];
    const from = msg.from;

    let text = "";
    if (msg.type === "text") {
      text = msg.text.body;
    } else if (msg.type === "interactive") {
      const ia = msg.interactive;
      if (ia.type === "button_reply")       text = ia.button_reply.id === "btn_0" ? "btn_0" : ia.button_reply.title;
      else if (ia.type === "list_reply")    text = ia.list_reply.id;
    }

    if (!text) return;

    console.log(`[MSG] From: ${from} | Text: ${text}`);
    await handleMessage(from, text);

  } catch (err) {
    console.error("Webhook error:", err.message);
  }
});

// Health check
app.get("/", (req, res) => res.send("Jay Bhavani Bot is running! 🟠"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Jay Bhavani Bot running on port ${PORT}`));
