const DEBUG = true;
const DBG_CIRCLE_SIZE = 8;

const WIDTH = 640;
const HEIGHT = 480;

const LEFT_IDX = 0;
const RIGHT_IDX = 1;

const DRAW_CONFIDENCE = 0.8;

let dbgBox = window.document.getElementById("debug-box");

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

  updateWithGesture(gesture) {
    let lastGesture = (this.gestures.length>0) ? this.gestures[this.gestures.length-1] : {name:''}
    if (lastGesture.name == gesture.name)  {
      lastGesture.count++;
      this.gestures[this.gestures.length-1]=lastGesture;
    }else {
      gesture.count = 1;
      this.gestures.push(gesture);
    }
  }

  debugLogUpdate() {
    dbgBox.innerHTML += `<div style="display: table-cell;">`
    dbgBox.innerHTML += this.side +": <br>";
    for (v of this.gestures) {
      dbgBox.innerHTML += v.name +" : "+v.count+"<br>";
    }
    dbgBox.innerHTML += `</div>`
  }

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
      if (this.magicEnabled) {
        this.drawMagicCircle();
      }
    }
  }

  drawMagicCircle() {
    let size = this.size * 2.2;
    push();
    imageMode(CENTER);
    translate(WIDTH * this.x, HEIGHT * this.y);
    rotate(this.rotation);
    image(mgc, 0, 0, size, size);
    pop();

  }
}

var hands = [new MyHand("left"), new MyHand("right")];



function setup() {

  let cnv = createCanvas(WIDTH, HEIGHT);
  cnv.parent(select("#video-box"))

  

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
  hf.useGesture({
    "name": "pistol",
    "algorithm": "fingerpose",
    "models": "hands",
    "confidence": 7.5,
    "description": [
      [
        "addCurl",
        "Thumb",
        "NoCurl",
        1
      ],
      [
        "addCurl",
        "Index",
        "NoCurl",
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
    if (data?.hands?.gesture?.length !== undefined) {
      // indexes swapped
      // move checks to update
      if (data?.hands?.gesture[1] !== null && data?.hands?.gesture[1].name !== "") {
        hands[LEFT_IDX].updateWithGesture(data.hands.gesture[1]);
      }
      if (data?.hands?.gesture[0] !== null && data?.hands?.gesture[0].name !== "") {
        hands[RIGHT_IDX].updateWithGesture(data.hands.gesture[0]);
      }
    }
  })
  // get gesture category(calulate based on arcs between fingers and state (curled or straightened))
  // append to structure {gesture + how many times in the row} (append only if first sequence is from starter)
  // verify if gestures in array are from sequence 
}


function draw() {
  // setup camera

  image(video, 0, 0);

  dbgBox.innerHTML = `<div style="width: 100%; display: table;">
  <div style="display: table-row">`;
  for (hand of hands) {
    hand.draw();
    hand.debugLogUpdate();
  }
  dbgBox.innerHTML += `</div>
  </div>`
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
