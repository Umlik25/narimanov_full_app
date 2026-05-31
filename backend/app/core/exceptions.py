class AppError(Exception):
    status_code = 500
    detail = "Internal server error"


class NotFoundError(AppError):
    status_code = 404

    def __init__(self, detail: str = "Resource not found") -> None:
        self.detail = detail


class BadRequestError(AppError):
    status_code = 400

    def __init__(self, detail: str = "Bad request") -> None:
        self.detail = detail
