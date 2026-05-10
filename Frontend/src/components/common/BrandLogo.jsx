import React from "react";
import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";

/**
 * Single source of truth for the LHMMS brand mark.
 * Use everywhere a logo is needed (auth forms, navbars, footers, error pages).
 *
 * Props:
 *  - size: "sm" | "md" | "lg"           → tile + text size (default "md")
 *  - variant: "default" | "onDark"      → "default" for light surfaces (forms),
 *                                         "onDark" for emerald/dark surfaces (nav/footer)
 *  - linkTo: string | null              → wraps in <Link>; null disables (default "/")
 *  - className: extra classes on the wrapper
 */
const BrandLogo = ({
  size = "md",
  variant = "default",
  linkTo = "/",
  className = "",
}) => {
  const sizes = {
    sm: { tile: "p-1.5 rounded-md", icon: 16, text: "text-sm" },
    md: { tile: "p-2 rounded-lg", icon: 20, text: "text-lg" },
    lg: { tile: "p-3 rounded-xl", icon: 28, text: "text-2xl" },
  };
  const s = sizes[size] ?? sizes.md;

  const skin =
    variant === "onDark"
      ? { tile: "bg-white text-emerald-600", text: "text-white" }
      : { tile: "bg-emerald-500 text-white", text: "text-emerald-700" };

  const content = (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`${skin.tile} ${s.tile}`}>
        <Stethoscope size={s.icon} />
      </div>
      <span className={`font-bold ${skin.text} ${s.text} tracking-tight`}>
        LHMMS
      </span>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }
  return content;
};

export default BrandLogo;
