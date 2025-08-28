import * as React from "react";
import { cn } from "../lib/utils";

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number;
}

export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, size = 48, ...props }, ref) => {
    return (
      <img
        ref={ref}
        width={size}
        height={size}
        className={cn(
          "rounded-full border-2 border-gray-700 shadow-md object-cover",
          className
        )}
        {...props}
      />
    );
  }
);
Avatar.displayName = "Avatar";
