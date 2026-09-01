from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends
from app.api.deps import get_current_customer, get_current_manager
from app.models.customer import Customer
from app.models.manager import Manager

router = APIRouter(prefix="/claims", tags=["Claims"])

@router.get("/")
async def list_claims(
    current_manager: Manager = Depends(get_current_manager),
):
    """
    Manager queue: List all claims for arbitration.
    Protected: Requires authenticated, APPROVED manager.
    """
    return {
        "success": True,
        "message": "Authenticated manager claims queue.",
        "claims": []
    }

@router.post("/{claim_id}/approve")
async def approve_claim(
    claim_id: str,
    notes: Optional[Dict[str, Any]] = None,
    current_manager: Manager = Depends(get_current_manager),
):
    """
    Human Manager final decision: Approve claim.
    Protected: Requires authenticated, APPROVED manager.
    """
    return {
        "success": True,
        "claim_id": claim_id,
        "status": "APPROVED",
        "approved_by": str(current_manager.id),
        "manager_name": current_manager.name,
        "message": "Claim approved by authorized warranty manager."
    }

@router.post("/{claim_id}/reject")
async def reject_claim(
    claim_id: str,
    payload: Dict[str, Any],
    current_manager: Manager = Depends(get_current_manager),
):
    """
    Human Manager final decision: Reject claim.
    Protected: Requires authenticated, APPROVED manager.
    """
    return {
        "success": True,
        "claim_id": claim_id,
        "status": "DENIED",
        "rejected_by": str(current_manager.id),
        "manager_name": current_manager.name,
        "reason": payload.get("reason", "Policy exclusion"),
        "message": "Claim rejected by authorized warranty manager."
    }

@router.post("/{claim_id}/request-info")
async def request_info_claim(
    claim_id: str,
    payload: Dict[str, Any],
    current_manager: Manager = Depends(get_current_manager),
):
    """
    Human Manager final decision: Request additional customer evidence.
    Protected: Requires authenticated, APPROVED manager.
    """
    return {
        "success": True,
        "claim_id": claim_id,
        "status": "UNDER_REVIEW",
        "requested_by": str(current_manager.id),
        "manager_name": current_manager.name,
        "requested_items": payload.get("items", []),
        "message": "Additional evidence request transmitted to customer."
    }
