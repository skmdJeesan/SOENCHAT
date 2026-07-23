import fs from 'fs'
import path from 'path'
import multer from 'multer'

const uploadDir = path.resolve('../temp')
// console.log(uploadDir)

if(!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {recursive: true})
}

const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, uploadDir) },
  filename(req, file, cb) { cb(null, `${file.originalname}-${Date.now()}`)},
})

const fileFilter = (req, file, cb) => {
  if(file?.mimetype == 'application/pdf' || file?.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only pdf & image file is allowed to upload'), false)
  }
}

export default multer({
  storage, fileFilter,
  limits: { fileSize: 20*1024*1024 }
})
