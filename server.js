import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import multer from "multer";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const upload = multer();

app.post("/send-order", upload.single("file"), async (req, res) => {
  const { name, contact, type, details, length, characters, estimated } = req.body;

  const fd = new FormData();
  const payloadJson = {
    content: null,
    embeds: [{
      title: 'New Commission',
      color: 7506394,
      fields: [
        { name: 'Name', value: name || '—', inline: true },
        { name: 'Contact', value: contact || '—', inline: true },
        { name: 'Type', value: type || '—', inline: true },
        { name: 'Length (s)', value: length || '—', inline: true },
        { name: 'Characters', value: characters || '—', inline: true },
        { name: 'Estimated', value: estimated || '—', inline: true },
        { name: 'Details', value: details || '—', inline: false }
      ],
      timestamp: new Date().toISOString()
    }]
  };

  fd.append("payload_json", JSON.stringify(payloadJson));

  if (req.file) {
    fd.append("file", req.file.buffer, req.file.originalname);
  }

  try {
    const resDiscord = await fetch(process.env.DISCORD_WEBHOOK, {
      method: "POST",
      body: fd
    });

    if (!resDiscord.ok) {
      throw new Error("Discord error: " + resDiscord.status);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
