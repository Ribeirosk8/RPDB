import Link from "next/link";
import React from "react";
// Import FontAwesome configuration
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";


config.autoAddCss = false;

const Navigation: React.FC = () => {
  return (
    <nav className="sidenav p-4 bg-gray-800 text-white h-full">
      <Link href="/" legacyBehavior>
        <a className="nav-button flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded transition duration-300 ease-in-out transform hover:scale-10">
          <FontAwesomeIcon icon={faHome} className="text-10xl" />
        </a>
      </Link>
    </nav>
  );
};

export default Navigation;
