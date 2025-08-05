import { useCallback, useLayoutEffect, type RefObject } from 'react'
import Quagga from '@ericblade/quagga2'
import { getMedianOfCodeErrors } from '@utils/index'

const decoders = ['code_128_reader', 'ean_reader', 'ean_8_reader']

interface DecodedCode {
  error?: number
}

interface CodeResult {
  code: string | null
  decodedCodes: DecodedCode[]
}

interface QuaggaResult {
  box?: number[][]
  boxes?: (number[][] & { codeResult?: { code?: string } })[]
  codeResult?: CodeResult
}

const QuaggaScanner = ({
  onDetected,
  scannerRef,
  cameraId,
  constraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
}: {
  onDetected?: (result: string) => void
  scannerRef: RefObject<HTMLDivElement | null>
  cameraId?: string
  constraints?: MediaTrackConstraints
}) => {
  const errorCheck = useCallback(
    (result: {
      codeResult: {
        code: string | null
        decodedCodes: { error?: number }[]
      }
    }) => {
      if (!onDetected || result.codeResult.code == null) return

      const err = getMedianOfCodeErrors(result.codeResult.decodedCodes)
      if (err < 0.1) {
        onDetected(result.codeResult.code)
      }
    },
    [onDetected]
  )

  const handleProcessed = (result: QuaggaResult) => {
    const drawingCtx = Quagga.canvas.ctx.overlay
    const drawingCanvas = Quagga.canvas.dom.overlay
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)

    if (!result?.boxes?.length) return

    drawingCtx.lineWidth = 3
    drawingCtx.font = '36px Arial'

    result.boxes.forEach((box, idx) => {
      const isConfirmed = box === result.box
      const color = isConfirmed ? 'green' : 'purple'

      Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
        color,
        lineWidth: 4,
      })

      const code =
        result.boxes?.[idx]?.codeResult?.code ?? result?.codeResult?.code
      if (code) {
        const [topLeft] = box
        drawingCtx.fillStyle = color
        drawingCtx.fillText(code, topLeft[0] + 10, topLeft[1] - 10)
      }
    })
  }

  useLayoutEffect(() => {
    let initialized = false

    const init = async () => {
      try {
        if (!scannerRef || !scannerRef.current) return
        await new Promise((resolve) => setTimeout(resolve, 1))
        if (initialized) return

        await Quagga.init(
          {
            inputStream: {
              type: 'LiveStream',
              constraints: {
                ...constraints,
                ...(cameraId && { deviceId: cameraId }),
                ...(!cameraId && { facingMode: 'environment' }),
              },
              target: scannerRef.current,
              willReadFrequently: true,
            },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            locator: {
              patchSize: 'medium',
              halfSample: true,
            },
            decoder: {
              readers: decoders.map((format) => ({
                format,
                config: { supplements: [] },
              })),
            },
            locate: true,
          },
          async (err) => {
            if (err) {
              return console.error('Error starting Quagga:', err)
            }
            await Quagga.start()
            initialized = true
          }
        )
        await Quagga.onProcessed(handleProcessed)
        await Quagga.onDetected(errorCheck)
      } catch (error) {
        console.error('Error initializing Quagga:', error)
      }
    }
    init()

    return () => {
      initialized = false
      const cleanup = async () => {
        await Quagga.stop()
        await Quagga.CameraAccess.release()
        await Quagga.offProcessed(handleProcessed)
        await Quagga.offDetected(errorCheck)
      }
      cleanup()
    }
  }, [cameraId, constraints, errorCheck, scannerRef])
  return null
}

export default QuaggaScanner
