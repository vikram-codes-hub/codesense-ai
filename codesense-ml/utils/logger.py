import logging
import os


def get_logger(name: str) -> logging.Logger:
    logger  = logging.getLogger(name)

    if not logger.handlers:
        level   = logging.DEBUG if os.getenv("NODE_ENV") != "production" else logging.INFO
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            fmt   ="  [%(levelname)s] %(name)s — %(message)s",
            datefmt="%H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(level)

    return logger