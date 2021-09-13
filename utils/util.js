export function getFrameSliceOptions(devicePosition, frameWidth, frameHeight, displayWidth, displayHeight) {
  let result = {
    start: [0, 0, 0],
    size: [-1, -1, 3]
  }

  const ratio = displayHeight / displayWidth

  if (ratio > frameHeight / frameWidth) {
    result.start = [0, Math.ceil((frameWidth - Math.ceil(frameHeight / ratio)) / 2), 0]
    result.size = [-1, Math.ceil(frameHeight / ratio), 3]
  } else {
    result.start = [Math.ceil((frameHeight - Math.floor(ratio * frameWidth)) / 2), 0, 0]
    result.size = [Math.ceil(ratio * frameWidth), -1, 3]
  }

  return result
}

const fingerLookupIndices = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20]
};

export function drawPoint(ctx, y, x, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

export function drawKeypoints(ctx, keypoints) {
  const keypointsArray = keypoints;

  for (let i = 0; i < keypointsArray.length; i++) {
    const y = keypointsArray[i][0];
    const x = keypointsArray[i][1];
    drawPoint(ctx, x - 2, y - 2, 3);
  }

  const fingers = Object.keys(fingerLookupIndices);
  for (let i = 0; i < fingers.length; i++) {
    const finger = fingers[i];
    const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
    drawPath(ctx, points, false);
  }
}

export function drawPath(ctx, points, closePath) {
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }

  if (closePath) {
    region.closePath();
  }
  ctx.stroke(region);
}

export function getNode(id, ctx) {
  return new Promise(resolve => {
    wx.createSelectorQuery().in(ctx).select(id).fields({ node: true, rect: true, size: true }).exec(resolve);
  });
}
export function objectFit(imgW, imgH, canW, canH) {
  let w, h;
  const canRatio = canW / canH;
  const imgRatio = imgW / imgH;
  if (canRatio > imgRatio) {
    w = canW;
    h = canW / imgRatio;
  }
  else {
    w = canH * imgRatio;
    h = canH;
  }
  return [w, h];
}
export const fetch = url => new Promise((resolve, reject) => wx.request({ url, success: resolve, fail: reject }));
export const onePixel = {
  width: 1,
  height: 1,
  data: new Uint8Array([0, 0, 0, 1]),
}

