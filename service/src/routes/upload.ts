import Router from 'express'
import multer from 'multer'
import { auth } from '../middleware/auth'

export const router = Router()

// Configure multer storage options
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/') // Make sure this folder exists
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}`)
  },
})

const upload = multer({ storage })
router.post('/upload-image', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file)
      res.send({ status: 'Fail', message: 'No files were uploaded', data: null })
    const data = {
      fileKey: req.file.filename,
    }
    // File uploaded
    res.send({ status: 'Success', message: 'File uploaded successfully', data })
  }
  catch (error) {
    res.send(error)
  }
})
