
# XY-V17B MP3 Player for micro:bit

Biblioteka MakeCode do sterowania modulem MP3 XY-V17B
przez UART za pomoca BBC micro:bit V2.

## Funkcje

- Odtwarzanie wybranego pliku MP3
- Zatrzymywanie odtwarzania
- Pauza
- Regulacja glosnosci 0-30
- Automatyczne zapetlenie utworu
- Wykrywanie konca odtwarzania
- Odczyt stanu odtwarzacza

## Podlaczenie

| micro:bit | XY-V17B |
|-----------|---------|
| P13 (TX)  | RX      |
| P15 (RX)  | TX      |
| GND       | GND     |

Modul XY-V17B wymaga osobnego zasilania 5 V.

UART: 9600 baud.

## Konfiguracja trybu UART

CON1 -> GND przez 10 kOhm

CON2 -> GND przez 10 kOhm

CON3 -> 3.3 V przez 10 kOhm

## Karta microSD

Pliki MP3 umiesc w katalogu glownym karty.

Przykladowe nazwy:

- 00001.mp3
- 00002.mp3
- 00003.mp3

## Przykladowy program

```typescript
xyv17b.init(SerialPin.P13, SerialPin.P15)
xyv17b.setVolume(15)
xyv17b.setLoop(true)

input.onButtonPressed(Button.A, function () {
    xyv17b.play(1)
})

input.onButtonPressed(Button.B, function () {
    xyv17b.play(2)
})

input.onButtonPressed(Button.AB, function () {
    xyv17b.stop()
})
```

## Dostepne funkcje

| Funkcja | Opis |
|---------|------|
| init(tx, rx) | Inicjalizacja UART |
| play(track) | Odtwarzanie pliku |
| stop() | Zatrzymanie |
| pause() | Pauza |
| setVolume(level) | Glosnosc 0-30 |
| getVolume() | Odczyt ustawionej glosnosci |
| setLoop(enabled) | Zapetlenie |
| isPlaying() | Czy odtwarza |
| isFinished() | Czy zakonczono |
| getStatus() | Status modulu |

## Uwagi

Biblioteka nie wymaga wyswietlacza OLED.

Status odtwarzacza jest sprawdzany automatycznie
co 200 ms.

Zapetlenie jest realizowane programowo.

## Autor

Pawel Kasprowicz
```
