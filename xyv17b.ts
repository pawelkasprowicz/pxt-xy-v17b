
/**
 * Sterowanie odtwarzaczem MP3 XY-V17B przez UART.
 */
//% color=#1976D2 icon="\uf001" block="XY-V17B MP3"
namespace xyv17b {
    let initialized = false
    let currentTrack = 0
    let volume = 15
    let looping = false
    let playing = false
    let seenPlaying = false
    let finished = false
    let waitingForStart = false
    let paused = false
    let rxBuffer = pins.createBuffer(0)
    let lastQuery = 0
    let lastStart = 0
    let lastStatus = -1

    function sendCommand(command: number, data: number[]) {
        if (!initialized) return

        let frame = pins.createBuffer(data.length + 4)
        let sum = 0xAA + command + data.length

        frame[0] = 0xAA
        frame[1] = command
        frame[2] = data.length

        for (let i = 0; i < data.length; i++) {
            frame[i + 3] = data[i]
            sum += data[i]
        }

        frame[frame.length - 1] = sum & 0xFF
        serial.writeBuffer(frame)
    }

    function startTrack(track: number) {
        if (track < 1 || track > 65535) return

        currentTrack = track
        playing = false
        seenPlaying = false
        finished = false
        paused = false
        waitingForStart = true
        lastStart = input.runningTime()

        sendCommand(0x07, [
            Math.idiv(track, 256),
            track % 256
        ])
    }

    function handleStatus(status: number) {
        lastStatus = status

        if (status == 1) {
            playing = true
            paused = false
            seenPlaying = true
            waitingForStart = false
            finished = false
        } else if (status == 2) {
            playing = false
            paused = true
        } else if (status == 0) {
            playing = false
            paused = false

            if (seenPlaying && currentTrack > 0) {
                seenPlaying = false

                if (looping) {
                    startTrack(currentTrack)
                } else {
                    finished = true
                    currentTrack = 0
                }
            }
        }
    }

    function readResponses() {
        let incoming = serial.readBuffer(0)

        if (incoming.length > 0) {
            let combined = pins.createBuffer(
                rxBuffer.length + incoming.length
            )

            for (let i = 0; i < rxBuffer.length; i++) {
                combined[i] = rxBuffer[i]
            }

            for (let i = 0; i < incoming.length; i++) {
                combined[rxBuffer.length + i] = incoming[i]
            }

            rxBuffer = combined
        }

        while (rxBuffer.length >= 4) {
            if (rxBuffer[0] != 0xAA) {
                rxBuffer = rxBuffer.slice(1)
                continue
            }

            let length = rxBuffer[2]
            let frameSize = length + 4

            if (length > 16) {
                rxBuffer = rxBuffer.slice(1)
                continue
            }

            if (rxBuffer.length < frameSize) break

            let sum = 0

            for (let i = 0; i < frameSize - 1; i++) {
                sum += rxBuffer[i]
            }

            if ((sum & 0xFF) == rxBuffer[frameSize - 1]) {
                if (rxBuffer[1] == 0x01 && length == 1) {
                    handleStatus(rxBuffer[3])
                }

                rxBuffer = rxBuffer.slice(frameSize)
            } else {
                rxBuffer = rxBuffer.slice(1)
            }
        }
    }

    /**
     * Uruchom komunikacje UART z XY-V17B.
     */
    //% block="inicjalizuj XY-V17B TX %tx RX %rx"
    //% tx.defl=SerialPin.P13
    //% rx.defl=SerialPin.P15
    //% weight=100
    export function init(tx: SerialPin, rx: SerialPin): void {
        if (initialized) return

        serial.redirect(tx, rx, BaudRate.BaudRate9600)

        initialized = true
        rxBuffer = pins.createBuffer(0)
        lastQuery = input.runningTime()

        control.inBackground(function () {
            while (true) {
                if (initialized) {
                    readResponses()

                    if (input.runningTime() - lastQuery >= 200) {
                        sendCommand(0x01, [])
                        lastQuery = input.runningTime()
                    }
                }

                basic.pause(20)
            }
        })
    }

    /**
     * Odtworz plik MP3 o podanym numerze.
     */
    //% block="odtworz utwor %track"
    //% track.min=1 track.max=65535 track.defl=1
    //% weight=90
    export function play(track: number): void {
        if (!initialized) return
        startTrack(track)
    }

    /**
     * Zatrzymaj odtwarzanie.
     */
    //% block="zatrzymaj odtwarzanie"
    //% weight=80
    export function stop(): void {
        if (!initialized) return

        looping = false
        playing = false
        paused = false
        seenPlaying = false
        waitingForStart = false
        finished = false
        currentTrack = 0

        sendCommand(0x04, [])
    }

    /**
     * Wstrzymaj odtwarzanie.
     */
    //% block="pauza"
    //% weight=70
    export function pause(): void {
        if (!initialized) return
        sendCommand(0x03, [])
    }

    /**
     * Ustaw glosnosc od 0 do 30.
     */
    //% block="ustaw glosnosc %level"
    //% level.min=0 level.max=30 level.defl=15
    //% weight=60
    export function setVolume(level: number): void {
        if (!initialized) return

        level = Math.max(0, Math.min(30, level))
        volume = level

        sendCommand(0x13, [level])
    }

    /**
     * Odczytaj ustawiony poziom glosnosci.
     */
    //% block="glosnosc"
    //% weight=55
    export function getVolume(): number {
        return volume
    }

    /**
     * Wlacz lub wylacz automatyczne zapetlenie.
     */
    //% block="zapetlenie %enabled"
    //% weight=50
    export function setLoop(enabled: boolean): void {
        looping = enabled
    }

    /**
     * Czy modul aktualnie odtwarza utwor?
     */
    //% block="czy odtwarza"
    //% weight=40
    export function isPlaying(): boolean {
        return playing
    }

    /**
     * Czy utwor zakonczyl sie naturalnie?
     */
    //% block="czy zakonczono utwor"
    //% weight=30
    export function isFinished(): boolean {
        return finished
    }

    /**
     * Ostatni status odebrany z modulu.
     * 0 = STOP, 1 = GRA, 2 = PAUZA.
     */
    //% block="status odtwarzacza"
    //% weight=20
    export function getStatus(): number {
        return lastStatus
    }
}
