# Use a python image with uv pre-installed
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS builder

WORKDIR /app
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Copy dependency files and install them
COPY pyproject.toml /app/
RUN uv sync --frozen --no-install-project --no-dev

# Add source code
COPY . /app
RUN uv sync --frozen --no-dev

# Final stage
FROM python:3.13-slim-bookworm

COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app /app

ENV PATH="/app/.venv/bin:$PATH"
WORKDIR /app
ENV PYTHONPATH="/app"

# Default command runs the migration orchestrator
CMD ["python", "src/migration_orchestrator.py"]
