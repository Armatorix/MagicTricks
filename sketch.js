const DEBUG = true;
const WIDTH = 640;
const HEIGHT = 480;
const DBG_CIRCLE_SIZE = 8;
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
        handsPositions = [handStateFromLandmarks(data.hands.multiHandLandmarks[0])]
        break;
      case 2:
        handsPositions = [handStateFromLandmarks(data.hands.multiHandLandmarks[0]),
        handStateFromLandmarks(data.hands.multiHandLandmarks[1])]
        break;
    }
  })

  // get gesture category(calulate based on arcs between fingers and state (curled or straightened))
  // append to structure {gesture + how many times in the row} (append only if first sequence is from starter)
  // verify if gestures in array are from sequence 

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
  drawDebugDots();
  drawMagicCircles();



  // tint(255, 0, 255);

  // if (hf.data?.hands?.landmarksVisible[0]) {
  //   console.log(hf.data.hands.landmarks[0])
  // }
}
function drawDebugDots() {
  if (hf?.data?.hands?.multiHandLandmarks !== undefined && DEBUG) {
    fill(244, 17, 17)
    for (handLandmarks of hf?.data?.hands?.multiHandLandmarks) {
      for (handLandmark of handLandmarks) {
        circle(handLandmark.x * WIDTH,
          handLandmark.y * HEIGHT,
          DBG_CIRCLE_SIZE);
      }
    }
  }
}

function drawMagicCircles() {
  for (hand of handsPositions) {
    let size = hand.size * WIDTH;
    image(mgc, WIDTH * hand.x - size / 2, HEIGHT * hand.y - size / 2,
      size, size);
  }
}

function handStateFromLandmarks(s) {
  return {
    x: s[21].x,
    y: s[21].y,
    size: sqrt((s[4].x - s[20].x) * (s[4].x - s[20].x) +
      (s[4].y - s[20].y) * (s[4].y - s[20].y))
  };
}
