

// https://editor.p5js.org/pixelfelt/sketches/oS5CwSbM1
const WIDTH = 640;
const HEIGHT = 480;
let MAGIC_CIRCLE_SIZE = WIDTH / 4;

function setup() {

  hf = new Handsfree({ hands: true })
  hf.start()
  handsPositions = []

  hf.use('gestureColletor', data => {
    switch (data?.hands?.multiHandLandmarks?.length) {
      case undefined:
        return;
      case 0:
        handsPositions = [];
        break;
      case 1:
        handsPositions = [data.hands.multiHandLandmarks[0][21]]
        let l = data.hands.multiHandLandmarks[0][4]
        let r = data.hands.multiHandLandmarks[0][20]
        MAGIC_CIRCLE_SIZE = WIDTH * abs(l.x - r.x);
        break;
      case 2:
        handsPositions = [data.hands.multiHandLandmarks[0][21], data.hands.multiHandLandmarks[1][21]]
        break;
    }

    // get gesture category(calulate based on arcs between fingers and state (curled or straightened))
    // append to structure {gesture + how many times in the row} (append only if first sequence is from starter)
    // verify if gestures in array are from sequence 

  })

  createCanvas(WIDTH, HEIGHT);
  background(0, 0, 0, 0.1);
  video = createCapture(VIDEO);
  video.size(WIDTH, HEIGHT)
  video.hide();

  // load all the images etc.
  mgc = loadImage("imgs/magic-strange.png");
}


function draw() {
  // setup camera
  image(video, 0, 0);
  for (hand of handsPositions) {
    image(mgc, WIDTH * hand.x - MAGIC_CIRCLE_SIZE / 2, HEIGHT * hand.y - MAGIC_CIRCLE_SIZE / 2,
      MAGIC_CIRCLE_SIZE, MAGIC_CIRCLE_SIZE);
  }
  // tint(255, 0, 255);

  // if (hf.data?.hands?.landmarksVisible[0]) {
  //   console.log(hf.data.hands.landmarks[0])
  // }
}
