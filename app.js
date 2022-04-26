const button = document.getElementById("button");
const icon = document.getElementById("swap-icon");

let devicesIds = [];
let currentDeviceIndex = 0;

navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
    devicesIds = mediaDevices
        .filter(mediaDevice => mediaDevice.kind === 'videoinput')
        .map((mediaDevice) => mediaDevice.deviceId);

    if (devicesIds.length > 1)
        button.style = '';
});

button.addEventListener("click", () => {
    icon.textContent = "more_horiz";

    const video = document.getElementById("arjs-video");
    video.srcObject.getTracks().forEach((track) => {
        track.stop();
    });

    currentDeviceIndex = (currentDeviceIndex + 1) % devicesIds.length;
    const deviceId = devicesIds[currentDeviceIndex];

    const constraints = {
        video: {
            deviceId: {exact: deviceId},
        },
        audio: false,
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;

        const event = new CustomEvent("camera-init", {stream: stream});
        window.dispatchEvent(event);

        icon.textContent = "cached";
    }).catch(e => alert(e + JSON.stringify(constraints)));
});


const image = document.querySelector("#snap");
const take_photo_btn = document.querySelector("#take-photo");
const delete_photo_btn = document.querySelector("#delete-photo");
const download_photo_btn = document.querySelector("#download-photo");

//Snapshot button
take_photo_btn.addEventListener("click", function (e) {
    e.preventDefault();
    let video = document.querySelector("video");
    let snap = takeSnapshot(video);

    //snap shot display.
    image.setAttribute("src", snap);
    image.classList.add("visible");

    take_photo_btn.classList.add("disabled");

    //delete button and save button effective
    delete_photo_btn.classList.remove("disabled");
    download_photo_btn.classList.remove("disabled");

    // //Save button pass snapshot
    download_photo_btn.href = snap;
});

//delete button

delete_photo_btn.addEventListener("click", function (e) {
    e.preventDefault();

    //hide the snapshot
    image.setAttribute("src", "");
    image.classList.remove("visible");

    //delete button and save button invalid
    take_photo_btn.classList.remove("disabled");
    delete_photo_btn.classList.add("disabled");
    download_photo_btn.classList.add("disabled");
});

//take a snapshot

function takeSnapshot(video) {
    video.pause();
    let resizedCanvas = document.createElement("canvas");
    let resizedContext = resizedCanvas.getContext("2d");
    let width = video.videoWidth;
    let height = video.videoHeight;
    let aScene = document
        .querySelector("a-scene").components.screenshot.getCanvas("perspective");

    if (width && height) {
        //set the size of the canvas video
        resizedCanvas.width = width;
        resizedCanvas.height = height;

        //copy video to Canvas
        resizedContext.drawImage(video, 0, 0, width, height);

        //in the angle of view of the camera changes with the reduction processing of the ar side
        if (width > height) {
            //Horizontal (PC)
            resizedContext.drawImage(aScene, 0, 0, width, height);
        } else {
            //Vertical (smartphone )
            let scale = height / width;
            let scaledWidth = height * scale;
            let marginLeft = (width - scaledWidth) / 2;

            resizedContext.drawImage(aScene, marginLeft, 0, scaledWidth, height);
        }
        video.play();
        return resizedCanvas.toDataURL("image/png");

    }
}
