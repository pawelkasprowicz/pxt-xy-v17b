
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

basic.showIcon(IconNames.Yes)
