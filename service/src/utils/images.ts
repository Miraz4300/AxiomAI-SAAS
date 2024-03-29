import fs from 'node:fs/promises'
import * as fileType from 'file-type'

fs.mkdir('uploads').then(() => {
  globalThis.console.log('Directory uploads created')
}).catch((e) => {
  if (e.code === 'EEXIST') {
    globalThis.console.log('Directory uploads already exists')
    return
  }
  globalThis.console.error('Error creating directory uploads, ', e)
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
