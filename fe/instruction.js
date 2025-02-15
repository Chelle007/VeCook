// for instruction page script

let handPose;
let video;
let hand = null; // Store only ONE hand

function preload() {
    handPose = ml5.handPose();
}

function setup() {
    createCanvas(400, 300);
    video = createCapture(VIDEO);
    video.size(400, 300);
    video.hide();
    handPose.detectStart(video, gotHands);
}

function draw() {
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();

    if (hand) {
        let fingers = ["thumb", "index_finger", "middle_finger", "ring_finger", "pinky"];
        let stretchedFingers = fingers.filter(finger => isFingerStretched(hand, finger));

        if (stretchedFingers.length > 0) {
            // console.log("Stretched fingers:", stretchedFingers.join(", "));
        }

        // When index, middle, ring finger is open
        if (isHandOpen(hand)) {
            let fingers = ["index_finger", "middle_finger", "ring_finger"];
            for (let i = 0; i < fingers.length; i++) {
                if (isFingerPointingUp(hand, fingers[i])) {
                    console.log("Hand is OPEN and UP✋");
                    // console.log(fingers[i] + " is pointing UP 👆");
                }
            }
        }

        if (isFingerStretched(hand, "index_finger")) {
            let direction = isFingerPointingLeftRight(hand, "index_finger");

            if (direction === "right") {
                console.log("Index finger is pointing RIGHT 👉");
                fetchNextStep();  // Fetch and log the next step from the backend
            } else if (direction === "left") {
                fetchPreviousStep();
                console.log("Index finger is pointing LEFT 👈");
            }
        }

        for (let j = 0; j < hand.keypoints.length; j++) {
            let keypoint = hand.keypoints[j];
            let mirroredX = width - keypoint.x;

            fill(0, 255, 0);
            noStroke();
            circle(mirroredX, keypoint.y, 10);
        }
    }
}

// Store only the first detected hand
function gotHands(results) {
    hand = results.length > 0 ? results[0] : null;
}

function isFingerStretched(hand, fingerName) {
    let tip = hand.keypoints.find(k => k.name === `${fingerName}_tip`);
    let dip = hand.keypoints.find(k => k.name === `${fingerName}_dip`);
    let pip = hand.keypoints.find(k => k.name === `${fingerName}_pip`);
    let mcp = hand.keypoints.find(k => k.name === `${fingerName}_mcp`);
    let wrist = hand.keypoints.find(k => k.name === "wrist");

    if (!tip || !dip || !pip || !mcp || !wrist) return false;

    let handLength = dist(wrist.x, wrist.y, mcp.x, mcp.y);
    let stretchDistance = dist(tip.x, tip.y, mcp.x, mcp.y);
    let isFarEnough = stretchDistance > handLength * 0.5; // Increased sensitivity

    // TODO: thumb and pinky not working
    // if (fingerName === "thumb") {
    //     // Check if the thumb is stretched outwards
    //     thumbIsStrecthed = dist(wrist.x, wrist.y, mcp.x, mcp.y) > handLength * 0.5;

    //     // Increase horizontal spread sensitivity for thumb
    //     return tip.x > mcp.x + handLength * 0.05; // Increase this value for more sensitivity
    // } else if (fingerName === "pinky") {
    //     // Increase vertical sensitivity for pinky
    //     return isFarEnough && tip.y < dip.y && tip.x < mcp.x; // Ensure the pinky is stretched outwards
    // } else {
    //     // Normal fingers: check vertical straightness
    //     return isFarEnough && tip.y < dip.y && dip.y < pip.y && pip.y < mcp.y;
    // }
    // Normal fingers: check vertical straightness
    return isFarEnough && tip.y < dip.y && dip.y < pip.y && pip.y < mcp.y;
}

function isFingerPointingLeftRight(hand, fingerName) {
    let tip = hand.keypoints.find(k => k.name === `${fingerName}_tip`);
    let mcp = hand.keypoints.find(k => k.name === `${fingerName}_mcp`);

    if (!tip || !mcp) return "unknown";

    return tip.x > mcp.x ? "left" : "right"; // Adjusted for mirrored video
}

function isFingerPointingUp(hand, fingerName) {
    let tip = hand.keypoints.find(k => k.name === `${fingerName}_tip`);
    let mcp = hand.keypoints.find(k => k.name === `${fingerName}_mcp`);

    if (!tip || !mcp) return "unknown";

    return tip.y < mcp.y ? "up" : "down"; // Adjusted for pointing up or down
}

function isHandOpen(hand) {
    // let fingers = ["thumb", "index_finger", "middle_finger", "ring_finger", "pinky"];

    // excluding thumb and pinky
    let fingers = ["index_finger", "middle_finger", "ring_finger"];
    
    // Check if all fingers are stretched
    return fingers.every(finger => isFingerStretched(hand, finger));
}