// Import the data to customize and insert them into page
const fetchData = () => {
  fetch("customize.json")
    .then(data => data.json())
    .then(data => {
      dataArr = Object.keys(data);
      dataArr.map(customData => {
        if (data[customData] !== "") {
          if (customData === "imagePath") {
            document
              .querySelector(`[data-node-name*="${customData}"]`)
              .setAttribute("src", data[customData]);
          } else {
            document.querySelector(`[data-node-name*="${customData}"]`).innerText = data[customData];
          }
        }

        // Check if the iteration is over
        // Run amimation if so
        if ( dataArr.length === dataArr.indexOf(customData) + 1 ) {
          animationTimeline();
        } 
      });
    });
};

  let resetScratchCard = () => {};

const initScratchCard = () => {
  const card = document.querySelector("[data-scratch-card]");
  const canvas = document.querySelector("[data-scratch-canvas]");

  if (!card || !canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  let isScratching = false;
  let lastPoint = null;
  let revealed = false;

  const drawCover = (width, height) => {
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#d9b16a";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    for (let offset = -height; offset < width + height; offset += 26) {
      ctx.fillRect(offset, 0, 10, height);
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
    ctx.beginPath();
    ctx.arc(width * 0.18, height * 0.22, Math.min(width, height) * 0.12, 0, Math.PI * 2);
    ctx.arc(width * 0.82, height * 0.28, Math.min(width, height) * 0.08, 0, Math.PI * 2);
    ctx.arc(width * 0.74, height * 0.76, Math.min(width, height) * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 248, 238, 0.92)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 18px 'Work Sans', sans-serif";
    ctx.fillText("Scratch for a gift", width / 2, height / 2 - 8);
    ctx.font = "400 13px 'Work Sans', sans-serif";
    ctx.fillText("Drag your mouse or finger", width / 2, height / 2 + 14);
    ctx.restore();
  };

  const resizeCanvas = () => {
    const width = card.clientWidth;
    const height = card.clientHeight;

    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!revealed) {
      drawCover(width, height);
    }
  };

  const getPoint = (event) => {
    const bounds = canvas.getBoundingClientRect();

    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    };
  };

  const scratchAt = (point, previousPoint) => {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 34;
    ctx.beginPath();
    ctx.moveTo(previousPoint ? previousPoint.x : point.x, previousPoint ? previousPoint.y : point.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.arc(point.x, point.y, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const revealCard = () => {
    if (revealed) {
      return;
    }

    revealed = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    card.classList.add("is-revealed");
  };

  const getScratchProgress = () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const step = Math.max(Math.round(12 * dpr), 12);
    let cleared = 0;
    let samples = 0;

    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const alpha = imageData[(y * canvas.width + x) * 4 + 3];
        samples += 1;

        if (alpha < 32) {
          cleared += 1;
        }
      }
    }

    return cleared / samples;
  };

  const endScratch = () => {
    if (!isScratching) {
      return;
    }

    isScratching = false;
    lastPoint = null;

    if (getScratchProgress() > 0.55) {
      revealCard();
    }
  };

  canvas.addEventListener("pointerdown", (event) => {
    if (revealed) {
      return;
    }

    isScratching = true;
    lastPoint = getPoint(event);
    canvas.setPointerCapture(event.pointerId);
    scratchAt(lastPoint);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!isScratching || revealed) {
      return;
    }

    const currentPoint = getPoint(event);
    scratchAt(currentPoint, lastPoint);
    lastPoint = currentPoint;
  });

  canvas.addEventListener("pointerup", endScratch);
  canvas.addEventListener("pointercancel", endScratch);
  canvas.addEventListener("pointerleave", endScratch);

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  resetScratchCard = () => {
    revealed = false;
    isScratching = false;
    lastPoint = null;
    card.classList.remove("is-revealed");
    resizeCanvas();
  };
};

// Animation Timeline
const animationTimeline = () => {
  // Spit chars that needs to be animated individually
  const textBoxChars = document.getElementsByClassName("hbd-chatbox")[0];
  const hbd = document.getElementsByClassName("wish-hbd")[0];

  textBoxChars.innerHTML = `<span>${textBoxChars.innerHTML
    .split("")
    .join("</span><span>")}</span`;

  hbd.innerHTML = `<span>${hbd.innerHTML
    .split("")
    .join("</span><span>")}</span`;

  const ideaTextTrans = {
    opacity: 0,
    y: -20,
    rotationX: 5,
    skewX: "15deg"
  };

  const ideaTextTransLeave = {
    opacity: 0,
    y: 20,
    rotationY: 5,
    skewX: "-15deg"
  };

  const tl = new TimelineMax();

  tl
    .to(".container", 0.1, {
      visibility: "visible"
    })
    .from(".one", 0.7, {
      opacity: 0,
      y: 10
    })
    .to(
      ".one",
      0.7,
      {
        opacity: 0,
        y: 10
      },
      "+=2.5"
    )
    .from(".three", 0.7, {
      opacity: 0,
      y: 10
      // scale: 0.7
    })
    .to(
      ".three",
      0.7,
      {
        opacity: 0,
        y: 10
      },
      "+=2"
    )
    .from(".four", 0.7, {
      scale: 0.2,
      opacity: 0
    })
    .from(".fake-btn", 0.3, {
      scale: 0.2,
      opacity: 0
    })
    .staggerTo(
      ".hbd-chatbox span",
      0.5,
      {
        visibility: "visible"
      },
      0.05
    )
    .to(".fake-btn", 0.1, {
      backgroundColor: "rgb(127, 206, 248)"
    })
    .to(
      ".four",
      0.5,
      {
        scale: 0.2,
        opacity: 0,
        y: -150
      },
      "+=0.7"
    )
    .from(".idea-1", 0.7, ideaTextTrans)
    .to(".idea-1", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-2", 0.7, ideaTextTrans)
    .to(".idea-2", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-3", 0.7, ideaTextTrans)
    .to(".idea-3 strong", 0.5, {
      scale: 1.2,
      x: 10,
      backgroundColor: "rgb(21, 161, 237)",
      color: "#fff"
    })
    .to(".idea-3", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-4", 0.7, ideaTextTrans)
    .to(".idea-4", 0.7, ideaTextTransLeave, "+=1.5")
    .from(
      ".idea-5",
      0.7,
      {
        rotationX: 15,
        rotationZ: -10,
        skewY: "-5deg",
        y: 50,
        z: 10,
        opacity: 0
      },
      "+=0.5"
    )
    .to(
      ".idea-5 .smiley",
      0.7,
      {
        rotation: 90,
        x: 8
      },
      "+=0.4"
    )
    .to(
      ".idea-5",
      0.7,
      {
        scale: 0.2,
        opacity: 0
      },
      "+=2"
    )
    .staggerFrom(
      ".idea-6 span",
      0.8,
      {
        scale: 3,
        opacity: 0,
        rotation: 15,
        ease: Expo.easeOut
      },
      0.2
    )
    .staggerTo(
      ".idea-6 span",
      0.8,
      {
        scale: 3,
        opacity: 0,
        rotation: -15,
        ease: Expo.easeOut
      },
      0.2,
      "+=1"
    )
    .staggerFromTo(
      ".baloons img",
      2.5,
      {
        opacity: 0.9,
        y: 1400
      },
      {
        opacity: 1,
        y: -1000
      },
      0.2
    )
    .from(
      ".lydia-dp",
      0.5,
      {
        scale: 3.5,
        opacity: 0,
        x: 25,
        y: -25,
        rotationZ: -45
      },
      "-=2"
    )
    .from(".hat", 0.5, {
      x: -100,
      y: 350,
      rotation: -180,
      opacity: 0
    })
    .staggerFrom(
      ".wish-hbd span",
      0.7,
      {
        opacity: 0,
        y: -50,
        // scale: 0.3,
        rotation: 150,
        skewX: "30deg",
        ease: Elastic.easeOut.config(1, 0.5)
      },
      0.1
    )
    .staggerFromTo(
      ".wish-hbd span",
      0.7,
      {
        scale: 1.4,
        rotationY: 150
      },
      {
        scale: 1,
        rotationY: 0,
        color: "#ff69b4",
        ease: Expo.easeOut
      },
      0.1,
      "party"
    )
    .from(
      ".wish h5",
      0.5,
      {
        opacity: 0,
        y: 10,
        skewX: "-15deg"
      },
      "party"
    )
    .staggerTo(
      ".eight svg",
      1.5,
      {
        visibility: "visible",
        opacity: 0,
        scale: 80,
        repeat: 3,
        repeatDelay: 1.4
      },
      0.3
    )
    .to(".six", 0.5, {
      opacity: 0,
      y: 30,
      zIndex: "-1"
    })
    .staggerFrom(".nine p", 1, ideaTextTrans, 1.2)
    .from(
      ".scratch-card",
      0.6,
      {
        opacity: 0,
        y: 16,
        scale: 0.96
      },
      "+=0.6"
    )
    .to(
      ".last-smile",
      0.5,
      {
        rotation: 90
      },
      "+=1"
    );

  // tl.seek("currentStep");
  // tl.timeScale(2);

  // Restart Animation on click
  const replyBtn = document.getElementById("replay");
  replyBtn.addEventListener("click", () => {
    resetScratchCard();
    tl.restart();
  });

  initScratchCard();
};

// Run fetch and animation in sequence
fetchData();