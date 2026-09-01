from datetime import datetime, timezone
from typing import List
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_manager
from app.models.manager import Manager
from app.schemas.manager import ManagerOut, ManagerRejectRequest

router = APIRouter(prefix="/manager", tags=["Manager Approvals & Governance"])

@router.get("/approvals/pending", response_model=List[ManagerOut])
async def get_pending_managers(
    current_manager: Manager = Depends(get_current_manager),
):
    """
    List all PENDING manager accounts.
    Protected: Requires acting manager to have status=APPROVED.
    """
    pending = (
        await Manager.find(Manager.status == "PENDING")
        .sort("-requested_at")
        .to_list()
    )
    return [ManagerOut.model_validate(m) for m in pending]


@router.get("/list", response_model=List[ManagerOut])
async def list_all_managers(
    current_manager: Manager = Depends(get_current_manager),
):
    """
    List all manager accounts for audit visibility.
    Protected: Requires acting manager to have status=APPROVED.
    """
    all_managers = await Manager.find_all().sort("-created_at").to_list()
    return [ManagerOut.model_validate(m) for m in all_managers]


@router.post("/approvals/{manager_id}/approve", response_model=ManagerOut)
async def approve_manager(
    manager_id: PydanticObjectId,
    current_manager: Manager = Depends(get_current_manager),
):
    """
    Approve a pending manager account.
    Protected: Requires acting manager to have status=APPROVED.
    Defends against self-approval.
    """
    if manager_id == current_manager.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security Violation: Managers cannot approve their own account.",
        )

    target = await Manager.get(manager_id)
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manager account not found.",
        )

    now = datetime.now(timezone.utc)
    target.status = "APPROVED"
    target.approved_by = current_manager.id
    target.approved_at = now
    target.rejected_by = None
    target.rejected_at = None
    target.rejection_reason = None
    target.updated_at = now

    await target.save()

    return ManagerOut.model_validate(target)


@router.post("/approvals/{manager_id}/reject", response_model=ManagerOut)
async def reject_manager(
    manager_id: PydanticObjectId,
    payload: ManagerRejectRequest,
    current_manager: Manager = Depends(get_current_manager),
):
    """
    Reject a manager account with a structured reason.
    Protected: Requires acting manager to have status=APPROVED.
    Defends against self-rejection.
    """
    if manager_id == current_manager.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security Violation: Managers cannot alter their own account status.",
        )

    if not payload.reason.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rejection reason is required.",
        )

    target = await Manager.get(manager_id)
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manager account not found.",
        )

    now = datetime.now(timezone.utc)
    target.status = "REJECTED"
    target.rejected_by = current_manager.id
    target.rejected_at = now
    target.rejection_reason = payload.reason.strip()
    target.updated_at = now

    await target.save()

    return ManagerOut.model_validate(target)
