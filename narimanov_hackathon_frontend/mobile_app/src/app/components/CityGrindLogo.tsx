import cityGrindLogo from "../../imports/city-grind-logo.png";

interface CityGrindLogoProps {
  size?: number;
}

export function CityGrindLogo({ size = 50 }: CityGrindLogoProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(10, Math.round(size * 0.32)),
        flexShrink: 0,
        background: "#0B5CFF",
        boxShadow: "0 8px 28px rgba(11,92,255,0.42)",
        border: "1.5px solid rgba(255,255,255,0.28)",
        overflow: "hidden",
      }}
    >
      <img
        src={cityGrindLogo}
        alt="City Grind"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
    </div>
  );
}
