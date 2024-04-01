import { Button } from "@components/index";
import React, { FC, useState } from 'react';
import { FaBeer } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { FaHome, FaLink } from 'react-icons/fa';
import { RxAvatar } from "react-icons/rx";
import { Link } from "@remix-run/react";

const iconsX = {
  home: FaHome,
  default: FaLink,
  avatar: RxAvatar,
}

interface ButtonProps {
  id: number;
  label: string;
  variant?: string;
  color?: string;
  startIcon?: string;
  linkTo?: string;
}

interface ButtonGroupProps {
  className?: string;
  buttons: ButtonProps[];
  onSelect?: (buttonId: number) => void;
}

export const ButtonGroup: FC<ButtonGroupProps> = ({ buttons, onSelect, className }) => {
  const [selectedButton, setSelectedButton] = useState<number | null>(null);

  const handleButtonClick = (buttonId: number) => {
    setSelectedButton(buttonId);
    if (onSelect) {
      onSelect(buttonId);
    }
  };

  const mapButtonIcon = (name: string) => {
    if (!name) return <iconsX.default />;

    if (name === 'home')
      return <iconsX.home />;

    if (name === 'avatar')
      return <iconsX.avatar />

    return <iconsX.default />;
  }

  return (
    <div className={className ? className : ""}>
      {buttons.map((button) => {
        const iconName = button.startIcon ? button.startIcon : "home";
        //@ts-ignore
        const icon = mapButtonIcon(button.startIcon);
        return (
          <Link key={button.id} className="flex items-center" to={button.linkTo || '/'}>
            {/* <Button
              onClick={() => handleButtonClick(button.id)}>
              {button.label}
            </Button> */}

            <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              onClick={() => handleButtonClick(button.id)}>
              {button.label}
            </button>
          </Link>
        )
      })}
    </div >
  );
};
