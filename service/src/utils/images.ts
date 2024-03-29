import fs from 'node:fs/promises'
import * as fileType from 'file-type'
import logger from '../logger/winston'

fs.mkdir('uploads').then(() => {
  logger.info('Directory uploads created')
}).catch((e) => {
  if (e.code === 'EEXIST') {
    logger.info('Directory uploads already exists')
    return
  }
  logger.error('Error creating directory uploads, ', e)
})

export async function convertImageUrl(uploadFileKey: string): Promise<string> {
  const imageData = await fs.readFile(`uploads/${uploadFileKey}`)
  // Determine the file format
  const imageType = await fileType.fileTypeFromBuffer(imageData)
  const mimeType = imageType.mime
  // Convert image data to a Base64 encoded string
  const base64Image = imageData.toString('base64')
  return `data:${mimeType};base64,${base64Image}`
}
