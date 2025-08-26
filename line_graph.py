import os
from typing import List

import matplotlib.pyplot as plt
from matplotlib.ticker import PercentFormatter


def create_line_graph(categories: List[str], values_as_fraction: List[float], title: str, output_path: str) -> str:
    """Create a simple line graph with categories on the x-axis and percentage values on the y-axis.

    Args:
        categories: Ordered category labels for the x-axis.
        values_as_fraction: Values expressed as fractions (e.g., 0.10 for 10%).
        title: Chart title.
        output_path: Absolute path to save the resulting PNG.

    Returns:
        The absolute path where the PNG was saved.
    """
    if len(categories) != len(values_as_fraction):
        raise ValueError("categories and values_as_fraction must have the same length")

    figure_width_inches = 10
    figure_height_inches = 5

    plt.style.use("seaborn-v0_8-whitegrid")
    fig, ax = plt.subplots(figsize=(figure_width_inches, figure_height_inches))

    x_positions = list(range(len(categories)))

    ax.plot(
        x_positions,
        values_as_fraction,
        color="#2563eb",
        marker="o",
        linewidth=2.5,
        markersize=8,
    )

    for x, y in zip(x_positions, values_as_fraction):
        ax.annotate(
            f"{y * 100:.2f}%",
            (x, y),
            textcoords="offset points",
            xytext=(0, 8),
            ha="center",
            fontsize=10,
            color="#111827",
        )

    ax.set_title(title, fontsize=14, pad=12)
    ax.set_xticks(x_positions)
    ax.set_xticklabels(categories, rotation=0, ha="center")
    ax.yaxis.set_major_formatter(PercentFormatter(xmax=1.0))
    ax.set_ylabel("Percentage")
    ax.set_ylim(bottom=0)

    plt.tight_layout()

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fig.savefig(output_path, dpi=200)
    plt.close(fig)

    return output_path


if __name__ == "__main__":
    chart_title = "Phase 2 · Sprint 1"

    x_categories = [
        "Defect Density (FE)",
        "Japan Region (Stretch Target)",
        "UI competency Target (General)",
    ]

    # Values converted to fractions: 1.17%, 4%, 10%
    y_values_fraction = [0.0117, 0.04, 0.10]

    output_file = "/workspace/phase2_sprint1_line_graph.png"

    saved_path = create_line_graph(x_categories, y_values_fraction, chart_title, output_file)
    print(f"Saved line graph to: {saved_path}")