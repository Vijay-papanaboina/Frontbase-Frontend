import { Link } from "react-router-dom";

const Logo = () => (
  <Link to="/" className="flex items-center gap-2 font-semibold">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-blue-400"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
    </svg>
    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-teal-400">
      Frontbase
    </span>
  </Link>
);

export default Logo;
