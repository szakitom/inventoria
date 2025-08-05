import { useCallback, useLayoutEffect, type RefObject } from 'react'
import Quagga from '@ericblade/quagga2'
import { getMedianOfCodeErrors } from '@utils/index'

type QuaggaBox = number[][]

interface ProcessedResult {
  box?: QuaggaBox
  boxes?: QuaggaBox[]
}

const decoders = ['code_128_reader', 'ean_reader', 'ean_8_reader']

const BarcodeScanner = ({
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

  const handleProcessed = (result: ProcessedResult) => {
    const drawingCtx = Quagga.canvas.ctx.overlay
    const drawingCanvas = Quagga.canvas.dom.overlay
    // Clear the whole canvas at the start of processing each frame
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)

    if (result) {
      if (result.boxes) {
        result.boxes
          .filter((box) => box !== result.box)
          .forEach((box) => {
            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
              color: 'purple',
              lineWidth: 2,
            })
          })
      }
      if (result.box) {
        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
          color: 'green',
          lineWidth: 2,
        })
      }
    }
  }

  useLayoutEffect(() => {
    let initialized = false

    console.log({
      constraints: {
        ...constraints,
        ...(cameraId && { deviceId: cameraId }),
        ...(!cameraId && { facingMode: 'environment' }),
      },
    })

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
  }, [cameraId, onDetected, scannerRef, errorCheck, constraints])
  return null
}

export default BarcodeScanner
