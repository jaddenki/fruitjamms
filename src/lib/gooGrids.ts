export const PIXEL_CELL = 36;
/** Distance between pixel origins — less than PIXEL_CELL so blocks overlap for goo merges */
export const PIXEL_STRIDE = 28;

export const SHAPE_GRIDS = {
    cross: [".X.", "X.X", ".X."],
    plus: [".X.", "XXX", ".X."],
    diamond: ["X.X", ".X.", "X.X"],
    dot: ["X"],
} as const;

export type ShapeKey = keyof typeof SHAPE_GRIDS;

export function gridDimensions(
    grid: readonly string[],
    cell: number = PIXEL_CELL,
    stride: number = PIXEL_STRIDE,
): { w: number; h: number } {
    const cols = grid[0].length;
    const rows = grid.length;
    return {
        w: (cols - 1) * stride + cell,
        h: (rows - 1) * stride + cell,
    };
}

export function gridToGooRects(
    grid: readonly string[],
    fill: string,
    cell: number = PIXEL_CELL,
    stride: number = PIXEL_STRIDE,
): string {
    return grid
        .flatMap((row, r) =>
            [...row].flatMap((ch, c) =>
                ch === "X"
                    ? [
                          `<rect class="goo-pixel" data-cell="${cell}" data-hx="${c * stride}" data-hy="${r * stride}" x="${c * stride}" y="${r * stride}" width="${cell}" height="${cell}" fill="${fill}"/>`,
                      ]
                    : [],
            ),
        )
        .join("\n        ");
}

export function buildGooSvg(
    grid: readonly string[],
    fill: string,
    cell: number = PIXEL_CELL,
    stride: number = PIXEL_STRIDE,
): string {
    const { w, h } = gridDimensions(grid, cell, stride);
    const rects = gridToGooRects(grid, fill, cell, stride);
    return (
        `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" ` +
        `xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" overflow="visible">` +
        `<g class="goo-layer" filter="url(#gooey)">${rects}</g></svg>`
    );
}
