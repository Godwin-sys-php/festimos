const Jimp = require("jimp");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
require('dotenv').config();

async function generateQRCode(data) {
  const dataUrl = await QRCode.toDataURL(data);
  const base64Data = dataUrl.split(",")[1];
  const buffer = Buffer.from(base64Data, "base64");
  const qrCode = await Jimp.read(buffer);

  qrCode.resize(449, Jimp.AUTO);
  return qrCode;
}

async function makeImage(
  id,
  name,
  location,
  date,
  ticketId,
  type,
  price,
  expiration,
  event,
  time
) {
  try {
    const image = await Jimp.read("template.png");
    const font64 = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    const font32 = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    name = name.toUpperCase();
    const textWidth = Jimp.measureText(font64, name);
    image.print(font64, image.bitmap.width / 2 - textWidth / 2, 820, name);

    image.print(font32, 94, 940, location);
    image.print(font32, 100, 1040, date);

    const token = jwt.sign(
      {
        id: id,
        ticketId: ticketId,
        price: price,
        name: name,
        expiration: expiration,
        type: type,
        event: event,
        time: time,
      },
      process.env.TOKEN,
      {
        expiresIn: 604800 * 7, // 7 weeks
      }
    );

    const qrCodeData = `{"token": "${token}", "id": "${id}", "ticketId": "${id}", "type": "${type}", "price": "${price}", "name": "${name}", "expiration": "${expiration}", "event": "${event}", "time": "${time}"  }`;
    const qrCode = await generateQRCode(qrCodeData);

    image.composite(
      qrCode,
      (image.bitmap.width - qrCode.bitmap.width) / 2,
      368
    );

    await image.writeAsync(`./tickets/${id}.png`);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = makeImage;
