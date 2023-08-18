const Events = require("../Models/Events");
const AvailableTicket = require("../Models/AvailableTicket");
const short = require("short-uuid");
const makeImage = require("../makeImage");
const Tickets = require("../Models/Tickets");
const moment = require("moment");

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.getATicket = async (req, res) => {
  try {
    const now = moment();
    const event = await Events.findOne({ slug: req.params.slug });
    const { nbreOfTicket, titulairesName, ticketId, phoneNumber, email } =
      req.body;
    const ticket = await AvailableTicket.findOne({ id: ticketId });
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
        });
        moment.locale("fr");
        await makeImage(
          toInsert[index].id,
          toInsert[index].name,
          event[0].location,
          capitalizeFirstLetter(moment.unix(event[0].toTimestamp).format("ddd DD MMMM [à] HH:mm")),
          toInsert[index].ticketId,
          toInsert[index].ticketType,
          toInsert[index].price,
          toInsert[index].expirationTimestamp,
          toInsert[index].eventName,
          toInsert[index].deliveryTimestamp
        );        
      }
      for (let index in toInsert) {
        await Tickets.insertOne(toInsert[index]);
      }
      return res.status(200).json({ create: true, result: toInsert });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Une erreur a eu lieu" });
  }
};
