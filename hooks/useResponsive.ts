import { useWindowDimensions } from 'react-native';

export type ScreenSize = 'small' | 'medium' | 'large';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const screenSize: ScreenSize =
    width < 380 ? 'small' : width < 768 ? 'medium' : 'large';

  const isSmallScreen = screenSize === 'small';
  const isLargeScreen = screenSize === 'large';

  // Scale a value based on screen width relative to a 390px base (iPhone 14)
  const wp = (percent: number) => (width * percent) / 100;

  // Responsive value: returns small/medium/large value based on screen size
  function pick<T>(small: T, medium: T, large: T): T {
    switch (screenSize) {
      case 'small':
        return small;
      case 'large':
        return large;
      default:
        return medium;
    }
  }

  return {
    width,
    height,
    screenSize,
    isSmallScreen,
    isLargeScreen,
    wp,
    pick,
  };
}
