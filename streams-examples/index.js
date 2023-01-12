import request from "request"
import fs from "fs-extra"
import { join } from "path"
import { pipeline } from "stream" // CORE MODULE

const url = "https://skimdb.npmjs.com/registry/_changes?include_docs=true"

// ****************************************************** TRADITIONAL APPROACH **********************************************
/* request.get(url, (err, data) => {
  if (err) console.log(err)
  else console.log(data)
}) */

// ***************************************************** STREAMS APPROACH ***************************************************

// SOURCE (http request on npm registry) --> DESTINATION (terminal)

/* const source = request.get(url) // READABLE STREAM (http request on npm registry)
const destination = process.stdout // WRITABLE STREAM (terminal) */

// **************************************************************************************************************************

// SOURCE (data.json file) --> DESTINATION (terminal)

/* const source = fs.createReadStream(join(process.cwd(), "./streams-examples/data.json")) // READABLE STREAM (data.json file)
const destination = process.stdout // WRITABLE STREAM (terminal) */

// **************************************************************************************************************************

// SOURCE (data.json file) --> DESTINATION (another.json file)

/* const source = fs.createReadStream(join(process.cwd(), "./streams-examples/data.json")) // READABLE STREAM (data.json file)
const destination = fs.createWriteStream(join(process.cwd(), "./streams-examples/another.json")) // WRITABLE STREAM (another.json file) */

// **************************************************************************************************************************

// SOURCE (http request on npm registry) --> DESTINATION (npm.json file)

/* const source = request.get(url) // READABLE STREAM (http request on npm registry)
const destination = fs.createWriteStream(join(process.cwd(), "./streams-examples/npm.json")) // WRITABLE STREAM (npm.json file)

pipeline(source, destination, err => {
  if (err) console.log(err)
  else console.log("STREAM ENDED SUCCESFULLY!")
}) */

// source.pipe(destination) <-- OLD APPROACH

// **************************************************************************************************************************

// SOURCE (data.json file) --> TRANSFORM (compression) --> DESTINATION (data.json.gz)
/* import { createGzip } from "zlib" // CORE MODULE

const source = fs.createReadStream(join(process.cwd(), "./streams-examples/data.json")) // READABLE STREAM (data.json file)
const destination = fs.createWriteStream(join(process.cwd(), "./streams-examples/data.json.gz")) // WRITABLE STREAM (npm.json file)
const transform = createGzip()

pipeline(source, transform, destination, err => {
  if (err) console.log(err)
  else console.log("STREAM ENDED SUCCESFULLY!")
})
 */

const source = request.get("http://parrot.live")
const destination = process.stdout

pipeline(source, destination, err => {
  if (err) console.log(err)
  else console.log("STREAM ENDED SUCCESFULLY!")
})
