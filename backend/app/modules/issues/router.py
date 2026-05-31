from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    Response,
    UploadFile,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.s3 import S3Storage
from app.dependencies.db import get_db_session
from app.dependencies.s3 import get_s3_storage
from app.modules.issues.models import IssueModerationStatus
from app.modules.issues.repository import IssueRepository
from app.modules.issues.schemas import (
    IssueAssignmentUpdate,
    IssueCreate,
    IssueImageListResponse,
    IssueImageResponse,
    IssueListResponse,
    IssueModerationUpdate,
    IssueDetailsResponse,
    IssueResponse,
    IssueUpdate,
    IssueWindowResponse,
)
from app.modules.issues.service import IssueService
from app.modules.workers.repository import WorkerRepository


router = APIRouter(prefix="/issues", tags=["Issues"])


def get_issue_service(
    session: Annotated[AsyncSession, Depends(get_db_session)],
    s3_storage: Annotated[S3Storage, Depends(get_s3_storage)],
) -> IssueService:
    repository = IssueRepository(session)
    worker_repository = WorkerRepository(session)
    return IssueService(repository, worker_repository, s3_storage)


@router.post(
    "",
    response_model=IssueResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create issue",
)
async def create_issue(
    payload: IssueCreate,
    service: Annotated[IssueService, Depends(get_issue_service)],
) -> IssueResponse:
    issue = await service.create_issue(payload)
    return IssueResponse.model_validate(issue)


@router.get(
    "",
    response_model=IssueListResponse,
    summary="List issues",
)
async def list_issues(
    service: Annotated[IssueService, Depends(get_issue_service)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> IssueListResponse:
    issues, total = await service.list_issues(limit=limit, offset=offset)
    return IssueListResponse(
        items=[IssueResponse.model_validate(issue) for issue in issues],
        limit=limit,
        offset=offset,
        total=total,
    )


@router.get(
    "/moderation",
    response_model=IssueListResponse,
    summary="List issues for moderation",
)
async def list_issues_for_moderation(
    service: Annotated[IssueService, Depends(get_issue_service)],
    moderation_status: IssueModerationStatus | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> IssueListResponse:
    issues, total = await service.list_issues_for_moderation(
        limit=limit,
        offset=offset,
        moderation_status=moderation_status,
    )
    return IssueListResponse(
        items=[IssueResponse.model_validate(issue) for issue in issues],
        limit=limit,
        offset=offset,
        total=total,
    )


@router.get(
    "/assignments",
    response_model=IssueListResponse,
    summary="List issues assigned to worker",
)
async def list_issues_assigned_to_worker(
    service: Annotated[IssueService, Depends(get_issue_service)],
    worker_id: Annotated[int, Query(gt=0)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> IssueListResponse:
    issues, total = await service.list_issues_assigned_to_worker(
        worker_id=worker_id,
        limit=limit,
        offset=offset,
    )
    return IssueListResponse(
        items=[IssueResponse.model_validate(issue) for issue in issues],
        limit=limit,
        offset=offset,
        total=total,
    )


@router.get(
    "/window",
    response_model=IssueWindowResponse,
    summary="List issues in coordinate window",
)
async def list_issues_in_window(
    service: Annotated[IssueService, Depends(get_issue_service)],
    min_lat: Annotated[float, Query(ge=-90, le=90)],
    min_lon: Annotated[float, Query(ge=-180, le=180)],
    max_lat: Annotated[float, Query(ge=-90, le=90)],
    max_lon: Annotated[float, Query(ge=-180, le=180)],
) -> IssueWindowResponse:
    if min_lat > max_lat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_lat must be less than or equal to max_lat",
        )

    if min_lon > max_lon:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_lon must be less than or equal to max_lon",
        )

    issues = await service.list_issues_in_window(
        min_lat=min_lat,
        min_lon=min_lon,
        max_lat=max_lat,
        max_lon=max_lon,
    )
    return IssueWindowResponse(
        items=[IssueResponse.model_validate(issue) for issue in issues],
        total=len(issues),
    )


@router.get(
    "/{issue_id}/details",
    response_model=IssueDetailsResponse,
    summary="Get issue details",
)
async def get_issue_details(
    issue_id: int,
    service: Annotated[IssueService, Depends(get_issue_service)],
) -> IssueDetailsResponse:
    return await service.get_issue_details(issue_id)


@router.get(
    "/{issue_id}",
    response_model=IssueResponse,
    summary="Get issue",
)
async def get_issue(
    issue_id: int,
    service: Annotated[IssueService, Depends(get_issue_service)],
) -> IssueResponse:
    issue = await service.get_visible_issue(issue_id)
    return IssueResponse.model_validate(issue)


@router.post(
    "/{issue_id}/images",
    response_model=IssueImageListResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload issue images",
)
async def upload_issue_images(
    issue_id: int,
    service: Annotated[IssueService, Depends(get_issue_service)],
    files: Annotated[list[UploadFile], File()],
) -> IssueImageListResponse:
    images = await service.upload_issue_images(issue_id, files)
    return IssueImageListResponse(items=images, total=len(images))


@router.get(
    "/{issue_id}/images",
    response_model=IssueImageListResponse,
    summary="List issue images",
)
async def list_issue_images(
    issue_id: int,
    service: Annotated[IssueService, Depends(get_issue_service)],
) -> IssueImageListResponse:
    images = await service.list_issue_images(issue_id)
    return IssueImageListResponse(items=images, total=len(images))


@router.get(
    "/{issue_id}/images/{image_id}",
    response_model=IssueImageResponse,
    summary="Get issue image",
)
async def get_issue_image(
    issue_id: int,
    image_id: int,
    service: Annotated[IssueService, Depends(get_issue_service)],
) -> IssueImageResponse:
    return await service.get_issue_image(issue_id, image_id)


@router.delete(
    "/{issue_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete issue image",
)
async def delete_issue_image(
    issue_id: int,
    image_id: int,
    service: Annotated[IssueService, Depends(get_issue_service)],
) -> Response:
    await service.delete_issue_image(issue_id, image_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch(
    "/{issue_id}/assignment",
    response_model=IssueResponse,
    summary="Assign issue to worker",
)
async def assign_issue(
    issue_id: int,
    payload: IssueAssignmentUpdate,
    service: Annotated[IssueService, Depends(get_issue_service)],
) -> IssueResponse:
    issue = await service.assign_issue(issue_id, payload)
    return IssueResponse.model_validate(issue)


@router.delete(
    "/{issue_id}/assignment",
    response_model=IssueResponse,
    summary="Remove issue assignment",
)
async def unassign_issue(
    issue_id: int,
    service: Annotated[IssueService, Depends(get_issue_service)],
) -> IssueResponse:
    issue = await service.unassign_issue(issue_id)
    return IssueResponse.model_validate(issue)


@router.patch(
    "/{issue_id}",
    response_model=IssueResponse,
    summary="Update issue",
)
async def update_issue(
    issue_id: int,
    payload: IssueUpdate,
    service: Annotated[IssueService, Depends(get_issue_service)],
) -> IssueResponse:
    issue = await service.update_issue(issue_id, payload)
    return IssueResponse.model_validate(issue)


@router.patch(
    "/{issue_id}/moderation",
    response_model=IssueResponse,
    summary="Moderate issue",
)
async def moderate_issue(
    issue_id: int,
    payload: IssueModerationUpdate,
    service: Annotated[IssueService, Depends(get_issue_service)],
) -> IssueResponse:
    issue = await service.moderate_issue(issue_id, payload)
    return IssueResponse.model_validate(issue)


@router.delete(
    "/{issue_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete issue",
)
async def delete_issue(
    issue_id: int,
    service: Annotated[IssueService, Depends(get_issue_service)],
) -> Response:
    await service.delete_issue(issue_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
