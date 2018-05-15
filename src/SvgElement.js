import React from "react";
import Immutable from "immutable";
import PropTypes from "prop-types";
import { Map } from "immutable";

const styles = {
  border: "0.0625rem solid #9c9c9c",
  borderRadius: "0.25rem",
  fill: "none"
};

const svgPath = (paths, command) => {
  // build the d attributes by looping over the paths
  const d = paths.reduce(
    (acc, path, i, a) =>
      i === 0
        ? // if first path
          `M ${path.get("x")},${path.get("y")}`
        : // else
          `${acc} ${command(path, i, a)}`,
    ""
  );
  return <path d={d} fill="none" stroke="black" />;
};

const line = (pointA, pointB) => {
  const lengthX = pointB.get("x") - pointA.get("x");
  const lengthY = pointB.get("y") - pointA.get("y");

  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  };
};

const controlPoint = (current, previous, next, reverse) => {
  const p = previous || current;
  const n = next || current;

  const smoothing = 0.2;

  const o = line(p, n);

  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;

  const x = current.get("x") + Math.cos(angle) * length;
  const y = current.get("y") + Math.sin(angle) * length;

  return [x, y];
};

const bezierCommand = (point, i, a) => {
  // start control point
  let cpsX = null;
  let cpsY = null;

  switch (i) {
    case 0:
      [cpsX, cpsY] = controlPoint(undefined, undefined, point);
      break;
    case 1:
      [cpsX, cpsY] = controlPoint(a.get(i - 1), undefined, point);
      break;
    default:
      [cpsX, cpsY] = controlPoint(a.get(i - 1), a.get(i - 2), point);
      break;
  }

  // end control point
  const [cpeX, cpeY] = controlPoint(point, a.get(i - 1), a.get(i + 1), true);
  return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point.get("x")},${point.get(
    "y"
  )}`;
};

const Path = ({ paths }) => {
  return svgPath(paths, bezierCommand);
};

const SvgElement = ({ paths, width, height, strokeColor, strokeWidth }) => (
  <svg
    version="1.1"
    baseProfile="full"
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{
      strokeColor,
      strokeWidth,
      ...styles
    }}
  >
    {paths.map((path, index) => <Path key={index} paths={path} />)}
  </svg>
);

export default SvgElement;