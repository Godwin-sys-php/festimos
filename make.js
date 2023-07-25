const pdfMake = require("pdfmake/build/pdfmake");
const pdfFonts = require("pdfmake/build/vfs_fonts");
pdfMake.vfs = pdfFonts.pdfMake.vfs;
const fs = require("fs");

try {
  // function to encode file data to base64 encoded string
  function base64_encode(file) {
      // read binary data
      var bitmap = fs.readFileSync(file);
      // convert binary data to base64 encoded string
      return new Buffer(bitmap).toString('base64');
  }
  
  // Les détails de l'événement et du billet doivent être remplacés par les valeurs réelles
  let eventDetails = {
    eventName: "La CAN des Champions",
    ticketType: "Billet Électronique",
    ticketHolder:
      "Godwin Burume",
    date: "10 Août 2024",
    time: "12:00",
    venue: "Lisanga, KINSHASA",
  };
  
  let docDefinition = {
    pageSize: 'A6',
    pageMargins: [20, 20, 20, 20 ],
    content: [
        {
      canvas: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          w: 298, // Largeur de la page A4 en points
          h: 420, // Hauteur de la page A4 en points
          lineWidth: 30, // Épaisseur du cadre
          lineColor: 'tomato',
        }
      ],
      absolutePosition: {x: 0, y: 0}
    },
        { text: eventDetails.eventName, fontSize: 18, bold: true, margin: [0, 0, 0, 8], alignment: "center" },
        { text: eventDetails.ticketType, fontSize: 16, bold: true, margin: [0, 0, 0, 16], alignment: "center" },
        {image: "data:image/png;base64," + base64_encode('./assets/mask.png'), width: 40, absolutePosition: {x: 50, y: 220}},
        {image: "data:image/png;base64," + base64_encode('./assets/calendar.png'), width: 40, absolutePosition: {x: 50, y: 275}},
        //////
        {image: "data:image/png;base64," + base64_encode('./assets/confetti.png'), width: 40, absolutePosition: {x: 210, y: 240}},
        {image: "data:image/png;base64," + base64_encode('./assets/micro.png'), width: 40, absolutePosition: {x: 210, y: 290}},
        { text: 'Nom du Titulaire :', fontSize: 14, bold: true, },
        { text: eventDetails.ticketHolder, fontSize: 10, margin:  [0, 0, 0, 5] },
        { text: 'Date : ', fontSize: 14, bold: true },
        { text: eventDetails.date, fontSize: 10, margin:  [0, 0, 0, 5] },
        { text: 'Heure : ', fontSize: 14, bold: true },
        { text: eventDetails.time, fontSize: 10, margin:  [0, 0, 0, 5] },
        { text: 'Lieu : ', fontSize: 14, bold: true },
        { text: eventDetails.venue + '\n\n', fontSize: 10 },
        { qr: 'text in QR', alignment: "center" },
        { text: '\nMerci d\'avoir choisi Festimo !', alignment: "center", fontSize: 14, bold: true }
    ],
    defaultStyle: {
        alignment: "left",
    }
  };
  
  let pdfDoc = pdfMake.createPdf(docDefinition);
  
  pdfDoc.getBuffer((buffer) => {
    fs.writeFileSync("billet.pdf", buffer);
  });
} catch (error) {
  console.log(error);
}
