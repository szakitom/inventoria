import { useCallback, useEffect, useRef } from 'react'
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

interface UseBarcodeScannerProps {
  onDetected?: (code: string) => void
  container: HTMLElement | null
  open: boolean
  cameraId?: string
  constraints?: MediaTrackConstraints
}

export function useBarcodeScanner({
  onDetected,
  container,
  open,
  cameraId,
  constraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
}: UseBarcodeScannerProps) {
  const runningRef = useRef(false)

  const errorCheck = useCallback(
    (result: {
      codeResult: {
        code: string | null
        decodedCodes: { error?: number }[]
      }
    }) => {
      if (!onDetected || !result?.codeResult?.code) return

      const err = getMedianOfCodeErrors(result.codeResult.decodedCodes)
      if (err < 0.1) {
        onDetected(result.codeResult.code)
      }
    },
    [onDetected]
  )

  const handleProcessed = useCallback((result: QuaggaResult) => {
    const drawingCtx = Quagga.canvas.ctx.overlay
    const drawingCanvas = Quagga.canvas.dom.overlay
    if (!drawingCtx || !drawingCanvas) return

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
  }, [])

  useEffect(() => {
    if (!container || !open) return

    const init = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1))
        await Quagga.init(
          {
            inputStream: {
              type: 'LiveStream',
              constraints: {
                ...constraints,
                ...(cameraId && { deviceId: cameraId }),
                ...(!cameraId && { facingMode: 'environment' }),
              },
              target: container,
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
              console.error('Quagga init error:', err)
              return
            }
            await Quagga.start()
            runningRef.current = true
          }
        )

        Quagga.onProcessed(handleProcessed)
        Quagga.onDetected(errorCheck)
      } catch (err) {
        console.error('Quagga error:', err)
      }
    }

    const cleanup = async () => {
      if (!runningRef.current) return
      await Quagga.stop()
      await Quagga.CameraAccess.release()
      Quagga.offProcessed(handleProcessed)
      Quagga.offDetected(errorCheck)
      runningRef.current = false
    }

    init()

    return () => {
      cleanup()
    }
  }, [container, open, cameraId, constraints, errorCheck, handleProcessed])
}
