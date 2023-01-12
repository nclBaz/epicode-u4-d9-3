import express from "express"
import multer from "multer"
import { extname } from "path"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { pipeline } from "stream"
import { createGzip } from "zlib"
import json2csv from "json2csv"
import {
  saveUsersAvatars,
  getUsers,
  writeUsers,
  getBooksJsonReadableStream,
  getBooks,
} from "../../lib/fs-tools.js"
import { getPDFReadableStream } from "../../lib/pdf-tools.js"

const filesRouter = express.Router()

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, // cloudinary is going to search in .env vars for smt called process.env.CLOUDINARY_URL
    params: {
      folder: "fs0422/users",
    },
  }),
}).single("avatar")

filesRouter.post("/:userId/single", cloudinaryUploader, async (req, res, next) => {
  // "avatar" needs to match exactly to the name of the field appended in the FormData object coming from the FE
  // If they do not match, multer will not find the file
  try {
    /* const originalFileExtension = extname(req.file.originalname)
    const fileName = req.params.userId + originalFileExtension

    await saveUsersAvatars(fileName, req.file.buffer)

    const url = `http://localhost:3001/img/users/${fileName}`
 */

    console.log(req.file)
    const url = req.file.path
    const users = await getUsers()

    const index = users.findIndex(user => user.id === req.params.userId) // 1. Find user (by userID)
    if (index !== -1) {
      const oldUser = users[index]
      // 2. Add to user a field called avatar (or in the case of book it could be author.avatar) containing the url of the file

      const author = { ...oldUser.author, avatar: url }
      const updatedUser = { ...oldUser, author, updatedAt: new Date() }

      users[index] = updatedUser

      await writeUsers(users)
    }

    // In FE <img src="http://localhost:3001/img/users/magic.gif" />

    res.send("File uploaded")
  } catch (error) {
    next(error)
  }
})

filesRouter.post("/multiple", multer().array("avatars"), async (req, res, next) => {
  try {
    console.log("FILES:", req.files)
    await Promise.all(req.files.map(file => saveUsersAvatars(file.originalname, file.buffer)))
    res.send("File uploaded")
  } catch (error) {
    next(error)
  }
})

filesRouter.get("/booksJSON", (req, res, next) => {
  try {
    // SOURCES (file on disk, http request, ...) --> DESTINATION (file on disk, terminal, http response, ...)

    // SOURCE (READABLE STREAM on books.json file) --> DESTINATION (WRITABLE STREAM http response)

    res.setHeader("Content-Disposition", "attachment; filename=books.json.gz")
    // without this header the browser will try to open (not save) the file.
    // This header will tell the browser to open the "save file as" dialog
    const source = getBooksJsonReadableStream()
    const transform = createGzip()
    const destination = res
    pipeline(source, transform, destination, err => {
      if (err) console.log(err)
    })
  } catch (error) {
    next(error)
  }
})

filesRouter.get("/booksPDF", async (req, res, next) => {
  res.setHeader("Content-Disposition", "attachment; filename=test.pdf")

  const books = await getBooks()
  const source = getPDFReadableStream(books)
  const destination = res
  pipeline(source, destination, err => {
    if (err) console.log(err)
  })
})

filesRouter.get("/booksCSV", (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=books.csv")
    // SOURCE (readable stream on books.json) --> TRANSFORM (json into csv) --> DESTINATION (response)
    const source = getBooksJsonReadableStream()
    const transform = new json2csv.Transform({ fields: ["asin", "title", "category"] })
    const destination = res
    pipeline(source, transform, destination, err => {
      if (err) console.log(err)
    })
  } catch (error) {
    next(error)
  }
})

export default filesRouter
