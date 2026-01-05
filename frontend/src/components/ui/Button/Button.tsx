import clsx from 'clsx';
import type { FC, MouseEvent as ReactMouseEvent, ReactNode, RefObject } from 'react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  buttonVariants,
  buttonSizes,
  textAlignments,
  disabledButton,
  buttonImage,
} from './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonTextAlign = 'center' | 'left' | 'right';

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  textAlign?: ButtonTextAlign;
  className?: string;
  disabled?: boolean;
  onClick?: (event: ReactMouseEvent) => void;
  to?: string;
  type?: 'button' | 'submit' | 'reset';
  imgSrc?: string;
  imgAlt?: string;
  imgClassName?: string;
  newTab?: boolean;
  buttonRef?: RefObject<HTMLButtonElement | null>;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'small',
  textAlign = 'center',
  disabled = false,
  onClick,
  children,
  to,
  className,
  imgSrc,
  imgAlt = '',
  imgClassName = '',
  type = 'button',
  newTab,
  buttonRef,
}) => {
  const classNames = clsx(
    buttonVariants[variant],
    buttonSizes[size],
    textAlignments[textAlign],
    disabled && disabledButton,
    className
  );

  const img = useMemo(() => {
    if (!imgSrc) return null;
    return <img className={clsx(buttonImage, imgClassName)} src={imgSrc} alt={imgAlt} />;
  }, [imgSrc, imgAlt, imgClassName]);

  const handleClick = (event: ReactMouseEvent) => {
    if (disabled || !onClick) return;
    onClick(event);
  };

  // External link
  if (to?.startsWith('http')) {
    return (
      <a
        href={disabled ? undefined : to}
        className={classNames}
        onClick={disabled ? undefined : onClick}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener noreferrer' : undefined}
      >
        {img}
        {children}
      </a>
    );
  }

  // Internal link
  if (to) {
    return (
      <Link
        to={to}
        className={classNames}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
      >
        {img}
        {children}
      </Link>
    );
  }

  // Regular button
  return (
    <button
      ref={buttonRef}
      type={type}
      className={classNames}
      onClick={handleClick}
      disabled={disabled}
    >
      {img}
      {children}
    </button>
  );
};

