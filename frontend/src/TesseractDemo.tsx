import { useEffect, useRef, useState } from 'react'
import { createWorker, PSM, OEM } from 'tesseract.js'

const IMAGE_URL = 'https://tesseract.projectnaptha.com/img/eng_bw.png'

interface WordBox {
  text: string
  bbox: { x0: number; y0: number; x1: number; y1: number }
  index: number
}

const TesseractDemo = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [wordBoxes, setWordBoxes] = useState<WordBox[]>([])
  const [selectedWords, setSelectedWords] = useState<WordBox[]>([])

  useEffect(() => {
    const recognize = async () => {
      const worker = await createWorker(['eng', 'hun'], 1, {
        logger: (m) => console.log(m),
      })

      await worker.setParameters({
        tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
        tessedit_pageseg_mode: PSM.SPARSE_TEXT_OSD,
      })

      const image = new Image()
      image.src = IMAGE_URL
      image.crossOrigin = 'anonymous'
      await image.decode()

      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(image, 0, 0)

      const ret = await worker.recognize(image, {}, { blocks: true })

      const words = (ret.data.blocks || [])
        .flatMap((block) =>
          block.paragraphs.flatMap((paragraph) =>
            paragraph.lines.flatMap((line) => line.words)
          )
        )
        .map((word, i) => ({ text: word.text, bbox: word.bbox, index: i }))

      setWordBoxes(words)

      // Draw bounding boxes
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 2
      ctx.font = '16px sans-serif'
      ctx.fillStyle = 'red'

      words.forEach((word) => {
        const { x0, y0, x1, y1 } = word.bbox
        ctx.strokeRect(x0, y0, x1 - x0, y1 - y0)
        ctx.fillText(word.text, x0, y0 - 5)
      })

      await worker.terminate()
    }

    recognize()
  }, [])

  const highlightWord = (bbox: {
    x0: number
    y0: number
    x1: number
    y1: number
  }) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 2
    ctx.strokeRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0)
  }

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY

    const clickedWord = wordBoxes.find(({ bbox }) => {
      return x >= bbox.x0 && x <= bbox.x1 && y >= bbox.y0 && y <= bbox.y1
    })

    if (clickedWord) {
      console.log('Clicked word:', clickedWord.text)
      highlightWord(clickedWord.bbox)

      setSelectedWords((prev) =>
        prev.some((w) => w.index === clickedWord.index)
          ? prev
          : [...prev, clickedWord]
      )
    }
  }

  const ordered = [...selectedWords].sort((a, b) => a.index - b.index)
  const selectedText = ordered.map((w) => w.text).join(' ')

  return (
    <div>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ maxWidth: '100%', cursor: 'pointer', display: 'block' }}
      />
      <p style={{ marginTop: '1rem' }}>
        <strong>Selected (in reading order):</strong> {selectedText}
      </p>
    </div>
  )
}

export default TesseractDemo
