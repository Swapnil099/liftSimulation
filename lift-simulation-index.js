import { addToQueue, createLifts, setNearestLiftIndex } from "./lift-logic.js";

let currrentReqUserFloor = 0;
let totalfloors = 0;
let lifts = 0;
let liftSpeed = 0;
let doorOpenCloseTime = 0;
let breakdownFloor = 0;
let breakdownLiftNumber = 0;

document
  .getElementById("advancedSettings")
  .addEventListener("change", function (event) {
    event.preventDefault();
    const advancedSettingsContainer = document.getElementById(
      "advancedSettingsContainer"
    );
    advancedSettingsContainer.style.display = document.getElementById(
      "advancedSettings"
    ).checked
      ? "block"
      : "none";
  });

document
  .getElementById("liftSimulationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Form submitted");
    // Get form values
    totalfloors = Number(document.getElementById("numFloors").value);
    lifts = Number(document.getElementById("numLifts").value);
    liftSpeed = Number(document.getElementById("liftSpeed").value);
    doorOpenCloseTime = Number(document.getElementById("doorTime").value);
    breakdownFloor = Number(document.getElementById("breakdownFloor").value);
    breakdownLiftNumber = Number(
      document.getElementById("breakdownLiftNumber").value
    );

    generateLiftColumns(lifts, totalfloors);
    createLifts(totalfloors, lifts);
    document
      .getElementById("destination-submit-btn")
      .addEventListener("click", submitForm);
  });

function generateLiftColumns(numLifts, numFloors) {
  document.getElementById("main-body").style.display = "block";
  document.getElementById("input-form-wrapper").style.display = "none";
  document.getElementById("lifts-wrapper").style.width = 150 * numLifts + "px";

  const container = document.getElementById("lifts-wrapper");
  for (let liftIndex = 1; liftIndex <= numLifts; liftIndex++) {
    const liftColumn = document.createElement("div");
    liftColumn.classList.add("lift-column");
    liftColumn.id = "lift-column-" + liftIndex;
    liftColumn.style.height = 100 * numFloors + "px";
    container.appendChild(liftColumn);

    const btnColumn = document.createElement("div");
    btnColumn.classList.add("btn-column");

    let height = liftColumn.offsetHeight;
    let margin_top = height - 50 * numFloors;
    margin_top = margin_top / numFloors;

    for (let floorIndex = 1; floorIndex <= numFloors; floorIndex++) {
      const btnWrapper = document.createElement("div");
      btnWrapper.classList.add("btn-wrapper");
      btnWrapper.id = "btn-wrapper-" + liftIndex + "-" + floorIndex;

      if (floorIndex != 1) {
        btnWrapper.style.marginTop = margin_top + "px";
      }

      const btnUp = document.createElement("button");
      btnUp.classList.add("btn-up");
      btnUp.classList.add(liftIndex);
      let btnUpId = floorIndex;
      btnUp.id = btnUpId;

      btnUp.addEventListener("click", showPopup);
      btnUp.addEventListener("click", setCurrentFloor);
      btnUp.innerHTML = `<p style = "pointer-events: none;"><i class="fa-regular fa-square-caret-up" style = "pointer-events: none;"></i></p>`;

      const btnDown = document.createElement("button");
      btnDown.classList.add("btn-down");
      btnDown.classList.add(liftIndex);
      let btnDownId = floorIndex;
      btnDown.id = btnDownId;

      btnDown.addEventListener("click", showPopup);
      btnDown.addEventListener("click", setCurrentFloor);
      btnDown.innerHTML = `<p style = "pointer-events: none;"><i class="fa-regular fa-square-caret-down" style = "pointer-events: none;"></i></p>`;

      btnWrapper.appendChild(btnUp);
      btnWrapper.appendChild(btnDown);
      btnColumn.appendChild(btnWrapper);
    }

    const liftWrapper = document.createElement("div");
    liftWrapper.classList.add("lift-wrapper");

    const lift = document.createElement("div");
    lift.classList.add("lift");
    lift.id = "lift-id-" + liftIndex;

    const liftDoor = document.createElement("div");
    liftDoor.classList.add("lift-door");
    liftDoor.id = "lift-door-id-" + liftIndex;

    lift.appendChild(liftDoor);

    liftWrapper.appendChild(lift);

    liftColumn.appendChild(btnColumn);
    liftColumn.appendChild(liftWrapper);
  }

  for (let i = 1; i <= numFloors; i++) {
    const newOption = document.createElement("option");
    newOption.value = String(i);
    newOption.textContent = numFloors - i;
    if (numFloors - i == 0) newOption.textContent = "Ground Floor";
    document.getElementById("multiselect").appendChild(newOption);
  }

  let margin_top = getMarginTopForLiftLocation(numFloors);
  let liftDivs = document.getElementsByClassName("lift");

  for (let i = 0; i < liftDivs.length; i++) {
    liftDivs[i].style.marginTop = margin_top;
  }
}

function showPopup() {
  document.getElementById("popup").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  document.getElementById("pop-up-wrapper").style.display = "flex";
}

function submitForm() {
  // You can add logic to handle form submission here
  const selectElement = document.getElementById("multiselect");
  const destinationFloor = selectElement.value;
  if (Number(destinationFloor) === currrentReqUserFloor) {
    alert("You are already on the same floor");
    closePopup();
    return;
  } else if (Number(destinationFloor) > totalfloors) {
    alert("Please select a valid floor");
    closePopup();
    return;
  }
  addToQueue(currrentReqUserFloor, destinationFloor);
  closePopup();
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  document.getElementById("pop-up-wrapper").style.display = "none";
}

function setCurrentFloor(event) {
  event.preventDefault();
  setNearestLiftIndex(Number(event.target.classList[1]));
  currrentReqUserFloor = Number(event.target.id);
  console.log("current floor set to : " + currrentReqUserFloor);
  console.log("Nearest lift set to : " + Number(event.target.classList[1]));
}

export function getMarginTopForLiftLocation(floor) {
  var button = document.getElementById("btn-wrapper-1-" + floor);
  let margin_top = parseInt(button.style.marginTop);
  console.log("actual margin - " + margin_top);
  if (isNaN(margin_top)) margin_top = -1 * button.offsetHeight;
  if (floor == 1) margin_top = 0;
  else margin_top = margin_top * (floor - 1);
  margin_top = margin_top + button.offsetHeight * (floor - 1) + "px";
  console.log("floor no : " + floor + " margin top is " + margin_top);
  return margin_top;
}
