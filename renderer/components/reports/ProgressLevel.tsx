import React from "react";

const ProgressLevel = ({ percentage }) => {
  const strokeWidth = 30;
  const radius = 90;
  const cx = 110;
  const cy = 110;

  const clamp = Math.max(-100, Math.min(percentage, 100));

  // Convert polar to Cartesian
  const polarToCartesian = (cx, cy, r, angle) => {
    const rad = ((angle + 180) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  // Describe arc path
  const describeArc = (startAngle, endAngle, color, sweepFlag = 0) => {
    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    return (
      <path
        d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth} 
      />
    );
  };

  return (
    <div
      className="h-[350px] w-[300px]  border border-primary-300 rounded-lg p-5
      bg-primary-200 mt-3"
    >
      <h3 className="font-bold text-xl text-primary-900">
        Yearly Progress Level
      </h3>
      <p className="text-primary-900 font-semibold">
        Growth According To Previous Year
      </p>

      <span className="text-[60px] font-semibold text-primary-900">
        {clamp > 0 ? "" : clamp < 0 ? "-" : ""}
        {Math.abs(clamp)}%
      </span>

      <div>
        <div className="w-[220px] mx-auto mt-2">
          <svg width="220" height="130" viewBox="0 0 220 130">
            {/* Background Arcs */}
            {describeArc(90, 180, "#176437", 1)}
            {describeArc(90, 0, "#ef4440", 0)}
            {/* Foreground fill based on percentage */}
            {clamp > 0 &&
              describeArc(90, 90 + (clamp * 90) / 100, "#052e18", 1)}{" "}
            {clamp < 0 &&
              describeArc(90, 90 - (clamp * 90) / -100, "#b91c1c", 0)}{" "}
          </svg>
        </div>
      </div>

      <p className="text-[18px] font-semibold text-primary-950 text-center mt-2">
        Growth Pulse
      </p>
    </div>
  );
};

export default ProgressLevel;
