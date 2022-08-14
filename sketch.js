const DEBUG = true;
const WIDTH = 640;
const HEIGHT = 480;
const DBG_CIRCLE_SIZE = 8;

var rotation = 0;

function setup() {

  createCanvas(WIDTH, HEIGHT);
  background(0, 0, 0, 0.1);
  video = createCapture(VIDEO);
  video.size(WIDTH, HEIGHT)
  video.hide();

  // load all the images etc.
  mgc = loadImage("imgs/magic-strange.png");

  hf = new Handsfree({
    hands: true,
    maxNumHands: 2,
    setup: {
      video: video,
    },
  })
  hf.enablePlugins('browser')
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
        handStateFromLandmarks(data.hands.multiHandLandmarks[1])
        ]
        break;
    }
  })

  // get gesture category(calulate based on arcs between fingers and state (curled or straightened))
  // append to structure {gesture + how many times in the row} (append only if first sequence is from starter)
  // verify if gestures in array are from sequence 
}


function draw() {
  // setup camera
  rotation += 0.1 * random(0, 1);
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
    for (handLandmarks of hf.data.hands.multiHandLandmarks) {
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
    size = hand.size * 2.2;
    push();
    imageMode(CENTER);
    translate(WIDTH * hand.x, HEIGHT * hand.y);
    rotate(rotation);
    image(mgc, 0, 0, size, size);
    pop();
  }
}

function handStateFromLandmarks(s) {
  return {
    x: s[21].x,
    y: s[21].y,
    size: maxDistance(s),
  }
}

function maxDistance(s) {
  m = 0
  for (v of s) {
    d = pointsDistance(v, s[21])
    if (d > m) {
      m = d
    }
  }
  return m
}

function pointsDistance(p1, p2) {
  x = WIDTH * (p1.x - p2.x)
  y = HEIGHT * (p1.y - p2.y)
  return sqrt(x * x + y * y)
}
