import logo from "../assets/logo.png";

export default function MsnLogo({ className = "h-9 w-9" }) {
  return (
    <img
      src={logo}
      alt="Milan Students Network"
      className={`${className} rounded-lg object-contain`}
    />
  );
}
