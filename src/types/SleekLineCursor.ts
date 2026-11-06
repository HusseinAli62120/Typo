interface SleekLineCursorProps {
  friction?: number;
  trails?: number;
  size?: number;
  dampening?: number;
  tension?: number;
}

export const SleekLineCursorPropsValues: SleekLineCursorProps = {
  friction: 0.5,
  trails: 20,
  size: 50,
  dampening: 0.25,
  tension: 0.98,
};
