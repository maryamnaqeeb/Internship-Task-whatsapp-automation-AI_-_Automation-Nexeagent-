const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const admin = require('firebase-admin');

// 1. Firebase ko connect karein
const serviceAccount = require('./firebase-key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// 2. WhatsApp Client setup (LocalAuth session ko save rakhega)
const client = new Client({
    authStrategy: new LocalAuth()
});

// Jab QR Code screen par dikhana ho
client.on('qr', (qr) => {
    console.log('Screen par maujood QR Code ko apne WhatsApp se scan karein:');
    qrcode.generate(qr, { small: true });
});

// Jab WhatsApp kamyabi se connect ho jaye
client.on('ready', () => {
    console.log('Aap ka WhatsApp Bot ab active hai!');
});

// 3. Incoming Messages ko handle karna (Main Logic)
client.on('message', async (msg) => {
    const senderNumber = msg.from; // Bhejne wale ka number
    const userMessage = msg.body.toLowerCase().trim(); // User ka message

    // Group messages ko ignore karne ke liye, sirf personal chat
    if (msg.from.includes('@g.us')) return;

    console.log(`Message mila: ${userMessage} | From: ${senderNumber}`);

    // (A) Message ko Database me Log (Save) karna
    await db.collection('conversations').add({
        phone: senderNumber,
        message: msg.body,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        direction: 'incoming'
    });

    // (B) FAQ aur Auto-Reply ki Logic
    let botReply = "";

    if (userMessage === 'hi' || userMessage === 'hello' || userMessage === 'salam') {
        botReply = "Walaikum Assalam! Khush aamdeed. Main aap ki kya madad kar sakta hoon?\n\n1. Hamare Courses\n2. Fees ki maloomat\n3. Human Support (Agent)";
    } 
    else if (userMessage.includes('course') || userMessage === '1') {
        botReply = "Hamare paas yeh courses available hain:\n- Flutter Mobile App Development\n- Web Development (Node.js/React)\n- AI & Machine Learning";
    } 
    else if (userMessage.includes('fee') || userMessage === '2') {
        botReply = "Tamam courses ki fees aur details jaan'ne ke liye hamari website visit karein ya apna email share karein.";
    } 
    else if (userMessage.includes('agent') || userMessage === '3') {
        botReply = "Aap ka message hamare numainde ko bhej diya gaya hai. Woh jald aap se rabta karenge.";
        
        // Human takeover ke liye alert flag set karna
        await db.collection('alerts').add({
            phone: senderNumber,
            status: 'pending',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    } 
    else {
        // Agar bot ko samajh na aaye (Default Reply)
        botReply = "Maazrat, main aap ki baat samajh nahi saka. Main Menu ke liye 'Hi' likh kar bhejin.";
    }

    // (C) Bot ka jawab WhatsApp par bhejna
    await client.sendMessage(senderNumber, botReply);

    // (D) Bot ke jawab ko bhi Database me Log karna
    await db.collection('conversations').add({
        phone: senderNumber,
        message: botReply,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        direction: 'outgoing'
    });
});

// Bot ko start karein
client.initialize();