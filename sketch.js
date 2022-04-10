// https://editor.p5js.org/pixelfelt/sketches/oS5CwSbM1
function setup() {
  hf = new Handsfree({ hands: true })
  hf.start()

  createCanvas(320, 240);
  background(0, 0, 0, 0.1);
  video = createCapture(VIDEO);
  video.size(320, 240)
  video.hide()
}


function draw() {
  // setup camera
  image(video, 0, 0);
  tint(255, 0, 255)

  if (hf.data?.hands?.landmarksVisible[0]) {
    console.log(hf.data.hands.landmarks[0])
  }
}
