import type { ThemeColors } from "./useThemeColors";

/** One lighting rig for every scene; Views each need their own copy since each has its own scene graph. */
export function SharedLights({ colors }: { colors: ThemeColors }) {
  return (
    <>
      <ambientLight intensity={colors.dark ? 0.55 : 0.9} />
      <directionalLight position={[3, 4, 5]} intensity={colors.dark ? 1.3 : 1.6} />
      <pointLight position={[-4, -2, 3]} intensity={colors.dark ? 12 : 6} color={colors.iris} />
    </>
  );
}
