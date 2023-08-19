const Events = require("../Models/Events");
const AvailableTicket = require("../Models/AvailableTicket");
const short = require("short-uuid");
const makeImage = require("../makeImage");
const Tickets = require("../Models/Tickets");
const moment = require("moment");

require("dotenv").config();

const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
let existingCodes = [];

async function getUniqueCode(eventId) {
  function generateCode() {
    const partie1 = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const partie2 = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const partie3 = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `${partie1}-${partie2}-${partie3}`;
  }

  while (true) {
    const code = generateCode();

    // Vérifiez d'abord dans les codes existants
    if (existingCodes.includes(code)) {
      continue;
    }

    // Ensuite, vérifiez dans la base de données
    const queryCheckCode = await Tickets.customQuery(
      "SELECT * FROM tickets WHERE eventId = ? AND code = ?",
      [eventId, code]
    );
    if (queryCheckCode.length === 0) {
      existingCodes.push(code); // Ajoutez le code unique au tableau
      return code;
    }
  }
}

exports.getATicket = async (req, res) => {
  try {
    generateCode = [];
    const now = moment();
    const event = await Events.findOne({ slug: req.params.slug });
    let { nbreOfTicket, titulairesName, ticketId, phoneNumber, email } =
      req.query;
    nbreOfTicket = Number(decodeURIComponent(nbreOfTicket));
    titulairesName = JSON.parse(decodeURIComponent(titulairesName));
    ticketId = decodeURIComponent(ticketId);
    phoneNumber = decodeURIComponent(phoneNumber);
    email = decodeURIComponent(email);

    console.log(req.query);

    const ticket = await AvailableTicket.findOne({ id: ticketId });
    console.log(ticket);
    console.log(event);
    console.log(nbreOfTicket);
    console.log(titulairesName);
    if (
      ticket[0].eventId === event[0].id &&
      nbreOfTicket == titulairesName.length
    ) {
      if (ticket[0].availableNbre - nbreOfTicket <= 0) {
        return res.status(400).json({ noTicketAvailable: true });
      }
      let newTitulaires = titulairesName;
      let toInsert = [];
      const insertedLot = await Events.customQuery(
        "INSERT INTO lots SET phoneNumber = ?, email = ?, nbreOfTicket = ?, timestamp = ?",
        [phoneNumber, email, nbreOfTicket, now.unix()]
      );
      for (let index in newTitulaires) {
        const code = await getUniqueCode(event[0].id);
        toInsert.push({
          id: short.generate(),
          userId: null,
          ticketId: ticket[0].id,
          eventId: event[0].id,
          lotId: insertedLot.insertId,
          organisatorId: event[0].organisatorId,
          name: newTitulaires[index],
          price: ticket[0].price,
          ticketType: ticket[0].name,
          eventName: event[0].name,
          hasBeenScanned: false,
          scanTimestamp: null,
          deliveryTimestamp: now.unix(),
          expirationTimestamp: event[0].expiration,
          code: code,
        });
        moment.locale("fr");
        await makeImage(
          toInsert[index].id,
          toInsert[index].name,
          event[0].location,
          capitalizeFirstLetter(
            moment.unix(event[0].toTimestamp).format("ddd DD MMMM [à] HH:mm")
          ),
          toInsert[index].ticketId,
          toInsert[index].ticketType,
          toInsert[index].price,
          toInsert[index].expirationTimestamp,
          toInsert[index].eventName,
          toInsert[index].deliveryTimestamp,
          code
        );
      }
      for (let index in toInsert) {
        await Tickets.insertOne(toInsert[index]);
      }

      let msg2Send = `Voici les liens vers vos billet pour La Can Des Champions: \n`;
      for (let index in toInsert) {
        msg2Send += `\n ${process.env.BASE_URL+toInsert[index].id+".png"} (${toInsert[index].name})`;
      }

      await twilio.messages.create({
        body: msg2Send,
        to: `${phoneNumber}`, // Text your number
        from: process.env.PHONE_NUMBER, // From a valid Twilio number
      });
      //return res.status(200).json({ create: true, result: toInsert });
      console.log(toInsert);
      res.render("success", {
        phoneNumber: phoneNumber,
        tickets: toInsert,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Une erreur a eu lieu" });
  }
};

exports.fail = async (req, res) => {
  res.render("fail");
}