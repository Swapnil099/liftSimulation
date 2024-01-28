import { getMarginTopForLiftLocation } from "./lift-simulation-index.js";

let nearestLiftIndex = 1;

class Lift {
  constructor(id, currentFloorNum) {
    this.id = id;
    this.status = 0;
    this.currentFloor = currentFloorNum;
    this.route = [];
  }

  getNextStop() {
    if (this.status === 0 || this.route.length < 1) return -1;
    return this.status === -1
      ? this.route[this.route.length - 1]
      : this.route[0];
  }

  getFinalStop() {
    if (this.status === 0 || this.route.length < 1) return -1;
    return this.route[this.route.length - 1];
  }

  insertStop(floorNumber) {
    if (this.route.includes(floorNumber)) return;
    this.route.push(floorNumber);
    this.route.sort();
  }

  async startTrip(floorNumber) {
    this.insertStop(floorNumber);
    if (floorNumber > this.currentFloor) {
      this.status = 1;
    } else this.status = -1;

    while (this.route.length > 0) {
      let nextStop = this.getNextStop();
      if (this.currentFloor == nextStop) {
        console.log(
          this.id +
            " : Arrived at floor " +
            this.currentFloor +
            " - doors will close in 2 seconds"
        );
        this.route.shift();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await addOpenCloseAnimation(this.id);
        // await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.log(this.id + " : Curr Floor " + this.currentFloor);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      if (this.route.length > 0) this.currentFloor += this.status;
    }
    this.status = 0;
  }
}

let lifts;
let queue;

function insertStop(liftId, floorNumber) {
  lifts[liftId - 1].insertStop(floorNumber);
}

export function setNearestLiftIndex(index) {
  nearestLiftIndex = index;
}

async function addOpenCloseAnimation(liftId) {
  document
    .getElementById("lift-door-id-" + liftId)
    .classList.add("lift-open-close");
  await new Promise((resolve) => setTimeout(resolve, 5000));
  document
    .getElementById("lift-door-id-" + liftId)
    .classList.remove("lift-open-close");
}

async function startTrip(liftId, floorNumber) {
  let liftDiv = document.getElementById("lift-id-" + liftId);
  liftDiv.style.marginTop = getMarginTopForLiftLocation(floorNumber);
  console.log(
    "floor id margin top : " + getMarginTopForLiftLocation(floorNumber)
  );
  await lifts[liftId - 1].startTrip(floorNumber);
}

export function createLifts(floors, numberOfLifts) {
  lifts = [];
  queue = [];
  for (let i = 0; i < numberOfLifts; i++) {
    lifts.push(new Lift(i + 1, floors));
  }
  processQueue();
}

createLifts(4, 2);

function getNearestLiftId(targetFloor, currentFloor) {
  let direction = 1;
  if (targetFloor < currentFloor) direction = -1;
  let nearestLiftId = -1;
  let minDistance = Infinity;
  let minHorizonatalDistance = Infinity;

  for (let i = 0; i < lifts.length; i++) {
    const lift = lifts[i];
    const currMinHorizonalDist = Math.abs(lift.id - nearestLiftIndex);
    const currMinVerticaldistance = Math.abs(lift.currentFloor - currentFloor);
    console.log(
      "lift info - " +
        lift.id +
        " : " +
        lift.status +
        " : current floor : " +
        lift.currentFloor
    );

    if (
      lift.status === 0 &&
      minDistance == currMinVerticaldistance &&
      minHorizonatalDistance >= currMinHorizonalDist
    ) {
      minDistance = currMinVerticaldistance;
      minHorizonatalDistance = currMinHorizonalDist;
      nearestLiftId = lift.id;
    } else if (lift.status === 0 && minDistance > currMinVerticaldistance) {
      minDistance = currMinVerticaldistance;
      minHorizonatalDistance = currMinHorizonalDist;
      nearestLiftId = lift.id;
    }
  }

  return nearestLiftId;
}

function notSurpassed(lift, targetFloor, direction) {
  if (lift.status == 0) return true;
  if (direction == 1) {
    return lift.currentFloor <= targetFloor;
  }
  return lift.currentFloor >= targetFloor;
}

// add incoming request to queue
export function addToQueue(currentFloorOfUser, destinationFloorOfUser) {
  // Check if the pair is not already in the queue
  if (
    !queue.some((item) =>
      isEqual(item, {
        currentFloor: currentFloorOfUser,
        destinationFloor: destinationFloorOfUser,
      })
    )
  ) {
    // Add the pair to the queue
    queue.push({
      currentFloor: currentFloorOfUser,
      destinationFloor: destinationFloorOfUser,
    });

    // alert("Your lift is on its way!");
    console.log(
      `Added user request: Current floor ${currentFloorOfUser}, Destination floor ${destinationFloorOfUser}`
    );
  } else {
    alert("Request already in the queue.");
    console.log(
      `User request: Current floor ${currentFloorOfUser}, Destination floor ${destinationFloorOfUser} is already in the queue.`
    );
  }
}

export function processQueue() {
  setInterval(() => {
    if (queue.length > 0) {
      const request = queue[0]; // Get the front element of the queue

      // Attempt to assign the lift
      const success = assignLift(
        request.currentFloor,
        request.destinationFloor
      );

      if (success) {
        // If successful, remove the element from the queue
        console.log(`Request processed successfully. Removing from the queue.`);

        queue.shift();
      } else {
        // If not successful, log a message
        console.log(`Unable to process request. Will try again.`);
      }
    } else {
      // Log a message if the queue is empty
      // console.log(`Queue is empty.`);
    }
  }, 1000); // Run every 1 second
}

// Assign lift function
async function assignLift(startFloor, destinationFloor) {
  let liftId = getNearestLiftId(destinationFloor, startFloor);
  if (liftId === -1) return false;
  console.log(
    `Assigning lift : ${liftId} : for Current floor : ${startFloor} , Destination floor : ${destinationFloor}`
  );
  let lift = lifts[liftId - 1];
  if (lift.status === 0) {
    let liftDiv = document.getElementById("lift-id-" + liftId);

    liftDiv.classList.add("yellow-blink");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    liftDiv.classList.remove("yellow-blink");

    insertStop(liftId, startFloor);
    console.log(
      "current floor of lift : " + liftId + " : " + lift.currentFloor
    );
    liftDiv.style.transition =
      "margin-top " +
      Math.abs(startFloor - lift.currentFloor) * 2 +
      "s" +
      " ease-in-out";
    await startTrip(liftId, startFloor);

    insertStop(liftId, destinationFloor);
    console.log(
      "current floor of lift : " + liftId + " : " + lift.currentFloor
    );
    liftDiv.style.transition =
      "margin-top " +
      Math.abs(lift.currentFloor - destinationFloor) * 2 +
      "s" +
      " ease-in-out";

    await startTrip(liftId, destinationFloor);
  } else {
    insertStop(liftId, startFloor);
    insertStop(liftId, destinationFloor);
  }
  return true;
}

// helper function
function isEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}
