from typing import Generic, TypeVar

from app.repositories.base import BaseRepository

RepoT = TypeVar("RepoT", bound=BaseRepository)


class BaseService(Generic[RepoT]):
    def __init__(self, repository: RepoT) -> None:
        self.repo = repository
