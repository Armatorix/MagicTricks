const DEBUG = true;
const DBG_CIRCLE_SIZE = 8;

const WIDTH = 640;
const HEIGHT = 480;

const LEFT_IDX = 0;
const RIGHT_IDX = 1;

const DRAW_CONFIDENCE = 0.8;

class MyHand {
  constructor(side) {
    this.side = side;
    this.magicEnabled = false;
    this.gestures = [];
    this.drawable = false;
    this.rotation = 0;
    this.confidence = 0;


    this.size = 0;
    this.x = 0;
    this.y = 0;
  }

  // catchGesture();
  updateWithLandmarks(landmarks, confidence) {
    this.rotation += random(-0.02, 0.12);
    this.confidence = confidence;
    if (landmarks === null) {
      this.drawable = false;
      return;
    }
    this.x = landmarks[21].x;
    this.y = landmarks[21].y;
    this.size = maxDistance(landmarks);

    if (this.confidence > DRAW_CONFIDENCE) {
      this.drawable = true;
    } else {
      this.drawable = false;
    }
  }

  draw() {
    if (this.drawable) {
      let size = this.size * 2.2;
      push();
      imageMode(CENTER);
      translate(WIDTH * this.x, HEIGHT * this.y);
      rotate(this.rotation);
      image(mgc, 0, 0, size, size);
      pop();

    }
  }
}

var hands = [new MyHand("left"), new MyHand("right")];



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
  hf.start()
  handsPositions = []
  hf.useGesture({
    "name": "fist",
    "algorithm": "fingerpose",
    "models": "hands",
    "confidence": 7.5,
    "description": [
      [
        "addCurl",
        "Index",
        "FullCurl",
        1
      ],
      [
        "addCurl",
        "Middle",
        "FullCurl",
        1
      ],
      [
        "addCurl",
        "Ring",
        "FullCurl",
        1
      ],
      [
        "addCurl",
        "Pinky",
        "FullCurl",
        1
      ],
      [
        "setWeight",
        "Index",
        2
      ]
    ]
  })


  hf.use('positionCollector', data => {
    let lLandmarks = null;
    let lConfidance = 0;
    let rLandmarks = null;
    let rConfidance = 0;
    switch (data?.hands?.multiHandLandmarks?.length) {
      case undefined:
        break;
      case 0:
        break;
      case 1:
        if (data.hands.multiHandedness[0].label === "Right") {
          rLandmarks = data.hands.multiHandLandmarks[0];
          rConfidance = data.hands.multiHandedness[0].score;
        } else {
          lLandmarks = data.hands.multiHandLandmarks[0];
          lConfidance = data.hands.multiHandedness[0].score;
        }
        break;
      case 2:
        if (data.hands.multiHandedness[0].label === "Right") {
          rLandmarks = data.hands.multiHandLandmarks[0];
          rConfidance = data.hands.multiHandedness[0].score;

          lLandmarks = data.hands.multiHandLandmarks[1];
          lConfidance = data.hands.multiHandedness[1].score;
        } else {
          lLandmarks = data.hands.multiHandLandmarks[0];
          lConfidance = data.hands.multiHandedness[0].score;

          rLandmarks = data.hands.multiHandLandmarks[1];
          rConfidance = data.hands.multiHandedness[1].score;
        }
        break;
    }
    hands[LEFT_IDX].updateWithLandmarks(lLandmarks, lConfidance);
    hands[RIGHT_IDX].updateWithLandmarks(rLandmarks, rConfidance);
  })

  hf.use('gestureCollector', data => {
    // console.log(data.hands)
  })
  // get gesture category(calulate based on arcs between fingers and state (curled or straightened))
  // append to structure {gesture + how many times in the row} (append only if first sequence is from starter)
  // verify if gestures in array are from sequence 
}


function draw() {
  // setup camera
  image(video, 0, 0);

  for (hand of hands) {
    hand.draw();
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
