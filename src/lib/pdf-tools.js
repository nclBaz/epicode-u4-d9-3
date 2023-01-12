import PdfPrinter from "pdfmake"
import { pipeline } from "stream"
import { promisify } from "util" // CORE MODULE
import { getPDFWritableStream } from "./fs-tools.js"

export const getPDFReadableStream = booksArray => {
  // Define font files
  const fonts = {
    Courier: {
      normal: "Courier",
      bold: "Courier-Bold",
      italics: "Courier-Oblique",
      bolditalics: "Courier-BoldOblique",
    },
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  }

  const printer = new PdfPrinter(fonts)

  const content = booksArray.map(book => {
    return [
      { text: book.title, style: "header" },
      { text: book.category, style: "subheader" },
      { text: book.price, style: "subheader" },
      "\n\n",
    ]
  })

  const docDefinition = {
    content: [...content],
    defaultStyle: {
      font: "Helvetica",
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        font: "Courier",
      },
      subheader: {
        fontSize: 15,
        bold: false,
      },
    },
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition)
  pdfReadableStream.end()

  return pdfReadableStream
}

export const asyncPDFGeneration = async booksArray => {
  const source = getPDFReadableStream(booksArray)
  const destination = getPDFWritableStream("test.pdf")

  // normally pipeline function works with callbacks to tell when the stream is ended, we shall avoid using callbacks
  // pipeline(source, destination, err => {}) <-- BAD (callback based pipeline)
  // await pipeline(source, destination) <-- GOOD (promise based pipeline)

  // promisify is a (VERY COOL) tool that turns a callback based function (err first callback) into a promise based function
  // since pipeline is an error first callback based function --> we can turn pipeline into a promise based pipeline

  const promiseBasedPipeline = promisify(pipeline)

  await promiseBasedPipeline(source, destination)
}
