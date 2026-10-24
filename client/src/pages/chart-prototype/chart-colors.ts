export function accessiblePlotColors(light: boolean): readonly string[] {
  return light
    ? [
        "#2364a0",
        "#a34a1b",
        "#6f48a7",
        "#087447",
        "#a52752",
        "#7c6509",
        "#425caa",
      ]
    : [
        "#87bafa",
        "#ffb18f",
        "#c9adff",
        "#80dcb0",
        "#ff9cbe",
        "#f3d56a",
        "#b2c2ff",
      ];
}
