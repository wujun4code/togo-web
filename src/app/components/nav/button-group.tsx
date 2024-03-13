import { Button } from "@nextui-org/react";
import React, { FC, useState } from 'react';
import { FaBeer } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { FaHome, FaLink } from 'react-icons/fa';


const iconsX = {
  home: FaHome,
  default: FaLink,
}

interface ButtonProps {
  id: number;
  label: string;
  variant?: string;
  color?: string;
  startIcon?: string;
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

    return <iconsX.default />;
  }

  return (
    <div className={className ? className : ""}>
      {buttons.map((button) => {
        const iconName = button.startIcon ? button.startIcon : "home";
        //@ts-ignore
        const icon = mapButtonIcon(button.startIcon);
        return (
          <Button
            startContent={icon}
            key={button.id}
            onClick={() => handleButtonClick(button.id)}>
            {button.label}
          </Button>)
      })}
    </div >
  );
};
