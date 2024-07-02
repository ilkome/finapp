import process from 'node:process'
import { Client } from 'basic-ftp'
import 'dotenv/config'

example()

async function example() {
  const client = new Client()
  client.ftp.verbose = true

  try {
    await client.access({
      host: process.env.UPLOAD_HOST,
      password: process.env.UPLOAD_PASSWORD,
      secure: true,
      user: process.env.UPLOAD_USER,
    })

    await client.ensureDir('/')
    await client.uploadFromDir('.output/public')
  }

  catch (err) {
    console.log(err)
  }

  client.close()
}
