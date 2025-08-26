from typing import List, Tuple
import os


def scale_values(values: List[float], height: int, top_padding: int, bottom_padding: int) -> List[float]:
    max_value = max(values) if values else 1.0
    min_value = 0.0
    usable_height = height - top_padding - bottom_padding
    scaled = []
    for v in values:
        # Normalize between 0 and 1, then invert for SVG y-axis (top=0)
        ratio = (v - min_value) / (max_value - min_value) if max_value != min_value else 0
        y = top_padding + (1 - ratio) * usable_height
        scaled.append(y)
    return scaled


def generate_svg_line_chart(
    title: str,
    categories: List[str],
    values: List[float],
    output_path: str,
) -> str:
    if len(categories) != len(values):
        raise ValueError("categories and values must be the same length")

    width = 900
    height = 420

    margin_left = 80
    margin_right = 30
    margin_top = 60
    margin_bottom = 80

    plot_width = width - margin_left - margin_right
    plot_height = height - margin_top - margin_bottom

    y_coords = scale_values(values, height, margin_top, margin_bottom)

    n = len(categories)
    x_step = plot_width / (max(n - 1, 1))
    x_coords = [margin_left + i * x_step for i in range(n)]

    max_value = max(values) if values else 1.0

    # Build SVG elements
    parts: List[str] = []
    parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">')

    # Background
    parts.append('<rect x="0" y="0" width="100%" height="100%" fill="#ffffff"/>')

    # Title
    parts.append(f'<text x="{width/2}" y="{margin_top/2}" text-anchor="middle" font-size="18" font-family="sans-serif" fill="#111827">{title}</text>')

    # Gridlines and y-axis ticks (5 ticks)
    num_ticks = 5
    for i in range(num_ticks + 1):
        t = i / num_ticks
        y = margin_top + (1 - t) * plot_height
        value = t * max_value
        parts.append(f'<line x1="{margin_left}" y1="{y:.2f}" x2="{width - margin_right}" y2="{y:.2f}" stroke="#e5e7eb" stroke-width="1"/>')
        parts.append(f'<text x="{margin_left - 10}" y="{y + 4:.2f}" text-anchor="end" font-size="12" font-family="sans-serif" fill="#374151">{value*100:.0f}%</text>')

    # Axes
    parts.append(f'<line x1="{margin_left}" y1="{margin_top}" x2="{margin_left}" y2="{height - margin_bottom}" stroke="#9ca3af" stroke-width="1.5"/>')
    parts.append(f'<line x1="{margin_left}" y1="{height - margin_bottom}" x2="{width - margin_right}" y2="{height - margin_bottom}" stroke="#9ca3af" stroke-width="1.5"/>')

    # Line path
    path_d = " ".join([f"L {x:.2f} {y:.2f}" if idx > 0 else f"M {x:.2f} {y:.2f}" for idx, (x, y) in enumerate(zip(x_coords, y_coords))])
    parts.append(f'<path d="{path_d}" fill="none" stroke="#2563eb" stroke-width="2.5"/>')

    # Points and labels
    for x, y, v in zip(x_coords, y_coords, values):
        parts.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="4" fill="#2563eb"/>')
        parts.append(f'<text x="{x:.2f}" y="{y - 10:.2f}" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#111827">{v*100:.2f}%</text>')

    # Category labels
    for i, label in enumerate(categories):
        x = x_coords[i]
        y = height - margin_bottom + 22
        parts.append(f'<text x="{x:.2f}" y="{y}" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#374151">{label}</text>')

    parts.append('</svg>')

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(parts))

    return output_path


if __name__ == "__main__":
    title = "Phase 2 · Sprint 1"
    categories = [
        "Defect Density (FE)",
        "Japan Region (Stretch Target)",
        "UI competency Target (General)",
    ]
    # As fractions
    values = [0.0117, 0.04, 0.10]

    output = "/workspace/phase2_sprint1_line_graph.svg"
    saved = generate_svg_line_chart(title, categories, values, output)
    print(f"Saved SVG to: {saved}")