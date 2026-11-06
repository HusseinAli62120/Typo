interface FluidCursorProps {
  densityDissipation?: number;
  velocityDissipation?: number;
  pressure?: number;
  curl?: number;
  splatRadius?: number;
  splatForce?: number;
  transparent?: boolean;
}

// Fluid Cursor props
export const FluidCursorPropsValues: FluidCursorProps = {
  densityDissipation: 3.5,
  velocityDissipation: 2,
  pressure: 0.1,
  curl: 3,
  splatRadius: 0.2,
  splatForce: 6000,
  transparent: true,
};
