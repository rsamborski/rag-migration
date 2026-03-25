# Use a python image with uv pre-installed
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS builder

# Set working directory
WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy from the cache instead of linking since it's a mounted volume
ENV UV_LINK_MODE=copy

# Copy dependency files and install them
COPY uv.lock pyproject.toml /app/
RUN uv sync --frozen --no-install-project --no-dev

# Then, add the rest of the project source code and install it
# Installing separately from its dependencies allows optimal docker layer caching
COPY . /app
RUN uv sync --frozen --no-dev

# Final stage
FROM python:3.13-slim-bookworm

# Copy the environment
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app /app

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"
WORKDIR /app

# Set python path to allow imports from src/
ENV PYTHONPATH="/app"

# Default command runs the worker
CMD ["python", "main.py"]
